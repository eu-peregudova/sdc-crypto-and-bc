import { expect } from "chai";
import { network } from "hardhat";
import { describe, it } from "mocha";

const INITIAL_SUPPLY = 1_000_000n * 10n ** 18n;

describe("MyToken", function () {
  async function deployToken() {
    const { ethers } = await network.create();
    const [deployer, recipient, spender, nonOwner] = await ethers.getSigners();
    const MyToken = await ethers.getContractFactory("MyToken");
    const token = await MyToken.deploy(INITIAL_SUPPLY);
    await token.waitForDeployment();

    return { deployer, recipient, spender, nonOwner, token };
  }

  it("sets the token metadata and initial supply", async function () {
    const { token } = await deployToken();

    expect(await token.name()).to.equal("MyToken");
    expect(await token.symbol()).to.equal("MTK");
    expect(await token.decimals()).to.equal(18);
    expect(await token.totalSupply()).to.equal(INITIAL_SUPPLY);
  });

  it("assigns the initial supply and ownership to the deployer", async function () {
    const { deployer, token } = await deployToken();

    expect(await token.balanceOf(deployer.address)).to.equal(INITIAL_SUPPLY);
    expect(await token.owner()).to.equal(deployer.address);
  });

  it("allows the owner to mint tokens", async function () {
    const { deployer, token } = await deployToken();
    const amount = 100n * 10n ** 18n;

    await token.mint(deployer.address, amount);

    expect(await token.balanceOf(deployer.address)).to.equal(
      INITIAL_SUPPLY + amount,
    );
    expect(await token.totalSupply()).to.equal(INITIAL_SUPPLY + amount);
  });

  it("allows transfers and delegated transferFrom calls", async function () {
    const { deployer, recipient, spender, token } = await deployToken();
    const amount = 100n;

    await token.transfer(recipient.address, amount);
    expect(await token.balanceOf(recipient.address)).to.equal(amount);

    await token.approve(spender.address, amount);
    await token.connect(spender).transferFrom(deployer.address, recipient.address, amount);

    expect(await token.balanceOf(recipient.address)).to.equal(amount * 2n);
  });

  it("rejects minting from a non-owner account", async function () {
    const { nonOwner, token } = await deployToken();

    await expect(token.connect(nonOwner).mint(nonOwner.address, 1n))
      .to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
  });

  it("rejects transfers above the available balance", async function () {
    const { recipient, token } = await deployToken();

    await expect(token.transfer(recipient.address, INITIAL_SUPPLY + 1n))
      .to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");
  });
});
