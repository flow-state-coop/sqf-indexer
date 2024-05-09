import { EventHandlerArgs, Indexer } from "chainsauce";
import { IndexerContext } from "../handleEvent.js";
import { Pool, getProfile, getPoolByRole } from "../../db/index.js";
import { abis } from "../../lib/abi/index.js";
import { ALLO_OWNER_ROLE } from "../../lib/constants.js";

export async function handleRoleGranted(
  args: EventHandlerArgs<
    Indexer<typeof abis, IndexerContext>,
    "AlloRegistry" | "Allo",
    "RoleGranted"
  >,
) {
  const {
    event,
    chainId,
    context: { db },
  } = args;

  const { params } = event;

  if (event.contractName === "AlloRegistry") {
    const role = params.role.toLowerCase();

    if (role === ALLO_OWNER_ROLE) {
      return;
    }

    const address = params.account.toLowerCase();
    const profile = await getProfile(chainId, role);

    try {
      if (profile !== null) {
        await db
          .insertInto("profileRoles")
          .values({
            chainId,
            profileId: profile.id,
            address,
            role: "member",
            createdAtBlock: event.blockNumber,
          })
          .execute();

        return;
      }

      await db
        .insertInto("pendingProfileRoles")
        .values({
          chainId,
          role,
          address,
          createdAtBlock: event.blockNumber,
        })
        .execute();
    } catch (err) {
      console.warn("DB write error");
    }
  } else if (event.contractName === "Allo") {
    const role = params.role.toLowerCase();
    const address = params.account.toLowerCase();

    let pool: Pool | null = null;

    pool = await getPoolByRole(chainId, "admin", role);

    if (pool !== null) {
      await db
        .insertInto("poolRoles")
        .values({
          chainId,
          poolId: pool.id,
          role: "admin",
          address,
          createdAtBlock: event.blockNumber,
        })
        .execute();

      return;
    }

    pool = await getPoolByRole(chainId, "manager", role);

    if (pool !== null) {
      await db
        .insertInto("poolRoles")
        .values({
          chainId,
          poolId: pool.id,
          role: "manager",
          address,
          createdAtBlock: event.blockNumber,
        })
        .execute();

      return;
    }

    await db
      .insertInto("pendingPoolRoles")
      .values({
        chainId,
        role,
        address,
        createdAtBlock: event.blockNumber,
      })
      .execute();
  }
}
