import { EventHandlerArgs, Indexer } from "chainsauce";
import { IndexerContext } from "../handleEvent.js";
import { fetchIpfs } from "../ipfs.js";
import { decodeRegistrationDataAlloStrategy } from "../decode.js";
import { abis } from "../../lib/abi/index.js";

export async function handleUpdatedRegistration(
  args: EventHandlerArgs<
    Indexer<typeof abis, IndexerContext>,
    "AlloStrategy" | "StreamingQuadraticFunding",
    "UpdatedRegistration"
  >,
) {
  if (args.event.contractName === "AlloStrategy") {
    const {
      event,
      chainId,
      context: { db },
    } = args as EventHandlerArgs<
      Indexer<typeof abis, IndexerContext>,
      "AlloStrategy",
      "UpdatedRegistration"
    >;

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
    const metadata = await fetchIpfs(metadataCid);

    try {
      await db
        .updateTable("recipients")
        .set({
          recipientAddress: recipientAddress.toLowerCase(),
          metadataCid,
          metadata,
          updatedAtBlock: event.blockNumber,
        })
        .where("chainId", "=", chainId)
        .where("strategyAddress", "=", strategyAddress)
        .where("id", "=", recipientId.toLowerCase())
        .execute();
    } catch (err) {
      console.warn("DB write error");
    }
  } else if (args.event.contractName === "StreamingQuadraticFunding") {
    const {
      event,
      chainId,
      context: { db },
    } = args as EventHandlerArgs<
      Indexer<typeof abis, IndexerContext>,
      "StreamingQuadraticFunding",
      "UpdatedRegistration"
    >;

    const { params, address } = event;

    const {
      recipientAddress,
      metadata: { pointer: metadataCid },
    } = params;

    const strategyAddress = address.toLowerCase();
    const metadata = await fetchIpfs(metadataCid);

    try {
      await db
        .updateTable("recipients")
        .set({
          recipientAddress: recipientAddress.toLowerCase(),
          metadataCid,
          metadata,
          updatedAtBlock: event.blockNumber,
        })
        .where("chainId", "=", chainId)
        .where("strategyAddress", "=", strategyAddress)
        .where("id", "=", recipientAddress.toLowerCase())
        .execute();
    } catch (err) {
      console.warn("DB write error");
    }
  }
}
