// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

/**
 * @title Presale Ed.0 pro
 * @author EscuelaCryptoEs
 * @notice This is the contract of the preasale of the Pro NFT
 */
contract ProE0 is ERC721, ERC721Enumerable, Pausable, AccessControl, ERC721Burnable {
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
     * @dev Beneficiaries and his NFTs setted. Also timestamp for the end of presale
     * @param _beneficiaries the beneficiaries
     * @param _quantities the total of NFTs booked
     * @param _timestampEndOfPS the ts for the end of presale
     */
    constructor(address[] memory _beneficiaries, uint8[] memory _quantities, uint64 _timestampEndOfPS) ERC721("ProEd0", "PR0") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, address(0)); // No one can mint more tokens
        _grantRole(ADMIN_ROLE, msg.sender);

        // End of PS
        require(_timestampEndOfPS > block.timestamp);
        endOfPS = _timestampEndOfPS;

        // Private Sell
        require(_beneficiaries.length == _quantities.length, "ROOKIE: Missmatch lengths");
        for (uint8 i = 0; i < _beneficiaries.length; i++) {
            require(_beneficiaries[i] != address(0), "Address shouldn't be zero");
            _privateSell[_beneficiaries[i]] = _quantities[i];
            _soldPrivately += _quantities[i];
        }

        // Starts in 1
        _tokenIdCounter.increment();
    }

    /**
     * @dev Requires that who calls the function is the owner of the token and
     * adds one to the breeding counter of the token provided.
     * @param id Is the id of the token to check
     * @param owner Is the id address of the sender of the contract ED 1
     */
    function setContadorBreeding(uint id, address owner) external {
        require(owner == ownerOf(id), "The sender isnt the owner of the token");
        _breedingCounter[id]++;
    }

    /**
     * @dev Returns the breeding counter of the token provided.
     * @param id Is the id of the token to check
     */
    function getContadorBreeding(uint id) view external returns(uint) {
        return _breedingCounter[id];
    }

    /**
     * @notice this function returns the URI of the json of the contract
     * @dev json holded on the hosting of the client
     * @return baseURI the URI of the json
     */
    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    /**
     * @notice Set a new URI for Rookie ED0 NFT
     * @param _newBaseURI the new URI
     */
    function setURI(string calldata _newBaseURI) public onlyRole(ADMIN_ROLE) {
        baseURI = _newBaseURI;
    }

    /**
     * @notice Inherit function which returns the URI of Rookie ED0 NFT
     * @dev ALL the tokens of Rookie ED0 have ONE SINGLE URI
     * @param tokenId The token ID
     * @return baseURI the baseURI of Rookie ED0
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return baseURI;
    }

    /**
     * @notice This function returns the quantity of NFTs stored for beneficiary
     * @param _beneficiary user address
     * @return quantity the total of NFTs booked to the beneficiary
     */
    function getPrivateSell(address _beneficiary) public view returns (uint) {
        return _privateSell[_beneficiary];
    }

    /// @dev PREGUNTAR SI VAN A QUERER SETEAR NUEVAS CANTIDADES!!!!!!!!!!!
    function setNewPrivateSell(address _beneficiary, uint8 _quantity) public onlyRole(ADMIN_ROLE) {
        require(_beneficiary != address(0), "Address shouldn't be zero");
        _privateSell[_beneficiary] = _quantity;
    }

    /**
     * @notice This function makes a private sell to the beneficiary if is into private sell whitelist
     * @dev Near to surpase gas limit when quantity stored into mapping >= 200
     * @param _beneficiary user address
     */
    function doPrivateSell(address _beneficiary) payable public onlyRole(ADMIN_ROLE) {
        require(_privateSell[_beneficiary] > 0, "Beneficiary isn't into private sell");
        require(block.timestamp >= endOfPS, "Presale is not over yet");

        for(uint8 i = 0; i < _privateSell[_beneficiary]; i++){
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            _safeMint(_beneficiary, tokenId);
        }
        _privateSell[_beneficiary] = 0;
    }

    /// @dev BORRAR ESTO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    function setNewDate(uint64 _newTS) public onlyRole(DEFAULT_ADMIN_ROLE) {
        endOfPS = _newTS;
    }

    /**
     * @notice This is the function that mints the contract to an address
     * @param to the address of the minter 
     */
    function safeMint(address to) public onlyRole(MINTER_ROLE) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    /// @notice Function for pause and unpause the contract
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
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