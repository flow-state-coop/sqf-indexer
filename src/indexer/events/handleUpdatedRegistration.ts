import { EventHandlerArgs, Indexer } from "chainsauce";
import { IndexerContext } from "../handleEvent.js";
import { decodeRegistrationDataAlloStrategy } from "../decode.js";
import { abis } from "../../lib/abi/index.js";

export async function handleUpdatedRegistration(
  args: EventHandlerArgs<
    Indexer<typeof abis, IndexerContext>,
    "AlloStrategy",
    "UpdatedRegistration"
  >,
) {
  const {
    event,
    chainId,
    context: { db },
  } = args;

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
}
