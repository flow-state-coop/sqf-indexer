import { EventHandlerArgs, Indexer } from "chainsauce";
import { pad, encodePacked, keccak256 } from "viem";
import { getPendingPoolRoles } from "../../db/index.js";
import { IndexerContext } from "../handleEvent.js";
import { fetchIpfs } from "../ipfs.js";
import { abis } from "../../lib/abi/index.js";
import {
  ALLO_STRATEGY_ID,
  NULL_BYTES,
  ZERO_ADDRESS,
} from "../../lib/constants.js";

export async function handlePoolCreated(
  args: EventHandlerArgs<
    Indexer<typeof abis, IndexerContext>,
    "Allo" | "PoolFactory",
    "PoolCreated"
  >,
) {
  if (args.event.contractName === "Allo") {
    const {
      event,
      chainId,
      readContract,
      subscribeToContract,
      context: { db },
    } = args as EventHandlerArgs<
      Indexer<typeof abis, IndexerContext>,
      "Allo",
      "PoolCreated"
    >;

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
      const allocationToken = await readContract({
        contract: "AlloStrategy",
        address: params.strategy,
        functionName: "allocationSuperToken",
      });

      try {
        await db
          .insertInto("pools")
          .values({
            id: poolId.toString(),
            chainId,
            allocationToken: allocationToken.toLowerCase(),
            matchingToken: token.toLowerCase(),
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
                  role: "manager",
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
  } else if (args.event.contractName === "PoolFactory") {
    const {
      event,
      chainId,
      readContract,
      subscribeToContract,
      context: { db },
    } = args as EventHandlerArgs<
      Indexer<typeof abis, IndexerContext>,
      "PoolFactory",
      "PoolCreated"
    >;

    const { params } = event;
    const {
      poolId,
      poolAddress,
      token,
      metadata: { pointer: metadataCid },
    } = params;

    subscribeToContract({
      contract: "StreamingQuadraticFunding",
      address: poolAddress,
    });

    const strategyName = "StreamingQuadraticFunding";
    const managerRole = pad(`0x${poolId.toString(16)}`);
    const adminRole = keccak256(
      encodePacked(["uint256", "string"], [poolId, "admin"]),
    );
    const metadata = await fetchIpfs(metadataCid);

    const adminAddress = await readContract({
      contract: "StreamingQuadraticFunding",
      address: poolAddress,
      functionName: "admin",
    });
    const allocationToken = await readContract({
      contract: "StreamingQuadraticFunding",
      address: poolAddress,
      functionName: "allocationSuperToken",
    });

    try {
      await db
        .insertInto("profiles")
        .values({
          id: NULL_BYTES,
          chainId,
          name: strategyName,
          anchorAddress: ZERO_ADDRESS,
          metadataCid,
          metadata,
          createdAtBlock: event.blockNumber,
          updatedAtBlock: event.blockNumber,
          tags: [],
        })
        .execute();

      await db
        .insertInto("profileRoles")
        .values({
          chainId,
          profileId: NULL_BYTES,
          address: poolAddress.toLowerCase(),
          role: "owner",
          createdAtBlock: event.blockNumber,
        })
        .execute();

      await db
        .insertInto("pools")
        .values({
          id: poolId.toString(),
          chainId,
          allocationToken: allocationToken.toLowerCase(),
          matchingToken: token.toLowerCase(),
          metadataCid,
          metadata,
          managerRole,
          adminRole,
          createdAtBlock: event.blockNumber,
          updatedAtBlock: event.blockNumber,
          strategyAddress: poolAddress.toLowerCase(),
          strategyId: NULL_BYTES,
          strategyName,
          profileId: NULL_BYTES,
          tags: [],
        })
        .execute();

      await db
        .insertInto("poolRoles")
        .values({
          chainId,
          poolId: poolId.toString(),
          address: adminAddress,
          role: "admin",
          createdAtBlock: event.blockNumber,
        })
        .execute();
    } catch (err) {
      console.warn("DB write error");
    }
  }
}
