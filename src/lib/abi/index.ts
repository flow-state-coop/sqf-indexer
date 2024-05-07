import { alloAbi } from "./allo.js";
import { alloStrategyAbi } from "./alloStrategy.js";

const abis = {
  Allo: alloAbi,
  AlloStrategy: alloStrategyAbi,
} as const;

export { abis };
