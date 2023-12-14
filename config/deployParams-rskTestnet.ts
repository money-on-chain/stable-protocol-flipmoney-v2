import { BigNumber } from "ethers";
import { DeployParameters } from "moc-main/export/scripts/types";
import { MigrateParameters } from "../hardhat.base.config";

const PCT_BASE = BigNumber.from((1e18).toString());
const DAY_BLOCK_SPAN = 2880;
const WEEK_BLOCK_SPAN = DAY_BLOCK_SPAN * 7;
const MONTH_BLOCK_SPAN = DAY_BLOCK_SPAN * 30;

const commonParams = {
  queueParams: {
    minOperWaitingBlk: 5,
    maxOperPerBatch: 65,
    execFeeParams: {
      tcMintExecFee: BigNumber.from("26065600000000"),
      tcRedeemExecFee: BigNumber.from("26065600000000"),
      tpMintExecFee: BigNumber.from("26065600000000"),
      tpRedeemExecFee: BigNumber.from("26065600000000"),
      mintTCandTPExecFee: BigNumber.from("26065600000000"),
      redeemTCandTPExecFee: BigNumber.from("26065600000000"),
      swapTPforTPExecFee: BigNumber.from("26065600000000"),
      swapTPforTCExecFee: BigNumber.from("26065600000000"),
      swapTCforTPExecFee: BigNumber.from("26065600000000"),
    },
  },
  gasLimit: 6800000,
};


export const rskTestnetDeployParams: DeployParameters = {
  coreParams: {
    protThrld: PCT_BASE.mul(15).div(10), // 1.5
    liqThrld: PCT_BASE.mul(104).div(100), // 1.04
    emaCalculationBlockSpan: DAY_BLOCK_SPAN,
    successFee: PCT_BASE.mul(20).div(100), // 20%
    appreciationFactor: PCT_BASE.mul(0).div(100), // 0%
    tcInterestRate: PCT_BASE.mul(5).div(100000), // 0.005% : weekly 0.0025 / 365 * 7
    tcInterestPaymentBlockSpan: WEEK_BLOCK_SPAN,
    decayBlockSpan: DAY_BLOCK_SPAN,
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
    redeemTCandTPFee: PCT_BASE.mul(8).div(10000), // 0.08%
    mintTCandTPFee: PCT_BASE.mul(8).div(10000), // 0.08%
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
        initialEma: PCT_BASE.mul(500), //500
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
      }
    ],
  },
  mocAddresses: {
    governorAddress: "0x7b716178771057195bB511f0B1F7198EEE62Bc22", // if not provided a new GovernorMock.sol is deployed
    collateralAssetAddress: "0xCB46c0ddc60D18eFEB0E586C17Af6ea36452Dae0",
    pauserAddress: "0x5bCdf8A2E61BD238AEe43b99962Ee8BfBda1Beca", // if not provided is set to deployer
    feeTokenAddress: "0xf698561a2c88F4B057f1D5A5285B9cc38fE61D76",
    feeTokenPriceProviderAddress: "0x8DCE78BbD4D757EF7777Be113277cf5A35283b1E",
    mocFeeFlowAddress: "0xcd8a1c9acc980ae031456573e34dc05cd7dae6e3",
    mocAppreciationBeneficiaryAddress: "0xcd8a1c9acc980ae031456573e34dc05cd7dae6e3",
    vendorsGuardianAddress: "0xcd8a1c9acc980ae031456573e34dc05cd7dae6e3",
    tcInterestCollectorAddress: "0xcd8a1c9acc980ae031456573e34dc05cd7dae6e3",
    maxAbsoluteOpProviderAddress: "", // if not provided a new FCMaxAbsoluteOpProvider.sol will be deployed with pauser as owner
    maxOpDiffProviderAddress: "", // if not provided a new FCMaxOpDifferenceProvider.sol will be deployed with pauser as owner
  },
  ...commonParams,
};
