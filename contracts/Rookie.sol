// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

// Stablecoin imp
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// ERC721
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

// OZ control
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "hardhat/console.sol";

/**
 * @title Presale Ed.0 rookie
 * @author EscuelaCryptoES
 * @notice This is the contract of the preasale of the Rookie NFT
 */
contract RookieE0 is ERC721, ERC721Enumerable, Pausable, AccessControl, ERC721Burnable, ReentrancyGuard {
    // Token counter
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // Roles
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE  = keccak256("ADMIN_ROLE");
    
    // URI of the tokens
    string public baseURI = "https://www.metaclassicgames.com/tokens/ed0/0.json";
    
    // privateSell config
    mapping(address=>uint8) private _privateSell;
    uint64 private endOfPS;

    // NFT Config
    uint16 private constant _maxSupply = 1000;
    uint16 private _soldPrivately;
    uint256 public _price = 50000000000000000000;
    IERC20 public stableCoin;

    // Breeding
    mapping(uint256 => uint256) private _breedingCounter;


    // Modifiers
    modifier isBeneficiary(address _beneficiary) {
        require(_beneficiary != address(0), "RKE0: Address shouldn't be zero");
        require(_privateSell[_beneficiary] > 0, "RKE0: Beneficiary isn't into private sell");
        _;
    }

    // Events
    event RookieMinted(uint256 indexed tokenId, address to, uint256);

    /** 
     * @notice This is the contructor of the contract
     * @dev Beneficiaries and his NFTs setted. Also timestamp for the end of presale
     * @param _beneficiaries the beneficiaries
     * @param _quantities the total of NFTs booked
     * @param _timestampEndOfPS the ts for the end of presale
     */
    constructor(address[] memory _beneficiaries, uint8[] memory _quantities, uint64 _timestampEndOfPS, address _stableCoin) ERC721("RookieEd0", "RKE0") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, address(0)); // No one can mint more tokens
        _grantRole(ADMIN_ROLE, msg.sender);

        // End of PS
        require(_timestampEndOfPS > block.timestamp);
        endOfPS = _timestampEndOfPS;

        // Private Sell
        require(_beneficiaries.length == _quantities.length, "RKE0: Missmatch lengths");
        for (uint8 i = 0; i < _beneficiaries.length; i++) {
            require(_beneficiaries[i] != address(0), "RKE0: Address shouldn't be zero");
            _privateSell[_beneficiaries[i]] = _quantities[i];
            _soldPrivately += _quantities[i];
        }

        // Starts in 1
        _tokenIdCounter.increment();

        //Stablecoin
        stableCoin = IERC20(_stableCoin);
    }

    // **** SETTER SECTION ****

    /**
     * @notice Setter for stablecoin
     * @param _newStableCoin The address of the new stablecoin
     */
    function setNewStableCoin(address _newStableCoin) public onlyRole(ADMIN_ROLE) {
        stableCoin = IERC20(_newStableCoin);
    }

    /**
     * @notice Setter for NFT price
     * @param _newPrice The new price of NFT
     */
    function setNewPrice(uint256 _newPrice) public onlyRole(ADMIN_ROLE) {
        _price = _newPrice;
    } 

    /**
     * @notice This setter changes the presale final date
     * @param _newTS The new ts for final date of presale
     */
    function setNewDate(uint64 _newTS) public onlyRole(ADMIN_ROLE) {
        endOfPS = _newTS;
    }

    // **** BREEDING SECTION ****

    /**
     * @dev Requires that who calls the function is the owner of the token and
     * adds one to the breeding counter of the token provided. 
     * TODO: OJO!!!!!!! ESTO HAY QUE CONTROLAR Q SEA LLAMABLE SOLO DESDE ED1
     * @param id Is the id of the token to check
     * @param owner Is the id address of the sender of the contract ED 1
     */
    function setCounterBreeding(uint256 id, address owner) external {
        require(owner == ownerOf(id), "RKE0: The sender isnt the owner of the token");
        _breedingCounter[id]++;
    }

    /**
     * @notice Returns the breeding counter of the token provided.
     * @param id Is the id of the token to check
     */
    function getCounterBreeding(uint256 id) view external returns(uint256) {
        return _breedingCounter[id];
    }

    // **** URI SECTION ****

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

    // **** PRIVATE SELL SECTION ****

    /**
     * @notice This function returns the quantity of NFTs stored for beneficiary
     * @param _beneficiary user address
     * @return quantity the total of NFTs booked to the beneficiary
     */
    function getPrivateSell(address _beneficiary) public view returns (uint256) {
        return _privateSell[_beneficiary];
    }

    /// @dev PREGUNTAR SI VAN A QUERER SETEAR NUEVAS CANTIDADES!!!!!!!!!!!
    function setNewPrivateSell(address _beneficiary, uint8 _quantity) public onlyRole(ADMIN_ROLE) {
        require(_beneficiary != address(0), "RKE0: Address shouldn't be zero");
        _privateSell[_beneficiary] = _quantity;
        _soldPrivately += _quantity;
    }

    /**
     * @notice This function makes a private sell to the beneficiary if is into private sell whitelist
     * @dev Near to surpase gas limit when quantity stored into mapping >= 200
     * @param _beneficiary user address
     */
    function doPrivateSell(address _beneficiary) public nonReentrant isBeneficiary(_beneficiary) {
        require(block.timestamp >= endOfPS, "RKE0: Presale is not over yet");

        for(uint8 i = 0; i < _privateSell[_beneficiary]; i++){
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            _safeMint(_beneficiary, tokenId);
            // TODO: Creo que esto hay que quitarlo. Los mappings se inician a 0 default.
            _breedingCounter[tokenId] = 0;
        }
        _privateSell[_beneficiary] = 0;
    }

    // **** NFT SECTION ****

    /**
     * @notice This function mints one Rookie NFT from ed0
     * @param _to The address of minter
     */
    function mintRookie(address _to) public nonReentrant whenNotPaused {
        require(IERC20(stableCoin).balanceOf(_to) >= _price, "USDC: Insufficient funds");
        SafeERC20.safeTransferFrom(IERC20(stableCoin), _to, address(this), _price);
        
        // Mint
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        require(tokenId < _maxSupply - _soldPrivately, "RKE0: Max supply reached");
        _safeMint(_to, tokenId);
        // TODO: Creo que esto hay que quitarlo. Los mappings se inician a 0 default.
        _breedingCounter[tokenId] = 0;

        emit RookieMinted(tokenId, _to, _price);
    }

    /**
     * @notice This function never will be executed
     * @param to the address of the minter 
     */
    function safeMint(address to) public onlyRole(MINTER_ROLE) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    // **** EXTRA FUNCTIONS SECTION ****

    /// @notice Function for pause the contract
    function pause() public onlyRole(PAUSER_ROLE) whenNotPaused {
        _pause();
    }

    /// @notice Function for unpause contract
    function unpause() public onlyRole(PAUSER_ROLE) whenPaused {
        _unpause();
    }

    /// @notice Getter of current NFT Id
    function getCurrentTokenId() public view returns (uint) {
        return _tokenIdCounter.current();
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