const authenticate = {
  "root": {
    "create": ["superAdmin", "admin", "member"],
    "page": [],
    "delete": [],
    "editInfo": "all",
  },
  "superAdmin": {
    "create": ["admin", "member"],
    "page": [],
    "delete": [],
    "editInfo": "all",

  },
  "admin": {
    "create": ["member"],
    "page": [],
    "delete": [],
    "editInfo": "all",

  },
  "member": {
    "create": [],
    "page": [],
    "delete": [],
    "editInfo": "password",

  }
}

exports.authenticate = authenticate