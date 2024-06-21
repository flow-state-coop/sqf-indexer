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
  {
    id: 666666666,
    name: "degen",
    rpc: process.env.RPC_URL_DEGEN ?? "https://rpc.degen.tips",
    contracts: [
      {
        name: "PoolFactory",
        address: "0xcB15aE6b8C1c0A868c9c6494C49D65eFce23313A",
        fromBlock: 17503928n,
      },
    ],
  },
  {
    id: 8453,
    name: "base",
    rpc: process.env.RPC_URL_BASE ?? "https://mainnet.base.org",
    contracts: [
      {
        name: "Allo",
        address: "0x1133eA7Af70876e64665ecD07C0A0476d09465a1",
        fromBlock: 16047236n,
      },
      {
        name: "AlloRegistry",
        address: "0x4AAcca72145e1dF2aeC137E1f3C5E3D75DB8b5f3",
        fromBlock: 16047236n,
      },
    ],
  },
];

export { networks };
