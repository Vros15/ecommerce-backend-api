// Shared between the query validator and the products controller so the limit
// enforced at validation and the limit applied to the query cannot drift apart.
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

module.exports = { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT };
