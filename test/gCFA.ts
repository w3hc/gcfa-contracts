import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { parseEther } from "ethers/lib/utils";
import { getRandomAddress } from "./helpers";

describe("gCFA", function () {
  async function deployContractsFixture() {
    const [alice, bob, recovery] = await ethers.getSigners();

    const EURMock = await ethers.getContractFactory("EURMock");
    const eur = await EURMock.deploy();
    await eur.deployed();

    const rate = 655957;

    const IdentityMock = await ethers.getContractFactory("IdentityMock");
    const identity = await IdentityMock.deploy();
    await identity.deployed();

    await identity.addWhitelisted(alice.address);

    const NameServiceMock = await ethers.getContractFactory("NameServiceMock");
    const nameService = await NameServiceMock.deploy(identity.address);
    await nameService.deployed();

    const gCFA = await ethers.getContractFactory("gCFA");
    const cfa = await gCFA.deploy(eur.address, recovery.address, rate, nameService.address);
    await cfa.deployed();

    return { cfa, eur, alice, bob, recovery, rate };
  }

  describe("Deployment", function () {
    it("Should set the right underlying asset", async function () {
      const { cfa, eur } = await loadFixture(deployContractsFixture);
      expect(await cfa.underlying()).to.equal(eur.address);
    });

    it("Should set the right recovery address", async function () {
      const { cfa, recovery } = await loadFixture(deployContractsFixture);
      expect(await cfa.recoveryAddress()).to.equal(recovery.address);
    });

    it("Should set the right rate", async function () {
      const { cfa, rate } = await loadFixture(deployContractsFixture);
      expect(await cfa.rate()).to.equal(rate);
    });
  });

  describe("Interactions", function () {
    it("Should mint 1525 units", async function () {
      const { eur, alice } = await loadFixture(deployContractsFixture);
      expect(await eur.balanceOf(alice.address)).to.equal(parseEther("1525"));
      expect(eur.mint());
      expect(await eur.balanceOf(alice.address)).to.equal(parseEther("1625"));
    });

    it("Should approve gCFA contract", async function () {
      const { eur, cfa, alice } = await loadFixture(deployContractsFixture);
      expect(eur.approve(cfa.address, parseEther("10000")));
      expect(await eur.allowance(alice.address, cfa.address)).to.equal(
        parseEther("10000")
      );
    });

    it("Should mint using the correct rate", async function () {
      const { eur, cfa, alice, rate } = await loadFixture(
        deployContractsFixture
      );

      expect(eur.approve(cfa.address, parseEther("1")));
      expect(await eur.allowance(alice.address, cfa.address)).to.equal(
        parseEther("1")
      );
      expect(cfa.depositFor(alice.address, 1000));
      expect(await eur.balanceOf(alice.address)).to.equal(1524999999999999999000n);
      expect(await cfa.balanceOf(alice.address)).to.equal(rate.toString());
    });

    it("Should revert if EUR max limit is reached", async function () {
      const { eur, cfa, alice, rate } = await loadFixture(
        deployContractsFixture
      );

      expect(eur.approve(cfa.address, parseEther("2000")));
      expect(await eur.allowance(alice.address, cfa.address)).to.equal(
        parseEther("2000")
      );
      expect(cfa.depositFor(alice.address, parseEther("2000"))).to.be.revertedWith("Amount too high");
    });

    it("Should withdraw EUR", async function () {
      const { eur, cfa, alice, rate } = await loadFixture(
        deployContractsFixture
      );

      // deposit
      expect(eur.approve(cfa.address, parseEther("1")));
      expect(await eur.allowance(alice.address, cfa.address)).to.equal(
        parseEther("1")
      );
      expect(cfa.depositFor(alice.address, 1000));
      expect(await eur.balanceOf(alice.address)).to.equal(1524999999999999999000n);
      expect(await cfa.balanceOf(alice.address)).to.equal(rate.toString());

      // withdraw
      const currentBalance = await cfa.balanceOf(alice.address);
      expect(cfa.withdrawTo(alice.address, currentBalance));
      expect(await eur.balanceOf(alice.address)).to.equal(parseEther("1525"));
    });

    it("Should revert if gCFA max limit is reached", async function () {
      const { eur, cfa, alice, rate } = await loadFixture(
        deployContractsFixture
      );

      // deposit
      expect(eur.approve(cfa.address, parseEther("1525")));
      expect(await eur.allowance(alice.address, cfa.address)).to.equal(
        parseEther("1525")
      );
      expect(cfa.depositFor(alice.address, parseEther("1525")));
      expect(await eur.balanceOf(alice.address)).to.equal(0);
      expect(await cfa.balanceOf(alice.address)).to.equal(parseEther("1000334.425"));

      // withdraw
      expect(cfa.withdrawTo(alice.address, parseEther("1000001"))).to.be.revertedWith("Amount too high");
      expect(await cfa.balanceOf(alice.address)).to.equal(parseEther("1000334.425"));
    });

    it("Should recover lost EUR", async function () {
      const { eur, cfa, alice, recovery } = await loadFixture(
        deployContractsFixture
      );
      expect(cfa.recoverEUR()).to.be.revertedWith("Nothing to recover");
      expect(await eur.transfer(cfa.address, parseEther("1")));
      expect(await eur.balanceOf(alice.address)).to.equal(parseEther("1524"));
      expect(await cfa.recoverEUR());
      expect(await cfa.balanceOf(recovery.address)).to.equal(
        parseEther("655.957")
      );
    });

    it("Should recover lost CFA", async function () {
      const { eur, cfa, alice, recovery, rate } = await loadFixture(
        deployContractsFixture
      );
      expect(cfa.recoverCFA()).to.be.revertedWith("Nothing to recover");
      expect(eur.approve(cfa.address, parseEther("1")));
      expect(await cfa.depositFor(alice.address, 1000));
      expect(await eur.allowance(alice.address, cfa.address)).to.equal(
        999999999999999000n
      );
      expect(await eur.balanceOf(alice.address)).to.equal(parseEther("1524.999999999999999000"));
      expect(await cfa.transfer(cfa.address, 655957));
      expect(await cfa.balanceOf(alice.address)).to.equal(parseEther("0"));
      expect(await cfa.balanceOf(cfa.address)).to.equal(655957);
      expect(await eur.balanceOf(recovery.address)).to.equal(0);
      expect(await cfa.recoverCFA());
      expect(await cfa.balanceOf(cfa.address)).to.equal(parseEther("0"));
      expect(await eur.balanceOf(recovery.address)).to.equal(1000);
    });

    xit("Should set Name Service for deployer", async function () {
      const { cfa, recovery } = await loadFixture(deployContractsFixture);
      const nameServiceBefore = await cfa.nameService();
      const randomAddress = getRandomAddress();
      expect(await cfa.connect(recovery).setNameService(randomAddress)).to.not.be.reverted;
      const nameServiceAfter = await cfa.nameService();
      expect(nameServiceAfter).to.not.equal(nameServiceBefore);
    });

    xit("Should not set Name Service for not deployer", async function () {
      const { cfa, alice } = await loadFixture(deployContractsFixture);
      const nameServiceBefore = await cfa.nameService();
      const randomAddress = getRandomAddress();
      expect(cfa.connect(alice).setNameService(randomAddress)).to.be.revertedWith("Requires a community vote");
      const nameServiceAfter = await cfa.nameService();
      expect(nameServiceAfter).to.equal(nameServiceBefore);
    });
  });
});
