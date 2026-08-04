// Vercel serverless entry point. The platform invokes the exported handler per
// request, so the app must not listen here. Local development still runs
// index.js, which attaches a listener to this same app.
module.exports = require("../app");
