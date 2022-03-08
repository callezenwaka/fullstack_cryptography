import 'dotenv/config';
import { expect } from "chai";
import { ethers } from "hardhat";
// import { ContractFactory } from 'ethers';

describe("Transactions", function () {
  let transactions: any;

  before(async () => {
    const Transactions = await ethers.getContractFactory("Transactions");
    transactions = await Transactions.deploy();
    await transactions.deployed();
  });

  it("Should get all transaction count", async function () {
    const tx = await transactions.getTransactionCount();
    // console.log(tx.toNumber());

    expect(typeof tx.toNumber()).to.equal('number');
  });

  it("Should get all transactions", async function () {
    const tx = await transactions.getAllTransactions();
    // console.log(tx);

    expect(typeof tx).to.equal('object');
  });

  it("Should send transaction", async function () {
    let transactionCount = 0;
    await transactions.addToBlockchain(process.env.ACCOUNT, 0.00000, 'Test');
    // console.log(tx);

    expect(transactionCount).to.equal(transactionCount++);
  });
});
