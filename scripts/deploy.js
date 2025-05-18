const hre = require("hardhat");

async function main() {
  const Loan = await hre.ethers.getContractFactory("EscrowLoan");

  // 3. Desplegamos (no recibe parámetros en el constructor)
  const loan = await Loan.deploy();

  // 4. Esperamos a que se mine la transacción de despliegue
  await loan.deployed();

  console.log(`EscrowLoan deployed to: ${loan.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
