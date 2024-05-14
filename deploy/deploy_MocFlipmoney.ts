import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import {
  addPeggedTokensAndChangeGovernor,
  deployUUPSArtifact,
  waitForTxConfirmation,
} from "moc-main/export/scripts/utils";
import { getNetworkDeployParams } from "../scripts/utils";

const deployFunc: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const deployParams = getNetworkDeployParams(hre);
  if (!deployParams.deploy) throw new Error("No deploy params config found.");
  const { mocAddresses, coreParams, settlementParams, feeParams, ctParams, queueParams, tpParams, gasLimit, feesSplitterParams, tcInterestsSplitterParams } =
    deployParams.deploy;
  const signer = ethers.provider.getSigner();

  const deployedMocExpansionContract = await deployments.getOrNull("MocFlipmoneyExpansion");
  if (!deployedMocExpansionContract) throw new Error("No MocFlipmoneyExpansion deployed.");

  let {
    collateralAssetAddress,
    governorAddress,
    pauserAddress,
    feeTokenAddress,
    feeTokenPriceProviderAddress,
    mocFeeFlowAddress,
    mocAppreciationBeneficiaryAddress,
    tcInterestCollectorAddress,
    vendorsGuardianAddress,
    maxAbsoluteOpProviderAddress,
    maxOpDiffProviderAddress,
  } = mocAddresses;

  let stopperAddress = pauserAddress;

  if (!pauserAddress) {
    pauserAddress = deployer;
    stopperAddress = deployer;
    console.log(`pauser address for MocFlipmoney set at deployer: ${stopperAddress}`);
  }

  // We need a governor Mock for intermediate protected actions
  const governorMock = (
    await deploy("GovernorMock", {
      from: deployer,
    })
  ).address;
  console.log(`using a governorMock for MocFlipmoney at: ${governorMock}`);
  let governorProvided = true;
  if (!governorAddress) {
    governorProvided = false;
    governorAddress = governorMock;
  }

  const collateralTokenAddress = (
    await deployUUPSArtifact({
      hre,
      artifactBaseName: "CollateralToken",
      contract: "MocTC",
      initializeArgs: [
        ctParams.name,
        ctParams.symbol,
        deployer, // proper Moc roles are gonna be assigned after it's deployed
        governorAddress,
      ],
    })
  ).address;

  const mocQueue = await deployUUPSArtifact({
    hre,
    artifactBaseName: "MocFlipmoneyQueue",
    contract: "MocQueue",
    initializeArgs: [
      governorMock,
      pauserAddress,
      queueParams.minOperWaitingBlk,
      queueParams.maxOperPerBatch,
      queueParams.execFeeParams,
    ],
  });

  const mocQueueProxy = await ethers.getContractAt("MocQueue", mocQueue.address, signer);

  const mocVendorsDeployed = await deployUUPSArtifact({
    hre,
    artifactBaseName: "MocFlipmoneyVendors",
    contract: "MocVendors",
    initializeArgs: [vendorsGuardianAddress, governorAddress, pauserAddress],
  });

  if (!maxAbsoluteOpProviderAddress) {
    const deployImplResult = await deploy("FCMaxAbsoluteOpProvider", {
      from: deployer,
      args: [stopperAddress],
      gasLimit,
    });
    console.log(`FCMaxAbsoluteOpProvider deployed at ${deployImplResult.address} with owner at ${stopperAddress}`);
    maxAbsoluteOpProviderAddress = deployImplResult.address;
  }

  if (!maxOpDiffProviderAddress) {
    const deployImplResult = await deploy("FCMaxOpDifferenceProvider", {
      from: deployer,
      args: [stopperAddress],
      gasLimit,
    });
    console.log(`FCMaxOpDifferenceProvider deployed at ${deployImplResult.address} with owner at ${stopperAddress}`);
    maxOpDiffProviderAddress = deployImplResult.address;
  }

  if (!mocFeeFlowAddress) {

    const initializeArgs = [
      governorAddress,
      collateralAssetAddress,
      feeTokenAddress,
      feesSplitterParams.acTokenAddressRecipient1,
      feesSplitterParams.acTokenAddressRecipient2,
      feesSplitterParams.acTokenPctToRecipient1,
      feesSplitterParams.feeTokenAddressRecipient1,
      feesSplitterParams.feeTokenAddressRecipient2,
      feesSplitterParams.feeTokenPctToRecipient1,
    ];

    const feesSplitter = await deployUUPSArtifact({
      hre,
      artifactBaseName: "FeesSplitter",
      contract: "CommissionSplitter",
      initializeArgs,
    });

    console.log(`FeesSplitter deployed at ${feesSplitter.address} with:`, initializeArgs);
    mocFeeFlowAddress = feesSplitter.address;
  }

  if (!tcInterestCollectorAddress) {
    const initializeArgs = [
      governorAddress,
      collateralAssetAddress,
      feeTokenAddress,
      tcInterestsSplitterParams.acTokenAddressRecipient1,
      tcInterestsSplitterParams.acTokenAddressRecipient2,
      tcInterestsSplitterParams.acTokenPctToRecipient1,
      tcInterestsSplitterParams.feeTokenAddressRecipient1,
      tcInterestsSplitterParams.feeTokenAddressRecipient2,
      tcInterestsSplitterParams.feeTokenPctToRecipient1,
    ];
    const tcInterestsSplitter = await deployUUPSArtifact({
      hre,
      artifactBaseName: "TCInterestsSplitter",
      contract: "CommissionSplitter",
      initializeArgs,
    });
    console.log(`TCInterestsSplitter deployed at ${tcInterestsSplitter.address} with:`, initializeArgs);
    tcInterestCollectorAddress = tcInterestsSplitter.address;
  }

  const initializeArgs = [
    {
      initializeCoreParams: {
        initializeBaseBucketParams: {
          mocQueueAddress: mocQueue.address,
          feeTokenAddress,
          feeTokenPriceProviderAddress,
          tcTokenAddress: collateralTokenAddress,
          mocFeeFlowAddress,
          mocAppreciationBeneficiaryAddress,
          protThrld: coreParams.protThrld,
          liqThrld: coreParams.liqThrld,
          feeRetainer: feeParams.feeRetainer,
          tcMintFee: feeParams.mintFee,
          tcRedeemFee: feeParams.redeemFee,
          swapTPforTPFee: feeParams.swapTPforTPFee,
          swapTPforTCFee: feeParams.swapTPforTCFee,
          swapTCforTPFee: feeParams.swapTCforTPFee,
          redeemTCandTPFee: feeParams.redeemTCandTPFee,
          mintTCandTPFee: feeParams.mintTCandTPFee,
          feeTokenPct: feeParams.feeTokenPct,
          successFee: coreParams.successFee,
          appreciationFactor: coreParams.appreciationFactor,
          bes: settlementParams.bes,
          tcInterestCollectorAddress,
          tcInterestRate: coreParams.tcInterestRate,
          tcInterestPaymentBlockSpan: coreParams.tcInterestPaymentBlockSpan,
          decayBlockSpan: coreParams.decayBlockSpan,
          maxAbsoluteOpProviderAddress,
          maxOpDiffProviderAddress,
          allowDifferentRecipient: coreParams.allowDifferentRecipient,
        },
        governorAddress: tpParams ? governorMock : governorAddress, // Use mock to add TPs
        pauserAddress: stopperAddress,
        mocCoreExpansion: deployedMocExpansionContract.address,
        emaCalculationBlockSpan: coreParams.emaCalculationBlockSpan,
        mocVendors: mocVendorsDeployed.address,
      },
      acTokenAddress: collateralAssetAddress,
    },
  ];

  console.log("Initializing MocFlipmoney with:", initializeArgs[0]);

  const mocFlipmoney = await deployUUPSArtifact({
    hre,
    contract: "MocFlipmoney",
    initializeArgs,
  });

  console.log("Delegating CT roles to Moc");

  const mocTCProxy = await ethers.getContractAt("MocTC", collateralTokenAddress, signer);
  // Assign TC Roles, and renounce deployer ADMIN
  await waitForTxConfirmation(mocTCProxy.transferAllRoles(mocFlipmoney.address));

  console.log(`Registering mocFlipmoney bucket as enqueuer: ${mocFlipmoney.address}`);
  await waitForTxConfirmation(mocQueueProxy.registerBucket(mocFlipmoney.address, { gasLimit }));

  if (governorProvided) {
    console.log(`Restating Queue governor: ${governorAddress} after registration`);
    await waitForTxConfirmation(
      mocQueueProxy.changeGovernor(governorAddress, {
        gasLimit,
      }),
    );
  }

  if (tpParams) {
    // for testing we add some Pegged Token and then transfer governance to the real governor
    const mocFlipmoneyV2 = await ethers.getContractAt("MocFlipmoney", mocFlipmoney.address, signer);
    for (let tpParam of tpParams.tpParams) {
      if (!tpParam.priceProvider) {
        const tpPriceProvider = await deploy("PriceProviderMock", {
          from: deployer,
          args: [ethers.utils.parseEther("1")],
          gasLimit,
        });
        tpParam.priceProvider = tpPriceProvider.address;
        console.log(`Deploying Fake PriceProvider for ${tpParam.name} at ${tpPriceProvider.address}`);
      }
    }
    await addPeggedTokensAndChangeGovernor(hre, governorAddress, mocFlipmoneyV2, tpParams);
  }

  return hre.network.live; // prevents re execution on live networks
};
export default deployFunc;

deployFunc.id = "deployed_MocFlipmoney"; // id required to prevent re-execution
deployFunc.tags = ["MocFlipmoneyDeploy"];
deployFunc.dependencies = ["MocFlipmoneyExpansion"];
