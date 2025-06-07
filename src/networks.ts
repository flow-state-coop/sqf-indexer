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
    id: 42220,
    name: "celo",
    rpc: process.env.RPC_URL_CELO ?? "https://forno.celo.org",
    contracts: [
      {
        name: "Allo",
        address: "0x1133eA7Af70876e64665ecD07C0A0476d09465a1",
        fromBlock: 37338741n,
      },
      {
        name: "AlloRegistry",
        address: "0x4aacca72145e1df2aec137e1f3c5e3d75db8b5f3",
        fromBlock: 37338741n,
      },
    ],
  },
  {
    id: 10,
    name: "optimism",
    rpc: process.env.RPC_URL_OPTIMISM ?? "https://optimism-rpc.publicnode.com",
    contracts: [
      {
        name: "Allo",
        address: "0x1133eA7Af70876e64665ecD07C0A0476d09465a1",
        fromBlock: 136823763n,
      },
      {
        name: "AlloRegistry",
        address: "0x4AAcca72145e1dF2aeC137E1f3C5E3D75DB8b5f3",
        fromBlock: 136823763n,
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
        fromBlock: 30718760n,
      },
      {
        name: "AlloRegistry",
        address: "0x4AAcca72145e1dF2aeC137E1f3C5E3D75DB8b5f3",
        fromBlock: 30718760n,
      },
    ],
  },
  {
    id: 42161,
    name: "arbitrum-one",
    rpc: process.env.RPC_URL_ARBITRUM_ONE ?? "https://arb1.arbitrum.io/rpc",
    contracts: [
      {
        name: "Allo",
        address: "0x1133eA7Af70876e64665ecD07C0A0476d09465a1",
        fromBlock: 343821459n,
      },
      {
        name: "AlloRegistry",
        address: "0x4AAcca72145e1dF2aeC137E1f3C5E3D75DB8b5f3",
        fromBlock: 343821459n,
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
        fromBlock: 34419n,
      },
    ],
  },
  {
    id: 11155420,
    name: "optimism-sepolia",
    rpc:
      process.env.RPC_URL_OPSEPOLIA ?? "https://optimism-sepolia.infura.io/v3",
    contracts: [
      {
        name: "Allo",
        address: "0x1133eA7Af70876e64665ecD07C0A0476d09465a1",
        fromBlock: 28404424n,
      },
      {
        name: "AlloRegistry",
        address: "0x4AAcca72145e1dF2aeC137E1f3C5E3D75DB8b5f3",
        fromBlock: 28404424n,
      },
    ],
  },
];

export { networks };
