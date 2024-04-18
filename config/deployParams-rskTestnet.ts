import { BigNumber } from "ethers";
import { DeployParameters } from "moc-main/export/scripts/types";
import { MigrateParameters } from "../hardhat.base.config";

const PCT_BASE = BigNumber.from((1e18).toString());
const DAY_BLOCK_SPAN = 2880;
const WEEK_BLOCK_SPAN = DAY_BLOCK_SPAN * 7;
const MONTH_BLOCK_SPAN = DAY_BLOCK_SPAN * 30;

// Reference gasPrice average on RSK network
const gasPrice = BigNumber.from("65800000");

const commonParams = {
  queueParams: {
    minOperWaitingBlk: 3,
    maxOperPerBatch: 65,
    execFeeParams: {
      tcMintExecFee: BigNumber.from("103000").mul(gasPrice),
      tcRedeemExecFee: BigNumber.from("105000").mul(gasPrice),
      tpMintExecFee: BigNumber.from("131500").mul(gasPrice),
      tpRedeemExecFee: BigNumber.from("121500").mul(gasPrice),
      mintTCandTPExecFee: BigNumber.from("165000").mul(gasPrice),
      redeemTCandTPExecFee: BigNumber.from("174500").mul(gasPrice),
      swapTPforTPExecFee: BigNumber.from("154000").mul(gasPrice),
      swapTPforTCExecFee: BigNumber.from("140000").mul(gasPrice),
      swapTCforTPExecFee: BigNumber.from("147500").mul(gasPrice),
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
    mintFee: PCT_BASE.mul(2).div(1000), // 0.002 = 0.2%
    redeemFee: PCT_BASE.mul(2).div(1000), // 0.002 = 0.2%
    swapTPforTPFee: PCT_BASE.mul(2).div(1000), // 0.002 = 0.2%
    swapTPforTCFee: PCT_BASE.mul(2).div(1000), // 0.002 = 0.2%
    swapTCforTPFee: PCT_BASE.mul(2).div(1000), // 0.002 = 0.2%
    redeemTCandTPFee: PCT_BASE.mul(2).div(1000), // 0.002 = 0.2%
    mintTCandTPFee: PCT_BASE.mul(2).div(1000), // 0.002 = 0.2%
    feeTokenPct: PCT_BASE.mul(75).div(100), // 75% (Using feeToken gives 25% cheaper fees)
  },
  ctParams: {
    name: "BPro Max",
    symbol: "BProX",
  },
  tpParams: {
    tpParams: [
      {
        name: "Argentinian Peso",
        symbol: "GOARS",
        priceProvider: "0x50BCa2759A0640510D88c38A6a3b1F17c1C14d51".toLowerCase(),
        ctarg: PCT_BASE.mul(40).div(10), // 4.0
        mintFee: PCT_BASE.mul(2).div(1000), // 0.002 = 0.2%
        redeemFee: PCT_BASE.mul(2).div(1000), // 0.002 = 0.2%
        initialEma: PCT_BASE.mul(800), // 800
        smoothingFactor: PCT_BASE.mul(1653).div(100000), // 0.01653
      },
      {
        name: "Colombian Peso",
        symbol: "GOCOP",
        priceProvider: "0xAD84A2B815F38b3917B57863D9302086011220C4".toLowerCase(),
        ctarg: PCT_BASE.mul(40).div(10), // 4.0
        mintFee: PCT_BASE.mul(2).div(1000), // 0.002 = 0.2%
        redeemFee: PCT_BASE.mul(2).div(1000), // 0.002 = 0.2%
        initialEma: PCT_BASE.mul(3200), // 3200
        smoothingFactor: PCT_BASE.mul(1653).div(100000), // 0.01653
      }
    ],
  },
  mocAddresses: {
    governorAddress: "0x7b716178771057195bB511f0B1F7198EEE62Bc22", // if not provided a new GovernorMock.sol is deployed
    collateralAssetAddress: "0x4dA7997A819bb46B6758B9102234c289dD2Ad3bf",
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
