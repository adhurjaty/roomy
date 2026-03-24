/**
 * Local development environment setup script.
 * Creates pre-populated accounts on local PDS with seed data.
 *
 * Usage:
 *   pnpm setup:local-dev
 *   pnpm setup:local-dev:reset  # Reset everything and re-seed
 */

import "dotenv/config";
import { AtpAgent } from "@atproto/api";
import { RoomyClient } from "@roomy/sdk";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  createAccount,
  checkPdsHealth,
  checkLeafHealth,
  checkPlcHealth,
} from "./pds-admin.js";
import { ACCOUNT_PERSONAS, generateSeedDataForAccount } from "./seed/multi-account-data.js";
import { executeSeed } from "./seed/execute.js";

const PDS_URL = "http://localhost:2583";
const LEAF_URL = "http://localhost:5530";
const PLC_URL = "http://localhost:3001";
const STREAM_NSID = "space.roomy.space.personal.dev";
const PROFILE_SPACE_NSID = "space.roomy.profileSpace.dev";
const STREAM_SCHEMA_VERSION = "4";

// Helper to add timeout to promises
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMsg: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMsg)), timeoutMs)
    ),
  ]);
}

interface AccountCredentials {
  handle: string;
  password: string;
  did: string;
}

interface CredentialsFile {
  pds_url: string;
  leaf_url: string;
  accounts: AccountCredentials[];
}

async function main() {
  console.log("=== Roomy Local Development Setup ===\n");

  // Check if services are accessible
  console.log("Checking services...");
  const [pdsHealthy, leafHealthy, plcHealthy] = await Promise.all([
    checkPdsHealth(PDS_URL),
    checkLeafHealth(LEAF_URL),
    checkPlcHealth(PLC_URL),
  ]);

  if (!pdsHealthy) {
    console.error("❌ PDS is not accessible at", PDS_URL);
    console.error("   Run: docker compose up -d");
    process.exit(1);
  }
  console.log("✓ PDS is accessible");

  if (!leafHealthy) {
    console.error("❌ Leaf server is not accessible at", LEAF_URL);
    console.error("   Run: docker compose up -d");
    process.exit(1);
  }
  console.log("✓ Leaf server is accessible");

  if (!plcHealthy) {
    console.error("❌ PLC directory is not accessible at", PLC_URL);
    console.error("   Run: docker compose up -d");
    process.exit(1);
  }
  console.log("✓ PLC directory is accessible\n");

  const credentials: CredentialsFile = {
    pds_url: PDS_URL,
    leaf_url: LEAF_URL,
    accounts: [],
  };

  const leafDid = `did:web:localhost`;

  // Create and seed each account
  for (let i = 0; i < ACCOUNT_PERSONAS.length; i++) {
    const persona = ACCOUNT_PERSONAS[i];
    const password = `password-${persona.name.toLowerCase()}`;

    console.log(`\n[${ i + 1}/${ACCOUNT_PERSONAS.length}] Setting up ${persona.name} (${persona.handle})...`);

    let accountDid: string;
    let agent: AtpAgent;

    try {
      // Try to authenticate first (account may already exist)
      console.log("  Checking if account exists...");
      agent = new AtpAgent({ service: PDS_URL });
      try {
        await agent.login({
          identifier: persona.handle,
          password,
        });
        accountDid = agent.session!.did;
        console.log(`  ✓ Account already exists: ${accountDid}`);
      } catch (loginError: any) {
        // Account doesn't exist, create it
        console.log("  Creating account...");
        const account = await createAccount({
          pdsUrl: PDS_URL,
          handle: persona.handle,
          password,
          email: `${persona.name.toLowerCase()}@example.com`,
        });
        accountDid = account.did;
        console.log(`  ✓ Account created: ${accountDid}`);

        // Re-authenticate with the new account
        await agent.login({
          identifier: persona.handle,
          password,
        });
      }

      console.log("  ✓ Authenticated");

      // Create RoomyClient with timeout
      console.log("  Connecting to Leaf...");
      const client = await withTimeout(
        RoomyClient.create({
          agent,
          leafUrl: LEAF_URL,
          leafDid,
          spaceNsid: STREAM_NSID,
          profileSpaceNsid: PROFILE_SPACE_NSID,
        }),
        30000,
        "Timeout: Leaf authentication took too long (30s). This might indicate a configuration issue."
      );
      console.log("  ✓ Connected to Leaf");

      // Connect to personal space
      console.log("  Connecting to personal space...");
      const personalSpace = await client.connectPersonalSpace(STREAM_SCHEMA_VERSION);
      console.log("  ✓ Connected to personal space");

      // Generate and execute seed data
      console.log("  Generating seed data...");
      const seedData = generateSeedDataForAccount(persona.name, i);
      console.log(`  ✓ Generated ${seedData.spaces.length} spaces, ${seedData.rooms.length} rooms, ${seedData.messages.length} messages`);

      console.log("  Seeding data...");
      await executeSeed(client, personalSpace, seedData);
      console.log("  ✓ Data seeded");

      // Save credentials
      credentials.accounts.push({
        handle: persona.handle,
        password,
        did: accountDid,
      });

      console.log(`✅ ${persona.name} setup complete!`);
    } catch (error: any) {
      console.error(`❌ Failed to setup ${persona.name}:`, error?.message || error);
      // Continue with other accounts
    }
  }

  // Save credentials to file
  const credentialsPath = join(process.cwd(), ".dev-credentials.json");
  writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2));
  console.log(`\n✅ Credentials saved to: .dev-credentials.json`);

  // Print summary
  console.log("\n=== Setup Complete! ===\n");
  console.log("Available accounts:");
  for (const account of credentials.accounts) {
    console.log(`  • ${account.handle} / password-${account.handle.split('.')[0]}`);
  }
  console.log("\nTo start developing:");
  console.log("  1. cd packages/app");
  console.log("  2. Update .env to use local PDS (uncomment local dev section)");
  console.log("  3. pnpm dev");
  console.log("  4. Login with any account above");
  console.log("\n✨ Happy coding!");
}

main().catch((error) => {
  console.error("\n❌ Fatal error:", error);
  process.exit(1);
});
