import { createVerifiedFetch } from "@helia/verified-fetch";
import { IPFS_GATEWAYS } from "../lib/constants.js";

async function fetchIpfs(cid: string) {
  const cidRegex = /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|baf[0-9A-Za-z]{50,})$/;

  if (!cidRegex.test(cid)) {
    return null;
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const verifiedFetch = await createVerifiedFetch({
    gateways: IPFS_GATEWAYS,
  });

  const res = await verifiedFetch(`ipfs://${cid}`);

  return await res.json();
}

export { fetchIpfs };
