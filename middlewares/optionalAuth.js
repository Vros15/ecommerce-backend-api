const { clerkMiddleware, getAuth } = require("@clerk/express");

// Checkout must keep working for guests, and must keep working even if
// Clerk isn't configured in a given environment - unlike requireAuth, this
// never rejects the request. It only ever adds req.clerkUserId when it can.
const optionalAuth = () => (req, res, next) => {
  if (!process.env.CLERK_SECRET_KEY || !process.env.CLERK_PUBLISHABLE_KEY) {
    req.clerkUserId = null;
    return next();
  }

  clerkMiddleware()(req, res, (err) => {
    if (err) return next(err);

    const { userId } = getAuth(req);
    req.clerkUserId = userId || null;
    next();
  });
};

module.exports = optionalAuth;
