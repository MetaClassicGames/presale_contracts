const { expect } = require("chai");
const { ethers } = require("hardhat");

let owner, admin, B1, B2, B3, B4, B5;
const quantity = 20;

let beneficiaries;
let quantities;

// Contracts
let usdContract;
let rookieContract;
let amateurContract;
let proContract;
let legendContract;

const rookiePrice = 50;
const amateurPrice  = 70;
const proPrice      = 100;
const legendPrice   = 150;

let te1;

// Add days to timestamp
// Date.prototype.addDays = function (days) {
//   var date = new Date(this.valueOf());
//   date.setDate(date.getDate() + days);
//   return date;
// };

//DEPLOY
describe("Deploy", function () {
  this.beforeAll(async function () {
    try {
      // Get signers
      [owner, admin, B1, B2, B3, B4, B5] = await ethers.getSigners();

      beneficiaries = [
        B1,
        B2,
        B3,
        B4,
        B5
      ];
      quantities = Array(beneficiaries.length).fill(quantity);

      // const days = 1;
      // let today = new Date();
      // today = today.addDays(days).getTime();
      // const limit = (today - (today % 1000)) / 1000;

      //USDC contract
      const USDC = await ethers.getContractFactory("USDC");
      usdContract = await USDC.deploy();
      await usdContract.deployed();

      // Rookie contract
      const Rookie = await ethers.getContractFactory("RookieE0");
      rookieContract = await Rookie.deploy(
        ethers.constants.AddressZero,
        ethers.utils.parseEther(rookiePrice.toString())
      );
      rookieContract.deployed();

      // Amateur contract
      const Amateur = await ethers.getContractFactory("AmateurE0");
      amateurContract = await Amateur.deploy(
        ethers.constants.AddressZero,
        ethers.utils.parseEther(amateurPrice.toString())
      );
      await amateurContract.deployed();

      // Pro contract
      const Pro = await ethers.getContractFactory("ProE0");
      proContract = await Pro.deploy(
        ethers.constants.AddressZero,
        ethers.utils.parseEther(proPrice.toString())
      );
      await proContract.deployed();

      // Legend contract
      const Legend = await ethers.getContractFactory("LegendE0");
      legendContract = await Legend.deploy(
        ethers.constants.AddressZero,
        ethers.utils.parseEther(legendPrice.toString())
      );
      await legendContract.deployed();
    } catch (ex) {
      console.error(ex);
    }
  });
  it("All smart contracts deployed", async function () {});
});

describe("USDC", function () {
  const USDCForAccounts = 100000;
  it("Deposits 100000 USDC into owner address", async function () {
    const amount = await ethers.utils.parseEther(USDCForAccounts.toString());

    await usdContract.depositTest(owner.address, amount);
    const total = await usdContract.balanceOf(owner.address);
    expect(parseInt(ethers.utils.formatEther(total))).to.equal(USDCForAccounts);
  });
});

// Tests of Presale Contract
describe("Presale Contract Test Suite", function () {
  // admin IS NOT ADMIN_ROLE
  it("Roles control", async function () {
    // R1
    await expect(
      rookieContract.connect(admin).setNewStableCoin(usdContract.address),
      "REVERT: ROLES"
    ).to.be.reverted;
    // R4
    await expect(
      rookieContract
        .connect(admin)
        .setNewPrice(ethers.utils.parseEther(rookiePrice.toString())),
      "REVERT: ROLES"
    ).to.be.reverted;
    // R6
    await expect(rookieContract.connect(admin).setEndOfPS(true), "REVERT: ROLES")
      .to.be.reverted;
    // R8
    await expect(
      rookieContract.connect(admin).setChildContractAddress(admin.address),
      "REVERT: ROLES"
    ).to.be.reverted;
    // R13
    await expect(rookieContract.connect(admin).setURI("hola"), "REVERT: ROLES")
      .to.be.reverted;
    // RX
    await expect(
      rookieContract.connect(admin).setNewPrivateSell(admin.address, 1),
      "REVERT: ROLES"
    ).to.be.reverted;
    // R25
    await expect(
      rookieContract.connect(admin).withdrawFunds(admin.address),
      "REVERT: ROLES"
    ).to.be.reverted;
    // R25
    await expect(
      rookieContract.connect(admin).nativeWithdraw(admin.address),
      "REVERT: ROLES"
    ).to.be.reverted;

    const ADMIN_ROLE = ethers.utils.id("ADMIN_ROLE");

    // RolesR2
    await expect(
      rookieContract.connect(admin).grantRole(ADMIN_ROLE, admin.address),
      "REVERT: roles"
    ).to.be.reverted;
    // RolesV1
    await expect(
      rookieContract.grantRole(ADMIN_ROLE, admin.address),
      "ROL ACTIONER is ADMIN"
    ).not.to.be.reverted;
  });

  it("setNewStableCoin fx", async function () {
    // R2
    await expect(
      rookieContract
        .connect(admin)
        .setNewStableCoin(ethers.constants.AddressZero),
      "Zero address for StableCoin"
    ).to.be.revertedWith("RKE0: StableCoin address shouldn't be zero address");
    //TODO R3
    // await expect(rookieContract.setNewStableCoin(B1.address),'NO ERC20 address for StableCoin').to.be.reverted;
    // V1
    await expect(
      rookieContract.connect(admin).setNewStableCoin(usdContract.address),
      "USDC set"
    ).not.to.be.reverted;

    const real = await rookieContract.stableCoin();

    //* Success criteria
    expect(usdContract.address, "USDC contract seted").to.equal(real);
  });

  it("setNewPrice fx", async function () {
    const expected = ethers.utils.parseEther(rookiePrice.toString());

    // R5
    await expect(
      rookieContract.connect(admin).setNewPrice(0),
      "REVERT: New price 0"
    ).to.be.revertedWith("RKE0: Price must be greater than 0 wei");
    // V2
    await expect(
      rookieContract.connect(admin).setNewPrice(expected),
      "New price set"
    ).not.to.be.reverted;

    const real = await rookieContract.price();

    //* Success Criteria
    expect(expected, "New price succesfully seted").to.equal(real);
  });

  it("setEndOfPS fx", async function () {
    // R7 (no timestamp)
    // await expect(
    //   rookieContract.connect(admin).setEndOfPS(false),
    //   'REVERT: ts < actual'
    // ).to.be.revertedWith(
    //   "RKE0: Date must be greater than now"
    // );

    // V3
    await expect(
      rookieContract.connect(admin).setEndOfPS(false),
      "New value set"
    ).not.to.be.reverted;

    const real = await rookieContract.getEndOfPS();

    //* Success criteria
    expect(false, "New ts succesfully seted").to.equal(real);
  });

  it("setChildContractAddress fx", async function () {
    // R9
    await expect(
      rookieContract
        .connect(admin)
        .setChildContractAddress(ethers.constants.AddressZero),
      "REVERT: zeroAddress child contract"
    ).to.be.revertedWith("RKE0: Zero address shouldn't be child contract");

    try {
      const TE1 = await ethers.getContractFactory("TokenEd1");
      te1 = await TE1.deploy(rookieContract.address);
      await te1.deployed();
    } catch (ex) {
      console.error(ex);
    }

    // V4
    await expect(
      rookieContract.connect(admin).setChildContractAddress(te1.address),
      "child contract address seted"
    ).not.to.be.reverted;

    const real = await rookieContract.getChildContractAddress();

    //* Success criteria
    expect(te1.address).to.equal(real);
  });

  it("Mint 1 Rookie Ed 0 for owner", async function () {
    // Initial balances
    // Contract
    const contractBalanceB = await usdContract.balanceOf(
      rookieContract.address
    );
    expect(0, "Contract balance 0").to.equal(parseInt(contractBalanceB));

    // Owner
    const ownerBalanceB = await usdContract.balanceOf(owner.address);
    expect(100000, "Owner balance").to.equal(
      parseInt(ethers.utils.formatEther(ownerBalanceB))
    );

    // R20
    await expect(
      rookieContract.mintRookie(ethers.constants.AddressZero),
      "REVERT: Mint Rookie ADDRESS ZERO"
    ).to.be.revertedWith("RKE0: Address shouldn't be zero");
    // R21
    await expect(
      rookieContract.mintRookie(owner.address),
      "REVERT: Allowance < rookiePrice"
    ).to.be.reverted;
    // R22
    await expect(
      rookieContract.mintRookie(admin.address),
      "REVERT: Admin has 0 USDC"
    ).to.be.revertedWith("USDC: Insufficient funds");

    // Approval
    if (
      parseInt(
        await usdContract.allowance(owner.address, rookieContract.address)
      ) < parseInt(ethers.utils.parseEther(rookiePrice.toString()))
    ) {
      await expect(
        usdContract.approve(
          rookieContract.address,
          ethers.utils.parseEther(rookiePrice.toString())
        ),
        "Mint Approve"
      ).not.to.be.reverted;
    }

    // Mint
    await expect(
      rookieContract.mintRookie(owner.address),
      "Mint Rookie tk0"
    ).to.emit(rookieContract, "RookieMinted");

    // Check balances
    const breedingCount = await rookieContract.getCounterBreeding(22);
    expect(0, "Counter breeding tk0").to.equal(breedingCount);

    // Contract balance USDC
    const contractBalanceA = await usdContract.balanceOf(
      rookieContract.address
    );
    expect(
      parseInt(ethers.utils.formatEther(contractBalanceA)),
      "Contract balance updated"
    ).to.equal(rookiePrice);

    // Owner balance USDC
    const ownerBalanceA = await usdContract.balanceOf(owner.address);
    expect(
      parseInt(ethers.utils.formatEther(ownerBalanceA)),
      "Owner balance"
    ).to.equal(99950);

    // Balance of owner ERC721
    const balanceExp = 1;
    const realBalance = await rookieContract.balanceOf(owner.address);

    //* Success criteria
    expect(balanceExp, "Balance of rookie owner").to.equal(realBalance);
  });

  it("Should revert when safeMint function is called", async function () {
    // R24 Deployer
    await expect(
      rookieContract.safeMint(owner.address),
      "REVERT: Mint deployer"
    ).to.be.reverted;
    // R24 Admin
    await expect(
      rookieContract.connect(admin).safeMint(admin.address),
      "REVERT: Mint admin"
    ).to.be.reverted;
  });

  it("setNewPrivateSell fx", async function () {
    // R15
    await expect(
      rookieContract.setNewPrivateSell(ethers.constants.AddressZero, 1),
      "REVERT: Private sell to address zero"
    ).to.be.revertedWith("RKE0: Address shouldn't be zero");

    // V9
    for (let i = 0; i < beneficiaries.length; i++) {
      await expect(
        rookieContract.connect(admin).setNewPrivateSell(beneficiaries[i].address, quantity),
        "Added to private sell"
      ).not.to.be.reverted;
    }
    
    const real_quantity = await rookieContract.getPrivateSell(B1.address);
    const new_privatelycount = 100;

    //* Success criteria
    expect(
      quantity,
      "new quantity to B1 added to private sell"
    ).to.equal(real_quantity);

    expect(await rookieContract.getPrivatelySellCount()).to.equal(
      new_privatelycount
    );
  });

  it("Should revert, PreSale is not over", async function () {
    // R19
    await expect(
      rookieContract.connect(B1).doPrivateSell(),
      "REVERT mint privateSell"
    ).to.be.revertedWith("RKE0: Presale is not over yet");
  });

  it("Should do a private sell to B1", async function () {
    await expect(
      rookieContract.connect(admin).setEndOfPS(true),
      "Set new PS date"
    ).not.to.be.reverted;

    // R17
    await expect(
      rookieContract.connect(owner).doPrivateSell(),
      "REVERT: owner isn't into private sell"
    ).to.be.revertedWith("RKE0: Beneficiary isn't into private sell");

    // V10
    await expect(rookieContract.connect(B1).doPrivateSell(), "privateSell").not
      .to.be.reverted;

    //* Success criteria
    expect(
      await rookieContract.balanceOf(B1.address),
      "Check new balance of B1"
    ).to.equal(quantity);
    expect(
      await rookieContract.getPrivateSell(B1.address),
      "Check if B1 is seted to 0 in mapping after private sell"
    ).to.equal(0);
  });

  it("Should revert when try to do a private sell to B1 again", async function () {
    await expect(
      rookieContract.connect(B1).doPrivateSell(),
      "privateSell"
    ).to.be.revertedWith("RKE0: Beneficiary isn't into private sell");
  });

  it("Should withdraw USDC balance to admin wallet", async function () {
    // R26
    // await expect(
    //   rookieContract.connect(admin).withdrawFunds(ethers.constants.AddressZero),
    //   "REVERT: Withdraw USDC to address zero"
    // ).to.be.revertedWith("RKE0: Address shouldn't be zero");

    const adminBalanceBefore = await usdContract.balanceOf(admin.address);
    expect(
      parseInt(ethers.utils.formatEther(adminBalanceBefore)),
      "Admin balance before"
    ).to.equal(0);

    //V12
    await expect(rookieContract.connect(admin).withdrawFunds(), "Withdraw USDC")
      .not.to.be.reverted;

    //* Success criteria
    const adminBalanceAfter = await usdContract.balanceOf(admin.address);
    const contractBalance = await usdContract.balanceOf(rookieContract.address);

    expect(
      parseInt(ethers.utils.formatEther(adminBalanceAfter)),
      "Admin balance before"
    ).to.equal(rookiePrice);
    expect(
      parseInt(ethers.utils.formatEther(contractBalance)),
      "Admin balance before"
    ).to.equal(0);
  });

  it("Should revert when B1 address try to call setCounterBreeding", async function () {
    expect(
      await rookieContract.getCounterBreeding(2),
      "getCounterBreeding"
    ).to.equal(0);
    await expect(
      rookieContract.setCounterBreeding(2, B1.address),
      "REVERT: setCounterBreeding"
    ).to.be.revertedWith("RKE0: Caller isnt the child contract");
  });

  it("Reproduce 2 and 3", async function () {
    expect(
      await rookieContract.getCounterBreeding(2),
      "getCounterBreeding"
    ).to.equal(0);
    expect(
      await rookieContract.getCounterBreeding(3),
      "getCounterBreeding"
    ).to.equal(0);

    await expect(te1.connect(B1).reproduce(2, 3), "Breed").to.emit(
      te1,
      "MintedByBreed"
    );

    expect(
      await rookieContract.getCounterBreeding(2),
      "getCounterBreedingAfterReproduce1"
    ).to.equal(1);
    expect(
      await rookieContract.getCounterBreeding(3),
      "getCounterBreedingAfterReproduce1"
    ).to.equal(1);
  });

  it("Should revert when 2 and 3 calls reproduce when it calls again", async function () {
    await expect(te1.connect(B1).reproduce(2, 3), "Breed").to.emit(
      te1,
      "MintedByBreed"
    );

    expect(
      await rookieContract.getCounterBreeding(2),
      "getCounterBreedingAfterReproduce1"
    ).to.equal(2);
    expect(
      await rookieContract.getCounterBreeding(3),
      "getCounterBreedingAfterReproduce1"
    ).to.equal(2);

    await expect(
      te1.connect(B1).reproduce(2, 3),
      "REVERT: BREED"
    ).to.be.revertedWith("MTK1: Token 1 is steril");
  });

  it("Should revert when B4 try to set new child contract to hack contract", async function () {
    // Don't works
    rookieContract._child = B4.address;
    // OK
    await expect(
      rookieContract.connect(B4).setChildContractAddress(B4.address),
      "REVERT: setChildCA"
    ).to.be.reverted;
    await expect(
      rookieContract.connect(B4).setCounterBreeding(3, B4.address),
      "REVERT: setCounterBreeding"
    ).to.be.reverted;
  });

  it("1 - MAX SUPPLY", async function(){
    let rookieTotal = rookiePrice * 100;
    // Approval
    await expect(
      usdContract.approve(
        rookieContract.address,
        ethers.utils.parseEther(rookieTotal.toString())
      ),
      "Mint Approve"
    ).not.to.be.reverted;

    for (let index = 0; index < 100; index++) {
      // Mint
      await expect(
        rookieContract.mintRookie(owner.address),
        "Mint Rookie tk0"
      ).to.emit(rookieContract, "RookieMinted");
    }
  });

  it("2 - MAX SUPPLY", async function(){
    let rookieTotal = rookiePrice * 100;
    // Approval
    await expect(
      usdContract.approve(
        rookieContract.address,
        ethers.utils.parseEther(rookieTotal.toString())
      ),
      "Mint Approve"
    ).not.to.be.reverted;

    for (let index = 0; index < 100; index++) {
      // Mint
      await expect(
        rookieContract.mintRookie(owner.address),
        "Mint Rookie tk0"
      ).to.emit(rookieContract, "RookieMinted");
    }
  });

  it("3 - MAX SUPPLY", async function(){
    let rookieTotal = rookiePrice * 100;
    // Approval
    await expect(
      usdContract.approve(
        rookieContract.address,
        ethers.utils.parseEther(rookieTotal.toString())
      ),
      "Mint Approve"
    ).not.to.be.reverted;

    for (let index = 0; index < 100; index++) {
      // Mint
      await expect(
        rookieContract.mintRookie(owner.address),
        "Mint Rookie tk0"
      ).to.emit(rookieContract, "RookieMinted");
    }
  });

  it("4 - MAX SUPPLY", async function(){
    let rookieTotal = rookiePrice * 100;
    // Approval
    await expect(
      usdContract.approve(
        rookieContract.address,
        ethers.utils.parseEther(rookieTotal.toString())
      ),
      "Mint Approve"
    ).not.to.be.reverted;

    for (let index = 0; index < 100; index++) {
      // Mint
      await expect(
        rookieContract.mintRookie(owner.address),
        "Mint Rookie tk0"
      ).to.emit(rookieContract, "RookieMinted");
    }
  });

  it("5 - MAX SUPPLY", async function(){
    let rookieTotal = rookiePrice * 100;
    // Approval
    await expect(
      usdContract.approve(
        rookieContract.address,
        ethers.utils.parseEther(rookieTotal.toString())
      ),
      "Mint Approve"
    ).not.to.be.reverted;

    for (let index = 0; index < 100; index++) {
      // Mint
      await expect(
        rookieContract.mintRookie(owner.address),
        "Mint Rookie tk0"
      ).to.emit(rookieContract, "RookieMinted");
    }
  });

  it("6 - MAX SUPPLY", async function(){
    let rookieTotal = rookiePrice * 100;
    // Approval
    await expect(
      usdContract.approve(
        rookieContract.address,
        ethers.utils.parseEther(rookieTotal.toString())
      ),
      "Mint Approve"
    ).not.to.be.reverted;

    for (let index = 0; index < 100; index++) {
      // Mint
      await expect(
        rookieContract.mintRookie(owner.address),
        "Mint Rookie tk0"
      ).to.emit(rookieContract, "RookieMinted");
    }
  });

  it("7 - MAX SUPPLY", async function(){
    let rookieTotal = rookiePrice * 120;
    // Approval
    await expect(
      usdContract.approve(
        rookieContract.address,
        ethers.utils.parseEther(rookieTotal.toString())
      ),
      "Mint Approve"
    ).not.to.be.reverted;

    for (let index = 0; index < 120; index++) {
      // Mint
      await expect(
        rookieContract.mintRookie(owner.address),
        "Mint Rookie tk0"
      ).to.emit(rookieContract, "RookieMinted");
    }
  });

  it("8 - MAX SUPPLY", async function(){
    let rookieTotal = rookiePrice * 179;
    // Approval
    await expect(
      usdContract.approve(
        rookieContract.address,
        ethers.utils.parseEther(rookieTotal.toString())
      ),
      "Mint Approve"
    ).not.to.be.reverted;

    for (let index = 0; index < 179; index++) {
      // Mint
      await expect(
        rookieContract.mintRookie(owner.address),
        "Mint Rookie tk0"
      ).to.emit(rookieContract, "RookieMinted");
    }
  });
  
  it("Should revert when try to mint tokens", async function(){
    console.log(await rookieContract.totalSupply());
    console.log(await rookieContract.getPrivatelySellCount());
    await expect(
      usdContract.approve(
        rookieContract.address,
        ethers.utils.parseEther(rookiePrice.toString())
      ),
      "Mint Approve"
    ).not.to.be.reverted;

    await expect(
      rookieContract.mintRookie(owner.address),
      "Mint Rookie tk0"
    ).to.be.revertedWith("RKE0: Max supply reached");
  });
  
  it("setNewPrivateSell R16", async function(){
    //900 + 80 reservados = 980
    await expect(
      rookieContract.connect(admin).setNewPrivateSell(admin.address, 1),
      "Added to private sell"
    ).to.be.revertedWith("RKE0: Max supply reached");
  });

  it("Private sell to get 1000 tokens minted", async function(){
    for (let index = 1; index <= 4; index++) {
      await expect(rookieContract.connect(beneficiaries[index]).doPrivateSell(), "privateSell").not
      .to.be.reverted;
    }
  });

  it("setNewPrivateSell R16", async function(){
    //1000
    await expect(
      rookieContract.connect(admin).setNewPrivateSell(admin.address, 1),
      "Added to private sell"
    ).to.be.revertedWith("RKE0: Max supply reached");
  });
  
  it("Should revert when try to mint 1001 tokens", async function(){
    await expect(
      usdContract.approve(
        rookieContract.address,
        ethers.utils.parseEther(rookiePrice.toString())
      ),
      "Mint Approve"
    ).not.to.be.reverted;

    await expect(
      rookieContract.mintRookie(owner.address),
      "Mint Rookie tk0"
    ).to.be.revertedWith("RKE0: Max supply reached");
  });

  it("Should pause contract", async function(){
    // PausableR1
    await expect(rookieContract.connect(admin).pause()).to.be.reverted;

    const PAUSER_ROLE = ethers.utils.id("PAUSER_ROLE");

    // PausableV1
    await expect(
      rookieContract.grantRole(PAUSER_ROLE, admin.address),
      "ROL ACTIONER is PAUSER"
    ).not.to.be.reverted;

    await expect(rookieContract.connect(admin).pause()).not.to.be.reverted;
  });

  it("Mint function paused", async function(){
    await expect(rookieContract.mintRookie(owner.address)).to.be.revertedWith("Pausable: paused");
  });

  it("Should unpause contract", async function(){
    await expect(rookieContract.connect(admin).unpause()).not.to.be.reverted;
  });

  it("Should return the URI", async function () {
    const expected = "http://vegabuild.es/mcg_tokens/0.json";
    const real = await rookieContract.tokenURI(1);
    expect(expected, "URI").to.equal(real);
  });

  it("Should change the URI", async function () {
    const newURI = "QmSpgXDTNVcwcQRoSHduoTR9ogaFPsd2RqawUuTgAmjUVe";
    //V7
    await expect(rookieContract.connect(admin).setURI(newURI), "New URI seted")
      .not.to.be.reverted;

    const real = await rookieContract.tokenURI(1);

    //* Success criteria
    expect(newURI, "New URI seted").to.equal(real);
  });

  it("Should burn token 1000", async function(){
    await expect(rookieContract.connect(B5).burn(1001)).to.be.reverted;
    await expect(rookieContract.connect(B5).burn(1000)).not.to.be.reverted;
    await expect(rookieContract.connect(B5).burn(999)).not.to.be.reverted;
    await expect(rookieContract.connect(B5).burn(998)).not.to.be.reverted;
    await expect(rookieContract.connect(B5).burn(997)).not.to.be.reverted;
    console.log(await rookieContract.getCurrentTokenId());
  })
});