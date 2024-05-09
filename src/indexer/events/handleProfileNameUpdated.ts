import { EventHandlerArgs, Indexer } from "chainsauce";
import { IndexerContext } from "../handleEvent.js";
import { abis } from "../../lib/abi/index.js";

export async function handleProfileNameUpdated(
  args: EventHandlerArgs<
    Indexer<typeof abis, IndexerContext>,
    "AlloRegistry",
    "ProfileNameUpdated"
  >,
) {
  const {
    event,
    chainId,
    context: { db },
  } = args;

  const { params } = event;

  try {
    db.updateTable("profiles")
      .set({
        name: params.name,
        anchorAddress: params.anchor.toLowerCase(),
      })
      .where("chainId", "=", chainId)
      .where("id", "=", params.profileId)
      .execute();
  } catch (err) {
    console.warn("DB write error");
  }
}
