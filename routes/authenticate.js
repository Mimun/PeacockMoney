const authenticate = {
  "root": {
    "create": ["superAdmin", "admin", "member"],
    "page": [],
    "delete": [],
    "editInfo": "all",
    // evaluating item
    "importFiles": true,
    "crud": true
  },
  "superAdmin": {
    "create": ["admin", "member"],
    "page": [],
    "delete": [],
    "editInfo": "all",
    // evaluating item
    "importFiles": true,
    "crud": true

  },
  "admin": {
    "create": ["member"],
    "page": [],
    "delete": [],
    "editInfo": "all",
    // evaluating item
    "importFiles": true,
    "crud": true

  },
  "member": {
    "create": [],
    "page": [],
    "delete": [],
    "editInfo": "password",
     // evaluating item
     "importFiles": false,
     "crud": false

  }
}

exports.authenticate = authenticate