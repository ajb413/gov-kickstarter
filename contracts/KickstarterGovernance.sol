// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.6.10;
pragma experimental ABIEncoderV2;

interface IComp {
    function delegateBySig(address delegatee, uint nonce, uint expiry, uint8 v, bytes32 r, bytes32 s) external;
    function getCurrentVotes(address account) external view returns (uint96);
}

interface IGovernorAlpha {
    function proposalThreshold() external pure returns (uint);
    function propose(address[] memory targets, uint[] memory values, string[] memory signatures, bytes[] memory calldatas, string memory description) external returns (uint);
}

enum Error {
    NO_ERROR,
    NOT_ENOUGH_DELEGATIONS
}

contract KickstarterGovernance {

    // keep and address for possible rewards
    address public immutable proposalAuthor;

    // Proposal data
    address[] public targets;
    uint[] public values;
    string[] public signatures;
    bytes[] public calldatas;
    string public description;

    // Compound smart contracts
    address public immutable comp;
    address public immutable governor;

    /// @notice An event thats emitted when an account changes its delegate
    event NewDelegation();
    event ProposalCreated(uint proposalId);

    constructor(address[] memory targets_,
                uint[] memory values_,
                string[] memory signatures_,
                bytes[] memory calldatas_,
                string memory description_,
                address comp_,
                address governor_) public {
        targets = targets_;
        values = values_;
        signatures = signatures_;
        calldatas = calldatas_;
        description = description_;
        comp = comp_;
        governor = governor_;

        proposalAuthor = msg.sender;
    }

    function delegateToProposalBySig(uint nonce, uint expiry, uint8 v, bytes32 r, bytes32 s) external returns (Error, uint) {
        IComp(comp).delegateBySig(address(this), nonce, expiry, v, r, s);

        emit NewDelegation();

        return submitProposal();
    }

    function submitProposal() public returns (Error, uint) {
        if (IComp(comp).getCurrentVotes(address(this)) >= IGovernorAlpha(governor).proposalThreshold()) {
           uint proposalId = IGovernorAlpha(governor).propose(targets, values, signatures, calldatas, description);

           emit ProposalCreated(proposalId);

           return(Error.NO_ERROR, proposalId);
        }
        return(Error.NOT_ENOUGH_DELEGATIONS, 0);
    }

}
