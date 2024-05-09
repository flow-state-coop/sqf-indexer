import { alloRegistryAbi } from "./alloRegistry.js";
import { alloAbi } from "./allo.js";
import { alloStrategyAbi } from "./alloStrategy.js";

const abis = {
  AlloRegistry: alloRegistryAbi,
  Allo: alloAbi,
  AlloStrategy: alloStrategyAbi,
} as const;

export { abis };
