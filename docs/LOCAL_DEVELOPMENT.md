# Local Development Environment

Complete local AT Protocol stack with pre-populated test accounts for offline development.

## Quick Start

### One-Time Setup

```bash
# Create Docker network (only needed once)
docker network create roomy-dev

# Start services and create pre-populated accounts
pnpm dev:local
```

This will:
1. Start PDS, Leaf, and PLC services in Docker
2. Create 5 test accounts with pre-populated data
3. Start the Roomy app

### Login

Use any of these pre-created accounts:

| Handle | Password | Persona |
|--------|----------|---------|
| alice.localhost | password-alice | Team Lead |
| bob.localhost | password-bob | Developer |
| carol.localhost | password-carol | Designer |
| dave.localhost | password-dave | Product Manager |
| eve.localhost | password-eve | QA Engineer |

## What Gets Created

Each account gets:
- **2 spaces** with themed content
- **3-5 channels** per space
- **1-2 threads** with replies
- **1 page** with markdown content
- **15-25 messages** with realistic timestamps
- **Reactions** on ~40% of messages

### Account Spaces

**Alice (Team Lead):**
- Welcome to Roomy
- Alice's Projects (tasks, updates, sprint planning)

**Bob (Developer):**
- Welcome to Roomy
- Bob's Workshop (ideas, experiments)

**Carol (Designer):**
- Welcome to Roomy
- Community Hub (chat, events, introductions)

**Dave (Product Manager):**
- Welcome to Roomy
- Dave's Roadmap (planning, features, feedback)

**Eve (QA Engineer):**
- Welcome to Roomy
- Testing Space (test cases, bug reports, automation)

## Architecture

```
┌─────────────────────────────────────────────────┐
│           Docker Network: roomy-dev             │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │   PDS    │  │   Leaf   │  │   PLC    │     │
│  │  :2583   │  │  :5530   │  │  :3001   │     │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘     │
│       │             │              │            │
└───────┼─────────────┼──────────────┼────────────┘
        │             │              │
     Host:2583    Host:5530      Host:3001
```

## Manual Setup (Alternative)

If you prefer to run steps separately:

```bash
# 1. Start services
docker compose up -d

# 2. Wait for services to be ready
curl http://localhost:2583/xrpc/_health  # PDS
curl http://localhost:5530/_health        # Leaf
curl http://localhost:3001/_health        # PLC

# 3. Create accounts and seed data
pnpm setup:local-dev

# 4. Configure app for local PDS
cd packages/app
# Edit .env and uncomment the "Local Development" section

# 5. Start app
pnpm dev
```

## Commands

### Development

```bash
# Start everything (one command)
pnpm dev:local

# Start just the services
docker compose up -d

# Stop services
docker compose down

# Reset everything (destroy volumes, re-seed)
pnpm setup:local-dev:reset
```

### Logs

```bash
# PDS logs
pnpm pds:logs

# Leaf logs
docker compose logs leaf-server -f

# PLC logs
docker compose logs plc-directory -f

# All services
docker compose logs -f
```

### Data Management

```bash
# Re-seed accounts (accounts must already exist)
pnpm setup:local-dev

# Complete reset (destroys all data and recreates)
pnpm setup:local-dev:reset
```

## Configuration

### App Configuration

Update `packages/app/.env` to use local services:

```bash
# Local Development (uncomment these)
PUBLIC_PDS="http://localhost:2583"
PUBLIC_PDS_HANDLE_SUFFIX=".localhost"
VITE_LEAF_URL=http://localhost:5530
```

### Service URLs

| Service | Container URL | Host URL |
|---------|--------------|----------|
| PDS | http://pds:2583 | http://localhost:2583 |
| Leaf | http://leaf-server:5530 | http://localhost:5530 |
| PLC | http://plc-directory:3000 | http://localhost:3001 |

## Troubleshooting

### Services Won't Start

```bash
# Check if Docker is running
docker ps

# Check if network exists
docker network ls | grep roomy-dev

# Create network if missing
docker network create roomy-dev

# Check service logs
docker compose logs pds
docker compose logs leaf-server
docker compose logs plc-directory
```

### PDS Not Accessible

```bash
# Check PDS health
curl http://localhost:2583/xrpc/_health

# Check PDS logs
docker compose logs pds -f

# Restart PDS
docker compose restart pds
```

### Account Creation Fails

```bash
# Check if PDS and PLC are both running
curl http://localhost:2583/xrpc/_health
curl http://localhost:3001/_health

# Check credentials file was created
cat .dev-credentials.json

# Try creating manually
pnpm setup:local-dev
```

### Leaf Connection Fails

```bash
# Check Leaf health
curl http://localhost:5530/_health

# Check Leaf logs
docker compose logs leaf-server -f

# Verify Leaf DID configuration
# Should be: did:web:localhost
```

### App Can't Connect

Common issues:

1. **Wrong PDS URL in .env**
   - Make sure `PUBLIC_PDS="http://localhost:2583"`
   - Not `https://`, not a different port

2. **Services not running**
   ```bash
   docker compose ps
   # All services should show "Up"
   ```

3. **Port conflicts**
   ```bash
   # Check if ports are in use
   lsof -i :2583  # PDS
   lsof -i :5530  # Leaf
   lsof -i :3001  # PLC
   ```

### Reset Everything

If things are broken, nuclear option:

```bash
# Stop and remove everything
docker compose down -v

# Remove credentials
rm .dev-credentials.json

# Start fresh
docker compose up -d
pnpm setup:local-dev
```

## Advanced

### Custom Account Data

Edit `/packages/app/src/lib/workers/seed/multi-account-data.ts` to customize:
- Account personas
- Space themes
- Message content
- Room structures

### Add More Accounts

Edit `ACCOUNT_PERSONAS` in `multi-account-data.ts`:

```typescript
{
  name: "Frank",
  handle: "frank.localhost",
  spaces: [
    {
      name: "Welcome to Roomy",
      description: "Your first space!",
      theme: "welcome",
    },
    // Add more spaces...
  ],
}
```

Then run:
```bash
pnpm setup:local-dev
```

### Network Configuration

Services communicate via Docker network `roomy-dev`. If you need to change this:

1. Update `compose.yaml` networks section
2. Update PDS environment variables for service URLs
3. Recreate network: `docker network rm roomy-dev && docker network create roomy-dev`

## Performance

- **Setup time**: 3-5 minutes for 5 accounts
- **Account creation**: ~30 seconds per account
- **Data seeding**: ~1 minute per account
- **Memory usage**: ~500MB total (PDS 200MB, Leaf 150MB, PLC 100MB)

## Security Notes

This setup is for **local development only**:

- No authentication on admin endpoints
- Weak JWT secrets
- Open invitation (no invite codes required)
- No rate limiting
- No HTTPS/TLS

**Never expose these services to the internet.**

## Data Persistence

Data is stored in Docker volumes:
- `pds-data`: Account data, records
- `leaf-data`: Event streams
- `plc-db-data`: DID registry

To clear all data:
```bash
docker compose down -v
```

## Next Steps

After setup:
1. Explore the pre-populated spaces
2. Test multi-account scenarios (login as different users)
3. Create new spaces and channels
4. Test real-time updates across accounts
5. Debug without internet dependency

## See Also

- [PDS Documentation](../pds/README.md)
- [Seed Data System](../packages/app/src/lib/workers/seed/README.md)
- [AT Protocol Docs](https://atproto.com/)
