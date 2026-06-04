/* config.js — settings for live game cover art.
 *
 * The app can pull real game covers at runtime from RAWG.io (a free games database).
 *
 * HOW TO ENABLE:
 *   1. Go to https://rawg.io/apidocs  → sign up (free) → copy your API key.
 *   2. Paste it between the quotes below.
 *   3. Refresh index.html. Covers load automatically; the generated covers stay
 *      as a fallback for any game RAWG can't match (or when you're offline).
 *
 * Leave it as "" to just use the bundled generated covers.
 */
window.RAWG_API_KEY = "8ed15142dbc54cf2bba1efd6816951f8";
