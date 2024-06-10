import { EventHandlerArgs, Indexer } from "chainsauce";
import { IndexerContext } from "../handleEvent.js";
import { fetchIpfs } from "../ipfs.js";
import { abis } from "../../lib/abi/index.js";

export async function handlePoolMetadataUpdated(
  args: EventHandlerArgs<
    Indexer<typeof abis, IndexerContext>,
    "Allo",
    "PoolMetadataUpdated"
  >,
) {
  const {
    event,
    chainId,
    context: { db },
  } = args;

  const { params } = event;

  const metadataCid = params.metadata.pointer;
  const metadata = await fetchIpfs(metadataCid);

  try {
    db.updateTable("pools")
      .set({
        metadataCid,
        metadata,
      })
      .where("chainId", "=", chainId)
      .where("id", "=", params.poolId.toString())
      .execute();
  } catch (err) {
    console.warn("DB write error");
  }
}
