# To run test 
npm i
npx hardhat test
# ERC20-Token-Dispenser-Test
The ERC20 Token Dispenser contract is designed to distribute a fixed amount of ERC20 tokens over a predefined schedule. This system ensures tokens are distributed monthly without exceeding the maximum specified amount per month. The distribution follows a specific pattern over several years, gradually decreasing until all tokens are distributed.
# Smart Contract (TokenDispenser):
# Variables:

totalTokens: The total number of tokens to be distributed (700,000).

distributionAddress: The address that will receive the distributed tokens.

owner: The address with special permissions to manage the contract.

startTime: The timestamp when the distribution starts.

tokensDistributed: The total number of tokens distributed so far.

currentPeriod: Tracks the current distribution period.

monthlyDistribution: Tracks the number of tokens distributed in the current month.

token: Interface to the ERC20 token.

# Events:

TokensDistributed: Logs details of each token distribution.

OwnershipTransferred: Logs details of ownership transfers.

# Modifiers:

onlyOwner: Restricts access to certain functions to the owner.

# Functions:

constructor: Initializes the contract with the token address, distribution address, and sets the owner.

calculateMonthlyDistribution: Computes the maximum number of tokens to distribute for a given period.

distribute: Distributes tokens based on the current period and updates state variables.

getCurrentPeriod: Determines the current distribution period based on the elapsed time.

transferOwnership: Allows the owner to transfer contract ownership.

# Smart Contract Workflow
Initialization:

The owner deploys the contract, setting the ERC20 token address and the distribution address.
startTime is set to the deployment time.
Initial period and distribution variables are set.
Token Distribution:

The owner calls the distribute function monthly.
The function calculates the current period using getCurrentPeriod.
The calculateMonthlyDistribution function computes the allowed tokens for the current period.
Tokens are transferred to the distributionAddress.
Events are emitted to log the distribution details.
Ownership Management:

The onlyOwner modifier ensures only the owner can call restricted functions.
The owner can transfer ownership using the transferOwnership function, emitting an event to log the change.
Detailed Function Descriptions