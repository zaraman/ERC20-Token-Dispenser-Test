// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TimedTokenDistribution is Ownable {
    IERC20 public token;
    address public beneficiary;
    uint256 public totalTokens = 700000 * 10 ** 18; // Adjusted for ERC20 decimals
    uint256 public constant maxMonthlyDistribution = 10000 * 10 ** 18; // Max tokens per month
    uint256 public startTime;
    uint256 public distributedTokens;
    uint256 public lastDistributedMonth;

    event TokensDistributed(address indexed beneficiary, uint256 amount);

    constructor(address _token, address _beneficiary, uint256 _startTime) Ownable(msg.sender) {
        token = IERC20(_token);
        beneficiary = _beneficiary;
        startTime = _startTime;
        lastDistributedMonth = 0; // Initialize to zero since no tokens have been distributed yet
    }

    function distribute() external onlyOwner {
    require(block.timestamp >= startTime, "Distribution not started");
    uint256 currentMonth = getCurrentMonth();
    require(currentMonth > lastDistributedMonth, "Already distributed this month");

    uint256 maxTokensThisMonth = calculateMaxTokens(currentMonth);

    uint256 remainingTokens = totalTokens - distributedTokens;
    uint256 tokensToDistribute = maxTokensThisMonth > remainingTokens ? remainingTokens : maxTokensThisMonth;

    require(tokensToDistribute > 0, "No tokens to distribute");

    distributedTokens += tokensToDistribute;
    token.transfer(beneficiary, tokensToDistribute);
    lastDistributedMonth = currentMonth; 

    emit TokensDistributed(beneficiary, tokensToDistribute);
}

    function calculateMaxTokens(uint256 month) public pure returns (uint256) {
        if (month < 12) return (1000 * 10 ** 18); // Year 1: 10%
        if (month < 24) return (2500 * 10 ** 18); // Year 2: 25%
        if (month < 36) return (5000 * 10 ** 18); // Year 3: 50%
        if (month < 48) return (10000 * 10 ** 18); // Year 4: 100%
        if (month < 96) return (5000 * 10 ** 18); // Year 5-8: 50%
        if (month < 144) return (2500 * 10 ** 18); // Year 9-12: 25%

        // Calculate for years after year 12
        uint256 yearsAfter12 = (month - 144) / 12;
        uint256 factor = 1250 * 10 ** 18; // 12.5% initially
        for (uint256 i = 0; i < yearsAfter12; i++) {
            factor /= 2;
        }
        return factor > 100 * 10 ** 18 ? factor : 100 * 10 ** 18; // Ensure at least 100 tokens or the remaining
    }

    function remainingTokens() external view returns (uint256) {
        return totalTokens - distributedTokens;
    }

    function getCurrentMonth() public view returns (uint256) {
        return (block.timestamp - startTime) / 30 days;
    }
}
