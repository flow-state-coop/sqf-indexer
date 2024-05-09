import { EventHandlerArgs, Indexer } from "chainsauce";
import { pad, encodePacked, keccak256 } from "viem";
import { getPendingPoolRoles } from "../../db/index.js";
import { IndexerContext } from "../handleEvent.js";
import { fetchIpfs } from "../ipfs.js";
import { abis } from "../../lib/abi/index.js";
import { ALLO_STRATEGY_ID } from "../../lib/constants.js";

export async function handlePoolCreated(
  args: EventHandlerArgs<
    Indexer<typeof abis, IndexerContext>,
    "Allo",
    "PoolCreated"
  >,
) {
  const {
    event,
    chainId,
    readContract,
    subscribeToContract,
    context: { db },
  } = args;

  const { params } = event;

  const strategyId = await readContract({
    contract: "AlloStrategy",
    address: params.strategy,
    functionName: "getStrategyId",
  });

  if (strategyId === ALLO_STRATEGY_ID) {
    const {
      poolId,
      token,
      profileId,
      strategy,
      metadata: { pointer: metadataCid },
    } = params;

    subscribeToContract({
      contract: "AlloStrategy",
      address: strategy,
    });

    const strategyAddress = strategy.toLowerCase();
    const strategyName = "SQFSuperfluidv1";
    const managerRole = pad(`0x${poolId.toString(16)}`);
    const adminRole = keccak256(
      encodePacked(["uint256", "string"], [poolId, "admin"]),
    );
    const metadata = await fetchIpfs(metadataCid);

    try {
      await db
        .insertInto("pools")
        .values({
          id: poolId.toString(),
          chainId,
          token: token.toLowerCase(),
          metadataCid,
          metadata,
          managerRole,
          adminRole,
          createdAtBlock: event.blockNumber,
          updatedAtBlock: event.blockNumber,
          strategyAddress,
          strategyId,
          strategyName,
          profileId,
          tags: ["allo"],
        })
        .execute();

      const pendingAdminRoles = await getPendingPoolRoles(chainId, adminRole);

      if (pendingAdminRoles.length > 0) {
        await db
          .insertInto("poolRoles")
          .values(
            pendingAdminRoles.map((pendingAdminRole) => {
              return {
                chainId,
                poolId: poolId.toString(),
                address: pendingAdminRole.address,
                role: "admin",
                createdAtBlock: event.blockNumber,
              };
            }),
          )
          .execute();

        await db
          .deleteFrom("pendingPoolRoles")
          .where(
            "id",
            "in",
            pendingAdminRoles.map((role) => role.id),
          )
          .execute();
      }

      const pendingManagerRoles = await getPendingPoolRoles(
        chainId,
        managerRole,
      );

      if (pendingManagerRoles.length > 0) {
        await db
          .insertInto("poolRoles")
          .values(
            pendingManagerRoles.map((pendingManagerRole) => {
              return {
                chainId,
                poolId: poolId.toString(),
                address: pendingManagerRole.address,
                role: "admin",
                createdAtBlock: event.blockNumber,
              };
            }),
          )
          .execute();

        await db
          .deleteFrom("pendingPoolRoles")
          .where(
            "id",
            "in",
            pendingManagerRoles.map((role) => role.id),
          )
          .execute();
      }
    } catch (err) {
      console.warn("DB write error");
    }
  }
}
