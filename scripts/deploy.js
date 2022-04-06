const hre = require("hardhat");

async function main() {

  const rookiePrice   = 50;
  const amateurPrice  = 70;
  const proPrice      = 100;
  const legendPrice   = 150;

  // Rookie contract
  const Rookie = await hre.ethers.getContractFactory("RookieE0");
  const rookie = await Rookie.deploy(hre.ethers.constants.AddressZero, hre.ethers.utils.parseEther(rookiePrice.toString()));
  await rookie.deployed();
  console.log("Rookie deployed to:", rookie.address);

  // Amateur contract
  const Amateur = await hre.ethers.getContractFactory("AmateurE0");
  const amateur = await Amateur.deploy(hre.ethers.constants.AddressZero, hre.ethers.utils.parseEther(amateurPrice.toString()));
  await amateur.deployed();
  console.log("Amateur deployed to:", amateur.address);

  // Pro contract
  const Pro = await hre.ethers.getContractFactory("ProE0");
  const pro = await Pro.deploy(hre.ethers.constants.AddressZero, hre.ethers.utils.parseEther(proPrice.toString()));
  await pro.deployed();
  console.log("Pro deployed to:", pro.address);

  // Legend contract
  const Legend = await hre.ethers.getContractFactory("LegendE0");
  const legend = await Legend.deploy(hre.ethers.constants.AddressZero, hre.ethers.utils.parseEther(legendPrice.toString()));
  await legend.deployed();
  console.log("Legend deployed to:", legend.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
