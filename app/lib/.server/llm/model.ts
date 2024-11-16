/*
 * @ts-nocheck
 * Preventing TS checks with files presented in the video for a better presentation.
 */
import { getAPIKey } from '~/lib/.server/llm/api-key';
import { createOpenAI } from '@ai-sdk/openai';

export function getOpenAIModel(apiKey: string, model: string) {
  const openai = createOpenAI({ apiKey });

  return openai(model);
}

export function getLaaSModel(apiKey: string, model: string) {
  const hash = '6b78a481bff4eaea68c393303b2a0dbd2b7bbdb6b5f52b143a4ec6bca4ba9a86';
  const openai = createOpenAI({
    apiKey,
    baseURL: 'https://api-laas.wanted.co.kr/api/preset/v2/',
    headers: {
      'Content-Type': 'application/json',
      project: 'BOLT_NEW',
      apiKey,
    },
    fetch: (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input instanceof URL ? input.toString() : input;

      const modifiedBody = init?.body
        ? typeof init.body === 'object'
          ? JSON.stringify({ ...init.body, hash })
          : init.body
        : JSON.stringify({ hash });

      return window.fetch(url, {
        ...init,
        body: modifiedBody,
      });
    },
  });

  return openai(model);
}

export function getModel(provider: string, model: string, env: Env) {
  const apiKey = getAPIKey(env, provider);
  return getLaaSModel(apiKey, model);
}
