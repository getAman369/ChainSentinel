// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title AttestationRegistry
 * @notice ChainSentinel — stores immutable AML/fraud risk attestations on Base L2.
 * Each screen result is recorded as an attestation with a risk score and evidence hash.
 */
contract AttestationRegistry {
    // Risk levels
    uint8 public constant MINIMAL = 1;
    uint8 public constant LOW = 2;
    uint8 public constant MEDIUM = 3;
    uint8 public constant HIGH = 4;
    uint8 public constant CRITICAL = 5;

    // Attestation struct
    struct Attestation {
        uint256 id;
        address subject; // address being screened
        uint8 riskScore; // 1-5
        bytes32 evidenceHash; // hash of off-chain ML evidence
        uint256 timestamp;
        address attestor; // who created the attestation (the API operator)
        bool valid;
    }

    // State
    address public owner;
    uint256 public attestationCount;
    mapping(uint256 => Attestation) public attestations;
    mapping(address => uint256[]) public attestationsBySubject;
    mapping(bytes32 => bool) public evidenceHashUsed; // prevent duplicate evidence

    // Pausable
    bool public paused;

    // Events
    event Paused(address account);
    event Unpaused(address account);
    event AttestationCreated(
        uint256 indexed id,
        address indexed subject,
        uint8 riskScore,
        bytes32 evidenceHash,
        uint256 timestamp
    );
    event AttestationRevoked(uint256 indexed id, address indexed revoker);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this.");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Pausable: paused");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function pause() external onlyOwner {
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }

    /**
     * @notice Create a new risk attestation for an address.
     * @param subject The address being screened.
     * @param riskScore Risk level 1-5.
     * @param evidenceHash Hash of the off-chain ML evidence payload.
     */
    function createAttestation(
        address subject,
        uint8 riskScore,
        bytes32 evidenceHash
    ) external whenNotPaused {
        require(riskScore >= 1 && riskScore <= 5, "Invalid risk score");
        require(!evidenceHashUsed[evidenceHash], "Evidence hash already used");

        evidenceHashUsed[evidenceHash] = true;
        attestationCount++;

        Attestation storage att = attestations[attestationCount];
        att.id = attestationCount;
        att.subject = subject;
        att.riskScore = riskScore;
        att.evidenceHash = evidenceHash;
        att.timestamp = block.timestamp;
        att.attestor = msg.sender;
        att.valid = true;

        attestationsBySubject[subject].push(attestationCount);

        emit AttestationCreated(
            attestationCount,
            subject,
            riskScore,
            evidenceHash,
            block.timestamp
        );
    }

    /**
     * @notice Create multiple attestations in a single transaction (batch).
     * @param subjects Array of addresses being screened.
     * @param riskScores Array of risk levels 1-5.
     * @param evidenceHashes Array of hashes of off-chain ML evidence payloads.
     * @return ids Array of created attestation IDs.
     */
    function batchCreateAttestations(
        address[] calldata subjects,
        uint8[] calldata riskScores,
        bytes32[] calldata evidenceHashes
    ) external whenNotPaused returns (uint256[] memory ids) {
        require(subjects.length == riskScores.length, "Array length mismatch");
        require(subjects.length == evidenceHashes.length, "Array length mismatch");
        require(subjects.length > 0, "Empty batch");
        require(subjects.length <= 100, "Batch too large (max 100)");

        ids = new uint256[](subjects.length);

        for (uint256 i = 0; i < subjects.length; i++) {
            require(riskScores[i] >= 1 && riskScores[i] <= 5, "Invalid risk score");
            require(!evidenceHashUsed[evidenceHashes[i]], "Evidence hash already used");

            evidenceHashUsed[evidenceHashes[i]] = true;
            attestationCount++;

            Attestation storage att = attestations[attestationCount];
            att.id = attestationCount;
            att.subject = subjects[i];
            att.riskScore = riskScores[i];
            att.evidenceHash = evidenceHashes[i];
            att.timestamp = block.timestamp;
            att.attestor = msg.sender;
            att.valid = true;

            attestationsBySubject[subjects[i]].push(attestationCount);
            ids[i] = attestationCount;

            emit AttestationCreated(
                attestationCount,
                subjects[i],
                riskScores[i],
                evidenceHashes[i],
                block.timestamp
            );
        }
    }

    /**
     * @notice Revoke an attestation (owner only).
     * @param id Attestation ID to revoke.
     */
    function revokeAttestation(uint256 id) external onlyOwner {
        Attestation storage att = attestations[id];
        require(att.id == id, "Invalid attestation id");
        require(att.valid, "Already revoked");

        att.valid = false;
        emit AttestationRevoked(id, msg.sender);
    }

    /**
     * @notice Get the latest attestation for a subject.
     * @param subject Address to look up.
     * @return id Attestation ID, riskScore, evidenceHash, timestamp, valid.
     */
    function getLatestAttestation(address subject)
        external
        view
        returns (
            uint256 id,
            uint8 riskScore,
            bytes32 evidenceHash,
            uint256 timestamp,
            bool valid
        )
    {
        uint256[] storage ids = attestationsBySubject[subject];
        require(ids.length > 0, "No attestations found");

        Attestation storage latest = attestations[ids[ids.length - 1]];
        return (
            latest.id,
            latest.riskScore,
            latest.evidenceHash,
            latest.timestamp,
            latest.valid
        );
    }

    /**
     * @notice Get attestation count for a subject.
     */
    function getAttestationCount(address subject) external view returns (uint256) {
        return attestationsBySubject[subject].length;
    }
}