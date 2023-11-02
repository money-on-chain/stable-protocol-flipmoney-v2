import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-solhint";
import "@nomicfoundation/hardhat-chai-matchers";
import "@openzeppelin/hardhat-upgrades";
import "@typechain/hardhat";
import { resolve } from "path";
import { config as dotenvConfig } from "dotenv";
import "hardhat-contract-sizer";
import "hardhat-deploy";
import "hardhat-docgen";
import "hardhat-gas-reporter";
import { removeConsoleLog } from "hardhat-preprocessor";
import { HardhatUserConfig } from "hardhat/config";
import { BigNumber } from "ethers";
import "solidity-coverage";
import "hardhat-storage-layout";
import { DeployParameters } from "moc-main/export/scripts/types";

dotenvConfig({ path: resolve(__dirname, "./.env") });

const PCT_BASE = BigNumber.from((1e18).toString());
const DAY_BLOCK_SPAN = 2880;
const WEEK_BLOCK_SPAN = DAY_BLOCK_SPAN * 7;
const MONTH_BLOCK_SPAN = DAY_BLOCK_SPAN * 30;
declare module "hardhat/types/config" {
  export interface HardhatNetworkUserConfig {
    deployParameters: DeployParameters;
  }
  export interface HardhatNetworkConfig {
    deployParameters: DeployParameters;
  }
  export interface HttpNetworkConfig {
    deployParameters: DeployParameters;
  }
}

const chainIds = {
  ganache: 1337,
  goerli: 5,
  hardhat: 31337,
  kovan: 42,
  mainnet: 1,
  rinkeby: 4,
  ropsten: 3,
  rskTestnet: 31,
  polygonMumbai: 80001,
};

// Ensure that we have all the environment variables we need.
let mnemonic: string;
if (!process.env.MNEMONIC) {
  throw new Error("Please set your MNEMONIC in a .env file");
} else {
  mnemonic = process.env.MNEMONIC;
}
/*
let alchemyApiKey: string;
if (!process.env.ALCHEMY_API_KEY) {
  throw new Error("Please set your ALCHEMY_API_KEY in a .env file");
} else {
  alchemyApiKey = process.env.ALCHEMY_API_KEY;
}*/
const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  namedAccounts: {
    deployer: 0,
    otherUser: 1,
    alice: 2,
    bob: 3,
    charlie: 4,
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic,
        accountsBalance: "100000000000000000000000000000000000",
      },
      chainId: chainIds.hardhat,
      hardfork: "london", // FIXME: latest evm version supported by rsk explorers, keep it updated
      // TODO: remove this
      allowUnlimitedContractSize: true,
      deployParameters: {
        coreParams: {
          protThrld: PCT_BASE.mul(2), // 2
          liqThrld: PCT_BASE.mul(104).div(100), // 1.04
          emaCalculationBlockSpan: DAY_BLOCK_SPAN,
          successFee: PCT_BASE.mul(10).div(100), // 10%
          appreciationFactor: PCT_BASE.mul(50).div(100), // 50%
          tcInterestRate: PCT_BASE.mul(5).div(100000), // 0.005% : weekly 0.0025 / 365 * 7
          tcInterestPaymentBlockSpan: WEEK_BLOCK_SPAN,
        },
        settlementParams: {
          bes: MONTH_BLOCK_SPAN,
        },
        feeParams: {
          feeRetainer: PCT_BASE.mul(0), // 0%
          mintFee: PCT_BASE.mul(5).div(100), // 5%
          redeemFee: PCT_BASE.mul(5).div(100), // 5%
          swapTPforTPFee: PCT_BASE.mul(1).div(100), // 1%
          swapTPforTCFee: PCT_BASE.mul(1).div(100), // 1%
          swapTCforTPFee: PCT_BASE.mul(1).div(100), // 1%
          redeemTCandTPFee: PCT_BASE.mul(8).div(100), // 8%
          mintTCandTPFee: PCT_BASE.mul(8).div(100), // 8%
          feeTokenPct: PCT_BASE.mul(5).div(10), // 50%
        },
        ctParams: {
          name: "CollateralToken",
          symbol: "CT",
        },
        mocAddresses: {
          governorAddress: "0x26a00af444928d689dDEc7B4D17C0e4A8c9D407A",
          collateralAssetAddress: "0x19F64674D8A5B4E652319F5e239eFd3bc969A1fE",
          collateralTokenAddress: "0x19F64674D8A5B4E652319F5e239eFd3bc969A1fE",
          pauserAddress: "0x26a00aF444928D689DDec7B4D17C0e4a8c9d407b",
          feeTokenAddress: "0x26a00AF444928d689DDeC7b4d17c0e4A8c9D4060",
          feeTokenPriceProviderAddress: "0x26A00AF444928d689ddec7b4d17c0E4A8C9D4061",
          mocFeeFlowAddress: "0x26a00aF444928d689DDEC7b4D17c0E4a8c9D407d",
          mocAppreciationBeneficiaryAddress: "0x26A00aF444928D689ddEC7B4D17C0E4A8C9d407F",
          vendorsGuardianAddress: "0x26a00AF444928D689DDeC7b4D17c0E4a8C9d407E",
          tcInterestCollectorAddress: "0x27a00Af444928D689DDec7B4D17c0E4a8c9d407F",
          authorizedExecutors: [],
        },
        gasLimit: 30000000, // high value to avoid coverage issue. https://github.com/NomicFoundation/hardhat/issues/3121
      },
      tags: ["local"],
    },
    rskTestnet: {
      accounts: process.env.MNEMONIC ? [`0x${process.env.MNEMONIC}`] : { mnemonic },
      chainId: chainIds.rskTestnet,
      url: "https://public-node.testnet.rsk.co",
      deployParameters: {
        coreParams: {
          protThrld: PCT_BASE.mul(15).div(10), // 1.5
          liqThrld: PCT_BASE.mul(104).div(100), // 1.04
          emaCalculationBlockSpan: DAY_BLOCK_SPAN,
          successFee: PCT_BASE.mul(20).div(100), // 20%
          appreciationFactor: PCT_BASE.mul(0).div(100), // 0%
          tcInterestRate: PCT_BASE.mul(5).div(100000), // 0.005% : weekly 0.0025 / 365 * 7
          tcInterestPaymentBlockSpan: WEEK_BLOCK_SPAN,
        },
        settlementParams: {
          bes: MONTH_BLOCK_SPAN,
        },
        feeParams: {
          feeRetainer: PCT_BASE.div(10), // 10%
          mintFee: PCT_BASE.div(1000), // 0.1%
          redeemFee: PCT_BASE.div(1000), // 0.1%
          swapTPforTPFee: PCT_BASE.div(1000), // 0.1%
          swapTPforTCFee: PCT_BASE.div(1000), // 0.1%
          swapTCforTPFee: PCT_BASE.div(1000), // 0.1%
          redeemTCandTPFee: PCT_BASE.div(1000), // 0.01%
          mintTCandTPFee: PCT_BASE.div(1000), // 0.01%
          feeTokenPct: PCT_BASE.mul(5).div(10), // 50%
        },
        ctParams: {
          name: "GoTurbo",
          symbol: "TURBO",
        },
        tpParams: {
          tpParams: [
            {
              name: "GoARS",
              symbol: "GOARS",
              priceProvider: "0xD1AFe67986523447b3426Ac2Fb8be2EE4aF5dad7".toLowerCase(),
              ctarg: PCT_BASE.mul(13).div(10), // 1.3
              mintFee: PCT_BASE.div(100), // 1%
              redeemFee: PCT_BASE.div(100), // 1%
              initialEma: PCT_BASE.mul(500), //297
              smoothingFactor: PCT_BASE.mul(1653).div(100000), // 0.01653
            },
            {
              name: "GoMXN",
              symbol: "GOMXN",
              priceProvider: "0x6951020041bFA2565877BF0eaF7f5DF039b490dC".toLowerCase(),
              ctarg: PCT_BASE.mul(13).div(10), // 1.3
              mintFee: PCT_BASE.div(100), // 1%
              redeemFee: PCT_BASE.div(100), // 1%
              initialEma: PCT_BASE.mul(17), // 20
              smoothingFactor: PCT_BASE.mul(1653).div(100000), // 0.01653
            },
          ],
        },
        mocAddresses: {
          governorAddress: "0x7b716178771057195bB511f0B1F7198EEE62Bc22",
          collateralAssetAddress: "0xCB46c0ddc60D18eFEB0E586C17Af6ea36452Dae0",
          pauserAddress: "0x5bCdf8A2E61BD238AEe43b99962Ee8BfBda1Beca",
          feeTokenAddress: "0x45a97b54021a3F99827641AFe1BFAE574431e6ab",
          feeTokenPriceProviderAddress: "0x8DCE78BbD4D757EF7777Be113277cf5A35283b1E",
          mocFeeFlowAddress: "0xcd8a1c9acc980ae031456573e34dc05cd7dae6e3",
          mocAppreciationBeneficiaryAddress: "0xcd8a1c9acc980ae031456573e34dc05cd7dae6e3",
          vendorsGuardianAddress: "0xcd8a1c9acc980ae031456573e34dc05cd7dae6e3",
          tcInterestCollectorAddress: "0xcd8a1c9acc980ae031456573e34dc05cd7dae6e3",
        },
        gasLimit: 6800000,
      },
      tags: ["testnet"],
    },
  },
  paths: {
    artifacts: process.env.DEPLOYING ? "node_modules/moc-main/export/artifacts" : "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    version: "0.8.18",
    settings: {
      // https://hardhat.org/hardhat-network/#solidity-optimizer-support
      optimizer: {
        enabled: true,
        runs: 200,
        details: {
          yulDetails: {
            // solves viaIR issue that inline internal functions: https://github.com/ethereum/solidity/issues/13858#issuecomment-1428754261
            optimizerSteps:
              "dhfoDgvulfnTUtnIf[xa[r]EscLMcCTUtTOntnfDIulLculVcul[j]Tpeulxa[rul]xa[r]cLgvifCTUca[r]LSsTOtfDnca[r]Iulc]jmul[jul]VcTOculjmul",
          },
        },
      },
      viaIR: process.env.VIA_IR ? true : false,
      evmVersion: "london", // FIXME: latest evm version supported by rsk explorers, keep it updated
      outputSelection: {
        "*": {
          "*": ["storageLayout"],
        },
      },
    },
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
    alwaysGenerateOverloads: false,
    externalArtifacts: ["node_modules/moc-main/export/artifacts/*.json", "./dependencies/mocV1Imports/*.json"],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS ? true : false,
    currency: "USD",
    gasPrice: 21,
  },
  preprocess: {
    eachLine: removeConsoleLog(hre => !["hardhat", "localhost"].includes(hre.network.name)),
  },
  docgen: {
    path: "./docs",
    clear: true,
    runOnCompile: false,
    except: ["^contracts/echidna/", "^contracts/mocks/"],
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
  mocha: {
    timeout: 100000,
  },
  external: {
    contracts: [
      {
        artifacts: "node_modules/moc-main/export/artifacts",
        deploy: "node_modules/moc-main/export/deploy/rc20",
      },
    ],
  },
};

export default config;
