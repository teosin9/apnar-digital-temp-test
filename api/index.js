// Vercel serverless entry for the TEMP test copy only.
// It reuses the same handleRequest from server.js (no code duplicated).
// Vercel functions are stateless: data in /tmp is per-instance and ephemeral.
// This is for temporary testing only, NOT for the real client deploy.
module.exports = require('../server.js');
