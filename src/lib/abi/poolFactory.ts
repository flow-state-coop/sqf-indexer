export const poolFactoryAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  {
    type: "function",
    name: "createPool",
    inputs: [
      {
        name: "metadata",
        type: "tuple",
        internalType: "struct StreamingQuadraticFunding.Metadata",
        components: [
          { name: "protocol", type: "uint256", internalType: "uint256" },
          { name: "pointer", type: "string", internalType: "string" },
        ],
      },
      { name: "_initData", type: "bytes", internalType: "bytes" },
    ],
    outputs: [
      {
        name: "poolAddress",
        type: "address",
        internalType: "contract StreamingQuadraticFunding",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getPool",
    inputs: [{ name: "_poolId", type: "uint256", internalType: "uint256" }],
    outputs: [
      {
        name: "pool",
        type: "tuple",
        internalType: "struct PoolFactory.Pool",
        components: [
          { name: "poolAddress", type: "address", internalType: "address" },
          {
            name: "metadata",
            type: "tuple",
            internalType: "struct StreamingQuadraticFunding.Metadata",
            components: [
              { name: "protocol", type: "uint256", internalType: "uint256" },
              { name: "pointer", type: "string", internalType: "string" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "initialize",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "poolCounter",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "proxiableUUID",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [{ name: "newOwner", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "upgradeTo",
    inputs: [
      { name: "newImplementation", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "upgradeToAndCall",
    inputs: [
      { name: "newImplementation", type: "address", internalType: "address" },
      { name: "data", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "event",
    name: "AdminChanged",
    inputs: [
      {
        name: "previousAdmin",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "newAdmin",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "BeaconUpgraded",
    inputs: [
      {
        name: "beacon",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Initialized",
    inputs: [
      { name: "version", type: "uint8", indexed: false, internalType: "uint8" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PoolCreated",
    inputs: [
      {
        name: "poolId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "poolAddress",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "token",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "metadata",
        type: "tuple",
        indexed: false,
        internalType: "struct StreamingQuadraticFunding.Metadata",
        components: [
          { name: "protocol", type: "uint256", internalType: "uint256" },
          { name: "pointer", type: "string", internalType: "string" },
        ],
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Upgraded",
    inputs: [
      {
        name: "implementation",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
] as const;
