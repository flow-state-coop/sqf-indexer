import express from "express";
import cors from "cors";
import { postgraphile } from "postgraphile";
import PgSimplifyInflectorPlugin from "@graphile-contrib/pg-simplify-inflector";
import ConnectionFilterPlugin from "postgraphile-plugin-connection-filter";
import { schemaName } from "../db/migrate.js";
import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

export async function createApi() {
  const dbConnectionPool = new Pool({
    connectionString: process.env.DATABASE_URI,
  });
  const app = express();
  const port = 3000;

  app.set("trust proxy", true);
  app.use(cors());
  app.use(
    postgraphile(dbConnectionPool, schemaName, {
      watchPg: true,
      graphiql: true,
      enhanceGraphiql: true,
      retryOnInitFail: true,
      dynamicJson: true,
      setofFunctionsContainNulls: false,
      enableQueryBatching: true,
      disableQueryLog: true,
      legacyRelations: "omit",
      disableDefaultMutations: true,
      simpleCollections: "only",
      appendPlugins: [
        PgSimplifyInflectorPlugin.default,
        ConnectionFilterPlugin,
      ],
      graphileBuildOptions: {
        pgOmitListSuffix: true,
        pgShortPk: true,
        connectionFilterRelations: true,
        connectionFilterUseListInflectors: true,
        connectionFilterAllowedOperators: [
          "isNull",
          "equalTo",
          "notEqualTo",
          "lessThan",
          "lessThanOrEqualTo",
          "greaterThan",
          "greaterThanOrEqualTo",
          "in",
          "notIn",
          "contains",
        ],
      },
    }),
  );

  app.get("/", (req, res) => {
    res.status(200).send("OK");
  });

  return {
    app,
    start() {
      return new Promise<void>((resolve) => {
        app.listen(port, () => {
          console.info(`Listening on port ${port}`);
          resolve();
        });
      });
    },
  };
}
