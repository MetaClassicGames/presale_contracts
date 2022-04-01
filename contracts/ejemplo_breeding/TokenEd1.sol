// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "hardhat/console.sol";

interface edicionCero {
    function getCounterBreeding(uint256 id) view external returns(uint256);
    function setCounterBreeding(uint256 id, address owner) external;
}

contract TokenEd1 is ERC721, ERC721Enumerable {
    // Address de la interfaz
    address private ed0;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    event MintedByBreed(address to, uint256 idToken1, uint256 idToken2);

    // Recibe el address de la interfaz por parámetro
    constructor(address addr) ERC721("MyTokenEd1", "MTK1") {
        ed0 = addr;
    }

    // Función que hace el breeding
    function reproduce(uint idToken1, uint idToken2) public {
        // Comprueba el contador Breeding de los NFT de edición 0
        require(edicionCero(ed0).getCounterBreeding(idToken1) < 2, "MTK1: Token 1 is steril");
        require(edicionCero(ed0).getCounterBreeding(idToken2) < 2, "MTK1: Token 2 is steril");

        // Mintea un nuevo NFT con address del sender
        __safeMint(msg.sender);
        
        // Aumenta el contador breeding de los NFT de edición 0
        edicionCero(ed0).setCounterBreeding(idToken1, msg.sender);
        edicionCero(ed0).setCounterBreeding(idToken2, msg.sender);

        emit MintedByBreed(msg.sender, idToken1, idToken2);
    }
    
    function __safeMint(address to) private {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    // The following functions are overrides required by Solidity.
    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
