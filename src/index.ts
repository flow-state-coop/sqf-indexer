import {
  createIndexer,
  createHttpRpcClient,
  createSqliteCache,
} from "chainsauce";
import "dotenv/config";
import { pool } from "./db/index.js";
import { createApi } from "./api/app.js";
import { networks } from "./networks.js";
import { abis } from "./lib/abi/index.js";

async function main() {
  for (const network of networks) {
    const indexer = createIndexer({
      chain: {
        id: network.id,
        rpcClient: createHttpRpcClient({
          url: network.rpc,
        }),
        pollingIntervalMs: 4000,
      },
      contracts: abis,
      cache: createSqliteCache(
        `${process.env.NODE_ENV === "production" ? "" : "."}/sqlite_cache/chainsauce.db`
      ),
    });

    indexer.on("Allo:PoolCreated", async ({ event }) => {
      console.log("Pool Created event:", event);
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

  const now = await pool.query("select now()");
  console.log("connected to" + process.env.DATABASE_URI);
  console.log(now);

  const api = await createApi();
  await api.start();
}

await main();
