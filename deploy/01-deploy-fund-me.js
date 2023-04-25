// Import
// Main Function
// calling of main function

// function deployFunc(hre) {
//   console.log("Hi")
// }

// module.exports.default = deployFunc

// module.exports = async (hre) => {
//     const {getNamedAccounts, deployments} = hre
// }

const { networkConfig, developmentChain } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId

  let ethUsdPriceFeedAddress
  if (developmentChain.includes(network.name)) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator")
    ethUsdPriceFeedAddress = ethUsdAggregator.address
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
  }

  //   When going for localhost or hardhat network, we want to use mock
  const args = [ethUsdPriceFeedAddress]
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args, //Put price feed address
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  })

  if (
    !developmentChain.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    // Verify
    await verify(fundMe.address, args)
  }
  log("---------------------------------")
}

module.exports.tags = ["all", "fundme"]
