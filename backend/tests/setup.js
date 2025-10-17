// Increase timeout to accommodate initial mongodb-memory-server download on CI/Windows
// Mocha root hooks setup so it works when loaded via --require
process.env.NODE_ENV = "test";
// Bind test server to an ephemeral port to avoid conflicts with local dev server
process.env.PORT = process.env.PORT || "0";
process.env.MONGOMS_DOWNLOAD_DIR =
  process.env.MONGOMS_DOWNLOAD_DIR ||
  require("path").join(require("os").homedir(), ".cache", "mongodb-binaries");

const mongoose = require("mongoose");
const mem = require("./mongoMemory");
const { app, startServer, stopServer } = require("../src/server");

let listener;

module.exports = {
  mochaHooks: {
    beforeAll: async function () {
      this.timeout(600000); // 10 minutes to allow initial MongoDB binary download
      await mem.start();
      listener = await startServer();
      // expose app globally for tests
      global.app = app;
    },
    afterAll: async function () {
      await mongoose.connection.dropDatabase().catch(() => {});
      await stopServer();
      await mem.stop();
    },
  },
};
