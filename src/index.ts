import { Hex, decodeAbiParameters } from "viem";
import {
  createIndexer,
  createHttpRpcClient,
  createSqliteCache,
} from "chainsauce";
import "dotenv/config";
import { db, createSchemaIfNotExists } from "./db/index.js";
import { createApi } from "./api/app.js";
import { networks } from "./networks.js";
import { abis } from "./lib/abi/index.js";

const ALLO_STRATEGY_ID =
  "0xf8a14294e80ff012e54157ec9d1b2827421f1e7f6bde38c06730b1c031b3f935";

async function main() {
  await createSchemaIfNotExists();

  for (const network of networks) {
    const indexer = createIndexer({
      chain: {
        id: network.id,
        rpcClient: createHttpRpcClient({
          url: network.rpc,
        }),
        pollingIntervalMs: 5000,
      },
      contracts: abis,
      cache: createSqliteCache(
        `${process.env.NODE_ENV === "production" ? "" : "."}/sqlite_cache/chainsauce.db`,
      ),
    });

    indexer.on("event", async (args) => {
      if (args.event.name === "PoolCreated") {
        const { params, blockNumber } = args.event;
        const { readContract, subscribeToContract, chainId } = args;

        const strategyId = await readContract({
          contract: "AlloStrategy",
          address: params.strategy,
          functionName: "getStrategyId",
        });

        if (strategyId === ALLO_STRATEGY_ID) {
          const {
            poolId,
            token,
            profileId,
            strategy: strategyAddress,
            metadata: { pointer: metadataCid },
          } = params;
          const strategyName = "SQFSuperfluidv1";
          subscribeToContract({
            contract: "AlloStrategy",
            address: strategyAddress,
          });

          try {
            await db
              .insertInto("pools")
              .values({
                id: poolId.toString(),
                chainId,
                token,
                metadataCid,
                createdAtBlock: blockNumber,
                updatedAtBlock: blockNumber,
                strategyAddress,
                strategyId,
                strategyName,
                projectId: profileId,
                tags: ["allo"],
              })
              .executeTakeFirst();
          } catch (err) {
            console.warn("DB write error");
          }
        }
      } else if (args.event.name === "Registered") {
        const { chainId, event } = args;
        const {
          blockNumber,
          params: { data: encodedData },
          address: strategyAddress,
        } = event;

        const poolId = await db
          .selectFrom("pools")
          .select("id")
          .where("chainId", "=", chainId)
          .where("strategyAddress", "=", strategyAddress)
          .executeTakeFirst();

        if (!poolId) {
          console.warn(`Pool ID was not found for strategy ${strategyAddress}`);

          return;
        }

        const {
          recipientId,
          recipientAddress,
          metadata: { pointer: metadataCid },
        } = decodeRegistrationDataAlloStrategy(encodedData);

        try {
          await db
            .insertInto("recipients")
            .values({
              id: recipientId,
              chainId,
              poolId: poolId.id,
              recipientAddress,
              anchorAddress:
                recipientId !== recipientAddress ? recipientId : null,
              status: "PENDING",
              metadataCid,
              createdAtBlock: blockNumber,
              updatedAtBlock: blockNumber,
              tags: ["allo"],
            })
            .executeTakeFirst();
        } catch (err) {
          console.warn("DB write error");
        }
      }
    });

    for (const contract of network.contracts) {
      indexer.subscribeToContract({
        contract: contract.name,
        address: contract.address,
        fromBlock: contract.fromBlock,
      });
    }

    indexer.watch();
  }

  const api = await createApi();
  await api.start();
}

function decodeRegistrationDataAlloStrategy(encodedData: Hex) {
  const decoded = decodeAbiParameters(
    [
      { name: "recipientId", type: "address" },
      { name: "recipientAddress", type: "address" },
      {
        name: "metadata",
        type: "tuple",
        components: [
          { name: "protocol", type: "uint256" },
          { name: "pointer", type: "string" },
        ],
      },
    ],
    encodedData,
  );

  return {
    recipientId: decoded[0],
    recipientAddress: decoded[1],
    metadata: {
      protocol: Number(decoded[2].protocol),
      pointer: decoded[2].pointer,
    },
  };
}

await main();
