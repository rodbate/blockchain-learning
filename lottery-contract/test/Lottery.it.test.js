const { ethers, deployments, getNamedAccounts, network } = require("hardhat");
const { assert, expect } = require("chai");
const { dev } = require("../config");

const oneEth = ethers.parseEther("1");

dev
  ? describe.skip
  : describe("Lottery IT Tests", function () {
      let lottery;
      let deployer;
      beforeEach(async function () {
        await deployments.fixture("all");
        deployer = (await getNamedAccounts()).deployer;
        lottery = await ethers.getContract("Lottery");
      });
    });
