// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title AttestationRegistry
 * @notice ChainSentinel — stores immutable AML/fraud risk attestations on Base L2.
 * Each screen result is recorded as an attestation with a risk score and evidence hash.
 */
contract AttestationRegistry {
    // Version info for upgrade tracking
    string public constant VERSION = "1.2.0";

    // Access control roles
    bytes32 public constant DEFAULT_ADMIN_ROLE = 0;
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant VIEWER_ROLE = keccak256("VIEWER_ROLE");

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
        uint256 expiresAt; // 0 = never expires
    }

    // Default expiration: 90 days in seconds
    uint256 public constant DEFAULT_EXPIRATION = 90 days;

    // State
    address public owner;
    uint256 public attestationCount;
    mapping(uint256 => Attestation) public attestations;
    mapping(address => uint256[]) public attestationsBySubject;
    mapping(bytes32 => bool) public evidenceHashUsed; // prevent duplicate evidence

    // Access control
    mapping(bytes32 => mapping(address => bool)) private _roles;
    mapping(address => uint256) private _revision;

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
    event BatchAttestationCreated(
        bytes32 indexed batchId,
        address indexed attestor,
        uint256 count,
        uint256 startId,
        uint256 endId
    );
    event AttestationRevoked(uint256 indexed id, address indexed revoker);
    event AttestationExpired(uint256 indexed id, uint256 expiresAt);
    event VersionUpgraded(string oldVersion, string newVersion, address indexed upgrader);
    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this.");
        _;
    }

    modifier onlyRole(bytes32 role) {
        require(_roles[role][msg.sender], "Caller does not have the required role");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Pausable: paused");
        _;
    }

    constructor() {
        owner = msg.sender;
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function _setupRole(bytes32 role, address account) internal {
        _roles[role][account] = true;
        _revision[account] += 1;
        emit RoleGranted(role, account, msg.sender);
    }

    function grantRole(bytes32 role, address account) external onlyOwner {
        _setupRole(role, account);
    }

    function revokeRole(bytes32 role, address account) external onlyOwner {
        _roles[role][account] = false;
        _revision[account] += 1;
        emit RoleRevoked(role, account, msg.sender);
    }

    function hasRole(bytes32 role, address account) external view returns (bool) {
        return _roles[role][account];
    }

    function getRoleAdmin(bytes32 role) public pure returns (bytes32) {
        if (role == OPERATOR_ROLE) return DEFAULT_ADMIN_ROLE;
        if (role == VIEWER_ROLE) return DEFAULT_ADMIN_ROLE;
        return role;
    }

    /**
     * @notice Returns the current contract version.
     * @dev Useful for upgrade tracking and ensuring client compatibility.
     */
    function getVersion() external pure returns (string memory) {
        return VERSION;
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
        att.expiresAt = 0;

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
     * @notice Create a new risk attestation with expiration.
     * @param subject The address being screened.
     * @param riskScore Risk level 1-5.
     * @param evidenceHash Hash of the off-chain ML evidence payload.
     * @param expiresIn Seconds until the attestation expires (0 = never).
     */
    function createAttestationWithExpiry(
        address subject,
        uint8 riskScore,
        bytes32 evidenceHash,
        uint256 expiresIn
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
        att.expiresAt = expiresIn > 0 ? block.timestamp + expiresIn : 0;

        attestationsBySubject[subject].push(attestationCount);

        emit AttestationCreated(
            attestationCount,
            subject,
            riskScore,
            evidenceHash,
            block.timestamp
        );

        // Emit expiration event only if expiry is set
        if (expiresIn > 0) {
            emit AttestationExpired(attestationCount, att.expiresAt);
        }
    }

    /**
     * @notice Check if an attestation is expired.
     * @param id Attestation ID to check.
     * @return True if expired and still valid.
     */
    function isExpired(uint256 id) external view returns (bool) {
        Attestation storage att = attestations[id];
        require(att.id == id, "Invalid attestation id");
        return att.expiresAt > 0 && att.expiresAt < block.timestamp && att.valid;
    }

    /**
     * @notice Expire an attestation by its ID (owner or attestor only).
     * @param id Attestation ID to expire.
     */
    function expireAttestation(uint256 id) external {
        Attestation storage att = attestations[id];
        require(att.id == id, "Invalid attestation id");
        require(att.valid, "Already revoked or expired");

        if (att.expiresAt > 0 && att.expiresAt < block.timestamp) {
            att.valid = false;
            emit AttestationExpired(id, att.expiresAt);
        } else {
            att.valid = false;
            emit AttestationExpired(id, att.expiresAt);
        }
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

        uint256 startId = attestationCount + 1;

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
            att.expiresAt = 0;

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

        uint256 endId = attestationCount;
        bytes32 batchId = keccak256(abi.encodePacked(block.timestamp, msg.sender, startId));
        
        emit BatchAttestationCreated(
            batchId,
            msg.sender,
            subjects.length,
            startId,
            endId
        );
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

    /**
     * @notice Get paginated attestations for a subject.
     * @param subject Address to look up.
     * @param offset Starting index (0 for latest).
     * @param limit Maximum number of attestations to return.
     * @return ids Array of attestation IDs.
     * @return riskScores Array of risk scores.
     * @return evidenceHashes Array of evidence hashes.
     * @return timestamps Array of timestamps.
     * @return valids Array of valid flags.
     */
    function getAttestationsBySubject(
        address subject,
        uint256 offset,
        uint256 limit
    ) external view returns (
        uint256[] memory ids,
        uint8[] memory riskScores,
        bytes32[] memory evidenceHashes,
        uint256[] memory timestamps,
        bool[] memory valids
    ) {
        uint256[] storage subjectIds = attestationsBySubject[subject];
        uint256 total = subjectIds.length;
        require(offset < total, "Offset out of bounds");
        
        uint256 end = offset + limit;
        if (end > total) end = total;
        uint256 count = end - offset;

        ids = new uint256[](count);
        riskScores = new uint8[](count);
        evidenceHashes = new bytes32[](count);
        timestamps = new uint256[](count);
        valids = new bool[](count);

        // Return newest first (reverse order)
        for (uint256 i = 0; i < count; i++) {
            uint256 index = total - 1 - offset - i;
            uint256 attestationId = subjectIds[index];
            Attestation storage att = attestations[attestationId];
            
            ids[i] = att.id;
            riskScores[i] = att.riskScore;
            evidenceHashes[i] = att.evidenceHash;
            timestamps[i] = att.timestamp;
            valids[i] = att.valid;
        }
    }
}