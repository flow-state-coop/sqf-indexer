import { EventHandlerArgs, Indexer } from "chainsauce";
import { IndexerContext } from "../handleEvent.js";
import { fetchIpfs } from "../ipfs.js";
import { getPendingProfileRoles } from "../../db/index.js";
import { abis } from "../../lib/abi/index.js";

export async function handleProfileCreated(
  args: EventHandlerArgs<
    Indexer<typeof abis, IndexerContext>,
    "AlloRegistry",
    "ProfileCreated"
  >,
) {
  const {
    event,
    chainId,
    context: { db },
  } = args;

  const {
    params: { profileId, name, metadata, owner, anchor },
  } = event;

  const metadataContent = await fetchIpfs(metadata.pointer);

  try {
    await db
      .insertInto("profiles")
      .values({
        id: profileId,
        chainId,
        name,
        anchorAddress: anchor.toLowerCase(),
        metadataCid: metadata.pointer,
        metadata: metadataContent,
        createdAtBlock: event.blockNumber,
        updatedAtBlock: event.blockNumber,
        tags: [
          "allo",
          metadataContent?.type === "program" ? "program" : "project",
        ],
      })
      .execute();

    await db
      .insertInto("profileRoles")
      .values({
        chainId,
        profileId,
        address: owner.toLowerCase(),
        role: "owner",
        createdAtBlock: event.blockNumber,
      })
      .execute();

    const pendingProfileRoles = await getPendingProfileRoles(
      chainId,
      profileId,
    );

    if (pendingProfileRoles.length > 0) {
      await db
        .insertInto("profileRoles")
        .values(
          pendingProfileRoles.map((pendingProfileRole) => {
            return {
              chainId,
              profileId,
              address: pendingProfileRole.address,
              role: "member",
              createdAtBlock: event.blockNumber,
            };
          }),
        )
        .execute();

      await db
        .deleteFrom("pendingProfileRoles")
        .where(
          "id",
          "in",
          pendingProfileRoles.map((role) => role.id),
        )
        .execute();
    }
  } catch (err) {
    console.warn("DB write error");
  }
}
