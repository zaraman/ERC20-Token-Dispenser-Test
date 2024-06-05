const { expect } = require("chai");
const { ethers } = require("hardhat");

function toWei(amount, decimals = 18) {
    return BigInt(amount) * BigInt(10 ** decimals);
}

describe("TimedTokenDistribution", function() {

    let ERC20Token, erc20Token, owner, addr1, addr2, TokenDispenser, tokenDispenser;
    const startTime = Math.floor(Date.now() / 1000);

    beforeEach(async function() {
        [owner, addr1, addr2] = await ethers.getSigners();
        ERC20Token = await ethers.getContractFactory("ERC20Token");
        erc20Token = await ERC20Token.deploy(owner);

        TokenDispenser = await ethers.getContractFactory("TimedTokenDistribution");
        tokenDispenser = await TokenDispenser.deploy(erc20Token, addr1, startTime );

        await erc20Token.transfer(tokenDispenser, toWei(700000));
    });

    async function increaseTime(duration) {
        await ethers.provider.send("evm_increaseTime", [duration]);
        await ethers.provider.send("evm_mine", []);
    }

    async function increaseTimeAndDistribute(duration) {
        await ethers.provider.send("evm_increaseTime", [duration]);
        await ethers.provider.send("evm_mine", []);
        await tokenDispenser.distribute();
    }

    it("Should initialize with correct values", async function () {
        expect(await tokenDispenser.totalTokens()).to.equal(toWei(700000));
        expect(await tokenDispenser.beneficiary()).to.equal(addr1.address);
        expect(await tokenDispenser.owner()).to.equal(owner.address);
        expect(await tokenDispenser.distributedTokens()).to.equal(0);
        expect(await tokenDispenser.lastDistributedMonth()).to.equal(0);
    });

    
    
    it("Should return correct current month", async function () {
        expect(await tokenDispenser.getCurrentMonth()).to.equal(0);
        await increaseTime(30 * 24 * 60 * 60); // Increase time by 1 month
        expect(await tokenDispenser.getCurrentMonth()).to.equal(1);
    });

    it("Should not allow distribution more than once in a month", async function () {
        await increaseTime(30 * 24 * 60 * 60); 
        await tokenDispenser.connect(owner).distribute();
        await expect(tokenDispenser.connect(owner).distribute()).to.be.revertedWith("Already distributed this month");
    });

    it("Should distribute correct tokens for the first 3 months", async function () {
        await increaseTime(30 * 24 * 60 * 60); // Increase time by 1 month
        await tokenDispenser.distribute();
        expect(await erc20Token.balanceOf(addr1.address)).to.equal(toWei(1000)); // 1000 tokens
        expect(await tokenDispenser.distributedTokens()).to.equal(toWei(1000));
        await increaseTime(30 * 24 * 60 * 60); // Increase time by 1 month
        await tokenDispenser.distribute();
        expect(await erc20Token.balanceOf(addr1.address)).to.equal(toWei(2000)); // Should remain 2000  
        expect(await tokenDispenser.distributedTokens()).to.equal(toWei(2000));
        await increaseTime(30 * 24 * 60 * 60); // Increase time by 1 month
        await tokenDispenser.distribute();
        expect(await erc20Token.balanceOf(addr1.address)).to.equal(toWei(3000)); // Should remain 2500
        expect(await tokenDispenser.distributedTokens()).to.equal(toWei(3000));

    });

    it("Should distribute correct tokens for the second year ", async function () {
        await increaseTime(13*30 * 24 * 60 * 60); // Increase time by 13 month
        await tokenDispenser.distribute();
        expect(await erc20Token.balanceOf(addr1.address)).to.equal(toWei(2500));
        expect(await tokenDispenser.distributedTokens()).to.equal(toWei(2500));
        
    });

    it("Should distribute correct tokens for the third year ", async function () {
        await increaseTime(36*30 * 24 * 60 * 60); // Increase time by 36 month
        await tokenDispenser.distribute();
        expect(await erc20Token.balanceOf(addr1.address)).to.equal(toWei(5000)); 
        expect(await tokenDispenser.distributedTokens()).to.equal(toWei(5000));
        
    });

    describe("Ownership", function() {
        it("Should transfer ownership correctly", async function () {
            await tokenDispenser.transferOwnership(addr2.address);
            expect(await tokenDispenser.owner()).to.equal(addr2.address);
        });
    });

});
