import { ethers } from "ethers";

export async function connectWallet() {
    if (typeof window === "undefined" || !(window as any).ethereum) {
        throw new Error("MetaMask is not installed");
    }

    try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();

        return {
            address: accounts[0],
            signer,
            provider
        };
    } catch (err: any) {
        console.error("User rejected connection", err);
        throw err;
    }
}

export async function getConnectedAddress() {
    if (typeof window === "undefined" || !(window as any).ethereum) return null;

    try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await provider.send("eth_accounts", []);
        return accounts[0] || null;
    } catch (err) {
        return null;
    }
}

export async function depositToVault(amountUSD: number) {
    if (typeof window === "undefined" || !(window as any).ethereum) {
        throw new Error("MetaMask is not installed");
    }

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();

    // These would ideally come from a config or env
    const VAULT_ADDRESS = "0x2f3B8aC8B0d513acB2bb90775238616d018335D0";
    const USDC_ADDRESS = "0x94a9D9AC8a64CC694109f2823992A74521473967";

    const amount = ethers.parseUnits(amountUSD.toString(), 6); // USDC typically has 6 decimals

    const erc20Abi = [
        "function approve(address spender, uint256 amount) public returns (bool)",
        "function allowance(address owner, address spender) public view returns (uint256)"
    ];

    const vaultAbi = [
        "function deposit(address token, uint256 amount) external"
    ];

    const usdcContract = new ethers.Contract(USDC_ADDRESS, erc20Abi, signer);
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, vaultAbi, signer);

    try {
        // Check allowance
        const userAddress = await signer.getAddress();
        const currentAllowance = await usdcContract.allowance(userAddress, VAULT_ADDRESS);

        if (currentAllowance < amount) {
            console.log("Approving USDC...");
            const approveTx = await usdcContract.approve(VAULT_ADDRESS, ethers.MaxUint256);
            await approveTx.wait();
            console.log("Approval confirmed");
        }

        console.log(`Depositing ${amountUSD} USDC to Vault...`);
        const depositTx = await vaultContract.deposit(USDC_ADDRESS, amount);
        const receipt = await depositTx.wait();
        console.log("Deposit confirmed", receipt.hash);
        return receipt;
    } catch (err: any) {
        console.error("Vault deposit error:", err);
        throw err;
    }
}

export function formatAddress(address: string) {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

