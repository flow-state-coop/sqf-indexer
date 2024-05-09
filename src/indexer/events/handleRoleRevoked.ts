import { EventHandlerArgs, Indexer } from "chainsauce";
import { IndexerContext } from "../handleEvent.js";
import { Pool, getProfile, getPoolByRole } from "../../db/index.js";
import { abis } from "../../lib/abi/index.js";

export async function handleRoleRevoked(
  args: EventHandlerArgs<
    Indexer<typeof abis, IndexerContext>,
    "AlloRegistry" | "Allo",
    "RoleRevoked"
  >,
) {
  const {
    event,
    chainId,
    context: { db },
  } = args;

  const { params } = event;

  if (event.contractName === "AlloRegistry") {
    if (event.contractName === "AlloRegistry") {
      const address = params.account.toLowerCase();
      const role = params.role.toLowerCase();
      const profile = await getProfile(chainId, role);

      if (profile === null) {
        return;
      }

      try {
        await db
          .deleteFrom("profileRoles")
          .where("chainId", "=", chainId)
          .where("profileId", "=", profile.id)
          .where("role", "=", "member")
          .where("address", "=", address)
          .execute();
      } catch (err) {
        console.warn("DB write error");
      }
    }
  } else if (event.contractName === "Allo") {
    const role = params.role.toLowerCase();
    const address = params.account.toLowerCase();

    let pool: Pool | null = null;

    pool = await getPoolByRole(chainId, "admin", role);

    if (pool !== null) {
      await db
        .deleteFrom("poolRoles")
        .where("chainId", "=", chainId)
        .where("poolId", "=", pool.id)
        .where("role", "=", "admin")
        .where("address", "=", address)
        .execute();

      return;
    }

    pool = await getPoolByRole(chainId, "manager", role);

    if (pool !== null) {
      await db
        .deleteFrom("poolRoles")
        .where("chainId", "=", chainId)
        .where("poolId", "=", pool.id)
        .where("role", "=", "manager")
        .where("address", "=", address)
        .execute();
    }
  }
}
