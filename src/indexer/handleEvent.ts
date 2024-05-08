import { decodeFunctionData, PublicClient } from "viem";
import { EventHandlerArgs } from "chainsauce";
import { Kysely } from "kysely";
import { Indexer } from "chainsauce";
import { Database } from "../db/index.js";
import { decodeRegistrationDataAlloStrategy } from "./decode.js";
import { abis } from "../lib/abi/index.js";
import { ALLO_STRATEGY_ID } from "../lib/constants.js";

type IndexerContext = { publicClient: PublicClient; db: Kysely<Database> };

async function handleEvent(
  args: EventHandlerArgs<Indexer<typeof abis, IndexerContext>>,
) {
  const {
    event,
    chainId,
    readContract,
    subscribeToContract,
    context: { publicClient, db },
  } = args;

  switch (event.name) {
    case "PoolCreated": {
      const { params, transactionHash } = event;

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
          strategy,
          metadata: { pointer: metadataCid },
        } = params;

        subscribeToContract({
          contract: "AlloStrategy",
          address: strategy,
        });

        const strategyAddress = strategy.toLowerCase();
        const strategyName = "SQFSuperfluidv1";
        const tx = await publicClient.getTransaction({
          hash: transactionHash,
        });
        const { args } = decodeFunctionData({
          abi: abis["Allo"],
          data: tx.input,
        });
        const managers = args[6]?.map((manager) => manager.toLowerCase()) ?? [
          tx.from,
        ];

        if (managers.indexOf(tx.from) < 0) {
          managers.push(tx.from);
        }

        try {
          await db
            .insertInto("pools")
            .values({
              id: poolId.toString(),
              chainId,
              token: token.toLowerCase(),
              metadataCid,
              createdAtBlock: event.blockNumber,
              updatedAtBlock: event.blockNumber,
              strategyAddress,
              strategyId,
              strategyName,
              projectId: profileId,
              managers,
              tags: ["allo"],
            })
            .execute();
        } catch (err) {
          console.warn("DB write error");
        }
      }

      break;
    }

    case "Registered": {
      const {
        params: { data: encodedData },
        address,
      } = event;

      const strategyAddress = address.toLowerCase();
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
            strategyAddress,
            recipientAddress: recipientAddress.toLowerCase(),
            anchorAddress:
              recipientId !== recipientAddress
                ? recipientId.toLowerCase()
                : null,
            status: "PENDING",
            metadataCid,
            createdAtBlock: event.blockNumber,
            updatedAtBlock: event.blockNumber,
            tags: ["allo"],
          })
          .execute();
      } catch (err) {
        console.warn("DB write error");
      }

      break;
    }

    case "UpdatedRegistration": {
      const {
        params: { data: encodedData },
        address,
      } = event;

      const {
        recipientId,
        recipientAddress,
        metadata: { pointer: metadataCid },
      } = decodeRegistrationDataAlloStrategy(encodedData);

      const strategyAddress = address.toLowerCase();

      try {
        await db
          .updateTable("recipients")
          .set({
            recipientAddress: recipientAddress.toLowerCase(),
            metadataCid,
            updatedAtBlock: event.blockNumber,
          })
          .where("chainId", "=", chainId)
          .where("strategyAddress", "=", strategyAddress)
          .where("id", "=", recipientId)
          .execute();
      } catch (err) {
        console.warn("DB write error");
      }

      break;
    }

    default:
      break;
  }
}

export { handleEvent };
