import { EventHandlerArgs, Indexer } from "chainsauce";
import { IndexerContext } from "../handleEvent.js";
import { abis } from "../../lib/abi/index.js";

export async function handleProfileOwnerUpdated(
  args: EventHandlerArgs<
    Indexer<typeof abis, IndexerContext>,
    "AlloRegistry",
    "ProfileOwnerUpdated"
  >,
) {
  const {
    event,
    chainId,
    context: { db },
  } = args;

  const { params } = event;

  try {
    await db
      .deleteFrom("profileRoles")
      .where("chainId", "=", chainId)
      .where("profileId", "=", params.profileId)
      .where("role", "=", "owner")
      .execute();

    await db
      .insertInto("profileRoles")
      .values({
        chainId,
        profileId: params.profileId,
        address: params.owner.toLowerCase(),
        role: "owner",
        createdAtBlock: event.blockNumber,
      })
      .execute();
  } catch (err) {
    console.warn("DB write error");
  }
}
