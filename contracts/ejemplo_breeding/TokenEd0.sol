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

    // Hago esto para que el contador sea 1 desde el principio
    constructor() ERC721("MyTokenEd0", "MTK0") {}

    // Getter y Setter del contador de Breeding, función que comprueba si el token existe
    function setContadorBreeding(uint id, address propietario) external {
        require(propietario == ownerOf(id), "El sender no es propietario del token");
        contadorBreeding[id]++;
    }
    function getContadorBreeding(uint id) view external returns(uint) {
        return contadorBreeding[id];
    }

    // mintea el token, pone su contador a 0 y lo añade al array
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
