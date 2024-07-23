import { BigNumber } from "ethers";
import { DeployParameters } from "moc-main/export/scripts/types";
import { MigrateParameters } from "../hardhat.base.config";

const PCT_BASE = BigNumber.from((1e18).toString());
const DAY_BLOCK_SPAN = 2880;
const WEEK_BLOCK_SPAN = DAY_BLOCK_SPAN * 7;
const MONTH_BLOCK_SPAN = DAY_BLOCK_SPAN * 30;
const SIX_HOURS = 720;

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
    successFee: BigNumber.from(0), // 0%
    appreciationFactor: BigNumber.from(0), // 0%
    tcInterestRate: PCT_BASE.mul(2).div(10000), // 0.02% : weekly 0.0025 / 365 * 7
    tcInterestPaymentBlockSpan: WEEK_BLOCK_SPAN,
    decayBlockSpan: SIX_HOURS,
    allowDifferentRecipient: true
  },
  settlementParams: {
    bes: DAY_BLOCK_SPAN,
  },
  feeParams: {
    feeRetainer: PCT_BASE.div(10), // 10%
    mintFee: PCT_BASE.mul(1).div(1000), // 0.001 = 0.1%
    redeemFee: PCT_BASE.mul(1).div(1000), // 0.001 = 0.1%
    swapTPforTPFee: PCT_BASE.mul(1).div(1000), // 0.001 = 0.1%
    swapTPforTCFee: PCT_BASE.mul(1).div(1000), // 0.001 = 0.1%
    swapTCforTPFee: PCT_BASE.mul(1).div(1000), // 0.001 = 0.1%
    redeemTCandTPFee: PCT_BASE.mul(1).div(1000), // 0.001 = 0.1%
    mintTCandTPFee: PCT_BASE.mul(1).div(1000), // 0.001 = 0.1%
    feeTokenPct: PCT_BASE.mul(100).div(100), // 100% (Using feeToken gives 0% cheaper fees)
  },
  ctParams: {
    name: "BPro Max",
    symbol: "BProX",
  },
  tpParams: {
    tpParams: [
      {
        name: "Argentinian Peso",
        symbol: "ArsFlip",
        priceProvider: "0xA9Fd4d4a251D041b2991bf42B3D72ABc9E97F889".toLowerCase(),
        ctarg: PCT_BASE.mul(100).div(10), // 10.0
        mintFee: PCT_BASE.mul(1).div(1000), // 0.001 = 0.1%
        redeemFee: PCT_BASE.mul(1).div(1000), // 0.001 = 0.1%
        initialEma: PCT_BASE.mul(1000), // 1000
        smoothingFactor: PCT_BASE.mul(1653).div(100000), // 0.01653 (2/(120+1))
      },
      {
        name: "Colombian Peso",
        symbol: "CopFlip",
        priceProvider: "0x69aeA1291AA7Ed13c0Ff1b8485926030fde9417A".toLowerCase(),
        ctarg: PCT_BASE.mul(100).div(10), // 10.0
        mintFee: PCT_BASE.mul(1).div(1000), // 0.001 = 0.1%
        redeemFee: PCT_BASE.mul(1).div(1000), // 0.001 = 0.1%
        initialEma: PCT_BASE.mul(3200), // 3200
        smoothingFactor: PCT_BASE.mul(1653).div(100000), // 0.01653 (2/(120+1))
      }
    ],
  },
  mocAddresses: {
    governorAddress: "0x4eAC4518e81B3A5198aADAb998D2610B46aAA609", // if not provided a new GovernorMock.sol is deployed
    collateralAssetAddress: "0x4dA7997A819bb46B6758B9102234c289dD2Ad3bf",
    pauserAddress: "0x5bCdf8A2E61BD238AEe43b99962Ee8BfBda1Beca", // if not provided is set to deployer
    feeTokenAddress: "0xf698561a2c88F4B057f1D5A5285B9cc38fE61D76",
    feeTokenPriceProviderAddress: "0x8DCE78BbD4D757EF7777Be113277cf5A35283b1E",
    mocFeeFlowAddress: "0xf69287F5Ca3cC3C6d3981f2412109110cB8af076",
    mocAppreciationBeneficiaryAddress: "0xf69287F5Ca3cC3C6d3981f2412109110cB8af076",
    vendorsGuardianAddress: "0xf69287F5Ca3cC3C6d3981f2412109110cB8af076",
    tcInterestCollectorAddress: "0xf69287F5Ca3cC3C6d3981f2412109110cB8af076",
    mocVendorsAddress: "", // if not provided a new MocVendors will be deployed
    maxAbsoluteOpProviderAddress: "", // if not provided a new FCMaxAbsoluteOpProvider.sol will be deployed with pauser as owner
    maxOpDiffProviderAddress: "", // if not provided a new FCMaxOpDifferenceProvider.sol will be deployed with pauser as owner
  },
  ...commonParams,
};
