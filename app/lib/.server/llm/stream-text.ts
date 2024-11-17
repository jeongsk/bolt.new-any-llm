/*
 * @ts-nocheck
 * Preventing TS checks with files presented in the video for a better presentation.
 */
import { streamText as _streamText, convertToCoreMessages, type Attachment, type ToolInvocation } from 'ai';
import { getModel } from '~/lib/.server/llm/model';
import { DEFAULT_MODEL, MODEL_LIST } from '~/utils/constants';
import { MAX_TOKENS } from './constants';
import { getSystemPrompt } from './prompts';

interface ConvertibleMessage {
  role: "system" | "user" | "assistant" | "function" | "tool" | "data";
  content: string;
  toolInvocations?: ToolInvocation[];
  experimental_attachments?: Attachment[];
}

interface ToolResult<Name extends string, Args, Result> {
  toolCallId: string;
  toolName: Name;
  args: Args;
  result: Result;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolResult<string, unknown, unknown>[];
  model?: string;
}

export type Messages = Message[];

export type StreamingOptions = Omit<Parameters<typeof _streamText>[0], 'model'>;

function extractModelFromMessage(message: Message): { model: string; content: string } {
  const modelRegex = /^\[Model: (.*?)\]\n\n/;
  const match = message.content.match(modelRegex);

  if (match) {
    const model = match[1];
    const content = message.content.replace(modelRegex, '');

    return { model, content };
  }

  // Default model if not specified
  return { model: DEFAULT_MODEL, content: message.content };
}

export function streamText(messages: Messages, env: Env, options?: StreamingOptions) {
  let currentModel = DEFAULT_MODEL;
  const processedMessages = messages.map((message) => {
    if (message.role === 'user') {
      const { model, content } = extractModelFromMessage(message);

      if (model && MODEL_LIST.find((m) => m.name === model)) {
        currentModel = model; // Update the current model
      }

      return { ...message, content };
    }

    return message;
  }).map(msg => msg as ConvertibleMessage);

  return _streamText({
    model: getModel(currentModel, env),
    system: getSystemPrompt(),
    maxTokens: MAX_TOKENS,
    messages: convertToCoreMessages(processedMessages),
    ...options,
  });
}
