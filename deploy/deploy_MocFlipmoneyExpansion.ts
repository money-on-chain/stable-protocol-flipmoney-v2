import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { getNetworkDeployParams } from "moc-main/export/scripts/utils";

const deployFunc: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;
  const gasLimit = getNetworkDeployParams(hre).gasLimit;
  const deployImplResult = await deploy("MocFlipmoneyExpansion", {
    contract: "MocCoreExpansion",
    from: deployer,
    gasLimit,
  });
  console.log(`MocFlipmoneyExpansion, as MocCoreExpansion implementation deployed at ${deployImplResult.address}`);
  return hre.network.live; // prevents re execution on live networks
};
export default deployFunc;

deployFunc.id = "deployed_MocFlipmoneyExpansion"; // id required to prevent re-execution
deployFunc.tags = ["MocFlipmoneyExpansion"];
