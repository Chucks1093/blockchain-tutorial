// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { console } from "forge-std/console.sol";
import { Script } from "forge-std/Script.sol";
import { MultiSignatureWallet } from "@simple-tasks/MultiSignatureWallet.sol";

contract MultiSignatureWalletScript is Script {
   address[] public initialOwners;

   function setUp() public {
      initialOwners.push(msg.sender);
   }

   function run() external {
      vm.startBroadcast();
      MultiSignatureWallet multiSig = new MultiSignatureWallet(initialOwners, initialOwners.length);
      (bool success,) = address(multiSig).call{ value: 0.002 ether }("");
      require(success, "Failed to send Ether");
      vm.stopBroadcast();

      // Call the external TypeScript script with the correct path and ts-node-esm
      // string[] memory inputs = new string[](5);
      // inputs[0] = "npx";
      // inputs[1] = "ts-node";
      // inputs[2] = "--esm";
      // inputs[3] = "../frontend/scripts/updateEnv.ts";
      // inputs[4] = vm.toString(address(multiSig));

      // vm.ffi(inputs);

      // console.log("MultiSignatureWallet deployed to:", address(multiSig));
   }
}
