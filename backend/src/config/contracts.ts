import { SECRETS } from "./secrets";

// ✅ Verified Chainlink Price Feed Addresses on Sepolia Testnet
// All addresses use correct EIP-55 checksums
export const CONTRACT_ADDRESSES = {
    // Aave V3 on Sepolia
    AAVE_V3_POOL: "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951",
    AAVE_V3_DATA_PROVIDER: "0x3e9708d80f7B3e43118013075F7e95CE3AB31F31",
    USDC_SEPOLIA: "0x94a9D9AC8a64CC694109f2823992A74521473967",
    DAI_SEPOLIA: "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357",
    // Chainlink Price Feeds — Sepolia (verified checksum addresses)
    CHAINLINK_ETH_USD: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    CHAINLINK_USDC_USD: "0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E",
    CHAINLINK_DAI_USD: "0x14866185B1962B63C3Ea9E03Bc1da838bab34C19",
    CHAINLINK_LINK_USD: "0xc59E3633BAAC79493d908e63626716e204A45EdF",
    // Note: WBTC/USD and AAVE/USD are not available on Sepolia; handled as fallback in priceService
    CHAINLINK_WBTC_USD: "",
    CHAINLINK_AAVE_USD: "",
    // Deployed Contract addresses (from .env)
    SENTINEL_CORE: SECRETS.SENTINEL_CORE,
    FORENSICS_LOGGER: SECRETS.FORENSICS_LOGGER,
    AUTO_PROTECTOR: SECRETS.AUTO_PROTECTOR,
    SENTINEL_VAULT: SECRETS.SENTINEL_VAULT,
};

export const CHAINLINK_PRICE_FEED_ABI = [
    "function latestRoundData() external view returns (uint80, int256, uint256, uint256, uint80)",
    "function decimals() external view returns (uint8)",
    "function description() external view returns (string)",
];

export const AAVE_POOL_ABI = [
    "function getUserAccountData(address user) external view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)",
    "function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external",
];

export const AAVE_DATA_PROVIDER_ABI = [
    "function getUserReserveData(address asset, address user) external view returns (uint256 currentATokenBalance, uint256 currentStableDebt, uint256 currentVariableDebt, uint256 principalStableDebt, uint256 scaledVariableDebt, uint256 stableBorrowRate, uint256 liquidityRate, uint40 stableRateLastUpdated, bool usageAsCollateralEnabled)",
];
