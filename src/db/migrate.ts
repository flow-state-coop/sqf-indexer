import { Kysely, sql } from "kysely";

const schemaName = "1";

async function migrate<T>(db: Kysely<T>) {
  const ref = (name: string) => sql.table(`${schemaName}.${name}`);

  const schema = db.withSchema(schemaName).schema;

  await schema
    .createTable("pools")
    .addColumn("id", "text")
    .addColumn("chainId", "integer")
    .addColumn("token", "text")
    .addColumn("tags", sql`text[]`)
    .addColumn("metadataCid", "text")
    .addColumn("createdAtBlock", "bigint")
    .addColumn("updatedAtBlock", "bigint")
    .addColumn("strategyAddress", "text")
    .addColumn("strategyId", "text")
    .addColumn("strategyName", "text")
    .addColumn("projectId", "text")
    .addPrimaryKeyConstraint("pools_pkey", ["id", "chainId"])
    .execute();

  await schema
    .createType("status")
    .asEnum(["PENDING", "REJECTED", "APPROVED"])
    .execute();

  await schema
    .createTable("recipients")
    .addColumn("id", "text")
    .addColumn("chainId", "integer")
    .addColumn("poolId", "text")
    .addColumn("recipientAddress", "text")
    .addColumn("anchorAddress", "text")
    .addColumn("status", ref("status"))
    .addColumn("metadataCid", "text")
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
}

export { schemaName, migrate };
