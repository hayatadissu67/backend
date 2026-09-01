// Simple in-memory rate limiting (for single-instance deployment)
// For production, use Redis-based rate limiting

const requests = new Map();

function getRateLimitKey(req) {
  return req.user?.id ? `user:${req.user.id}` : `ip:${req.ip}`;
}

export function rateLimit(windowMs = 60000, maxRequests = 100) {
  return (req, res, next) => {
    const key = getRateLimitKey(req);
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!requests.has(key)) {
      requests.set(key, []);
    }

    const userRequests = requests.get(key);
    const recentRequests = userRequests.filter(timestamp => timestamp > windowStart);

    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000),
      });
    }

    recentRequests.push(now);
    requests.set(key, recentRequests);

    // Cleanup old entries periodically
    if (Math.random() < 0.01) {
      for (const [k, v] of requests) {
        const recent = v.filter(t => t > windowStart);
        if (recent.length === 0) {
          requests.delete(k);
        } else {
          requests.set(k, recent);
        }
      }
    }

    next();
  };
}

// export default rateLimit;

