const { ethers, deployments, getNamedAccounts, network } = require("hardhat");
const { assert, expect } = require("chai");
const { dev } = require("../config");

const oneEth = ethers.parseEther("1");

!dev
  ? describe.skip
  : describe("Lottery Unit Tests", function () {
      let lottery;
      let vrfCoordinator;
      let deployer;
      let interval;
      beforeEach(async function () {
        await deployments.fixture("all");
        deployer = (await getNamedAccounts()).deployer;
        lottery = await ethers.getContract("Lottery");
        interval = await lottery.getInterval();
        vrfCoordinator = await ethers.getContract("VRFCoordinatorV2Mock");
      });

      describe("constructor", function () {
        it("vrfCoordinator address assert", async function () {
          const vrf = await lottery.getVrfCoordinator();
          assert.equal(vrfCoordinator.target, vrf);
        });

        it("state is open", async function () {
          const state = await lottery.getState();
          assert.equal("0", state.toString());
        });
      });

      describe("join", function () {
        it("not enough eth", async function () {
          await expect(lottery.join()).to.be.revertedWithCustomError(
            lottery,
            "Lottery__NotEnoughMinEth"
          );
        });

        it("persist player", async function () {
          await lottery.join({ value: ethers.parseEther("1") });
          const player = await lottery.getPlayer(0);
          assert.equal(deployer, player);
        });

        it("emit join event", async function () {
          await expect(
            lottery.join({ value: ethers.parseEther("1") })
          ).to.be.emit(lottery, "LotteryJoin");
        });

        it("cannot join when not open", async function () {
          await lottery.join({ value: oneEth });
          await network.provider.send("evm_increaseTime", [
            Number(interval + 1n),
          ]);
          await network.provider.send("evm_mine", []);
          await lottery.performUpkeep("0x");
          await expect(
            lottery.join({ value: oneEth })
          ).to.be.revertedWithCustomError(lottery, "Lottery__NotOpenState");
        });
      });

      describe("checkUpkeep", function () {
        it("return false when no players", async function () {
          await network.provider.send("evm_increaseTime", [
            Number(interval + 1n),
          ]);
          await network.provider.send("evm_mine", []);
          const { needed } = await lottery.checkUpkeep.staticCall("0x");
          assert.equal(false, needed);
        });

        it("return false when not reached interval", async function () {
          await lottery.join({ value: oneEth });
          await network.provider.send("evm_increaseTime", [
            Number(interval - 2n),
          ]);
          await network.provider.send("evm_mine", []);
          const { needed } = await lottery.checkUpkeep.staticCall("0x");
          assert.equal(false, needed);
        });

        it("return true", async function () {
          await lottery.join({ value: oneEth });
          await network.provider.send("evm_increaseTime", [
            Number(interval + 1n),
          ]);
          await network.provider.send("evm_mine", []);
          const { needed } = await lottery.checkUpkeep.staticCall("0x");
          assert.equal(true, needed);
        });
      });

      describe("performUpkeep", function () {
        it("upkeep not need", async function () {
          await expect(
            lottery.performUpkeep("0x")
          ).to.be.revertedWithCustomError(lottery, "Lottery__UpkeepNotNeed");
        });

        it("upkeep need", async function () {
          await lottery.join({ value: oneEth });
          await network.provider.send("evm_increaseTime", [
            Number(interval + 1n),
          ]);
          await network.provider.send("evm_mine", []);
          const rs = await lottery.performUpkeep("0x");
          const receipt = await rs.wait(1);
          const requestId = receipt.logs[1].args.requestId;

          let state = await lottery.getState();
          assert.equal("1", state.toString());

          await vrfCoordinator.fulfillRandomWords(requestId, lottery.target);

          state = await lottery.getState();
          assert.equal("0", state.toString());
          const winner = await lottery.getLastWinner();
          assert.equal(deployer, winner);
        });
      });
    });
