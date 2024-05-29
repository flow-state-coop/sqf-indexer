import { EventHandlerArgs, Indexer } from "chainsauce";
import { IndexerContext } from "../handleEvent.js";
import { abis } from "../../lib/abi/index.js";
import { ZERO_ADDRESS } from "../../lib/constants.js";

export async function handleCanceled(
  args: EventHandlerArgs<
    Indexer<typeof abis, IndexerContext>,
    "AlloStrategy",
    "Canceled"
  >,
) {
  const {
    event,
    chainId,
    context: { db },
  } = args;

  const {
    params: { recipientId },
    address,
  } = event;

  try {
    await db
      .updateTable("recipients")
      .set({
        status: "CANCELED",
        superappAddress: ZERO_ADDRESS,
        updatedAtBlock: event.blockNumber,
      })
      .where("chainId", "=", chainId)
      .where("strategyAddress", "=", address.toLowerCase())
      .where("id", "=", recipientId.toLowerCase())
      .execute();
  } catch (err) {
    console.warn("DB write error");
  }
}
