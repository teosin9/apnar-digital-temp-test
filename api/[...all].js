// Vercel catch-all for /api/* routes.
// Vercel routes /api/services etc. to api/* functions first, before vercel.json
// rewrites, so /api/index.js alone never saw them (hence 404). This file
// exports the same handler, so every /api/* path reaches server.js.
module.exports = require('../server.js');
