import { useCallback, useRef, useState } from "react";

// ─────────────────────────────────────────────
// COVER RESOLUTION
//
// The dataset originally carried a `igdb` image hash per game, meant
// to hotlink IGDB's public CDN directly. Those hashes turned out to
// be fabricated (they resolved to unrelated images — e.g. "Bayonetta
// 3" showed a Five Nights at Freddy's screenshot), so they are no
// longer used at all.
//
// Primary source: RAWG.io's public games API (https://rawg.io/apidocs),
// searched by title. Requires a free API key — set VITE_RAWG_API_KEY
// at build time (see .env.example). Without a key configured, cover
// lookup falls back straight to Wikipedia.
//
// Fallback: Wikipedia's public REST/Action API for the lead image of
// the matching article. Free, no API key, CORS-friendly (origin=*).
// Less precise than RAWG (can match the wrong article for ambiguous
// or non-English titles), used only when RAWG has no key configured
// or returns no result.
// ─────────────────────────────────────────────

const RAWG_API_KEY = import.meta.env.VITE_RAWG_API_KEY;
const RAWG_API = "https://api.rawg.io/api/games";
const WIKI_API = "https://en.wikipedia.org/w/api.php";
const CACHE_KEY = "gl_cover_cache_v2"; // v2: drop the bogus igdb-hash-based cache
const THROTTLE_MS = 60;

// Strip our own inventory annotations (region/condition/copy notes)
// before searching — they're not part of the real game title and
// only hurt matching, e.g. "Bomberman GB (JP, caja)" -> "Bomberman GB".
const NOISE_PAREN = /\s*\((?:[^()]*\b(?:jp|caja|cartucho|copia|bundle|cart|ilegible|no identificad\w*|t[ií]tulo en japon\w*)\b[^()]*)\)/gi;

function cleanTitle(title) {
  return title.replace(NOISE_PAREN, "").trim();
}

function loadCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // storage full / unavailable — fine, it's just a cache
  }
}

async function fetchRawgCover(title) {
  if (!RAWG_API_KEY) return null;
  try {
    const params = new URLSearchParams({
      key: RAWG_API_KEY,
      search: cleanTitle(title),
      page_size: "1",
    });
    const res = await fetch(`${RAWG_API}?${params.toString()}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.results?.[0]?.background_image || null;
  } catch {
    return null;
  }
}

async function fetchWikipediaCover(title) {
  try {
    const params = new URLSearchParams({
      action: "query",
      generator: "search",
      gsrsearch: `${cleanTitle(title)} video game`,
      gsrlimit: "1",
      prop: "pageimages",
      piprop: "original",
      format: "json",
      origin: "*",
    });
    const res = await fetch(`${WIKI_API}?${params.toString()}`);
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data?.query?.pages;
    if (!pages) return null;
    const page = Object.values(pages)[0];
    return page?.original?.source || null;
  } catch {
    return null;
  }
}

async function resolveCoverUrl(game) {
  return (await fetchRawgCover(game.t)) || (await fetchWikipediaCover(game.t));
}

/**
 * Lazily resolves and caches cover art URLs for games, throttling
 * requests so we don't hammer the APIs when hundreds of cards mount
 * at once.
 */
export function useCovers() {
  const cacheRef = useRef(loadCache());
  const [covers, setCovers] = useState(() => ({ ...cacheRef.current }));
  const [loadingCovers, setLoadingCovers] = useState({});
  const queueRef = useRef([]);
  const runningRef = useRef(false);

  const processQueue = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    while (queueRef.current.length > 0) {
      const game = queueRef.current.shift();
      if (cacheRef.current[game.id] !== undefined) continue;
      setLoadingCovers((p) => ({ ...p, [game.id]: true }));
      const url = await resolveCoverUrl(game);
      cacheRef.current[game.id] = url;
      saveCache(cacheRef.current);
      setCovers((p) => ({ ...p, [game.id]: url }));
      setLoadingCovers((p) => ({ ...p, [game.id]: false }));
      await new Promise((r) => setTimeout(r, THROTTLE_MS));
    }
    runningRef.current = false;
  }, []);

  const requestCover = useCallback(
    (game) => {
      if (cacheRef.current[game.id] !== undefined) {
        setCovers((p) => (p[game.id] !== undefined ? p : { ...p, [game.id]: cacheRef.current[game.id] }));
        return;
      }
      if (!queueRef.current.find((g) => g.id === game.id)) {
        queueRef.current.push(game);
        processQueue();
      }
    },
    [processQueue]
  );

  return { covers, loadingCovers, requestCover };
}
