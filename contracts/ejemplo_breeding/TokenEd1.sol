// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

interface edicionCero {
    function setContadorBreeding(uint id, address propietario) external;
    function getContadorBreeding(uint id) view external returns(uint);
}

contract TokenEd1 is ERC721, ERC721Enumerable, Ownable {
    // Address de la interfaz
    address private ed0;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // Recibe el address de la interfaz por parámetro
    constructor(address addr) ERC721("MyTokenEd1", "MTK1") {
        ed0 = addr;
    }

    // Función que hace el breeding
    function reproduce(uint idToken1, uint idToken2) public {
        // Comprueba el contador Breeding de los NFT de edición 0
        require(edicionCero(ed0).getContadorBreeding(idToken1) < 2, "El token 1 es esteril");
        require(edicionCero(ed0).getContadorBreeding(idToken2) < 2, "El token 2 es esteril");

        // Mintea un nuevo NFT con address del sender
        safeMint(msg.sender);
        
        // Aumenta el contador breeding de los NFT de edición 0
        edicionCero(ed0).setContadorBreeding(idToken1, msg.sender);
        edicionCero(ed0).setContadorBreeding(idToken2, msg.sender);
    }
    
    function safeMint(address to) public onlyOwner {
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
