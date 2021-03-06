export type NamaphMultisig = {
  "version": "0.1.0",
  "name": "namaph_multisig",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "topology",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "multisig",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "membership",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "multisigProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "username",
          "type": "string"
        },
        {
          "name": "mapName",
          "type": "string"
        },
        {
          "name": "capacity",
          "type": "u8"
        },
        {
          "name": "nonce",
          "type": "u8"
        }
      ]
    },
    {
      "name": "updateTopology",
      "accounts": [
        {
          "name": "topology",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "u8"
        },
        {
          "name": "value",
          "type": "u8"
        }
      ]
    },
    {
      "name": "addMembershipAndCreateTransaction",
      "accounts": [
        {
          "name": "proposer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "multisig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "transaction",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "multisigProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "membership",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "username",
          "type": "string"
        },
        {
          "name": "user",
          "type": "publicKey"
        },
        {
          "name": "pid",
          "type": "publicKey"
        },
        {
          "name": "accs",
          "type": {
            "vec": {
              "defined": "TransactionAccountCpi"
            }
          }
        },
        {
          "name": "data",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "createTransaction",
      "accounts": [
        {
          "name": "membership",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "multisig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "transaction",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "multisigProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "pid",
          "type": "publicKey"
        },
        {
          "name": "accs",
          "type": {
            "vec": {
              "defined": "TransactionAccountCpi"
            }
          }
        },
        {
          "name": "data",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "approve",
      "accounts": [
        {
          "name": "multisig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "transaction",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "membership",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "wallet",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "multisigProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createTreasury",
      "accounts": [
        {
          "name": "treasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "multisig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "treasuryName",
          "type": "string"
        },
        {
          "name": "authority",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "spend",
      "accounts": [
        {
          "name": "treasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "to",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "membership",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "type": "publicKey"
          },
          {
            "name": "username",
            "type": "string"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "topology",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "mapName",
            "type": "string"
          },
          {
            "name": "capacity",
            "type": "u8"
          },
          {
            "name": "values",
            "type": "bytes"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "treasury",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "multisig",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "TransactionAccountCpi",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pubkey",
            "type": "publicKey"
          },
          {
            "name": "isWritable",
            "type": "bool"
          },
          {
            "name": "isSigner",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "StringTooLong",
      "msg": "string is too long"
    },
    {
      "code": 6001,
      "name": "BumpMismatch",
      "msg": "bump do not match"
    },
    {
      "code": 6002,
      "name": "NotEnoughBalanceInTreasury",
      "msg": "not enough balance"
    }
  ]
};

export const IDL: NamaphMultisig = {
  "version": "0.1.0",
  "name": "namaph_multisig",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "topology",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "multisig",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "membership",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "multisigProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "username",
          "type": "string"
        },
        {
          "name": "mapName",
          "type": "string"
        },
        {
          "name": "capacity",
          "type": "u8"
        },
        {
          "name": "nonce",
          "type": "u8"
        }
      ]
    },
    {
      "name": "updateTopology",
      "accounts": [
        {
          "name": "topology",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "u8"
        },
        {
          "name": "value",
          "type": "u8"
        }
      ]
    },
    {
      "name": "addMembershipAndCreateTransaction",
      "accounts": [
        {
          "name": "proposer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "multisig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "transaction",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "multisigProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "membership",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "username",
          "type": "string"
        },
        {
          "name": "user",
          "type": "publicKey"
        },
        {
          "name": "pid",
          "type": "publicKey"
        },
        {
          "name": "accs",
          "type": {
            "vec": {
              "defined": "TransactionAccountCpi"
            }
          }
        },
        {
          "name": "data",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "createTransaction",
      "accounts": [
        {
          "name": "membership",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "multisig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "transaction",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "multisigProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "pid",
          "type": "publicKey"
        },
        {
          "name": "accs",
          "type": {
            "vec": {
              "defined": "TransactionAccountCpi"
            }
          }
        },
        {
          "name": "data",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "approve",
      "accounts": [
        {
          "name": "multisig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "transaction",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "membership",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "wallet",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "multisigProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createTreasury",
      "accounts": [
        {
          "name": "treasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "multisig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "treasuryName",
          "type": "string"
        },
        {
          "name": "authority",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "spend",
      "accounts": [
        {
          "name": "treasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "to",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "membership",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "type": "publicKey"
          },
          {
            "name": "username",
            "type": "string"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "topology",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "mapName",
            "type": "string"
          },
          {
            "name": "capacity",
            "type": "u8"
          },
          {
            "name": "values",
            "type": "bytes"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "treasury",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "multisig",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "TransactionAccountCpi",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pubkey",
            "type": "publicKey"
          },
          {
            "name": "isWritable",
            "type": "bool"
          },
          {
            "name": "isSigner",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "StringTooLong",
      "msg": "string is too long"
    },
    {
      "code": 6001,
      "name": "BumpMismatch",
      "msg": "bump do not match"
    },
    {
      "code": 6002,
      "name": "NotEnoughBalanceInTreasury",
      "msg": "not enough balance"
    }
  ]
};
