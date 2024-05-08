import { Hex, decodeAbiParameters } from "viem";

function decodeRegistrationDataAlloStrategy(encodedData: Hex) {
  const decoded = decodeAbiParameters(
    [
      { name: "recipientId", type: "address" },
      { name: "recipientAddress", type: "address" },
      {
        name: "metadata",
        type: "tuple",
        components: [
          { name: "protocol", type: "uint256" },
          { name: "pointer", type: "string" },
        ],
      },
    ],
    encodedData,
  );

  return {
    recipientId: decoded[0],
    recipientAddress: decoded[1],
    metadata: {
      protocol: Number(decoded[2].protocol),
      pointer: decoded[2].pointer,
    },
  };
}

export { decodeRegistrationDataAlloStrategy };
