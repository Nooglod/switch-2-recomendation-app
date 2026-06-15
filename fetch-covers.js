/* fetch-covers.js — download RAWG cover art for every game that lacks a local jpg/png/avif */
const fs   = require("fs");
const path = require("path");
const https = require("https");

const RAWG_KEY = "8ed15142dbc54cf2bba1efd6816951f8";
const IMG_DIR  = path.join(__dirname, "images");

// Load game list by evaluating the games.js assignment into a temp global
const src = fs.readFileSync(path.join(__dirname, "games.js"), "utf8")
              .replace("window.GAMES", "global.GAMES");
eval(src);
const GAMES = global.GAMES;

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "fetch-covers/1.0" } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return get(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
    }).on("error", reject);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function hasLocal(id) {
  return ["avif","png","jpg"].some(ext => fs.existsSync(path.join(IMG_DIR, `${id}.${ext}`)));
}

async function fetchCover(game) {
  const search = encodeURIComponent(game.en || game.name);
  const url = `https://api.rawg.io/api/games?key=${RAWG_KEY}&search=${search}&page_size=1&search_precise=true`;
  const res = await get(url);
  if (res.status !== 200) { console.log(`  RAWG error ${res.status} for ${game.en}`); return null; }
  const data = JSON.parse(res.body.toString());
  return data.results && data.results[0] && data.results[0].background_image || null;
}

async function download(imgUrl, destPath) {
  const res = await get(imgUrl);
  if (res.status !== 200) { console.log(`  Download error ${res.status}`); return false; }
  fs.writeFileSync(destPath, res.body);
  return true;
}

(async () => {
  const todo = GAMES.filter(g => !hasLocal(g.id));
  console.log(`${GAMES.length} games total, ${todo.length} need covers.\n`);

  for (const game of todo) {
    process.stdout.write(`[${game.id}] ${game.name} ... `);
    try {
      const imgUrl = await fetchCover(game);
      if (!imgUrl) { console.log("no RAWG result"); await sleep(400); continue; }
      const ext  = (imgUrl.match(/\.(jpg|jpeg|png|webp)/i) || ["","jpg"])[1].replace("jpeg","jpg");
      const dest = path.join(IMG_DIR, `${game.id}.${ext}`);
      const ok   = await download(imgUrl, dest);
      console.log(ok ? `saved ${game.id}.${ext}` : "download failed");
    } catch (e) {
      console.log(`error: ${e.message}`);
    }
    await sleep(350); // stay well under RAWG rate limit
  }
  console.log("\nDone.");
})();
