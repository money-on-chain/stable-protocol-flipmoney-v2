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


  const changerTemplate = await deploy("FeeTokenAddressChangerTemplate", {
    from: deployer,
    args: [changers.FeeTokenAddress.mocAddress, changers.FeeTokenAddress.newFeeTokenAddress],
    gasLimit,
  });
  console.log(`FeeTokenAddressChangerTemplate deployed at ${changerTemplate.address}`);

  return hre.network.live; // prevents re execution on live networks
};
export default deployFunc;

deployFunc.id = "deployed_ChangerAddressFeeToken"; // id required to prevent re-execution
deployFunc.tags = ["ChangerAddressFeeToken"];
deployFunc.dependencies = [];
