const hre = require("hardhat");

async function main() {
  // Rookie contract
  const Rookie = await hre.ethers.getContractFactory("Rookie");
  const rookie = await Rookie.deploy();
  await rookie.deployed();
  console.log("Rookie deployed to:", rookie.address);

  // Amateur contract
  const Amateur = await hre.ethers.getContractFactory("Amateur");
  const amateur = await Amateur.deploy();
  await amateur.deployed();
  console.log("Amateur deployed to:", amateur.address);

  // Pro contract
  const Pro = await hre.ethers.getContractFactory("Pro");
  const pro = await Pro.deploy();
  await pro.deployed();
  console.log("Pro deployed to:", pro.address);

  // Legend contract
  const Legend = await hre.ethers.getContractFactory("Legend");
  const legend = await Legend.deploy();
  await legend.deployed();
  console.log("Legend deployed to:", legend.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
