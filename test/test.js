const { expect } = require("chai");
const { ethers } = require("hardhat");

// Contracts
let rookieContract;
let amateurContract;
let proContract;
let legendContract;

// Deployment
BeforeEach(async () => {
  // Rookie contract
  const Rookie = await hre.ethers.getContractFactory("Rookie");
  const rookie = await Rookie.deploy();
  rookieContract = rookie.deployed();

  // Amateur contract
  const Amateur = await hre.ethers.getContractFactory("Amateur");
  const amateur = await Amateur.deploy();
  amateurContract = await amateur.deployed();

  // Pro contract
  const Pro = await hre.ethers.getContractFactory("Pro");
  const pro = await Pro.deploy();
  proContract = await pro.deployed();

  // Legend contract
  const Legend = await hre.ethers.getContractFactory("Legend");
  const legend = await Legend.deploy();
  legendContract = await legend.deployed();
});

// Tests of Rookie
describe("Rookie", function () {
  it("", async function () {});
});

// Tests of Amateur
describe("Amateur", function () {
  it("", async function () {});
});

// Tests of Pro
describe("Pro", function () {
  it("", async function () {});
});

// Tests of Legend
describe("Legend", function () {
  it("", async function () {});
});
