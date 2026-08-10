const { getAuth } = require("@clerk/express");
const AppError = require("../utils/AppError");

// Authentication and authorisation are separate questions. requireAuth proves
// the caller holds a valid session; this proves that session belongs to the one
// account allowed to write. Runs after requireAuth, so a userId is always set.
const requireAdmin = (req, res, next) => {
  const adminUserId = process.env.ADMIN_USER_ID;

  // Without the variable every caller, the admin included, would get a 403 that
  // reads like a permissions bug. Fail loudly, and still closed.
  if (!adminUserId) {
    return next(new AppError("Admin access is not configured.", 500, "ADMIN_NOT_CONFIGURED"));
  }

  const { userId } = getAuth(req);

  if (userId !== adminUserId) {
    return next(new AppError("Admin access required.", 403, "FORBIDDEN"));
  }

  next();
};

module.exports = requireAdmin;
