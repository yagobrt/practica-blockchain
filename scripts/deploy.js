const hre = require("hardhat");

async function main() {
  const HelloWorld = await hre.ethers.getContractFactory("HelloWorld");
  const hello = await HelloWorld.deploy("Hello, Sepolia!");
  await hello.deployed();
  console.log(`Contract deployed to: ${hello.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
