import axios from 'axios';
import { config } from '../../config';
import { ScraperResult } from './types';

/**
 * Instagram Commercial API Scraper (Apify)
 * Uses Apify's Instagram Profile Scraper actor via REST API.
 * Replaces brittle HTML scraping with a reliable commercial API.
 */

const APIFY_ACTOR_ID = 'apify~instagram-profile-scraper';
const TIMEOUT = 30000;

export async function scrapeInstagram(username: string): Promise<ScraperResult> {
  const clean = username.replace(/^@/, '').trim();
  const apiKey = config.instagramScraperApiKey;

  if (!apiKey) {
    throw new Error('INSTAGRAM_SCRAPER_API_KEY not configured');
  }

  // Start the actor run
  const runResponse = await axios.post(
    `${config.instagramScraperBaseUrl}/acts/${APIFY_ACTOR_ID}/runs`,
    { usernames: [clean], resultsLimit: 1 },
    { params: { token: apiKey }, timeout: TIMEOUT }
  );

  const runId = runResponse.data.data.id;

  // Poll for completion (max 60s)
  let dataset: any[] = [];
  const deadline = Date.now() + 60000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 3000));
    const statusRes = await axios.get(
      `${config.instagramScraperBaseUrl}/actor-runs/${runId}`,
      { params: { token: apiKey }, timeout: 10000 }
    );
    const status = statusRes.data.data.status;
    if (status === 'SUCCEEDED') {
      const datasetRes = await axios.get(
        `${config.instagramScraperBaseUrl}/datasets/${statusRes.data.data.defaultDatasetId}/items`,
        { params: { token: apiKey }, timeout: 10000 }
      );
      dataset = datasetRes.data;
      break;
    }
    if (status === 'FAILED' || status === 'ABORTED') {
      throw new Error('Scraper run failed');
    }
  }

  if (!dataset.length) {
    throw new Error('USER_NOT_FOUND');
  }

  const profile = dataset[0];
  return {
    username: clean,
    displayName: profile.fullName || undefined,
    bio: profile.biography || undefined,
    profilePicture: profile.profilePicUrl || undefined,
    followers: profile.followersCount,
    following: profile.followsCount,
    posts: profile.postsCount,
    isVerified: profile.verified,
    metadata: {
      isPrivate: profile.private,
      externalUrl: profile.externalUrl,
    },
  };
}
