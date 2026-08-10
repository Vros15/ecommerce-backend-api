const { clerkMiddleware, getAuth } = require("@clerk/express");
const AppError = require("../utils/AppError");

// Clerk cannot verify a token without its keys — the secret key signs the check
// and clerkMiddleware needs the publishable key to resolve the instance, so both
// are required. Answering with an explicit server error beats failing deep
// inside the SDK, and keeps the route closed rather than open when a deployment
// is missing either variable.
const requireClerkConfigured = (req, res, next) => {
  if (!process.env.CLERK_SECRET_KEY || !process.env.CLERK_PUBLISHABLE_KEY) {
    return next(new AppError("Authentication is not configured.", 500, "AUTH_NOT_CONFIGURED"));
  }

  next();
};

// clerkMiddleware only reads the token and marks the request signed out when it
// is missing, expired, or invalid — it never rejects — so the rejection is here.
const requireSignedIn = (req, res, next) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return next(new AppError("Authentication required.", 401, "UNAUTHENTICATED"));
  }

  next();
};

// Clerk's own requireAuth() redirects an unauthenticated caller to a sign-in
// page, which a JSON API cannot use, and is deprecated in @clerk/express v2.
// This composes the same pieces into the 401 the API contract promises. Express
// flattens the returned array into the route's middleware stack.
const requireAuth = () => [requireClerkConfigured, clerkMiddleware(), requireSignedIn];

module.exports = requireAuth;
