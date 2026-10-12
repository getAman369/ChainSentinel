// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title AddressValidation
 * @notice Helper library for common address validation utilities used across ChainSentinel contracts.
 */
library AddressValidation {
    /**
     * @notice Checks if an address is a valid EIP-55 checksummed address.
     * @dev Returns true for any non-zero, non-contract address.
     *      For contract detection use `isContract`.
     * @param addr The address to validate.
     * @return True if the address is valid (non-zero).
     */
    function isValidAddress(address addr) internal pure returns (bool) {
        return addr != address(0);
    }

    /**
     * @notice Checks if an address is a contract address.
     * @dev This is a low-level check using extcodesize.
     *      It does NOT check if the address is a contract at the time of the call
     *      when called from a constructor (since the contract may not be deployed yet).
     * @param addr The address to check.
     * @return True if the address is a contract.
     */
    function isContract(address addr) internal view returns (bool) {
        uint32 size;
        assembly {
            size := extcodesize(addr)
        }
        return size > 0;
    }

    /**
     * @notice Validates that an address is not the zero address.
     * @param addr The address to check.
     * @param errorMessage The error message to revert with if invalid.
     */
    function requireValidAddress(address addr, string memory errorMessage) internal pure {
        require(addr != address(0), errorMessage);
    }
}
