// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract TokenDispenser {
    uint256 public totalTokens = 700000 * (10 ** 18);
    address public distributionAddress;
    address public owner;
    uint256 public startTime;
    uint256 public tokensDistributed;
    uint256 public currentPeriod;
    uint256 public monthlyDistribution;
    IERC20 public token;

    event TokensDistributed(uint256 period, uint256 amount, address recipient);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    constructor(address _tokenAddress, address _distributionAddress) {
        token = IERC20(_tokenAddress);
        distributionAddress = _distributionAddress;
        startTime = block.timestamp;
        currentPeriod = 0;
        monthlyDistribution = 0;
        owner = msg.sender;
    }

    function calculateMonthlyDistribution(uint256 period) public pure returns (uint256) {
        if (period == 1) {
            return 1000 * (10 ** 18); // 10% of 10,000
        } else if (period == 2) {
            return 2500 * (10 ** 18); // 25% of 10,000
        } else if (period == 3) {
            return 5000 * (10 ** 18); // 50% of 10,000
        } else if (period == 4) {
            return 10000 * (10 ** 18); // 100% of 10,000
        } else if (period == 8) {
            return 5000 * (10 ** 18); // 50% of 10,000
        } else if (period == 12) {
            return 2500 * (10 ** 18); // 25% of 10,000
        } else {
            uint256 prevAmount = calculateMonthlyDistribution(period - 4);
            return prevAmount / 2; // Half of the previous period
        }
    }

    function distribute() public onlyOwner {
        require(block.timestamp >= startTime, "Distribution has not started yet");
        uint256 period = getCurrentPeriod();
        require(period > currentPeriod, "Already distributed for the current period");
        
        monthlyDistribution = calculateMonthlyDistribution(period);
        require(tokensDistributed + monthlyDistribution <= totalTokens, "Exceeds total tokens available");

        if (monthlyDistribution > 0) {
            token.transfer(distributionAddress, monthlyDistribution);
            tokensDistributed += monthlyDistribution;
            currentPeriod = period;
            emit TokensDistributed(period, monthlyDistribution, distributionAddress);
        }

        if (monthlyDistribution <= 100 * (10 ** 18) || tokensDistributed == totalTokens) {
            // Ensure no tokens left to distribute
            uint256 remainingTokens = totalTokens - tokensDistributed;
            token.transfer(distributionAddress, remainingTokens);
            tokensDistributed = totalTokens;
            emit TokensDistributed(period, remainingTokens, distributionAddress);
        }
    }

    function getCurrentPeriod() public view returns (uint256) {
        uint256 elapsedMonths = (block.timestamp - startTime) / 30 days;
        return elapsedMonths + 1; // +1 to start periods from 1
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner is the zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
