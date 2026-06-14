#!/usr/bin/env node
// fill-youtube.js — auto-fills missing YouTube trailer URLs in games.js
//
// Setup (one time):
//   1. Go to https://console.cloud.google.com
//   2. Create a project → Enable "YouTube Data API v3"
//   3. Create an API key under Credentials
//
// Run:
//   YOUTUBE_API_KEY=your_key_here node fill-youtube.js

const fs   = require("fs");
const path = require("path");

const API_KEY = process.env.YOUTUBE_API_KEY;
if (!API_KEY) {
  console.error("\n❌  Set your API key first:\n");
  console.error("   YOUTUBE_API_KEY=your_key_here node fill-youtube.js\n");
  console.error("Get a free key at https://console.cloud.google.com (YouTube Data API v3)\n");
  process.exit(1);
}

// ── Search YouTube and return an embed URL ────────────────────────────────────
async function findTrailer(searchTerm) {
  const query = `${searchTerm} Nintendo Switch official trailer`;
  const url =
    "https://www.googleapis.com/youtube/v3/search" +
    "?part=snippet&type=video&maxResults=1" +
    "&q=" + encodeURIComponent(query) +
    "&key=" + API_KEY;

  const res  = await fetch(url);
  const data = await res.json();

  if (data.error) throw new Error(data.error.message);
  const videoId = data.items?.[0]?.id?.videoId;
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const gamesPath = path.join(__dirname, "games.js");
  let content = fs.readFileSync(gamesPath, "utf8");

  // Parse the games array from games.js (the array is valid JSON after the assignment)
  const marker = "window.GAMES = [";
  const start  = content.indexOf(marker) + marker.length - 1;
  const end    = content.lastIndexOf("]") + 1;
  const games  = JSON.parse(content.slice(start, end));

  const missing = games.filter(g => g.youtube.includes("VIDEO_ID"));

  if (missing.length === 0) {
    console.log("✅  All games already have YouTube URLs!");
    return;
  }

  console.log(`\nFound ${missing.length} game(s) missing a trailer URL:\n`);

  let saved = 0;
  for (const game of missing) {
    const searchTerm = game.en || game.name;
    process.stdout.write(`  🔍  ${searchTerm} ... `);

    try {
      const embedUrl = await findTrailer(searchTerm);
      if (embedUrl) {
        // Replace the placeholder URL in the file content
        content = content.replace(`"${game.youtube}"`, `"${embedUrl}"`);
        console.log(`✓  ${embedUrl.split("/").pop()}`);
        saved++;
      } else {
        console.log("✗  no result found");
      }
    } catch (err) {
      console.log(`✗  error: ${err.message}`);
    }

    // Small delay to stay within API rate limits
    await new Promise(r => setTimeout(r, 300));
  }

  fs.writeFileSync(gamesPath, content, "utf8");
  console.log(`\n✅  Done! Updated ${saved} / ${missing.length} URLs in games.js\n`);
}

main().catch(err => {
  console.error("\n❌  Unexpected error:", err.message);
  process.exit(1);
});
