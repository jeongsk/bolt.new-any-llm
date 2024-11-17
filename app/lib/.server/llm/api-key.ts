/*
 * @ts-nocheck
 * Preventing TS checks with files presented in the video for a better presentation.
 */
import { env } from 'node:process';

export function getAPIKey(cloudflareEnv: Env) {
  return env.LAAS_API_KEY || cloudflareEnv.LAAS_API_KEY;
}
