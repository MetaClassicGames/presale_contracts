const { expect } = require("chai");
const { ethers } = require("hardhat");

// Contracts
let owner, B1, B2, B3, B4, B5;
const quantity = 20;

let beneficiaries;
let quantities;

let usdContract;
let rookieContract;
let amateurContract;
let proContract;
let legendContract;

const rookiePrice   = 50;
const amateurPrice  = 70;
const proPrice      = 100;
const legendPrice   = 150;

let te1;

// Add days to timestamp
Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

//DEPLOY
describe("Deploy", function(){
  
  this.beforeAll(async function(){
    try{
      // Get signers
      [ owner, B1, B2, B3, B4, B5 ] = await ethers.getSigners();

      beneficiaries = [ B1.address, B2.address, B3.address, B4.address, B5.address ]
      quantities    = Array(beneficiaries.length).fill(quantity);
      
      const days = 40;
      let today = new Date();
      today = today.addDays(days).getTime();
      const limit = (today - (today % 1000)) / 1000;

      //USDC contract
      const USDC = await ethers.getContractFactory("USDC");
      usdContract = await USDC.deploy();
      await usdContract.deployed();
      
      // Rookie contract
      const Rookie = await ethers.getContractFactory("RookieE0");
      rookieContract = await Rookie.deploy(beneficiaries, quantities, limit, usdContract.address);
      rookieContract.deployed();

      // Amateur contract
      const Amateur = await ethers.getContractFactory("AmateurE0");
      amateurContract = await Amateur.deploy();
      await amateurContract.deployed();

      // Pro contract
      const Pro = await ethers.getContractFactory("ProE0");
      proContract = await Pro.deploy();
      await proContract.deployed();

      // Legend contract
      const Legend = await ethers.getContractFactory("LegendE0");
      legendContract = await Legend.deploy();
      await legendContract.deployed();

    }
    catch(ex){
      console.error(ex);
    }
  })
  it("All smart contracts deployed", async function () {});
});

describe("USDC", function(){
  const USDCForAccounts = 1000;
  it("Deposits 1000 USDC into owner address", async function(){
    const amount = await ethers.utils.parseEther(USDCForAccounts.toString());

    await usdContract.depositTest(owner.address, amount);
    const total = await usdContract.balanceOf(owner.address);
    expect(parseInt(ethers.utils.formatEther(total))).to.equal(USDCForAccounts);
  });
})

// Tests of Rookie
describe("Rookie", function () {

  //Suite Test
  it("Check beneficiaries", async function () {
    const expected = 0;
    expect(await rookieContract.getPrivateSell(owner.address), 'Owner is not in the whitelist').to.equal(expected);

    for (let index = 0; index < beneficiaries.length; index++) {
      expect(await rookieContract.getPrivateSell(beneficiaries[index]),'Beneficiaries').to.equal(quantity);
    }
  });

  it("Should revert, PS is not over", async function () {
    await expect(rookieContract.connect(B1).doPrivateSell(),'REVERT mint privateSell').to.be.revertedWith("RKE0: Presale is not over yet");
  });

  it("Should do a private sell to B1", async function () {
    //New TS endOfPS
    const today = new Date();
    const endOfPS = ((today - (today % 1000)) / 1000) - 20
    await expect(rookieContract.setNewDate(endOfPS),'Set new PS date').not.to.be.reverted;

    await expect(rookieContract.connect(B1).doPrivateSell(),'privateSell').not.to.be.reverted;
    expect(await rookieContract.balanceOf(B1.address),'Check new balance of B1').to.equal(quantity);
  });

  it("Should revert when try to do a private sell to B1 again", async function () {
    await expect(rookieContract.connect(B1).doPrivateSell(),'privateSell').to.be.revertedWith("RKE0: Beneficiary isn't into private sell");
  });

  it("Should return the URI", async function(){
    const expected = "https://www.metaclassicgames.com/tokens/ed0/0.json";
    const real = await rookieContract.tokenURI(1);
    expect(expected,'URI').to.equal(real);
  });

  it("Should revert when B3 try to change the URI", async function(){
    const newURI = "QmSpgXDTNVcwcQRoSHduoTR9ogaFPsd2RqawUuTgAmjUVe";
    await expect(rookieContract.connect(B3).setURI(newURI),'REVERT: new URI').to.be.reverted;
  });

  it("Should change the URI", async function(){
    const newURI = "QmSpgXDTNVcwcQRoSHduoTR9ogaFPsd2RqawUuTgAmjUVe";
    await expect(rookieContract.setURI(newURI),'New URI seted').not.to.be.reverted;
    expect(await rookieContract.tokenURI(1),'GET New URI').to.equal(newURI);
  });

  it("Should revert when B1 address try to mint 1 Rookie Ed 0", async function(){
    const contractBalance = await usdContract.balanceOf(rookieContract.address);
    expect(0,'Contract balance 0').to.equal(parseInt(contractBalance));

    await expect(rookieContract.connect(B1).mintRookie(B1.address)).to.be.revertedWith("USDC: Insufficient funds");
  });

  it("Should rever when owner try to mint 1 Rookie Ed 0 without allowance", async function(){
    const contractBalance = await usdContract.balanceOf(rookieContract.address);
    expect(0,'Contract balance 0').to.equal(parseInt(contractBalance));

    await expect(rookieContract.connect(owner).mintRookie(owner.address)).to.be.revertedWith("ERC20: transfer amount exceeds allowance");
  });

  it("Mint 1 Rookie Ed 0 for owner", async function(){
    
    // Initial balances
    // Contract
    const contractBalanceB = await usdContract.balanceOf(rookieContract.address);
    expect(0,'Contract balance 0').to.equal(parseInt(contractBalanceB));
    
    // Owner
    const ownerBalanceB = await usdContract.balanceOf(owner.address);
    expect(1000,'Owner balance').to.equal(parseInt(ethers.utils.formatEther(ownerBalanceB)));

    // Mint op
    await expect(usdContract.connect(owner).approve(rookieContract.address, ethers.utils.parseEther(rookiePrice.toString())),'Mint Approve').not.to.be.reverted;
    await expect(rookieContract.connect(owner).mintRookie(owner.address),'Mint Rookie tk0').to.emit(rookieContract, "RookieMinted");

    // Check balances
    const breedingCount = await rookieContract.getCounterBreeding(22)
    expect(0,'Counter breeding tk0').to.equal(breedingCount);

    // Contract
    const contractBalanceA = await usdContract.balanceOf(rookieContract.address);
    expect(parseInt(ethers.utils.formatEther(contractBalanceA)),'Contract balance updated').to.equal(rookiePrice);
    
    // Owner
    const ownerBalanceA = await usdContract.balanceOf(owner.address);
    expect(parseInt(ethers.utils.formatEther(ownerBalanceA)),'Owner balance').to.equal(950);

    // Balance of owner ERC721
    const balanceExp = 1;
    const realBalance = await rookieContract.balanceOf(owner.address);

    expect(realBalance,'Balance of rookie owner').to.equal(balanceExp);
  });

  it("Should revert when safeMint function is called", async function(){
    await expect(rookieContract.safeMint(owner.address),'REVERT: Mint').to.be.reverted;
  });

  it("Should revert when B1 address try to call setCounterBreeding", async function(){
    expect(await rookieContract.getCounterBreeding(1),'getCounterBreeding').to.equal(0);
    await expect(rookieContract.setCounterBreeding(1, B1.address),'REVERT: setCounterBreeding').to.be.revertedWith("RKE0: Caller isnt the child contract")
  });

  it("Set new child contract", async function(){
    try{
      const TE1 = await ethers.getContractFactory("TokenEd1");
      te1 = await TE1.deploy(rookieContract.address);
      await te1.deployed();
    }
    catch(ex){
      console.error(ex);
    }
    await expect(rookieContract.setChildContractAddress(te1.address),'setChildCA').not.to.be.reverted;
  });

  it("Reproduce 1 and 2", async function(){
    expect(await rookieContract.getCounterBreeding(1),'getCounterBreeding').to.equal(0);
    expect(await rookieContract.getCounterBreeding(2),'getCounterBreeding').to.equal(0);

    await expect(te1.connect(B1).reproduce(1,2),'Breed').to.emit(te1, "MintedByBreed");

    expect(await rookieContract.getCounterBreeding(1),'getCounterBreedingAfterReproduce1').to.equal(1);
    expect(await rookieContract.getCounterBreeding(2),'getCounterBreedingAfterReproduce1').to.equal(1);
  });

  it("Should revert when 1 and 2 calls reproduce when it calls again", async function(){
    await expect(te1.connect(B1).reproduce(1,2),'Breed').to.emit(te1, "MintedByBreed");

    expect(await rookieContract.getCounterBreeding(1),'getCounterBreedingAfterReproduce1').to.equal(2);
    expect(await rookieContract.getCounterBreeding(2),'getCounterBreedingAfterReproduce1').to.equal(2);

    await expect(te1.connect(B1).reproduce(1,2),'REVERT: BREED').to.be.revertedWith("MTK1: Token 1 is steril");
  });

  it("Should revert when B4 try to set new child contract to hack contract", async function(){
    // Don't works
    rookieContract._child = B4.address;
    // OK
    await expect(rookieContract.connect(B4).setChildContractAddress(B4.address),'REVERT: setChildCA').to.be.reverted;
    await expect(rookieContract.connect(B4).setCounterBreeding(3,B4.address),'REVERT: setCounterBreeding').to.be.reverted;
  });
});

/*
// // Tests of Amateur
// describe("Amateur", function () {

//   //Suite Test
//   it("", async function () {});
// });

// // Tests of Pro
// describe("Pro", function () {

//   //Suite Test
//   it("", async function () {});
// });

// // Tests of Legend
// describe("Legend", function () {

//   //Suite Test
//   it("", async function () {});
// });
*/