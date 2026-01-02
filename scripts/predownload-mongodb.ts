import { mkdir } from "node:fs/promises";
import path from "node:path";
// @ts-ignore: No types available
import { MongoMemoryServer } from "mongodb-memory-server";

const downloadDir = process.env.MONGOMS_DOWNLOAD_DIR;
const version = process.env.MONGOMS_VERSION;

if (!downloadDir) {
  console.error("Missing required env var: MONGOMS_DOWNLOAD_DIR");
  process.exit(1);
}

if (!version) {
  console.error("Missing required env var: MONGOMS_VERSION");
  process.exit(1);
}

await mkdir(downloadDir, { recursive: true });

console.log(`Pre-downloading MongoDB binary v${version} into ${downloadDir}`);

const mongod = await MongoMemoryServer.create({
  binary: {
    downloadDir,
    version,
  },
});

console.log(`MongoDB binary download complete. Server started at: ${mongod.getUri()}`);

await mongod.stop();

console.log("MongoDB Memory Server stopped. Binary is cached for future use.");
