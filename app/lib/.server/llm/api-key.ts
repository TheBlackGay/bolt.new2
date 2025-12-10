import { env } from 'node:process';

export function getAPIKey(cloudflareEnv: Env, provider: string) {
  /**
   * The `cloudflareEnv` is only used when deployed or when previewing locally.
   * In development the environment variables are available through `env`.
   */
  switch (provider) {
    case 'Anthropic':
      return env.ANTHROPIC_API_KEY || cloudflareEnv.ANTHROPIC_API_KEY;
    case 'OpenAI':
      return env.OPENAI_API_KEY || cloudflareEnv.OPENAI_API_KEY;
    case 'Google':
      return env.GOOGLE_GENERATIVE_AI_API_KEY || cloudflareEnv.GOOGLE_GENERATIVE_AI_API_KEY;
    case 'OpenAICompatible':
      // OpenAI Compatible can work without API key for local deployments
      return env.OPENAI_COMPATIBLE_API_KEY || cloudflareEnv.OPENAI_COMPATIBLE_API_KEY || '';
    default:
      return env.ANTHROPIC_API_KEY || cloudflareEnv.ANTHROPIC_API_KEY;
  }
}
