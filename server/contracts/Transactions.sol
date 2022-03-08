//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Transactions {
    uint256 transactionCount;

    event Transfer(address from, address receiver, uint amount, string message, uint256 timestamp);

    struct Transaction {
        address sender;
        address receiver;
        uint amount;
        string message;
        uint256 timestamp;
    }

    Transaction[] transactions;

    function addToBlockchain(address payable receiver, uint amount, string memory message) public {
        transactionCount++;
        transactions.push(Transaction(msg.sender, receiver, amount, message, block.timestamp));
        emit Transfer(msg.sender, receiver, amount, message, block.timestamp);
    }

    function getAllTransactions() public view returns(Transaction[] memory) {
        return transactions;
    }

    function getTransactionCount() public view returns(uint256) {
        return transactionCount;
    }
}
