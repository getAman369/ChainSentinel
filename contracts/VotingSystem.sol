// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract OpenDAOHub {
    address public owner;
    string public proposal;
    mapping(address => bool) public members;
    mapping(address => bool) public votes;

    constructor(string memory initialProposal) {
        owner = msg.sender;
        proposal = initialProposal;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this.");
        _;
    }

    function joinDAO() public {
        members[msg.sender] = true;
    }

    function voteProposal(bool support) public {
        require(members[msg.sender], "Only DAO members can vote.");
        votes[msg.sender] = support;
    }

    function updateProposal(string memory newProposal) public onlyOwner {
        proposal = newProposal;
    }
}