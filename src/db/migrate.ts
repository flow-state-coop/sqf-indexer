import { Kysely, sql } from "kysely";

const schemaName = "3";

async function migrate<T>(db: Kysely<T>) {
  const ref = (name: string) => sql.table(`${schemaName}.${name}`);

  const schema = db.withSchema(schemaName).schema;

  await schema
    .createTable("profiles")
    .addColumn("id", "text")
    .addColumn("chainId", "integer")
    .addColumn("name", "text")
    .addColumn("anchorAddress", "text")
    .addColumn("metadataCid", "text")
    .addColumn("metadata", "jsonb")
    .addColumn("createdAtBlock", "bigint")
    .addColumn("updatedAtBlock", "bigint")
    .addColumn("tags", sql`text[]`)
    .addPrimaryKeyConstraint("profiles_pkey", ["id", "chainId"])
    .execute();

  await schema
    .createTable("pending_profile_roles")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("chainId", "integer")
    .addColumn("role", "text")
    .addColumn("address", "text")
    .addColumn("createdAtBlock", "bigint")
    .execute();

  await schema
    .createType("profile_role_name")
    .asEnum(["owner", "member"])
    .execute();

  await schema
    .createTable("profile_roles")
    .addColumn("chainId", "integer")
    .addColumn("profileId", "text")
    .addColumn("address", "text")
    .addColumn("role", ref("profile_role_name"))
    .addColumn("createdAtBlock", "bigint")
    .addPrimaryKeyConstraint("profile_roles_pkey", [
      "chainId",
      "profileId",
      "address",
      "role",
    ])
    .addForeignKeyConstraint(
      "profile_roles_profiles_fkey",
      ["chainId", "profileId"],
      "profiles",
      ["chainId", "id"],
    )
    .execute();

  await schema
    .createTable("pools")
    .addColumn("id", "text")
    .addColumn("chainId", "integer")
    .addColumn("allocationToken", "text")
    .addColumn("matchingToken", "text")
    .addColumn("tags", sql`text[]`)
    .addColumn("metadataCid", "text")
    .addColumn("metadata", "jsonb")
    .addColumn("managerRole", "text")
    .addColumn("adminRole", "text")
    .addColumn("createdAtBlock", "bigint")
    .addColumn("updatedAtBlock", "bigint")
    .addColumn("strategyAddress", "text")
    .addColumn("strategyId", "text")
    .addColumn("strategyName", "text")
    .addColumn("profileId", "text")
    .addPrimaryKeyConstraint("pools_pkey", ["id", "chainId"])
    .addForeignKeyConstraint(
      "pools_profiles_fkey",
      ["chainId", "profileId"],
      "profiles",
      ["chainId", "id"],
    )
    .execute();

  await schema
    .createType("status")
    .asEnum(["PENDING", "REJECTED", "APPROVED", "CANCELED"])
    .execute();

  await schema
    .createTable("recipients")
    .addColumn("id", "text")
    .addColumn("chainId", "integer")
    .addColumn("poolId", "text")
    .addColumn("strategyAddress", "text")
    .addColumn("recipientAddress", "text")
    .addColumn("anchorAddress", "text")
    .addColumn("superappAddress", "text")
    .addColumn("status", ref("status"))
    .addColumn("metadataCid", "text")
    .addColumn("metadata", "jsonb")
    .addColumn("createdAtBlock", "bigint")
    .addColumn("updatedAtBlock", "bigint")
    .addColumn("tags", sql`text[]`)
    .addPrimaryKeyConstraint("recipients_pkey", ["chainId", "poolId", "id"])
    .addForeignKeyConstraint(
      "recipients_pools_fkey",
      ["poolId", "chainId"],
      "pools",
      ["id", "chainId"],
      (cb) => cb.onDelete("cascade"),
    )
    .execute();

  await schema
    .createIndex("idx_pools_manager_role")
    .on("pools")
    .columns(["managerRole"])
    .execute();

  await schema
    .createIndex("idx_pools_admin_role")
    .on("pools")
    .columns(["adminRole"])
    .execute();

  await schema
    .createTable("pending_pool_roles")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("chainId", "integer")
    .addColumn("role", "text")
    .addColumn("address", "text")
    .addColumn("createdAtBlock", "bigint")
    .execute();

  await schema
    .createType("pool_role_name")
    .asEnum(["admin", "manager"])
    .execute();

  await schema
    .createTable("pool_roles")
    .addColumn("chainId", "integer")
    .addColumn("poolId", "text")
    .addColumn("address", "text")
    .addColumn("role", ref("pool_role_name"))
    .addColumn("createdAtBlock", "bigint")
    .addPrimaryKeyConstraint("pool_roles_pkey", [
      "chainId",
      "poolId",
      "address",
      "role",
    ])
    .addForeignKeyConstraint(
      "pool_roles_pools_fkey",
      ["chainId", "poolId"],
      "pools",
      ["chainId", "id"],
    )
    .execute();
}

export { schemaName, migrate };
