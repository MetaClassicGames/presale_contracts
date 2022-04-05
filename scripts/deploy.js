const hre = require("hardhat");

// Add days to timestamp
Date.prototype.addDays = function (days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

async function main() {
  // Params for contract deployment
  // Get signers
  [owner, admin, B1, B2, B3, B4, B5] = await ethers.getSigners();

  const beneficiaries = [
    B1.address,
    B2.address,
    B3.address,
    B4.address,
    B5.address,
  ];
  const quantities = Array(beneficiaries.length).fill(20);

  const days = 1;
  let today = new Date();
  today = today.addDays(days).getTime();
  const limit = (today - (today % 1000)) / 1000;

  // Rookie contract
  const Rookie = await hre.ethers.getContractFactory("RookieE0");
  const rookie = await Rookie.deploy(
    beneficiaries,
    quantities,
    limit,
    ethers.constants.AddressZero
  );
  await rookie.deployed();
  console.log("Rookie deployed to:", rookie.address);

  // Amateur contract
  // const Amateur = await hre.ethers.getContractFactory("Amateur");
  // const amateur = await Amateur.deploy();
  // await amateur.deployed();
  // console.log("Amateur deployed to:", amateur.address);

  // Pro contract
  // const Pro = await hre.ethers.getContractFactory("Pro");
  // const pro = await Pro.deploy();
  // await pro.deployed();
  // console.log("Pro deployed to:", pro.address);

  // Legend contract
  // const Legend = await hre.ethers.getContractFactory("Legend");
  // const legend = await Legend.deploy();
  // await legend.deployed();
  // console.log("Legend deployed to:", legend.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
