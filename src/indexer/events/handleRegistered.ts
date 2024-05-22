import { EventHandlerArgs, Indexer } from "chainsauce";
import { IndexerContext } from "../handleEvent.js";
import { getPool } from "../../db/index.js";
import { fetchIpfs } from "../ipfs.js";
import { decodeRegistrationDataAlloStrategy } from "../decode.js";
import { abis } from "../../lib/abi/index.js";

export async function handleRegistered(
  args: EventHandlerArgs<
    Indexer<typeof abis, IndexerContext>,
    "AlloStrategy" | "StreamingQuadraticFunding",
    "Registered"
  >
) {
  if (args.event.contractName === "AlloStrategy") {
    const {
      event,
      chainId,
      context: { db },
    } = args as EventHandlerArgs<
      Indexer<typeof abis, IndexerContext>,
      "AlloStrategy",
      "Registered"
    >;

    const {
      params: { data: encodedData },
      address,
    } = event;

    const strategyAddress = address.toLowerCase();
    const pool = await getPool(chainId, strategyAddress);

    if (!pool?.id) {
      console.warn(`Pool ID was not found for strategy ${strategyAddress}`);

      return;
    }

    const {
      recipientId,
      recipientAddress,
      metadata: { pointer: metadataCid },
    } = decodeRegistrationDataAlloStrategy(encodedData);

    const metadata = await fetchIpfs(metadataCid);

    try {
      await db
        .insertInto("recipients")
        .values({
          id: recipientId.toLowerCase(),
          chainId,
          poolId: pool.id,
          strategyAddress,
          recipientAddress: recipientAddress.toLowerCase(),
          anchorAddress:
            recipientId !== recipientAddress ? recipientId.toLowerCase() : null,
          superappAddress: null,
          status: "PENDING",
          metadataCid,
          metadata,
          createdAtBlock: event.blockNumber,
          updatedAtBlock: event.blockNumber,
          tags: ["allo"],
        })
        .execute();
    } catch (err) {
      console.warn("DB write error");
    }
  } else if (args.event.contractName === "StreamingQuadraticFunding") {
    const {
      event,
      chainId,
      readContract,
      context: { db },
    } = args as EventHandlerArgs<
      Indexer<typeof abis, IndexerContext>,
      "StreamingQuadraticFunding",
      "Registered"
    >;

    const { params, address } = event;

    const strategyAddress = address.toLowerCase();
    const pool = await getPool(chainId, strategyAddress);

    if (!pool?.id) {
      console.warn(`Pool ID was not found for strategy ${strategyAddress}`);

      return;
    }

    const {
      recipientAddress,
      metadata: { pointer: metadataCid },
    } = params;

    const metadata = await fetchIpfs(metadataCid);

    const superappAddress = await readContract({
      contract: "StreamingQuadraticFunding",
      address,
      functionName: "getSuperApp",
      args: [recipientAddress],
    });

    try {
      await db
        .insertInto("recipients")
        .values({
          id: recipientAddress.toLowerCase(),
          chainId,
          poolId: pool.id,
          strategyAddress,
          recipientAddress: recipientAddress.toLowerCase(),
          anchorAddress: null,
          superappAddress: superappAddress ?? null,
          status: "APPROVED",
          metadataCid,
          metadata,
          createdAtBlock: event.blockNumber,
          updatedAtBlock: event.blockNumber,
          tags: [],
        })
        .execute();
    } catch (err) {
      console.warn("DB write error");
    }
  }
}
