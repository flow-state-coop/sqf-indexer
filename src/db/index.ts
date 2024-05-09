import pg from "pg";
import {
  sql,
  Kysely,
  PostgresDialect,
  CamelCasePlugin,
  Insertable,
  Selectable,
  Updateable,
} from "kysely";
import { schemaName, migrate } from "./migrate.js";

export type Database = {
  profiles: ProfilesTable;
  pools: PoolsTable;
  recipients: RecipientsTable;
  pendingProfileRoles: PendingProfileRolesTable;
  profileRoles: ProfileRolesTable;
  pendingPoolRoles: PendingPoolRolesTable;
  poolRoles: PoolRolesTable;
};

export type ProfilesTable = {
  id: string;
  chainId: number;
  name: string;
  anchorAddress: string;
  metadataCid: string;
  metadata: unknown;
  createdAtBlock: bigint;
  updatedAtBlock: bigint;
  tags: string[];
};

export type PendingProfileRolesTable = {
  id?: number;
  chainId: number;
  role: string;
  address: string;
  createdAtBlock: bigint;
};

export type ProfileRolesTable = {
  chainId: number;
  profileId: string;
  address: string;
  role: "owner" | "member";
  createdAtBlock: bigint;
};

export type PoolsTable = {
  id: string;
  chainId: number;
  token: string;
  metadataCid: string;
  metadata: unknown;
  createdAtBlock: bigint;
  updatedAtBlock: bigint;
  managerRole: string;
  adminRole: string;
  strategyAddress: string;
  strategyId: string;
  strategyName: string;
  profileId: string;
  tags: string[];
};

export type RecipientsTable = {
  id: string;
  chainId: number;
  poolId: string;
  strategyAddress: string;
  recipientAddress: string;
  anchorAddress: string | null;
  status: "PENDING" | "REJECTED" | "APPROVED";
  metadataCid: string | null;
  createdAtBlock: bigint;
  updatedAtBlock: bigint;
  tags: string[];
};

export type PendingPoolRolesTable = {
  id?: number;
  chainId: number;
  role: string;
  address: string;
  createdAtBlock: bigint;
};

export type PoolRolesTable = {
  chainId: number;
  poolId: string;
  address: string;
  role: "admin" | "manager";
  createdAtBlock: bigint;
};

export type Profile = Selectable<ProfilesTable>;
export type ProfileNew = Insertable<ProfilesTable>;
export type ProfileUpdate = Updateable<ProfilesTable>;

export type Pool = Selectable<PoolsTable>;
export type PoolNew = Insertable<PoolsTable>;
export type PoolUpdate = Updateable<PoolsTable>;

export type Recipient = Selectable<RecipientsTable>;
export type RecipientNew = Insertable<RecipientsTable>;
export type RecipientUpdate = Updateable<RecipientsTable>;

export type ProfileRole = Selectable<ProfileRolesTable>;
export type NewProfileRole = Insertable<ProfileRolesTable>;
export type ProfileRoleUpdate = Updateable<ProfileRolesTable>;

export type PendingProfileRole = Selectable<PendingProfileRolesTable>;
export type NewPendingProfileRole = Insertable<PendingProfileRolesTable>;
export type PendingProfileRoleUpdate = Updateable<PendingProfileRolesTable>;

export type PendingPoolRole = Selectable<PendingPoolRolesTable>;
export type NewPendingPoolRole = Insertable<PendingPoolRolesTable>;
export type UpdatePendingPoolRole = Updateable<PendingPoolRolesTable>;

export type PoolRole = Selectable<PoolRolesTable>;
export type NewPoolRole = Insertable<PoolRolesTable>;
export type UpdatePoolRole = Updateable<PoolRolesTable>;

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URI,
});

const dialect = new PostgresDialect({
  pool,
});

export const db = new Kysely<Database>({
  dialect,
  plugins: [new CamelCasePlugin()],
}).withSchema(schemaName);

export async function createSchemaIfNotExists() {
  const exists = await sql<{ exists: boolean }>`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.schemata
      WHERE schema_name = ${schemaName}
    )`.execute(db);

  if (exists.rows.length > 0 && exists.rows[0].exists) {
    console.info(`schema "${schemaName}" exists, skipping creation`);

    return;
  }

  console.info(`schema "${schemaName}" does not exist, creating schema`);

  await db.transaction().execute(async (tx) => {
    await tx.schema.createSchema(schemaName).execute();
    await migrate(tx);
  });
}

export async function getProfile(chainId: number, id: string) {
  const profile = await db
    .selectFrom("profiles")
    .where("chainId", "=", chainId)
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirst();

  return profile ?? null;
}

export async function getPool(chainId: number, strategyAddress: string) {
  const pool = await db
    .selectFrom("pools")
    .select("id")
    .where("chainId", "=", chainId)
    .where("strategyAddress", "=", strategyAddress)
    .executeTakeFirst();

  return pool ?? null;
}

export async function getPoolByRole(
  chainId: number,
  roleName: "admin" | "manager",
  role: string,
) {
  const pool = await db
    .selectFrom("pools")
    .where("chainId", "=", chainId)
    .where(`${roleName}Role`, "=", role)
    .selectAll()
    .executeTakeFirst();

  return pool ?? null;
}

export async function getPendingProfileRoles(chainId: number, role: string) {
  const pendingProfileRoles = await db
    .selectFrom("pendingProfileRoles")
    .where("chainId", "=", chainId)
    .where("role", "=", role)
    .selectAll()
    .execute();

  return pendingProfileRoles ?? null;
}

export async function getPendingPoolRoles(chainId: number, role: string) {
  const pendingPoolRoles = await db
    .selectFrom("pendingPoolRoles")
    .where("chainId", "=", chainId)
    .where("role", "=", role)
    .selectAll()
    .execute();

  return pendingPoolRoles ?? null;
}
