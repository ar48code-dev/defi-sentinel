import { SECRETS } from "./secrets";

export const CHAINLINK_CONFIG = {
    apiKey: SECRETS.CRE_API_KEY,
    nodeUrl: process.env.CHAINLINK_CRE_NODE_URL || "https://cre.chain.link",
};
