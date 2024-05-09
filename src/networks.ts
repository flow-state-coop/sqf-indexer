import { Address } from "viem";
import "dotenv/config";
import { abis } from "./lib/abi/index.js";

type Network = {
  id: number;
  name: string;
  rpc: string;
  contracts: Contract[];
};

type Contract = {
  name: keyof typeof abis;
  address: Address;
  fromBlock: bigint;
};

const networks: Network[] = [
  {
    id: 11155420,
    name: "optimism-sepolia",
    rpc:
      process.env.RPC_URL_OPSEPOLIA ?? "https://optimism-sepolia.infura.io/v3",
    contracts: [
      {
        name: "Allo",
        address: "0x1133eA7Af70876e64665ecD07C0A0476d09465a1",
        fromBlock: 11724487n,
      },
      {
        name: "AlloRegistry",
        address: "0x4AAcca72145e1dF2aeC137E1f3C5E3D75DB8b5f3",
        fromBlock: 11724487n,
      },
    ],
  },
];

export { networks };
