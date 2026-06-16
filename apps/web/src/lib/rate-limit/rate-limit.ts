interface RateLimitConfig {
  interval: number;
  maxRequests: number;
}

const defaultConfig: RateLimitConfig = {
  interval: 60,
  maxRequests: 10,
};

const endpointLimits: Record<string, RateLimitConfig> = {
  "/api/auth/login": { interval: 60, maxRequests: 5 },
  "/api/auth/register": { interval: 60, maxRequests: 3 },
  "/api/auth/verify": { interval: 60, maxRequests: 5 },
  "/api/assessments": { interval: 60, maxRequests: 30 },
  "/api/payments": { interval: 60, maxRequests: 10 },
};

const requestCounts = new Map<string, { count: number; resetAt: number }>();

async function getRedisRateLimit(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig,
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  try {
    const { createClient } = await import("redis");
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) return fallbackRateLimit(identifier, endpoint, config);

    const client = createClient({ url: redisUrl });
    await client.connect();
    const key = `ratelimit:${endpoint}:${identifier}`;
    const now = Date.now();
    const window = now - config.interval * 1000;

    await client.zRemRangeByScore(key, 0, window);
    const count = await client.zCard(key);

    if (count >= config.maxRequests) {
      const oldest = await client.zRangeWithScores(key, 0, 0);
      await client.quit();
      const resetIn = oldest.length > 0
        ? Math.max(1, config.interval - Math.floor((now - oldest[0]!.score) / 1000))
        : config.interval;
      return { allowed: false, remaining: 0, resetIn };
    }

    await client.zAdd(key, { score: now, value: `${now}-${crypto.randomUUID()}` });
    await client.expire(key, config.interval * 2);
    await client.quit();

    return { allowed: true, remaining: config.maxRequests - count - 1, resetIn: config.interval };
  } catch {
    return fallbackRateLimit(identifier, endpoint, config);
  }
}

function fallbackRateLimit(
  identifier: string,
  _endpoint: string,
  config: RateLimitConfig,
): { allowed: boolean; remaining: number; resetIn: number } {
  const key = `${identifier}`;
  const now = Date.now();
  const entry = requestCounts.get(key);

  if (!entry || now > entry.resetAt) {
    requestCounts.set(key, { count: 1, resetAt: now + config.interval * 1000 });
    return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.interval };
  }

  entry.count++;
  if (entry.count > config.maxRequests) {
    const resetIn = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, resetIn };
  }

  return { allowed: true, remaining: config.maxRequests - entry.count, resetIn: Math.ceil((entry.resetAt - now) / 1000) };
}

export async function checkRateLimit(
  identifier: string,
  endpoint: string,
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const config = endpointLimits[endpoint] ?? defaultConfig;

  if (process.env.REDIS_URL) {
    return getRedisRateLimit(identifier, endpoint, config);
  }

  return fallbackRateLimit(identifier, endpoint, config);
}

export function rateLimitMiddleware(endpoint: string) {
  return async function rateLimit(
    request: Request,
  ): Promise<Response | null> {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? request.headers.get("x-real-ip")
      ?? "127.0.0.1";

    const result = await checkRateLimit(ip, endpoint);

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: "RATE_LIMITED",
            message: "Too many requests. Please try again later.",
            details: { retryAfter: result.resetIn },
          },
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(result.resetIn),
            "X-RateLimit-Remaining": String(result.remaining),
          },
        },
      );
    }

    return null;
  };
}
