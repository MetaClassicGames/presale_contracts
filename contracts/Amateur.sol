// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

/**
 * @title Presale Ed.0 Amateur
 * @author EscuelaCryptoES
 * @notice This is the contract of the preasale of the Pro NFT
 */
contract AmateurE0 is ERC721, ERC721Enumerable, AccessControl, Pausable {
    // Token counter
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // Roles
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE  = keccak256("ADMIN_ROLE");
    
    // URI of the tokens
    string public baseURI = "https://www.metaclassicgames.com/tokens/ed0/0.json";
    
    // uint8 fixed to 255 max
    mapping(address=>uint8) private _privateSell;
    uint64 private endOfPS;
    
    // TODO: Needs to add the require to not allowing minting without checking 
    // require(tokenId < _maxSupply - _soldPrivately, "Max supply reached");
    uint16 private constant _maxSupply = 1000;
    uint16 private _soldPrivately;

    // TODO: Breeding, everything of the ED0 is done except set the breedingCounter
    // to 0 when a new token is minted. _breedingCounter[tokenId] = 0;
    mapping(uint => uint) private _breedingCounter;

    /** 
     * @notice This is the contructor of the contract
     */
    constructor() ERC721("AmateurEd0", "AMTE0") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, address(0)); // No one can mint more tokens
        _grantRole(ADMIN_ROLE, msg.sender);

        // Starts in 1
        _tokenIdCounter.increment();
    }

    /**
     * @notice Gives a security measure to not loosing the NFT
     * @param from address of the owner
     * @param to address of the minter
     * @param tokenId id of the NFT to mint
     */
    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        whenNotPaused
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    // Overrided function
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}