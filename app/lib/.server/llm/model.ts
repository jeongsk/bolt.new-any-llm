/*
 * @ts-nocheck
 * Preventing TS checks with files presented in the video for a better presentation.
 */
import { createOpenAI } from '@ai-sdk/openai';
import { getAPIKey } from '~/lib/.server/llm/api-key';

export function getOpenAIModel(apiKey: string, model: string) {
  const openai = createOpenAI({ apiKey });

  return openai(model);
}

function parseRequestBody(body?: BodyInit | Record<string, any> | null | undefined): Record<string, any> {
  if (!body) return {};

  try {
    if (typeof body === 'string') {
      return JSON.parse(body);
    }

    if (body instanceof FormData || body instanceof URLSearchParams) {
      return Object.fromEntries(body);
    }

    if (typeof body === 'object' && !ArrayBuffer.isView(body)) {
      return body as Record<string, any>;
    }

    throw new Error('Unsupported body type');
  } catch (error) {
    console.error('Error parsing request body:', error);
    return {};
  }
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

      const body = parseRequestBody(init?.body);
      const modifiedBody = JSON.stringify({ ...body, hash });

      return fetch(url, {
        ...init,
        body: modifiedBody,
      });
    },
  });

  return openai(model);
}

export function getModel(model: string, env: Env) {
  const apiKey = getAPIKey(env);
  return getLaaSModel(apiKey, model);
}
