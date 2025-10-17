// Increase timeout to accommodate initial mongodb-memory-server download on CI/Windows
// Mocha root hooks setup so it works when loaded via --require
process.env.NODE_ENV = "test";
// Ensure JWT secrets exist for tests (CI environments may not provide them)
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";
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
