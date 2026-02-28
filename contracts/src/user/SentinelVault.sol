// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SentinelVault is Ownable, ReentrancyGuard {
    mapping(address => uint256) public balances;
    mapping(address => bool) public authorizedExecutors;

    event Deposited(address indexed token, uint256 amount);
    event Withdrawn(address indexed token, uint256 amount);
    event FundsUsed(address indexed token, uint256 amount, address recipient);

    constructor(address _owner) Ownable(_owner) {}

    modifier onlyExecutor() {
        require(authorizedExecutors[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    function deposit(address token, uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        balances[token] += amount;
        emit Deposited(token, amount);
    }

    function withdraw(address token, uint256 amount) external onlyOwner nonReentrant {
        require(balances[token] >= amount, "Insufficient balance");
        balances[token] -= amount;
        IERC20(token).transfer(msg.sender, amount);
        emit Withdrawn(token, amount);
    }

    function useForProtection(address token, uint256 amount, address recipient) external onlyExecutor nonReentrant {
        require(balances[token] >= amount, "Insufficient reserve");
        balances[token] -= amount;
        IERC20(token).transfer(recipient, amount);
        emit FundsUsed(token, amount, recipient);
    }

    function authorizeExecutor(address executor, bool status) external onlyOwner {
        authorizedExecutors[executor] = status;
    }
}
