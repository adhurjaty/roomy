import type { Agent } from "@atproto/api";

/**
 * Detects if we're running in local development environment by checking
 * if the PDS URL is localhost.
 *
 * Accepts either an Agent or a session object.
 */
export function isLocalDev(agentOrSession: Agent | any): boolean {
  // Try to get sessionManager from agent or use session directly
  const sessionManager = (agentOrSession as any).sessionManager || agentOrSession;

  if (!sessionManager?.server?.serverMetadata?.issuer) {
    return false;
  }

  const pdsUrl = sessionManager.server.serverMetadata.issuer;
  return pdsUrl.includes('localhost') || pdsUrl.includes('127.0.0.1');
}
