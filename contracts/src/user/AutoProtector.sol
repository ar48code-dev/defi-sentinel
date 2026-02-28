// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../shared/SentinelCore.sol";
import "../shared/ForensicsLogger.sol";
import "./SentinelVault.sol";

interface IPool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
}

contract AutoProtector is Ownable {
    SentinelCore public core;
    ForensicsLogger public logger;
    
    struct UserConfig {
        address vault;
        uint256 minAmount;
        uint256 maxAmount;
        bool active;
    }

    mapping(address => UserConfig) public userConfigs;

    event ProtectionExecuted(address indexed user, uint256 amount, uint256 healthFactorBefore);
    event ConfigUpdated(address indexed user, address vault, bool active);

    constructor(address _core, address _logger) Ownable(msg.sender) {
        core = SentinelCore(_core);
        logger = ForensicsLogger(_logger);
    }

    function setConfig(address vault, uint256 minAmount, uint256 maxAmount, bool active) external {
        userConfigs[msg.sender] = UserConfig({
            vault: vault,
            minAmount: minAmount,
            maxAmount: maxAmount,
            active: active
        });
        emit ConfigUpdated(msg.sender, vault, active);
    }

    function executeProtection(
        address user,
        address token,
        uint256 amount,
        address aavePool,
        uint256 healthFactorBefore
    ) external {
        require(core.authorizedCRENodes(msg.sender), "Only CRE nodes");
        UserConfig storage config = userConfigs[user];
        require(config.active, "User protection not active");
        require(amount >= config.minAmount && amount <= config.maxAmount, "Amount out of bounds");

        // Pull funds from vault
        SentinelVault(config.vault).useForProtection(token, amount, address(this));

        // Approve Aave Pool
        IERC20(token).approve(aavePool, amount);

        // Supply to Aave on behalf of user
        IPool(aavePool).supply(token, amount, user, 0);

        // Log action
        core.incrementProtectionCount(user);
        logger.logUserProtection(user, "Auto-protection: Collateral top-up", bytes32(healthFactorBefore));

        emit ProtectionExecuted(user, amount, healthFactorBefore);
    }
}
