// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

// Stablecoin implementation
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// ERC721
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

// OZ control
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title Presale Ed.0 rookie
 * @author EscuelaCryptoES
 * @notice This is the contract of the preasale of the Rookie NFT
 */
contract RookieE0 is ERC721, ERC721Enumerable, Pausable, AccessControl, ReentrancyGuard {
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
    uint64 public _endOfPS;

    // NFT Config
    uint16 private constant _maxSupply = 1000;
    uint16 public _soldPrivately;
    // TODO: Change in deploy
    uint256 public price = 10000000000000000000;
    IERC20 public stableCoin;

    // Breeding
    mapping(uint256 => uint256) private _breedingCounter;
    address private _child;

    // Events
    event RookieMinted(uint256 indexed tokenId, address to, uint256);
    // TODO: evento venta privada
    // TODO: eventos setters

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
        _grantRole(ADMIN_ROLE, msg.sender);

        // End of PS
        require(_timestampEndOfPS > block.timestamp);
        _endOfPS = _timestampEndOfPS;

        // Private Sell
        require(_beneficiaries.length == _quantities.length);
        for (uint8 i = 0; i < _beneficiaries.length; i++) {
            require(_beneficiaries[i] != address(0));
            _privateSell[_beneficiaries[i]] = _quantities[i];
            _soldPrivately += _quantities[i];
        }

        // Starts in 1
        _tokenIdCounter.increment();

        //Stablecoin
        stableCoin = IERC20(_stableCoin);

        //Child contract
        _child = address(0);
    }

    // **** SETTER & GETTER SECTION ****

    /**
     * @notice Setter for stablecoin
     * @param _newStableCoin The address of the new stablecoin
     */
    function setNewStableCoin(address _newStableCoin) external onlyRole(ADMIN_ROLE) {
        require(_newStableCoin != address(0));
        stableCoin = IERC20(_newStableCoin);
    }

    /**
     * @notice Setter for NFT price
     * @param _newPrice The new price of NFT
     */
    function setNewPrice(uint256 _newPrice) external onlyRole(ADMIN_ROLE) {
        require(_newPrice > 0);
        price = _newPrice;
    } 

    /**
     * @notice This setter changes the presale final date
     * @param _newTS The new ts for final date of presale
     */
    function setNewDate(uint64 _newTS) external onlyRole(ADMIN_ROLE) {
        // TODO: PARA PODER HACER VENTA PRIVADA EN TESTING
        // require(_newTS >= block.timestamp, "RKE0: Date must be greater than now");
        _endOfPS = _newTS;
    }

    /**
     * @notice Setter for child contract ED1
     * @param _contractAddress the ED1 contract address
     */
    function setChildContractAddress(address _contractAddress) external onlyRole(ADMIN_ROLE) {
        require(_contractAddress != address(0));
        _child = _contractAddress;
    }

    /**
     * @notice Getter for child variable
     * @return child the contract address of ED1
     * TODO: REVISAR LOS GETTERS
     */
    function getChildContractAddress() external view returns(address) {
        return _child;
    }

    // **** BREEDING SECTION ****

    /**
     * @dev Requires that who calls the function is the owner of the token and
     * adds one to the breeding counter of the token provided. 
     * @param id Is the id of the token to check
     * @param owner Is the id address of the sender of the contract ED 1
     */
    function setCounterBreeding(uint256 id, address owner) external {
        require(msg.sender == _child);
        require(owner == ownerOf(id));
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
    function setURI(string calldata _newBaseURI) external onlyRole(ADMIN_ROLE) {
        baseURI = _newBaseURI;
    }

    /**
     * @notice Inherit function which returns the URI of Rookie ED0 NFT
     * @dev ALL the tokens of Rookie ED0 have ONE SINGLE URI
     * @param tokenId The token ID
     * @return baseURI the baseURI of Rookie ED0
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId));
        return baseURI;
    }

    // **** PRIVATE SELL SECTION ****

    /**
     * @notice This function returns the quantity of NFTs stored for beneficiary
     * @param _beneficiary user address
     * @return quantity the total of NFTs booked to the beneficiary
     */
    function getPrivateSell(address _beneficiary) external view returns (uint256) {
        return _privateSell[_beneficiary];
    }

    /// @dev TODO: PREGUNTAR SI VAN A QUERER SETEAR NUEVAS CANTIDADES!!!!!!!!!!!
    function setNewPrivateSell(address _beneficiary, uint8 _quantity) external onlyRole(ADMIN_ROLE) {
        require(_tokenIdCounter.current() + (_soldPrivately + _quantity) <= _maxSupply);
        require(_beneficiary != address(0));
        _privateSell[_beneficiary] = _quantity;
        _soldPrivately += _quantity;
    }

    /**
     * @notice This function makes a private sell to the beneficiary if is into private sell whitelist
     * @dev Near to surpase gas limit when quantity stored into mapping >= 200
     */
    function doPrivateSell() external whenNotPaused nonReentrant {
        require(msg.sender != address(0));
        require(_privateSell[msg.sender] > 0);
        require(block.timestamp >= _endOfPS);

        for(uint8 i = 0; i < _privateSell[msg.sender]; i++){
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            _safeMint(msg.sender, tokenId);
        }
        _privateSell[msg.sender] = 0;
    }

    // **** NFT SECTION ****

    /**
     * @notice This function mints one Rookie NFT from ed0
     * @param _to The address of minter
     */
    function mintRookie(address _to) external nonReentrant whenNotPaused {
        require(_to != address(0));
        require(IERC20(stableCoin).balanceOf(_to) >= price);
        SafeERC20.safeTransferFrom(IERC20(stableCoin), _to, address(this), price);
        
        // Mint
        uint256 tokenId = _tokenIdCounter.current();
        require(tokenId < _maxSupply - _soldPrivately);

        _tokenIdCounter.increment();     
        _safeMint(_to, tokenId);

        emit RookieMinted(tokenId, _to, price);
    }

    /**
     * @notice Withdraw funds in stableCoin from this contract to an address
     * @param _to the address to send the funds
     */
    function withdrawFunds(address _to) external nonReentrant onlyRole(ADMIN_ROLE) {
        require(_to != address(0));
        IERC20(stableCoin).transfer(_to, IERC20(stableCoin).balanceOf(address(this)));
    }

    /**
     * @notice Withdraw native funds in wei from this contract to an address
     * @dev This PS contract should never have an wei balance (JIC)
     * @param _to the address to send the funds
     */
    function nativeWithdraw(address _to) external payable nonReentrant onlyRole(ADMIN_ROLE) {
        require(_to != address(0));
        payable(_to).transfer(address(this).balance);
    }

    // **** EXTRA FUNCTIONS SECTION ****

    /// @notice Getter of current NFT Id
    function getCurrentTokenId() external view returns (uint) {
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