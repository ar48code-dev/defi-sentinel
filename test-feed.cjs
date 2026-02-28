const { ethers } = require("ethers");
const RPC = "https://eth-sepolia.g.alchemy.com/v2/okxADEboayXHLzb7vd452";
const FEED = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
const ABI = ["function latestRoundData() external view returns (uint80, int256, uint256, uint256, uint80)"];

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC);
    const contract = new ethers.Contract(FEED, ABI, provider);
    console.log("Calling latestRoundData...");
    try {
        const data = await contract.latestRoundData();
        console.log("Data:", data);
    } catch (e) {
        console.error("Error:", e);
    }
}
main();
