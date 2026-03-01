import { SECRETS } from "./secrets";

export const CRE_CONFIG = {
    nodeUrl: process.env.CHAINLINK_CRE_NODE_URL || "https://cre.chain.link",
    apiKey: SECRETS.CRE_API_KEY,
    network: "sepolia",
    workflowsDir: "./cre-workflows",
};
