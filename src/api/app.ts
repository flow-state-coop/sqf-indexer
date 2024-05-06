import express from "express";
import "dotenv/config";

export async function createApi() {
  const app = express();
  const port = 3000;

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
