// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SentinelCore is Ownable {
    struct UserProfile {
        address vault;
        uint256 protectionCount;
        bool isRegistered;
    }

    struct ProtocolProfile {
        string name;
        uint8 threatLevel;
        address admin;
        bool isRegistered;
    }

    mapping(address => UserProfile) public users;
    mapping(address => ProtocolProfile) public protocols;
    mapping(address => bool) public authorizedCRENodes;

    event UserRegistered(address indexed user, address vault);
    event ProtocolRegistered(address indexed protocol, string name, address admin);
    event ThreatLevelUpdated(address indexed protocol, uint8 level);
    event ProtectionExecuted(address indexed user, uint256 count);

    constructor() Ownable(msg.sender) {}

    modifier onlyAuthorized() {
        require(authorizedCRENodes[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    function registerUser(address vaultAddress) external {
        require(!users[msg.sender].isRegistered, "Already registered");
        users[msg.sender] = UserProfile({
            vault: vaultAddress,
            protectionCount: 0,
            isRegistered: true
        });
        emit UserRegistered(msg.sender, vaultAddress);
    }

    function registerProtocol(address protocol, string calldata name) external {
        require(!protocols[protocol].isRegistered, "Protocol already registered");
        protocols[protocol] = ProtocolProfile({
            name: name,
            threatLevel: 1,
            admin: msg.sender,
            isRegistered: true
        });
        emit ProtocolRegistered(protocol, name, msg.sender);
    }

    function updateThreatLevel(address protocol, uint8 level) external onlyAuthorized {
        require(protocols[protocol].isRegistered, "Protocol not registered");
        protocols[protocol].threatLevel = level;
        emit ThreatLevelUpdated(protocol, level);
    }

    function incrementProtectionCount(address user) external onlyAuthorized {
        require(users[user].isRegistered, "User not registered");
        users[user].protectionCount++;
        emit ProtectionExecuted(user, users[user].protectionCount);
    }

    function authorizeCRENode(address node, bool status) external onlyOwner {
        authorizedCRENodes[node] = status;
    }

    function isProtocolRegistered(address protocol) external view returns (bool) {
        return protocols[protocol].isRegistered;
    }
}
