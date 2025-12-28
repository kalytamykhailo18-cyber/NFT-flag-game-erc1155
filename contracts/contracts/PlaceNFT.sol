// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * PlaceNFT - ERC-1155 Place NFT Contract
 *
 * Section 6.1 Requirements:
 * - Inherits: ERC1155, ERC1155URIStorage, AccessControl, Pausable
 * - Roles: MINTER_ROLE, CURATOR_ROLE, PAUSER_ROLE, ADMIN_ROLE
 * - State: placeExists, placeClaimed, placeClaimedBy, placeMetadataHash
 * - Functions: mintPlace, setPlaceURI, pause, unpause, claimPlace, uri, view functions
 * - Events: PlaceMinted, PlaceClaimed, PlaceURIUpdated, SlicePurchased, SlicePairCompleted
 * - Errors: PlaceAlreadyMinted, PlaceNotMinted, PlaceAlreadyClaimed, InvalidTokenId
 */

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract PlaceNFT is ERC1155, ERC1155URIStorage, AccessControl, Pausable {
    // ==================== Roles ====================
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant CURATOR_ROLE = keccak256("CURATOR_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // ==================== State Variables ====================
    mapping(uint256 => bool) public placeExists;
    mapping(uint256 => bool) public placeClaimed;
    mapping(uint256 => address) public placeClaimedBy;
    mapping(uint256 => string) public placeMetadataHash;

    // ==================== Events ====================
    event PlaceMinted(uint256 indexed tokenId, string uri, string metadataHash);
    event PlaceClaimed(uint256 indexed tokenId, address indexed claimedBy);
    event PlaceURIUpdated(uint256 indexed tokenId, string newUri, string newHash);
    event SlicePurchased(uint256 indexed tokenId, uint256 pairNumber, uint256 sliceId, address indexed user);
    event SlicePairCompleted(uint256 indexed tokenId, uint256 pairNumber, address indexed user);

    // ==================== Custom Errors ====================
    error PlaceAlreadyMinted(uint256 tokenId);
    error PlaceNotMinted(uint256 tokenId);
    error PlaceAlreadyClaimed(uint256 tokenId);
    error InvalidTokenId();

    // ==================== Constructor ====================
    constructor() ERC1155("") {
        // Grant admin role to deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(CURATOR_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }

    // ==================== Minter Functions ====================

    /**
     * @dev Mint a new place NFT
     * @param tokenId The unique token ID for the place
     * @param tokenUri The IPFS URI for the metadata
     * @param metadataHash The SHA-256 hash of the metadata for integrity verification
     */
    function mintPlace(
        uint256 tokenId,
        string memory tokenUri,
        string memory metadataHash
    ) external onlyRole(MINTER_ROLE) whenNotPaused {
        if (tokenId == 0) revert InvalidTokenId();
        if (placeExists[tokenId]) revert PlaceAlreadyMinted(tokenId);

        placeExists[tokenId] = true;
        placeMetadataHash[tokenId] = metadataHash;

        // Mint 1 token to the contract (admin holds until claimed)
        _mint(msg.sender, tokenId, 1, "");

        // Set the URI for this token
        _setURI(tokenId, tokenUri);

        emit PlaceMinted(tokenId, tokenUri, metadataHash);
    }

    /**
     * @dev Transfer place to user when they complete all pairs
     * @param tokenId The token ID of the place
     * @param to The address to transfer to
     */
    function claimPlace(
        uint256 tokenId,
        address to
    ) external onlyRole(MINTER_ROLE) whenNotPaused {
        if (!placeExists[tokenId]) revert PlaceNotMinted(tokenId);
        if (placeClaimed[tokenId]) revert PlaceAlreadyClaimed(tokenId);
        if (to == address(0)) revert InvalidTokenId();

        placeClaimed[tokenId] = true;
        placeClaimedBy[tokenId] = to;

        // Transfer from minter to claimer
        _safeTransferFrom(msg.sender, to, tokenId, 1, "");

        emit PlaceClaimed(tokenId, to);
    }

    // ==================== Curator Functions ====================

    /**
     * @dev Update the URI and metadata hash for a place
     * @param tokenId The token ID to update
     * @param newUri The new IPFS URI
     * @param newHash The new metadata hash
     */
    function setPlaceURI(
        uint256 tokenId,
        string memory newUri,
        string memory newHash
    ) external onlyRole(CURATOR_ROLE) {
        if (!placeExists[tokenId]) revert PlaceNotMinted(tokenId);

        placeMetadataHash[tokenId] = newHash;
        _setURI(tokenId, newUri);

        emit PlaceURIUpdated(tokenId, newUri, newHash);
    }

    // ==================== Pauser Functions ====================

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // ==================== View Functions ====================

    /**
     * @dev Get the URI for a token
     */
    function uri(uint256 tokenId) public view override(ERC1155, ERC1155URIStorage) returns (string memory) {
        return ERC1155URIStorage.uri(tokenId);
    }

    /**
     * @dev Check if a place has been minted
     */
    function isPlaceMinted(uint256 tokenId) public view returns (bool) {
        return placeExists[tokenId];
    }

    /**
     * @dev Check if a place has been claimed
     */
    function isPlaceClaimed(uint256 tokenId) public view returns (bool) {
        return placeClaimed[tokenId];
    }

    /**
     * @dev Get the address that claimed a place
     */
    function getPlaceClaimedBy(uint256 tokenId) public view returns (address) {
        return placeClaimedBy[tokenId];
    }

    /**
     * @dev Get the metadata hash for a place
     */
    function getPlaceMetadataHash(uint256 tokenId) public view returns (string memory) {
        return placeMetadataHash[tokenId];
    }

    // ==================== Progress Events (for frontend tracking) ====================

    /**
     * @dev Emit event when a slice is purchased (called by backend via minter)
     */
    function emitSlicePurchased(
        uint256 tokenId,
        uint256 pairNumber,
        uint256 sliceId,
        address user
    ) external onlyRole(MINTER_ROLE) {
        emit SlicePurchased(tokenId, pairNumber, sliceId, user);
    }

    /**
     * @dev Emit event when a pair is completed (called by backend via minter)
     */
    function emitSlicePairCompleted(
        uint256 tokenId,
        uint256 pairNumber,
        address user
    ) external onlyRole(MINTER_ROLE) {
        emit SlicePairCompleted(tokenId, pairNumber, user);
    }

    // ==================== Override Functions ====================

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
