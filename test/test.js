const { expect } = require("chai");
const { ethers } = require("hardhat");

// Contracts
let owner, B1, B2, B3, B4, B5, B6, B7;
const quantity = 100;

let beneficiaries;
let quantities;

let rookieContract;
let amateurContract;
let proContract;
let legendContract;

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
      [ owner, B1, B2, B3, B4, B5, B6, B7 ] = await ethers.getSigners();

      beneficiaries = [ B1.address, B2.address, B3.address, B4.address, B5.address, B6.address, B7.address ]
      quantities    = Array(beneficiaries.length).fill(quantity);
      
      const days = 40;
      let today = new Date();
      today = today.addDays(days).getTime();
      const limit = (today - (today % 1000)) / 1000;
      
      // Rookie contract
      const Rookie = await hre.ethers.getContractFactory("RookieE0");
      rookieContract = await Rookie.deploy(beneficiaries, quantities, limit);
      rookieContract.deployed();

      // Amateur contract
      const Amateur = await hre.ethers.getContractFactory("AmateurE0");
      amateurContract = await Amateur.deploy();
      await amateurContract.deployed();

      // Pro contract
      const Pro = await hre.ethers.getContractFactory("ProE0");
      proContract = await Pro.deploy();
      await proContract.deployed();

      // Legend contract
      const Legend = await hre.ethers.getContractFactory("LegendE0");
      legendContract = await Legend.deploy();
      await legendContract.deployed();
    }
    catch(ex){
      console.error(ex);
    }
  })
  it("Deployed", async function () {});
});

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
    await expect(rookieContract.doPrivateSell(B1.address),'REVERT mint privateSell').to.be.revertedWith("Presale is not over yet");
  })

  it("Should do a private sell to B1", async function () {
    //New TS endOfPS
    const today = new Date();
    const endOfPS = ((today - (today % 1000)) / 1000) - 20
    await expect(rookieContract.setNewDate(endOfPS),'Set new PS date').not.to.be.reverted;

    await expect(rookieContract.doPrivateSell(B1.address),'privateSell').not.to.be.reverted;
    expect(await rookieContract.balanceOf(B1.address),'Check new balance of B1').to.equal(quantity);
  })

  it("Should return the URI", async function(){
    const expected = "https://www.metaclassicgames.com/tokens/ed0/0.json";
    const real = await rookieContract.tokenURI(1);
    expect(expected,'URI').to.equal(real);
  })

  it("Should revert when B3 try to change the URI", async function(){
    const newURI = "QmSpgXDTNVcwcQRoSHduoTR9ogaFPsd2RqawUuTgAmjUVe";
    await expect(rookieContract.connect(B3).setURI(newURI),'REVERT:new URI').to.be.reverted;
  })

  it("Should change the URI", async function(){
    const newURI = "QmSpgXDTNVcwcQRoSHduoTR9ogaFPsd2RqawUuTgAmjUVe";
    await expect(rookieContract.setURI(newURI),'New URI seted').not.to.be.reverted;
    expect(await rookieContract.tokenURI(1),'GET New URI').to.equal(newURI);
  })
});

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