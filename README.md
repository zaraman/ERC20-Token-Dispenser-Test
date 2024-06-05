# To run test 

npm i

npx hardhat test

# TimedTokenDistribution

The TimedTokenDistribution contract allows for the controlled distribution of ERC20 tokens over time, following a predetermined schedule. Tokens are distributed once per month, with the maximum distribution amount changing over time according to a predefined schedule.

# Features

Controlled Distribution: Tokens can only be distributed once per month.
Time-Based Limits: The maximum number of tokens that can be distributed each month changes according to a schedule.
Owner-Only Distribution: Only the contract owner can trigger the distribution.
Tracking Distributed Tokens: Keeps track of the total number of distributed tokens and the last month in which tokens were distributed.

# State Variables

token: The ERC20 token to be distributed.
beneficiary: The address receiving the distributed tokens.
totalTokens: The total number of tokens available for distribution.
maxMonthlyDistribution: The maximum number of tokens that can be distributed per month.
startTime: The timestamp when the distribution starts.
distributedTokens: The total number of tokens that have been distributed so far.
lastDistributedMonth: The last month in which tokens were distributed.
# Events

TokensDistributed: Emitted when tokens are distributed to the beneficiary.
Functions
Constructor: Initializes the contract with the token address, beneficiary address, and start time.
distribute: Distributes the tokens to the beneficiary according to the predefined schedule. Ensures distribution occurs only once per month.
calculateMaxTokens: Calculates the maximum number of tokens that can be distributed in a given month based on the distribution schedule.
remainingTokens: Returns the number of tokens remaining for distribution.
getCurrentMonth: Returns the current month number based on the start time.

# Usage Example
Deploy the TimedTokenDistribution contract with the ERC20 token address, beneficiary address, and start time.
Call distribute() once a month to distribute the tokens according to the schedule.
Use calculateMaxTokens(month), remainingTokens(), and getCurrentMonth() to monitor the distribution progress and remaining tokens.