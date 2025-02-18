// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Script, console2 } from "forge-std/Script.sol";
import { LinkToken } from "@chainlink/contracts/src/v0.8/shared/token/ERC677/LinkToken.sol";
import { MockKeeperRegistry } from "../../test/mocks/MockKeeperRegistry.sol";
import { KeeperRegistrar1_2Mock } from "@chainlink/contracts/src/v0.8/automation/mocks/KeeperRegistrar1_2Mock.sol";

abstract contract CodeConstants {
   uint256 constant BASE_SEPOLIA_CHAIN_ID = 11155111;
   uint256 public constant BASE_MAINNET_CHAIN_ID = 8453;
   uint256 public constant ANVIL_CHAIN_ID = 31337;
}

contract HelperConfig is Script, CodeConstants {
   error HelperConfig__InvalidChainId();

   // Struct
   struct NetworkConfig {
      address linkToken;
      address automationRegistry;
      address automationRegistrar;
      uint256 registrationFee;
      uint256 minLinkBalance;
      uint256 initialTokenSupply;
      address deployer;
   }

   function getConfig() external returns (NetworkConfig memory) {
      return getConfigByChainId(block.chainid);
   }

   function getConfigByChainId(uint256 chainId) internal returns (NetworkConfig memory) {
      if (chainId == BASE_MAINNET_CHAIN_ID) {
         return getBaseMainnetConfig();
      } else if (chainId == BASE_SEPOLIA_CHAIN_ID) {
         return getBaseSepoliaConfig();
      } else if (chainId == ANVIL_CHAIN_ID) {
         return getOrCreateAnvilConfig();
      } else {
         revert HelperConfig__InvalidChainId();
      }
   }

   function getBaseMainnetConfig() public view returns (NetworkConfig memory) {
      return NetworkConfig({
         linkToken: 0x88Fb150BDc53A65fe94Dea0c9BA0a6dAf8C6e196,
         automationRegistry: 0xf4bAb6A129164aBa9B113cB96BA4266dF49f8743,
         automationRegistrar: 0xE28Adc50c7551CFf69FCF32D45d037e5F6554264,
         registrationFee: 5 ether,
         minLinkBalance: 0.1 ether,
         initialTokenSupply: 1000000 * 10 ** 18,
         deployer: msg.sender
      });
   }

   function getBaseSepoliaConfig() public view returns (NetworkConfig memory) {
      return NetworkConfig({
         linkToken: 0x88Fb150BDc53A65fe94Dea0c9BA0a6dAf8C6e196,
         automationRegistry: 0x91D4a4C3D448c7f3CB477332B1c7D420a5810aC3,
         automationRegistrar: 0xf28D56F3A707E25B71Ce529a21AF388751E1CF2A,
         registrationFee: 5 ether,
         minLinkBalance: 0.1 ether,
         initialTokenSupply: 1000000 * 10 ** 18,
         deployer: msg.sender
      });
   }

   function getOrCreateAnvilConfig() public returns (NetworkConfig memory) {
      // if (activeNetworkConfig.linkToken != address(0)) {
      //    return activeNetworkConfig;
      // }

      console2.log(unicode"⚠️ Using Chainlink mock contracts for local testing!");

      vm.startBroadcast();
      // Deploy mock LINK token
      LinkToken link = new LinkToken();

      // Deploy mock Registry and Registrar
      MockKeeperRegistry registry = new MockKeeperRegistry(0.1 ether);
      KeeperRegistrar1_2Mock registrar = new KeeperRegistrar1_2Mock();

      vm.stopBroadcast();

      return NetworkConfig({
         linkToken: address(link),
         automationRegistry: address(registry),
         automationRegistrar: address(registrar),
         registrationFee: 0.1 ether,
         minLinkBalance: 0.1 ether,
         initialTokenSupply: 1000000 * 10 ** 18,
         deployer: msg.sender
      });
   }
}
