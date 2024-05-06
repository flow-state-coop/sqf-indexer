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
    id: 11155111,
    name: "sepolia",
    rpc: process.env.RPC_URL_SEPOLIA ?? "https://sepolia.infura.io/v3",
    contracts: [
      {
        name: "Allo",
        address: "0x1133eA7Af70876e64665ecD07C0A0476d09465a1",
        fromBlock: 5802180n,
      },
    ],
  },
];

export { networks };
