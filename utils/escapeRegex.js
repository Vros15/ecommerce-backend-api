// Escapes characters that carry meaning inside a regular expression so user
// supplied query values match literally. Without this, input like "a+++++++b"
// can be compiled into a pattern that backtracks catastrophically.
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = escapeRegex;
