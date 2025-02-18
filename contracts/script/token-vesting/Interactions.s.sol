// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Script, console } from "forge-std/Script.sol";
import { TokenVesting } from "../../src/token-vesting/TokenVesting.sol";
import { HelperConfig } from "./HelperConfig.s.sol";
import {
   AutomationRegistryBaseInterface,
   State,
   OnchainConfig
} from "@chainlink/contracts/src/v0.8/automation/interfaces/v2_0/AutomationRegistryInterface2_0.sol";
import { LinkTokenInterface } from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import { DevOpsTools } from "foundry-devops/src/DevOpsTools.sol";

contract RegisterAutomation is Script {
   function run() external returns (uint256 upkeepId) {
      address mostRecentlyDeployed = DevOpsTools.get_most_recent_deployment("TokenVesting", block.chainid);
      return registerAutomationForVesting(mostRecentlyDeployed);
   }

   function registerAutomationForVesting(address vestingContract) public returns (uint256) {
      if (block.chainid == 31337) {
         console.log("Skipping Automation registration on Anvil");
         return 0;
      }

      HelperConfig config = new HelperConfig();
      HelperConfig.NetworkConfig memory networkConfig = config.getConfig();

      vm.startBroadcast(networkConfig.deployer);

      // 1. Approve LINK
      LinkTokenInterface(networkConfig.linkToken).approve(
         networkConfig.automationRegistry, networkConfig.registrationFee
      );

      // 2. Register upkeep
      string memory upkeepName = "TokenVesting_Automation";
      bytes memory checkData = "";
      address[] memory transmitters = new address[](0);
      uint32 gasLimit = 500000;

      AutomationRegistryBaseInterface automation = AutomationRegistryBaseInterface(networkConfig.automationRegistry);

      uint256 upkeepId = automation.registerUpkeep(
         vestingContract,
         gasLimit,
         networkConfig.deployer,
         checkData,
         encodeBasicServiceConfig(upkeepName, uint96(networkConfig.registrationFee))
      );

      vm.stopBroadcast();

      console.log("Upkeep registered with ID:", upkeepId);
      return upkeepId;
   }

   function encodeBasicServiceConfig(string memory name, uint96 amount) internal pure returns (bytes memory) {
      address[] memory transmitters = new address[](0);
      return abi.encode(
         OnchainConfig({
            paymentPremiumPPB: 0,
            flatFeeMicroLink: 0,
            checkGasLimit: 5000000,
            stalenessSeconds: 90000,
            gasCeilingMultiplier: 1,
            minUpkeepSpend: 0,
            maxPerformGas: 5000000,
            maxCheckDataSize: 5000,
            maxPerformDataSize: 5000,
            fallbackGasPrice: 0,
            fallbackLinkPrice: 0,
            transcoder: address(0),
            registrar: address(0)
         }),
         name,
         amount,
         transmitters
      );
   }
}

contract FundUpkeep is Script {
   function run(uint256 upkeepId, uint256 amount) external {
      HelperConfig config = new HelperConfig();
      HelperConfig.NetworkConfig memory networkConfig = config.getConfig();

      if (block.chainid == 31337) {
         console.log("Skipping funding on Anvil");
         return;
      }

      vm.startBroadcast(networkConfig.deployer);

      LinkTokenInterface(networkConfig.linkToken).transferAndCall(
         networkConfig.automationRegistry, amount, abi.encode(upkeepId)
      );

      vm.stopBroadcast();
      console.log("Funded upkeep ID:", upkeepId);
      console.log("Amount:", amount);
   }
}
