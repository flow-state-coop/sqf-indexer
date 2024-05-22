import { alloRegistryAbi } from "./alloRegistry.js";
import { alloAbi } from "./allo.js";
import { alloStrategyAbi } from "./alloStrategy.js";
import { poolFactoryAbi } from "./poolFactory.js";
import { streamingQuadraticFundingAbi } from "./streamingQuadraticFunding.js";

const abis = {
  AlloRegistry: alloRegistryAbi,
  Allo: alloAbi,
  AlloStrategy: alloStrategyAbi,
  PoolFactory: poolFactoryAbi,
  StreamingQuadraticFunding: streamingQuadraticFundingAbi,
} as const;

export { abis };
