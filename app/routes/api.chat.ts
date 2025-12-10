import { type ActionFunctionArgs } from '@remix-run/cloudflare';
import { MAX_RESPONSE_SEGMENTS, MAX_TOKENS } from '~/lib/.server/llm/constants';
import { CONTINUE_PROMPT } from '~/lib/.server/llm/prompts';
import { streamText, type Messages, type StreamingOptions } from '~/lib/.server/llm/stream-text';
import type { ModelConfig } from '~/lib/.server/llm/model';
import SwitchableStream from '~/lib/.server/llm/switchable-stream';

export async function action(args: ActionFunctionArgs) {
  return chatAction(args);
}

/**
 * Chat action handler
 * Implements streaming chat with AI models following AI SDK best practices
 */
async function chatAction({ context, request }: ActionFunctionArgs) {
  const { messages, modelConfig, apiKey, customEndpoint } = await request.json<{ 
    messages: Messages;
    modelConfig?: Partial<ModelConfig>;
    apiKey?: string;
    customEndpoint?: { baseURL?: string; apiKey?: string };
  }>();

  const stream = new SwitchableStream();

  try {
    const maxTokenLimit = modelConfig?.maxTokens || MAX_TOKENS;

    const options: StreamingOptions = {
      toolChoice: 'none',
      onFinish: async ({ text: content, finishReason }) => {
        if (finishReason !== 'length') {
          return stream.close();
        }

        if (stream.switches >= MAX_RESPONSE_SEGMENTS) {
          throw Error('Cannot continue message: Maximum segments reached');
        }

        const switchesLeft = MAX_RESPONSE_SEGMENTS - stream.switches;

        console.log(`Reached max token limit (${maxTokenLimit}): Continuing message (${switchesLeft} switches left)`);

        messages.push({ role: 'assistant', content });
        messages.push({ role: 'user', content: CONTINUE_PROMPT });

        const result = await streamText(
          messages, 
          context.cloudflare.env, 
          options, 
          apiKey,
          modelConfig,
          customEndpoint
        );

        return stream.switchSource(result.toAIStream());
      },
    };

    const result = await streamText(
      messages, 
      context.cloudflare.env, 
      options, 
      apiKey,
      modelConfig,
      customEndpoint
    );

    stream.switchSource(result.toAIStream());

    return new Response(stream.readable, {
      status: 200,
      headers: {
        contentType: 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Chat API Error:', error);

    // Return more informative error messages
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined 
      }), 
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
