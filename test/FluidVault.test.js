const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FluidVault", function () {
  let fluidVault;
  let interestCalculator;
  let governance;
  let owner;
  let user1;
  let user2;
  let mockToken;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy InterestCalculator
    const InterestCalculator = await ethers.getContractFactory("InterestCalculator");
    interestCalculator = await InterestCalculator.deploy();
    await interestCalculator.deployed();

    // Deploy Governance
    const Governance = await ethers.getContractFactory("Governance");
    governance = await Governance.deploy();
    await governance.deployed();

    // Deploy FluidVault
    const FluidVault = await ethers.getContractFactory("FluidVault");
    fluidVault = await FluidVault.deploy(
      interestCalculator.address,
      governance.address,
      owner.address
    );
    await fluidVault.deployed();

    // Deploy mock ERC20 token
    const MockToken = await ethers.getContractFactory("MockERC20");
    mockToken = await MockToken.deploy("Test Token", "TEST", ethers.utils.parseEther("1000000"));
    await mockToken.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await fluidVault.owner()).to.equal(owner.address);
    });

    it("Should set the right interest calculator", async function () {
      expect(await fluidVault.interestCalculator()).to.equal(interestCalculator.address);
    });

    it("Should set the right governance", async function () {
      expect(await fluidVault.governance()).to.equal(governance.address);
    });
  });

  describe("Vault Creation", function () {
    it("Should create a new vault", async function () {
      const initialRate = 500; // 5% APY
      
      await expect(fluidVault.createVault(mockToken.address, initialRate))
        .to.emit(fluidVault, "VaultCreated")
        .withArgs(mockToken.address, initialRate, await ethers.provider.getBlockNumber() + 1);

      expect(await fluidVault.supportedTokens(mockToken.address)).to.be.true;
      
      const vaultInfo = await fluidVault.getVaultInfo(mockToken.address);
      expect(vaultInfo.currentInterestRate).to.equal(initialRate);
      expect(vaultInfo.isActive).to.be.true;
    });

    it("Should not allow non-authorized users to create vaults", async function () {
      await expect(
        fluidVault.connect(user1).createVault(mockToken.address, 500)
      ).to.be.revertedWith("FluidVault: Not authorized");
    });

    it("Should not allow creating vault with rate too high", async function () {
      await expect(
        fluidVault.createVault(mockToken.address, 5001) // > 50%
      ).to.be.revertedWith("FluidVault: Rate too high");
    });
  });

  describe("Deposits", function () {
    beforeEach(async function () {
      // Create vault
      await fluidVault.createVault(mockToken.address, 500); // 5% APY
      
      // Mint tokens to user1
      await mockToken.mint(user1.address, ethers.utils.parseEther("1000"));
      
      // Approve vault to spend tokens
      await mockToken.connect(user1).approve(fluidVault.address, ethers.utils.parseEther("1000"));
    });

    it("Should allow users to deposit tokens", async function () {
      const depositAmount = ethers.utils.parseEther("100");
      
      await expect(fluidVault.connect(user1).deposit(mockToken.address, depositAmount))
        .to.emit(fluidVault, "Deposit")
        .withArgs(user1.address, mockToken.address, depositAmount, await ethers.provider.getBlockNumber() + 1);

      const userDeposit = await fluidVault.getUserDeposit(user1.address, mockToken.address);
      expect(userDeposit.amount).to.equal(depositAmount);
    });

    it("Should not allow deposits below minimum", async function () {
      const depositAmount = ethers.utils.parseEther("0.0001"); // Below minimum
      
      await expect(
        fluidVault.connect(user1).deposit(mockToken.address, depositAmount)
      ).to.be.revertedWith("FluidVault: Deposit too small");
    });

    it("Should not allow deposits to unsupported tokens", async function () {
      const depositAmount = ethers.utils.parseEther("100");
      
      await expect(
        fluidVault.connect(user1).deposit(ethers.constants.AddressZero, depositAmount)
      ).to.be.revertedWith("FluidVault: Token not supported");
    });
  });

  describe("Withdrawals", function () {
    beforeEach(async function () {
      // Create vault
      await fluidVault.createVault(mockToken.address, 500); // 5% APY
      
      // Mint tokens to user1
      await mockToken.mint(user1.address, ethers.utils.parseEther("1000"));
      
      // Approve and deposit
      await mockToken.connect(user1).approve(fluidVault.address, ethers.utils.parseEther("1000"));
      await fluidVault.connect(user1).deposit(mockToken.address, ethers.utils.parseEther("100"));
    });

    it("Should allow partial withdrawals", async function () {
      const withdrawAmount = ethers.utils.parseEther("50");
      
      await expect(fluidVault.connect(user1).withdraw(mockToken.address, withdrawAmount))
        .to.emit(fluidVault, "Withdrawal")
        .withArgs(user1.address, mockToken.address, withdrawAmount, 0, await ethers.provider.getBlockNumber() + 1);

      const userDeposit = await fluidVault.getUserDeposit(user1.address, mockToken.address);
      expect(userDeposit.amount).to.equal(ethers.utils.parseEther("50"));
    });

    it("Should allow full withdrawals with interest", async function () {
      // Fast forward time to accrue interest
      await ethers.provider.send("evm_increaseTime", [86400]); // 1 day
      await ethers.provider.send("evm_mine");
      
      await expect(fluidVault.connect(user1).withdrawAll(mockToken.address))
        .to.emit(fluidVault, "Withdrawal");

      const userDeposit = await fluidVault.getUserDeposit(user1.address, mockToken.address);
      expect(userDeposit.amount).to.equal(0);
    });

    it("Should not allow withdrawals exceeding deposit", async function () {
      const withdrawAmount = ethers.utils.parseEther("150"); // More than deposited
      
      await expect(
        fluidVault.connect(user1).withdraw(mockToken.address, withdrawAmount)
      ).to.be.revertedWith("FluidVault: Insufficient deposit");
    });
  });

  describe("Interest Calculations", function () {
    beforeEach(async function () {
      // Create vault
      await fluidVault.createVault(mockToken.address, 500); // 5% APY
      
      // Mint tokens to user1
      await mockToken.mint(user1.address, ethers.utils.parseEther("1000"));
      
      // Approve and deposit
      await mockToken.connect(user1).approve(fluidVault.address, ethers.utils.parseEther("1000"));
      await fluidVault.connect(user1).deposit(mockToken.address, ethers.utils.parseEther("100"));
    });

    it("Should calculate interest correctly", async function () {
      // Fast forward 1 year
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      
      const interest = await fluidVault.getCurrentInterest(user1.address, mockToken.address);
      expect(interest).to.be.gt(0);
    });

    it("Should emit InterestAccrued events", async function () {
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [86400]); // 1 day
      await ethers.provider.send("evm_mine");
      
      // Trigger interest accrual by making another deposit
      await fluidVault.connect(user1).deposit(mockToken.address, ethers.utils.parseEther("10"));
      
      // Check that interest was accrued
      const userDeposit = await fluidVault.getUserDeposit(user1.address, mockToken.address);
      expect(userDeposit.accumulatedInterest).to.be.gt(0);
    });
  });

  describe("Governance Integration", function () {
    it("Should allow authorized operators to update interest rates", async function () {
      // Create vault
      await fluidVault.createVault(mockToken.address, 500); // 5% APY
      
      const newRate = 600; // 6% APY
      
      await expect(fluidVault.updateInterestRate(mockToken.address, newRate))
        .to.emit(fluidVault, "InterestRateUpdated")
        .withArgs(mockToken.address, newRate, await ethers.provider.getBlockNumber() + 1);

      const vaultInfo = await fluidVault.getVaultInfo(mockToken.address);
      expect(vaultInfo.currentInterestRate).to.equal(newRate);
    });

    it("Should not allow non-authorized users to update rates", async function () {
      // Create vault
      await fluidVault.createVault(mockToken.address, 500);
      
      await expect(
        fluidVault.connect(user1).updateInterestRate(mockToken.address, 600)
      ).to.be.revertedWith("FluidVault: Not authorized");
    });
  });

  describe("Security Features", function () {
    it("Should allow owner to pause the contract", async function () {
      await fluidVault.pause();
      expect(await fluidVault.paused()).to.be.true;
    });

    it("Should not allow operations when paused", async function () {
      // Create vault and prepare deposit
      await fluidVault.createVault(mockToken.address, 500);
      await mockToken.mint(user1.address, ethers.utils.parseEther("1000"));
      await mockToken.connect(user1).approve(fluidVault.address, ethers.utils.parseEther("1000"));
      
      // Pause contract
      await fluidVault.pause();
      
      // Try to deposit
      await expect(
        fluidVault.connect(user1).deposit(mockToken.address, ethers.utils.parseEther("100"))
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should allow owner to unpause the contract", async function () {
      await fluidVault.pause();
      await fluidVault.unpause();
      expect(await fluidVault.paused()).to.be.false;
    });
  });
});

// Mock ERC20 contract for testing
const MockERC20 = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol, uint256 initialSupply) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
`;
