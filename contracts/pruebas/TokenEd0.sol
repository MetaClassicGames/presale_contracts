// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract TokenEd0 is ERC721, ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    
    // De id del token a nº veces Breeding
    mapping(uint => uint) public contadorBreeding;

    constructor() ERC721("MyTokenEd0", "MTK0") {}

    function setContadorBreeding(uint id, uint cantidad) external {
        require(msg.sender == ownerOf(id), "El sender no es propietario del token");
        contadorBreeding[id] = cantidad;
    }

    // Función que hace el breeding
    function reproduce(uint idToken1, uint idToken2) public {
        // Comprueba que los NFT existan
        require(_exists(idToken1), "El token 1 no existe");
        require(_exists(idToken2), "El token 2 no existe");

        // Comprueba el dueño de los NFT
        require(msg.sender == ownerOf(idToken1), "El sender no es propietario del token 1");
        require(msg.sender == ownerOf(idToken2), "El sender no es propietario del token 2");

        // Comprueba el contador Breeding de los NFT
        require(contadorBreeding[idToken1] < 2, "El token 1 es esteril");
        require(contadorBreeding[idToken2] < 2, "El token 2 es esteril");

        // Mintea un nuevo NFT con address del sender
        safeMint(msg.sender);
        
        // Aumenta el contador breeding de los tokens
        contadorBreeding[idToken1]++;
        contadorBreeding[idToken2]++;
    }

    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        contadorBreeding[tokenId] = 0;
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
