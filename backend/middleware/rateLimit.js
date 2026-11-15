const HttpError = require('../utils/httpError');

// ponytail: in-memory, per-process counter; move to Redis if the API runs on more than one instance.
function rateLimit({ windowMs, max }) {
  const hits = new Map();

  setInterval(() => hits.clear(), windowMs).unref();

  return function limiter(req, res, next) {
    const key = req.ip;
    const count = (hits.get(key) || 0) + 1;
    hits.set(key, count);

    if (count > max) {
      return next(new HttpError(429, 'Too many attempts. Please try again later.'));
    }

    return next();
  };
}

module.exports = rateLimit;
