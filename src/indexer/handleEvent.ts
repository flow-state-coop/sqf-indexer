import { PublicClient } from "viem";
import { EventHandlerArgs } from "chainsauce";
import { Kysely } from "kysely";
import { Indexer } from "chainsauce";
import { Database } from "../db/index.js";
import { abis } from "../lib/abi/index.js";
import {
  handleProfileCreated,
  handlePoolCreated,
  handlePoolMetadataUpdated,
  handleRegistered,
  handleUpdatedRegistration,
  handleReviewed,
  handleCanceled,
  handleProfileMetadataUpdated,
  handleProfileNameUpdated,
  handleProfileOwnerUpdated,
  handleRoleGranted,
  handleRoleRevoked,
} from "./events/index.js";

export type IndexerContext = {
  publicClient: PublicClient;
  db: Kysely<Database>;
};

async function handleEvent(
  args: EventHandlerArgs<Indexer<typeof abis, IndexerContext>>,
) {
  const { event } = args;

  switch (event.name) {
    case "ProfileCreated": {
      await handleProfileCreated({ ...args, event });

      break;
    }

    case "PoolCreated": {
      await handlePoolCreated({ ...args, event });

      break;
    }

    case "PoolMetadataUpdated": {
      await handlePoolMetadataUpdated({ ...args, event });

      break;
    }

    case "Registered": {
      await handleRegistered({ ...args, event });

      break;
    }

    case "UpdatedRegistration": {
      await handleUpdatedRegistration({ ...args, event });

      break;
    }

    case "Reviewed": {
      await handleReviewed({ ...args, event });

      break;
    }

    case "Canceled": {
      await handleCanceled({ ...args, event });

      break;
    }

    case "ProfileMetadataUpdated": {
      await handleProfileMetadataUpdated({ ...args, event });

      break;
    }

    case "ProfileNameUpdated": {
      await handleProfileNameUpdated({ ...args, event });

      break;
    }

    case "ProfileOwnerUpdated": {
      await handleProfileOwnerUpdated({ ...args, event });

      break;
    }

    case "RoleGranted": {
      await handleRoleGranted({ ...args, event });

      break;
    }

    case "RoleRevoked": {
      await handleRoleRevoked({ ...args, event });

      break;
    }

    default:
      break;
  }
}

export { handleEvent };
