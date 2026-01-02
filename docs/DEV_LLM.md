# LLM Development Environment

The `dev:llm` script sets up a complete development environment with in-memory MongoDB and pre-seeded mock data, perfect for LLM agents to interact with and test the application.

## Usage

From the repository root:

```bash
bun run dev:llm
```

Or from the server directory:

```bash
cd apps/server
bun run llm
```

## What It Does

1. **Creates In-Memory MongoDB**: Spins up a MongoMemoryServer instance (no external MongoDB required)
2. **Initializes Server**: Loads all server components (authentication, services, routers)
3. **Seeds Mock Data**:
   - 3 test users (Alice, Bob, Charlie)
   - 2 series (Detective Chronicles, Space Adventure)
   - 3 scripts with screenplay content
   - 3 characters with traits and descriptions
   - 2 locations
   - 2 props
   - Character relationships and appearances
   - Timeline entries
   - World-building notes
   - Canvas visualization with story structure
4. **Starts API Server**: Runs on http://localhost:3000

## Test Credentials

```
Alice:   alice@example.com / password123
Bob:     bob@example.com / password123
Charlie: charlie@example.com / password123
```

## Available Endpoints

- **Server**: http://localhost:3000
- **API**: http://localhost:3000/api
- **API Docs**: http://localhost:3000/api/reference
- **RPC**: http://localhost:3000/api/rpc
- **Auth**: http://localhost:3000/auth/*

## Known Issues

### MongoDB Binary Download

The script uses a workspace-local cache at `apps/server/.mongodb-binaries` so agents do **not** need outbound network access at runtime. On first run the binary (~100MB) must be downloaded into that folder.

**Solutions:**

1. **Pre-download to the workspace path (recommended for CI and Copilot agents):**

   ```bash
   export MONGOMS_DOWNLOAD_DIR=apps/server/.mongodb-binaries
   export MONGOMS_VERSION=7.0.14
   bunx mongodb-memory-server-download --downloadDir "$MONGOMS_DOWNLOAD_DIR" --version "$MONGOMS_VERSION"
   ```

   Cache `apps/server/.mongodb-binaries` if your CI allows it; this folder is inside the repo workspace so it is preserved for downstream agent runs.

2. **Use system MongoDB** (alternative):

   - Instead of in-memory MongoDB, connect to a local MongoDB instance
   - Modify `dev-llm.ts` to use `mongoose.connect('mongodb://localhost:27017/kaeri-dev')`

3. **Network-restricted environments:**
   - Point `MONGOMS_DOWNLOAD_MIRROR` to an internal mirror if external downloads are blocked
   - Ensure `MONGOMS_DOWNLOAD_DIR` is writable inside the workspace

### Network Restrictions

If you see `ECONNREFUSED` or download errors:

- Check firewall/proxy settings
- Try setting `MONGOMS_DOWNLOAD_URL` environment variable to a mirror
- Use a VPN or different network

## Development Tips

- The script keeps running until you press Ctrl+C
- Data is seeded fresh on each run (in-memory, ephemeral)
- Perfect for testing API endpoints, taking screenshots, or demonstrating features
- All test data follows the same patterns as the integration tests

## Script Architecture

```
dev-llm.ts
├── Environment Setup (NODE_ENV=test)
├── MongoDB Memory Server Creation
├── Server Component Loading (loaders)
├── User Creation (Better Auth)
├── Content Seeding (series, scripts, KB entries)
└── Server Start (Bun.serve)
```

## For LLM Agents

This environment provides:

- Fully functioning API with realistic data
- Multiple users to test permissions and collaboration
- Complete screenplay data with characters, locations, and relationships
- Canvas/visualization data
- Timeline and world-building notes

Use it to:

- Test API endpoints
- Generate screenshots
- Validate functionality
- Demonstrate features
- Test authentication flows
