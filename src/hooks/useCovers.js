import { useCallback, useRef, useState } from "react";

// ─────────────────────────────────────────────
// COVER RESOLUTION — public, keyless sources only
//
// 1) If the game already carries a known IGDB image hash, hotlink it
//    directly from IGDB's public image CDN (no auth needed to *read*
//    an image once you have its hash).
// 2) Otherwise, ask Wikipedia's public REST/Action API for the lead
//    image of the matching article. It's free, requires no API key,
//    and returns CORS-friendly responses (origin=*) so it works
//    straight from the browser.
// ─────────────────────────────────────────────

const IGDB_COVER_BASE = "https://images.igdb.com/igdb/image/upload/t_cover_big/";
const WIKI_API = "https://en.wikipedia.org/w/api.php";
const CACHE_KEY = "gl_cover_cache_v1";
const THROTTLE_MS = 60;

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

async function fetchWikipediaCover(title) {
  try {
    const params = new URLSearchParams({
      action: "query",
      generator: "search",
      gsrsearch: `${title} video game`,
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
  if (game.igdb) return `${IGDB_COVER_BASE}${game.igdb}.jpg`;
  return fetchWikipediaCover(game.t);
}

/**
 * Lazily resolves and caches cover art URLs for games, throttling
 * requests so we don't hammer Wikipedia when hundreds of cards mount
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
