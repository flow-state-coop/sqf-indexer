import { createPublicClient, http } from "viem";
import {
  createIndexer,
  createHttpRpcClient,
  createSqliteCache,
} from "chainsauce";
import "dotenv/config";
import { db, createSchemaIfNotExists } from "./db/index.js";
import { createApi } from "./api/app.js";
import { networks } from "./networks.js";
import { handleEvent } from "./indexer/handleEvent.js";
import { abis } from "./lib/abi/index.js";

async function main() {
  await createSchemaIfNotExists();

  for (const network of networks) {
    const publicClient = createPublicClient({
      transport: http(network.rpc),
    });
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
      context: { publicClient, db },
    });

    indexer.on("event", async (args) => await handleEvent(args));

    for (const contract of network.contracts) {
      indexer.subscribeToContract({
        contract: contract.name,
        address: contract.address,
        fromBlock: contract.fromBlock,
      });
    }

    indexer.on("error", (err) => {
      console.error(err);
    });
    indexer.watch();
  }

  const api = await createApi();
  await api.start();
}

await main();
