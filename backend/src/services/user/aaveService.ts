import { ethers } from "ethers";
import { AAVE_POOL_ABI, AAVE_DATA_PROVIDER_ABI, CONTRACT_ADDRESSES } from "../../config/contracts";
import { SECRETS } from "../../config/secrets";

export interface UserPosition {
    address: string;
    totalCollateralUSD: string;
    totalDebtUSD: string;
    availableBorrowsUSD: string;
    healthFactor: string;
    liquidationThreshold: string;
    ltv: string;
    isAtRisk: boolean;
    riskLevel: "safe" | "warning" | "danger" | "critical";
}

export class AaveService {
    private provider: ethers.JsonRpcProvider;
    private pool: ethers.Contract;
    private dataProvider: ethers.Contract;

    constructor() {
        this.provider = new ethers.JsonRpcProvider(SECRETS.SEPOLIA_RPC_URL);
        this.pool = new ethers.Contract(CONTRACT_ADDRESSES.AAVE_V3_POOL, AAVE_POOL_ABI, this.provider);
        this.dataProvider = new ethers.Contract(
            CONTRACT_ADDRESSES.AAVE_V3_DATA_PROVIDER,
            AAVE_DATA_PROVIDER_ABI,
            this.provider
        );
    }

    async getUserPosition(address: string): Promise<UserPosition> {
        const [
            totalCollateralBase,
            totalDebtBase,
            availableBorrowsBase,
            currentLiquidationThreshold,
            ltv,
            healthFactor,
        ] = await this.pool.getUserAccountData(address);

        // Aave returns values in USD with 8 decimals for base currency, 18 for HF
        const collateralUSD = Number(totalCollateralBase) / 1e8;
        const debtUSD = Number(totalDebtBase) / 1e8;
        const availableUSD = Number(availableBorrowsBase) / 1e8;
        const hf = Number(healthFactor) / 1e18;
        const liqThreshold = Number(currentLiquidationThreshold) / 10000;
        const ltvVal = Number(ltv) / 10000;

        let riskLevel: UserPosition["riskLevel"];
        if (hf >= 2.0) riskLevel = "safe";
        else if (hf >= 1.5) riskLevel = "warning";
        else if (hf >= 1.1) riskLevel = "danger";
        else riskLevel = "critical";

        return {
            address,
            totalCollateralUSD: collateralUSD.toFixed(2),
            totalDebtUSD: debtUSD.toFixed(2),
            availableBorrowsUSD: availableUSD.toFixed(2),
            healthFactor: hf === Infinity || hf > 1e10 ? "∞" : hf.toFixed(4),
            liquidationThreshold: (liqThreshold * 100).toFixed(2) + "%",
            ltv: (ltvVal * 100).toFixed(2) + "%",
            isAtRisk: hf < 1.5 && debtUSD > 0,
            riskLevel,
        };
    }

    async hasOpenPosition(address: string): Promise<boolean> {
        try {
            const [, totalDebtBase] = await this.pool.getUserAccountData(address);
            return Number(totalDebtBase) > 0;
        } catch {
            return false;
        }
    }

    calculateRequiredTopUp(position: UserPosition, targetHF: number): string {
        const debt = parseFloat(position.totalDebtUSD);
        const currentHF = parseFloat(position.healthFactor);
        if (!isFinite(currentHF) || debt === 0) return "0";
        // Required collateral = targetHF * debt - current collateral
        const currentCollateral = parseFloat(position.totalCollateralUSD);
        const requiredCollateral = targetHF * debt;
        const topUp = Math.max(0, requiredCollateral - currentCollateral);
        return topUp.toFixed(2);
    }

    monitorHealthFactor(
        address: string,
        threshold: number,
        callback: (position: UserPosition) => void
    ): NodeJS.Timer {
        return setInterval(async () => {
            try {
                const position = await this.getUserPosition(address);
                const hf = parseFloat(position.healthFactor);
                if (hf < threshold) {
                    callback(position);
                }
            } catch (err) {
                console.error(`Health monitor error for ${address}:`, err);
            }
        }, 60_000) as unknown as NodeJS.Timer;
    }
}

export const aaveService = new AaveService();
