const { MongoMemoryServer } = require("mongodb-memory-server");

let mongod;

module.exports = {
  async start() {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env.MONGODB_URI = uri;
    process.env.NODE_ENV = "test";
    return uri;
  },
  async stop() {
    if (mongod) {
      await mongod.stop();
      mongod = undefined;
    }
  },
};
