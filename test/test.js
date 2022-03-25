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
    await expect(rookieContract.doPrivateSell(B1.address),'REVERT mint privateSell').to.be.revertedWith("RKE0: Presale is not over yet");
  });

  it("Should do a private sell to B1", async function () {
    //New TS endOfPS
    const today = new Date();
    const endOfPS = ((today - (today % 1000)) / 1000) - 20
    await expect(rookieContract.setNewDate(endOfPS),'Set new PS date').not.to.be.reverted;

    await expect(rookieContract.doPrivateSell(B1.address),'privateSell').not.to.be.reverted;
    expect(await rookieContract.balanceOf(B1.address),'Check new balance of B1').to.equal(quantity);
  });

  it("Should revert when try to do a private sell to B1 again", async function () {
    await expect(rookieContract.doPrivateSell(B1.address),'privateSell').to.be.revertedWith("RKE0: Beneficiary isn't into private sell");
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