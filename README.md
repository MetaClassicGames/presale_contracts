# Meta Classic Games Presale Contracts

<img src="./logo.png" alt="Logo" width="500"/>

This is the official repository for the smart contracts of Meta Classic Games (Presale)

## Index
* [Smart Contracts](#smart-contracts)
* [Tests Results](#tests)
* [Slither Results](#slither)
* [Whitepaper](https://metaclassicgames.gitbook.io/white-paper-english)

### <a name="smart-contracts"></a>Smart Contracts
There are 4 contracts for this presale:
- Rookie
- Amateur
- Pro
- Legend

All the contracts are the same except in the name, symbol and revert errors. (/contracts)

#### URI

For the different tokens are:

| Type | URI |
|------|-----|
|Rookie|<a href="http://vegabuild.es/mcg_tokens/0.json">http://vegabuild.es/mcg_tokens/0.json</a>|
|Amateur|<a href="http://vegabuild.es/mcg_tokens/1.json">http://vegabuild.es/mcg_tokens/1.json</a>|
|Pro|<a href="http://vegabuild.es/mcg_tokens/2.json">http://vegabuild.es/mcg_tokens/2.json</a>|
|Legend|<a href="http://vegabuild.es/mcg_tokens/3.json">http://vegabuild.es/mcg_tokens/3.json</a>|

#### Stablecoin

The stablecoin used to buy PS tokens is <a href="https://mumbai.polygonscan.com/address/0xe11A86849d99F524cAC3E7A0Ec1241828e332C62"><mark>&nbsp;USDC&nbsp;</mark></a> from Polygon network.

#### Testnet Contracts

- [Rookie](https://mumbai.polygonscan.com/address/0xEcb4253D7d228cB5f05F4073001DFD51DB764fF8)
- [Amateur](https://mumbai.polygonscan.com/address/0x1ee0eDa3fdDAAF4484F02A35664F13590CeFEFA9)
- [Pro](https://mumbai.polygonscan.com/address/0x31eF5dA942dBFBB90c2b4Bf8EBBb564D59c36Ec3)
- [Legend](https://mumbai.polygonscan.com/address/0xaa46511C003239F23De291Ca3917434F29e68DA1)

#### :construction: Mainnet Contracts :construction:

- Rookie:
- Amateur:
- Pro: 
- Legend: 

### <a name="tests"></a>Test Results

By Chai
```
  Deploy
    √ All smart contracts deployed (1ms)

  Presale Contract Test Suite (only for one)
    √ Roles control (2446ms)
    √ setNewStableCoin fx (443ms)
    √ setNewPrice fx (363ms)
    √ setEndOfPS fx (181ms)
    √ setChildContractAddress fx (834ms)
    √ Mint 1 Rookie Ed 0 for owner (1476ms)
    √ Should revert when safeMint function is called (596ms)
    √ setNewPrivateSell fx (1040ms)
    √ Should revert, PreSale is not over (245ms)
    √ Should do a private sell to B1 (2519ms)
    √ Should revert when try to do a private sell to B1 again (186ms)
    √ Should withdraw USDC balance to admin wallet (317ms)
    √ Should revert when B1 address try to call setCounterBreeding (59ms)
    √ Reproduce 2 and 3 (704ms)
    √ Should revert when 2 and 3 calls reproduce when it calls again (583ms)
    √ Should revert when B4 try to set new child contract to hack contract (371ms)
    √ 1 - MAX SUPPLY (22240ms)
    √ 2 - MAX SUPPLY (12272ms)
    √ 3 - MAX SUPPLY (13069ms)
    √ 4 - MAX SUPPLY (7808ms)
    √ 5 - MAX SUPPLY (6259ms)
    √ 6 - MAX SUPPLY (6266ms)
    √ 7 - MAX SUPPLY (6934ms)
    √ 8 - MAX SUPPLY (10221ms)
    √ Should revert when try to mint tokens (79ms)
    √ setNewPrivateSell R16 (38ms)
    √ Private sell to get 1000 tokens minted (938ms)
    √ setNewPrivateSell R16 (32ms)
    √ Should revert when try to mint 1001 tokens (50ms)
    √ Should pause contract (132ms)
    √ Mint function paused (36ms)
    √ Should unpause contract (41ms)
    √ Should return the URI (20ms)
    √ Should change the URI (48ms)
    √ Should burn token 1000 (181ms)


·----------------------------------------|---------------------------|-------------|-----------------------------·
|          Solc version: 0.8.13          ·  Optimizer enabled: true  ·  Runs: 200  ·  Block limit: 30000000 gas  │
·········································|···························|·············|······························
|  Methods                               ·               30 gwei/gas               ·       1.30 eur/matic        │
·············|···························|·············|·············|·············|···············|··············
|  Contract  ·  Method                   ·  Min        ·  Max        ·  Avg        ·  # calls      ·  eur (avg)  │
·············|···························|·············|·············|·············|···············|··············
|  RookieE0  ·  burn                     ·          -  ·          -  ·      54652  ·            4  ·       0.00  │
·············|···························|·············|·············|·············|···············|··············
|  RookieE0  ·  doPrivateSell            ·          -  ·          -  ·    2381978  ·            5  ·       0.09  │
·············|···························|·············|·············|·············|···············|··············
|  RookieE0  ·  grantRole                ·          -  ·          -  ·      51464  ·            2  ·       0.00  │
·············|···························|·············|·············|·············|···············|··············
|  RookieE0  ·  mintRookie               ·     189894  ·     211794  ·     194678  ·         1800  ·       0.01  │
·············|···························|·············|·············|·············|···············|··············
|  RookieE0  ·  pause                    ·          -  ·          -  ·      47168  ·            1  ·       0.00  │
·············|···························|·············|·············|·············|···············|··············
|  RookieE0  ·  setChildContractAddress  ·          -  ·          -  ·      46373  ·            1  ·       0.00  │
·············|···························|·············|·············|·············|···············|··············
|  RookieE0  ·  setEndOfPS               ·      26150  ·      46062  ·      36106  ·            2  ·       0.00  │
·············|···························|·············|·············|·············|···············|··············
|  RookieE0  ·  setNewPrice              ·          -  ·          -  ·      26200  ·            1  ·       0.00  │
·············|···························|·············|·············|·············|···············|··············
|  RookieE0  ·  setNewPrivateSell        ·      54377  ·      54389  ·      54387  ·            5  ·       0.00  │
·············|···························|·············|·············|·············|···············|··············
|  RookieE0  ·  setNewStableCoin         ·          -  ·          -  ·      46449  ·            1  ·       0.00  │
·············|···························|·············|·············|·············|···············|··············
|  RookieE0  ·  setURI                   ·          -  ·          -  ·      40562  ·            1  ·       0.00  │
·············|···························|·············|·············|·············|···············|··············
|  RookieE0  ·  unpause                  ·          -  ·          -  ·      25286  ·            1  ·       0.00  │
·············|···························|·············|·············|·············|···············|··············
|  RookieE0  ·  withdrawFunds            ·          -  ·          -  ·      64148  ·            1  ·       0.00  │
·············|···························|·············|·············|·············|···············|··············
|  TokenEd1  ·  reproduce                ·     178078  ·     183978  ·     181028  ·            4  ·       0.01  │
·············|···························|·············|·············|·············|···············|··············
|  Deployments                           ·                                         ·  % of limit   ·             │
·········································|·············|·············|·············|···············|··············
|  AmateurE0                             ·          -  ·          -  ·    3212021  ·       10.7 %  ·       0.13  │
·········································|·············|·············|·············|···············|··············
|  LegendE0                              ·          -  ·          -  ·    3212005  ·       10.7 %  ·       0.13  │
·········································|·············|·············|·············|···············|··············
|  ProE0                                 ·          -  ·          -  ·    3211957  ·       10.7 %  ·       0.13  │
·········································|·············|·············|·············|···············|··············
|  RookieE0                              ·          -  ·          -  ·    3211993  ·       10.7 %  ·       0.13  │
·········································|·············|·············|·············|···············|··············
|  TokenEd1                              ·          -  ·          -  ·    1626968  ·        5.4 %  ·       0.06  │
·········································|·············|·············|·············|···············|··············
|  USDC                                  ·          -  ·          -  ·    4353724  ·       14.5 %  ·       0.17  │
·----------------------------------------|-------------|-------------|-------------|---------------|-------------·

  37 passing (2m)
```

### <a name="slither"></a> :snake: Slither results :snake:

> WARN: Slither's results on these contracts does NOT exonerate smart contracts from having bugs in the code. It is simply a test to detect the most common errors.

> All the OZ contracts issues from Slither are removed for a better reading

<span style="color:green">ERC721._baseURI() (../../share/contracts/token/ERC721/ERC721.sol#105-107) is never used and should be removed</span>

<span style="color:green">RookieE0._baseURI() (../../share/contracts/Rookie.sol#188-190) is never used and should be removed</span>

<span style="color:green">Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#dead-code</span>

<span style="color:green">Pragma version^0.8.0 (../../share/contracts/Rookie.sol#2) allows old versions</span>

<span style="color:green">Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#incorrect-versions-of-solidity</span>

<span style="color:green">tokenURI(uint256) should be declared external:</span>

- <span style="color:green">ERC721.tokenURI(uint256) (../../share/contracts/token/ERC721/ERC721.sol#93-98)</span>

- <span style="color:green">RookieE0.tokenURI(uint256) (../../share/contracts/Rookie.sol#206-209)</span>

<span style="color:green">Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#public-function-that-could-be-declared-external</span>
