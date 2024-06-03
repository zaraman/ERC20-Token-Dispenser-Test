const { expect } = require("chai");
const { ethers } = require("hardhat");

function toWei(amount, decimals = 18) {
    return BigInt(amount) * BigInt(10 ** decimals);
}

describe("TokenDispenser", function() {

    let ERC20Token, erc20Token, owner, addr1, addr2;

    beforeEach(async function() {
        [owner, addr1, addr2] = await ethers.getSigners();
        ERC20Token = await ethers.getContractFactory("ERC20Token");
        erc20Token = await ERC20Token.deploy(owner);
    

        TokenDispenser = await ethers.getContractFactory("TokenDispenser");
        tokenDispenser = await TokenDispenser.deploy(erc20Token, addr1.address);

        await erc20Token.transfer(tokenDispenser, toWei("700000"));
    });

    async function increaseTime(duration) {
        await ethers.provider.send("evm_increaseTime", [duration]);
        await ethers.provider.send("evm_mine", []);
    }

    it("Should initialize with correct values", async function () {
        expect(await tokenDispenser.totalTokens()).to.equal(toWei(700000));
        expect(await tokenDispenser.distributionAddress()).to.equal(addr1.address);
        expect(await tokenDispenser.owner()).to.equal(owner.address);
        expect(await tokenDispenser.currentPeriod()).to.equal(0);
        expect(await tokenDispenser.tokensDistributed()).to.equal(0);
    });
    
    it("Should handle minimal distribution case", async function () {
        await tokenDispenser.distribute();
        const balance = await erc20Token.balanceOf(addr1.address);
        expect(balance).to.equal(toWei(1000));
        await increaseTime(1 * 30 * 24 * 60 * 60);
        await tokenDispenser.distribute();
        const balance2 = await erc20Token.balanceOf(addr1.address);
        expect(balance2).to.equal(toWei(3500));
        await increaseTime(2 * 30 * 24 * 60 * 60);
        await tokenDispenser.distribute();
        const balance3 = await erc20Token.balanceOf(addr1.address);
        expect(balance3).to.equal(toWei(13500));
        await increaseTime(3 * 30 * 24 * 60 * 60);
        await tokenDispenser.distribute();
        const balance4 = await erc20Token.balanceOf(addr1.address);
        expect(balance4).to.equal(toWei(16000));
    });

    it("Should not distribute more than the specified amount in any month", async function () {
        await tokenDispenser.distribute();
        const balance = await erc20Token.balanceOf(addr1.address);
        console.log(balance.toString());
        expect(balance).to.equal(toWei("1000"));

        await increaseTime(15 * 24 * 60 * 60);
        await expect(tokenDispenser.distribute()).to.be.revertedWith("Already distributed for the current period");
        await increaseTime(15 * 24 * 60 * 60);
        await tokenDispenser.distribute();
        const balance2 = await erc20Token.balanceOf(addr1.address);
        expect(balance2).to.equal(toWei("3500"));
        
    });

    it("Should handle ownership transfer correctly", async function () {
        await expect(tokenDispenser.connect(addr1).transferOwnership(addr1.address)).to.be.revertedWith("Caller is not the owner");
        await tokenDispenser.transferOwnership(addr1.address);
        expect(await tokenDispenser.owner()).to.equal(addr1.address);
    });

    it("Should distribute all remaining tokens when amount to distribute is 100 or less", async function () {
        const periodsToFastForward = Math.ceil(700000 / 10000);
        await increaseTime(periodsToFastForward * 30 * 24 * 60 * 60);

        await tokenDispenser.distribute();
        const remainingTokens = await erc20Token.balanceOf(tokenDispenser);
        expect(remainingTokens).to.be.lte(toWei("100"));
    });

    it("Should fail distribution if not owner", async function () {
        await increaseTime(1 * 30 * 24 * 60 * 60);
        await expect(tokenDispenser.connect(addr2).distribute()).to.be.revertedWith("Caller is not the owner");
    });
    

});