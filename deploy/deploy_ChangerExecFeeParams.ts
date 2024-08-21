import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
//import { ethers } from "hardhat";
import { getNetworkDeployParams } from "../scripts/utils";

const deployFunc: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const deployParams = getNetworkDeployParams(hre);
  if (!deployParams.deploy) throw new Error("No deploy params config found.");
  const { changers, gasLimit } = deployParams.deploy;
  //const signer = ethers.provider.getSigner();


  const changerTemplate = await deploy("UpdateExecutionFeeChangerTemplate", {
    from: deployer,
    args: [changers.UpdateExecutionFeeChangerTemplate.mocQueueAddress, changers.UpdateExecutionFeeChangerTemplate.execFeeParams],
    gasLimit,
  });
  console.log(`UpdateExecutionFeeChangerTemplate deployed at ${changerTemplate.address}`);

  return hre.network.live; // prevents re execution on live networks
};
export default deployFunc;

deployFunc.id = "deployed_UpdateExecutionFeeChangerTemplate"; // id required to prevent re-execution
deployFunc.tags = ["UpdateExecutionFeeChangerTemplate"];
deployFunc.dependencies = [];
