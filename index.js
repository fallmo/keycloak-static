const express = require("express");
const path = require("path");
const session = require("express-session");
const dotenv = require("dotenv");
const Keycloak = require("keycloak-connect");

dotenv.config();

const clientId = process.env.KEYCLOAK_CLIENT;
const serverUrl = process.env.KEYCLOAK_SERVER;
const realm = process.env.KEYCLOAK_REALM;
const sessionSecret = process.env.SESSION_SECRET;
const webRoot = process.env.WEB_ROOT;

if (!clientId) {
  console.log(`KEYCLOAK_CLIENT missing`);
  process.exit(1);
}
if (!serverUrl) {
  console.log(`KEYCLOAK_SERVER missing`);
  process.exit(1);
}
if (!realm) {
  console.log(`KEYCLOAK_REALM missing`);
  process.exit(1);
}
if (!sessionSecret) {
  console.log(`SESSION_SECRET missing`);
  process.exit(1);
}
if (!webRoot) {
  console.log(`WEB_ROOT missing`);
  process.exit(1);
}

const memoryStore = new session.MemoryStore();

const keycloak = new Keycloak(
  { store: memoryStore },
  {
    realm: realm,
    "auth-server-url": serverUrl,
    resource: clientId,
    "ssl-required": "external",
  }
);

const app = express();

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  })
);

app.get("/healthz", (req, res) => {
  res.sendStatus(200);
});

app.use(keycloak.middleware(), keycloak.protect(), express.static(webRoot));

app.get("*", keycloak.middleware(), keycloak.protect(), (req, res) => {
  res.sendFile(path.join(webRoot, "index.html"));
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, function () {
  console.log("App listening on port " + PORT);
});
