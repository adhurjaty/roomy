/**
 * PDS admin utilities for local development.
 * Provides functions to create accounts and manage the local PDS.
 */

import { AtpAgent } from "@atproto/api";

export interface CreateAccountParams {
  pdsUrl: string;
  handle: string;
  password: string;
  email?: string;
}

export interface CreateAccountResult {
  did: string;
  handle: string;
  accessJwt: string;
  refreshJwt: string;
}

/**
 * Create a new account on the local PDS.
 */
export async function createAccount(
  params: CreateAccountParams,
): Promise<CreateAccountResult> {
  const { pdsUrl, handle, password, email } = params;

  const agent = new AtpAgent({ service: pdsUrl });

  try {
    const response = await agent.createAccount({
      handle,
      password,
      email: email || `${handle.split('.')[0]}@example.com`,
    });

    return {
      did: response.data.did,
      handle: response.data.handle,
      accessJwt: response.data.accessJwt,
      refreshJwt: response.data.refreshJwt,
    };
  } catch (error: any) {
    throw new Error(
      `Failed to create account ${handle}: ${error?.message || error}`,
    );
  }
}

/**
 * Create an app password for an account.
 */
export async function createAppPassword(
  pdsUrl: string,
  accessJwt: string,
  name: string,
): Promise<{ password: string }> {
  const agent = new AtpAgent({ service: pdsUrl });
  agent.session = {
    did: "",
    handle: "",
    email: undefined,
    emailConfirmed: false,
    emailAuthFactor: false,
    accessJwt,
    refreshJwt: "",
  };

  try {
    const response = await agent.com.atproto.server.createAppPassword({
      name,
    });

    return {
      password: response.data.password,
    };
  } catch (error: any) {
    throw new Error(
      `Failed to create app password: ${error?.message || error}`,
    );
  }
}

/**
 * Check if PDS is accessible and healthy.
 */
export async function checkPdsHealth(pdsUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${pdsUrl}/xrpc/_health`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Check if Leaf server is accessible and healthy.
 */
export async function checkLeafHealth(leafUrl: string): Promise<boolean> {
  try {
    const response = await fetch(leafUrl, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    // Leaf returns 200 for GET / but 404 for _health
    // Just check if we can connect (any non-error response)
    return response.status < 500;
  } catch (error) {
    return false;
  }
}

/**
 * Check if PLC directory is accessible and healthy.
 */
export async function checkPlcHealth(plcUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${plcUrl}/_health`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}
