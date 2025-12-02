// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title TicketNFT
 * @notice Non-transferable NFT tickets for prize pool participation
 * @dev ERC721 tokens that represent lottery tickets, soulbound to users
 */
contract TicketNFT is ERC721, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    struct TicketMetadata {
        uint256 poolId;
        uint256 issuedAt;
        address owner;
        bool isActive;
    }

    // Ticket ID => Metadata
    mapping(uint256 => TicketMetadata) public ticketMetadata;

    // User => Pool ID => Ticket IDs
    mapping(address => mapping(uint256 => uint256[])) private userTicketsByPool;

    // Pool ID => Total tickets
    mapping(uint256 => uint256) public poolTicketCount;

    // Counter for ticket IDs
    uint256 private _nextTokenId;

    // Base URI for metadata
    string private _baseTokenURI;

    // Events
    event TicketMinted(uint256 indexed tokenId, address indexed to, uint256 indexed poolId);
    event TicketBurned(uint256 indexed tokenId, uint256 indexed poolId);
    event TicketDeactivated(uint256 indexed tokenId);

    constructor(string memory name, string memory symbol, string memory baseURI) ERC721(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _baseTokenURI = baseURI;
        _nextTokenId = 1; // Start from 1
    }

    /**
     * @notice Mint tickets for a user
     * @param to The recipient address
     * @param poolId The pool ID
     * @param amount Number of tickets to mint
     * @return tokenIds Array of minted token IDs
     */
    function mint(
        address to,
        uint256 poolId,
        uint256 amount
    ) external onlyRole(MINTER_ROLE) whenNotPaused returns (uint256[] memory tokenIds) {
        require(to != address(0), "TicketNFT: Invalid recipient");
        require(amount > 0 && amount <= 1000, "TicketNFT: Invalid amount");

        tokenIds = new uint256[](amount);

        for (uint256 i = 0; i < amount; i++) {
            uint256 tokenId = _nextTokenId++;

            _safeMint(to, tokenId);

            ticketMetadata[tokenId] = TicketMetadata({
                poolId: poolId,
                issuedAt: block.timestamp,
                owner: to,
                isActive: true
            });

            userTicketsByPool[to][poolId].push(tokenId);
            poolTicketCount[poolId]++;

            tokenIds[i] = tokenId;

            emit TicketMinted(tokenId, to, poolId);
        }

        return tokenIds;
    }

    /**
     * @notice Burn a ticket
     * @param tokenId The token ID to burn
     */
    function burn(uint256 tokenId) external {
        require(
            msg.sender == ownerOf(tokenId) || hasRole(MINTER_ROLE, msg.sender),
            "TicketNFT: Not authorized"
        );

        TicketMetadata storage metadata = ticketMetadata[tokenId];
        require(metadata.isActive, "TicketNFT: Ticket already inactive");

        uint256 poolId = metadata.poolId;

        metadata.isActive = false;
        poolTicketCount[poolId]--;

        _burn(tokenId);

        emit TicketBurned(tokenId, poolId);
    }

    /**
     * @notice Deactivate a ticket without burning (for used tickets)
     * @param tokenId The token ID to deactivate
     */
    function deactivate(uint256 tokenId) external onlyRole(MINTER_ROLE) {
        TicketMetadata storage metadata = ticketMetadata[tokenId];
        require(metadata.isActive, "TicketNFT: Ticket already inactive");

        metadata.isActive = false;

        emit TicketDeactivated(tokenId);
    }

    /**
     * @notice Get all tickets owned by a user for a specific pool
     * @param user The user address
     * @param poolId The pool ID
     * @return Array of ticket IDs
     */
    function getUserTickets(address user, uint256 poolId) external view returns (uint256[] memory) {
        return userTicketsByPool[user][poolId];
    }

    /**
     * @notice Get active ticket count for a user in a pool
     * @param user The user address
     * @param poolId The pool ID
     * @return count Number of active tickets
     */
    function getUserActiveTicketCount(address user, uint256 poolId) external view returns (uint256 count) {
        uint256[] memory tickets = userTicketsByPool[user][poolId];
        count = 0;

        for (uint256 i = 0; i < tickets.length; i++) {
            if (ticketMetadata[tickets[i]].isActive) {
                count++;
            }
        }

        return count;
    }

    /**
     * @notice Get total ticket count for a pool
     * @param poolId The pool ID
     * @return Total ticket count
     */
    function getTicketCount(uint256 poolId) external view returns (uint256) {
        return poolTicketCount[poolId];
    }

    /**
     * @notice Get ticket metadata
     * @param tokenId The token ID
     * @return Ticket metadata
     */
    function getTicketMetadata(uint256 tokenId) external view returns (TicketMetadata memory) {
        require(_ownerOf(tokenId) != address(0), "TicketNFT: Token does not exist");
        return ticketMetadata[tokenId];
    }

    /**
     * @notice Check if a ticket is active
     * @param tokenId The token ID
     * @return True if active, false otherwise
     */
    function isTicketActive(uint256 tokenId) external view returns (bool) {
        return ticketMetadata[tokenId].isActive;
    }

    /**
     * @notice Override transfer functions to make tickets non-transferable (soulbound)
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);

        // Allow minting (from == address(0)) and burning (to == address(0))
        // but prevent transfers between addresses
        if (from != address(0) && to != address(0)) {
            revert("TicketNFT: Tickets are non-transferable");
        }

        return super._update(to, tokenId, auth);
    }

    /**
     * @notice Set base URI for token metadata
     * @param baseURI The new base URI
     */
    function setBaseURI(string memory baseURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseTokenURI = baseURI;
    }

    /**
     * @notice Get base URI
     * @return The base URI
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @notice Pause contract
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice Unpause contract
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @notice Support interface detection
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
