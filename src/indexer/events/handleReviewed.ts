import { EventHandlerArgs, Indexer } from "chainsauce";
import { IndexerContext } from "../handleEvent.js";
import { abis } from "../../lib/abi/index.js";

enum Status {
  None,
  Pending,
  Accepted,
  Rejected,
  Appealed,
  InReview,
  Canceled,
}

export async function handleReviewed(
  args: EventHandlerArgs<
    Indexer<typeof abis, IndexerContext>,
    "AlloStrategy",
    "Reviewed"
  >,
) {
  const {
    event,
    chainId,
    readContract,
    context: { db },
  } = args;

  const {
    params: { recipientId, status },
    address,
  } = event;

  const strategyAddress = address.toLowerCase();
  const superappAddress = await readContract({
    contract: "AlloStrategy",
    address,
    functionName: "getSuperApp",
    args: [recipientId],
  });

  try {
    await db
      .updateTable("recipients")
      .set({
        status: status === Status.Accepted ? "APPROVED" : "REJECTED",
        superappAddress: superappAddress.toLowerCase(),
        updatedAtBlock: event.blockNumber,
      })
      .where("chainId", "=", chainId)
      .where("strategyAddress", "=", strategyAddress)
      .where("id", "=", recipientId.toLowerCase())
      .execute();
  } catch (err) {
    console.warn("DB write error");
  }
}
