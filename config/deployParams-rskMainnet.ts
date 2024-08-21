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


export const rskMainnetDeployParams: DeployParameters = {
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
    feeTokenPct: PCT_BASE.mul(80).div(100), // 80% (Using feeToken gives 0% cheaper fees)
  },
  ctParams: {
    name: "BPro Max",
    symbol: "BProX",
  },
  tpParams: {
    tpParams: [
      {
        name: "ArsFlip",
        symbol: "ArsFlip",
        priceProvider: "0x39d7eF05ff67e2702aD5846DC7874E17fB0E51bF".toLowerCase(),
        ctarg: PCT_BASE.mul(100).div(10), // 10.0
        mintFee: PCT_BASE.mul(1).div(1000), // 0.001 = 0.1%
        redeemFee: PCT_BASE.mul(1).div(1000), // 0.001 = 0.1%
        initialEma: PCT_BASE.mul(100738424), // Bpro price in USD * EMA
        smoothingFactor: PCT_BASE.mul(1653).div(100000), // 0.01653 (2/(120+1))
      },
      {
        name: "CopFlip",
        symbol: "CopFlip",
        priceProvider: "0x7DC92607c57403e663d06D9EBe6Af3d2d73519dD".toLowerCase(),
        ctarg: PCT_BASE.mul(100).div(10), // 10.0
        mintFee: PCT_BASE.mul(1).div(1000), // 0.001 = 0.1%
        redeemFee: PCT_BASE.mul(1).div(1000), // 0.001 = 0.1%
        initialEma: PCT_BASE.mul(314767344), // Bpro price in USD * EMA
        smoothingFactor: PCT_BASE.mul(1653).div(100000), // 0.01653 (2/(120+1))
      }
    ],
  },
  mocAddresses: {
    governorAddress: "0xC61F0392d5170214b5D93C0BC4c4354163aBC1f7", // if not provided a new GovernorMock.sol is deployed
    collateralAssetAddress: "0x440CD83C160De5C96Ddb20246815eA44C7aBBCa8",
    pauserAddress: "0x40662eD57284B4B541A42D347BE2447ABd1b119d", // if not provided is set to deployer
    feeTokenAddress: "0xe65E1Cbb6eb5CD2003717af7Ee9F3BdeF3ABfEC5",
    feeTokenPriceProviderAddress: "0x305dB451317ac8F7571a1f267F8617802933648D",
    mocFeeFlowAddress: "0xC61820bFB8F87391d62Cd3976dDc1d35e0cf7128",
    mocAppreciationBeneficiaryAddress: "0xC61820bFB8F87391d62Cd3976dDc1d35e0cf7128",
    vendorsGuardianAddress: "0xC61820bFB8F87391d62Cd3976dDc1d35e0cf7128",
    tcInterestCollectorAddress: "0xC61820bFB8F87391d62Cd3976dDc1d35e0cf7128",
    mocVendorsAddress: "", // if not provided a new MocVendors will be deployed
    maxAbsoluteOpProviderAddress: "", // if not provided a new FCMaxAbsoluteOpProvider.sol will be deployed with pauser as owner
    maxOpDiffProviderAddress: "", // if not provided a new FCMaxOpDifferenceProvider.sol will be deployed with pauser as owner
  },
  changers: {
    priceProviderFeeToken: {
      mocAddress: "",
      priceProvider: ""
    },
    UpdateExecutionFeeChangerTemplate: {
      mocQueueAddress: "0x87252A0135BeD925068791D8ca1293C89505Ff61",
      execFeeParams: {
        tcMintExecFee: BigNumber.from("450000").mul(gasPrice),
        tcRedeemExecFee: BigNumber.from("450000").mul(gasPrice),
        tpMintExecFee: BigNumber.from("450000").mul(gasPrice),
        tpRedeemExecFee: BigNumber.from("450000").mul(gasPrice),
        mintTCandTPExecFee: BigNumber.from("600000").mul(gasPrice),
        redeemTCandTPExecFee: BigNumber.from("600000").mul(gasPrice),
        swapTPforTPExecFee: BigNumber.from("600000").mul(gasPrice),
        swapTPforTCExecFee: BigNumber.from("600000").mul(gasPrice),
        swapTCforTPExecFee: BigNumber.from("600000").mul(gasPrice),
      },
    }
  },
  ...commonParams,
};
