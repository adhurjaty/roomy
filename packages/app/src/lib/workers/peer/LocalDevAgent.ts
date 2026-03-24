import { Agent } from "@atproto/api";

/**
 * Local development agent that overrides getProfile() to fetch from PDS repo
 * instead of AppView (which doesn't exist in local dev).
 */
export class LocalDevAgent extends Agent {
  constructor(session: any) {
    super(session);

    // Override getProfile as a property (not a method) to match Agent's signature
    this.getProfile = async ({ actor }: { actor: string }) => {
      console.debug('[LocalDevAgent] Fetching profile from PDS repo:', actor);

      try {
        // Fetch profile record from PDS repo
        const profileResp = await this.com.atproto.repo.getRecord({
          repo: actor,
          collection: "app.bsky.actor.profile",
          rkey: "self",
        });

        const profileData = profileResp.data.value as any;

        // Try to resolve handle from local PLC directory
        let handle = actor;
        try {
          const plcResp = await fetch(`http://localhost:3001/${actor}`);
          if (plcResp.ok) {
            const didDoc = await plcResp.json();
            const alsoKnownAs = didDoc.alsoKnownAs?.[0];
            if (alsoKnownAs?.startsWith("at://")) {
              handle = alsoKnownAs.replace("at://", "");
            }
          }
        } catch {
          console.debug('[LocalDevAgent] Could not resolve handle from PLC, using DID');
        }

        // Return in the same format as production agent.getProfile()
        return {
          success: true,
          headers: {},
          data: {
            did: actor,
            handle,
            displayName: profileData.displayName,
            description: profileData.description,
            avatar: profileData.avatar,
            banner: profileData.banner,
            followsCount: 0,
            followersCount: 0,
            postsCount: 0,
            indexedAt: new Date().toISOString(),
            labels: [],
          },
        };
      } catch (error) {
        console.error('[LocalDevAgent] Profile fetch failed:', error);
        return {
          success: false,
          headers: {},
          data: undefined as any,
        };
      }
    };
  }
}
