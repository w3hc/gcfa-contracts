# Good CFA 

## Install

```
nvm use
npm ci
```

## Test

```
npx hardhat test
```

## Deploy

Create a `.env` on the model of `.env.example`:

```js
cp .env.example .env
```

Add your own keys in your `.env` file. 

Deploy to `alfajores` (Celo Testnet):

```
npx hardhat run scripts/clear.ts
npx hardhat run scripts/deploy.ts --network alfajores
```

## Supported networks

- Celo Mainnet
- Celo Alfajores Testnet
- Ethereum Goerli Testnet
- Gnosis Chain Mainnet
- Gnosis Chiado Testnet
- Mantle Testnet

## cEUR contract address

0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73 ([CeloScan](https://celoscan.io/token/0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73), [Coingecko](https://www.coingecko.com/en/coins/celo-euro))

## EURe contract address

0xcB444e90D8198415266c6a2724b7900fb12FC56E ([GnosisScan](https://gnosisscan.io/token/0xcB444e90D8198415266c6a2724b7900fb12FC56E), [Coingecko](https://www.coingecko.com/en/coins/monerium-eur-money))

## Latest deployment

Alfajores: 

*June 15, 2023*

- EURMock: [0x6bd981edf241d252b48af662a52e9d3ca84cdfae](https://alfajores.celoscan.io/address/0x6bd981edf241d252b48af662a52e9d3ca84cdfae#code)
- IdentityMock: [0x4A5C7e56a2e2E6641934522885e843e1dc98fC1f](https://alfajores.celoscan.io/address/0x4A5C7e56a2e2E6641934522885e843e1dc98fC1f#code)
- NameServiceMock: [0xAbf302bbe78f3e285dA4a7278DE428Caca96A873](https://alfajores.celoscan.io/address/0xAbf302bbe78f3e285dA4a7278DE428Caca96A873#code)
- gCFA: [0x868cD4404e990746C07E99Eeb7328F2e8B09fa4C](https://alfajores.celoscan.io/address/0x868cD4404e990746C07E99Eeb7328F2e8B09fa4C#code)

1st successful deposit: [0x7a311b27ce78e6e235a2c159e7fbcfbcc636b410374ac4204fa8029454bf3dec](https://alfajores.celoscan.io/tx/0x7a311b27ce78e6e235a2c159e7fbcfbcc636b410374ac4204fa8029454bf3dec)

*May 18, 2023*

- [EURMock](https://alfajores.celoscan.io/address/0x6Bd981edF241d252b48aF662A52E9d3cA84cdFae#code)
- [gCFA](https://alfajores.celoscan.io/address/0xEc12e5d24f3488C8cC22381caa1cECe12a5C254f#code)
- [DAO](https://alfajores.celoscan.io/address/0x020b796c418c363be5517c6febff5c5a9248f763#code)

Chiado: 

- [EURMock](https://blockscout.chiadochain.net/address/0x4bdf99b0e13457a367f4d1ffcefb8cec88f36199)
- [gCFA](https://blockscout.chiadochain.net/address/0x425F7D52ca97DA275e2218AB15cdDfE58e424Db2)
- [DAO](https://blockscout.com/gnosis/chiado/address/0x2cdF5cde6d6b47CA9550ba36BBE618C123d41238)

Gnosis Chain:

- [EURe](https://gnosisscan.io/token/0xcB444e90D8198415266c6a2724b7900fb12FC56E#code)
- [gCFA](https://gnosisscan.io/address/0xC34158a3c039Af254e38cE6Eb97363a5aAF405D1#code)
- [DAO](https://gnosisscan.io/address/0xb2d6696f7f006e67b1a1eccb264e0e62a8a76f93#code)

## Versions

- Node [v18.16.0](https://nodejs.org/uk/blog/release/v18.16.0/)
- NPM [v9.5.0](https://github.com/npm/cli/releases/tag/v9.5.0)
- OpenZeppelin Contracts [v4.8.0](https://github.com/OpenZeppelin/openzeppelin-contracts/releases/tag/v4.8.0)

## Support

You can contact me via [Element](https://matrix.to/#/@julienbrg:matrix.org), [Telegram](https://t.me/julienbrg), [Twitter](https://twitter.com/julienbrg), [Discord](https://discord.com/invite/uSxzJp3J76), or [LinkedIn](https://www.linkedin.com/in/julienberanger/).
