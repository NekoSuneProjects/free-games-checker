# About
`@nekosuneprojects/free-games-checker` fetches free or currently claimable games from multiple sources.

## Installation
`npm i @nekosuneprojects/free-games-checker`

## Sources
Primary sources:
- Epic Games Store
- Steam
- Humble Bundle
- Ubisoft Connect
- GOG
- Amazon Games (stub, currently returns `[]`)

Fallback sources:
- GamerPower API
- FreeToGame API

## How Fallback Works
`getFreeGames(country)` behavior:
1. Fetch primary sources.
2. If primary sources return at least one game, return those results.
3. If primary sources return zero games, fallback to GamerPower + FreeToGame.

## Usage
```typescript
import {
  getFreeGames,
  getFreeGamesWithFallbackOptions,
  getGamerPowerGames,
  getFreeToGameGames,
  clearRequestCache,
  getEpicGames,
  getSteamGames,
  getUbisoftGames,
  getHumbleGames,
  getGogGames
} from "@nekosuneprojects/free-games-checker";

async function main() {
  const all = await getFreeGames("US");
  console.log("getFreeGames", all.length);
  const repulled = await getFreeGames("US", { forceRefresh: true });
  console.log("getFreeGames forceRefresh", repulled.length);

  const fallbackFiltered = await getFreeGamesWithFallbackOptions("US", {
    gamerPowerPlatforms: ["pc", "steam", "epic-games-store"],
    gamerPowerCategories: ["game", "dlc", "software", "game-code"],
    freeToGamePlatforms: ["pc", "browser"],
    freeToGameCategory: "shooter",
    freeToGameSortBy: "release-date"
  }, {
    forceRefresh: true
  });
  console.log("getFreeGamesWithFallbackOptions", fallbackFiltered.length);

  const gamerPowerSteam = await getGamerPowerGames(["steam"], {
    categories: ["giveaway", "game", "dlc"]
  });
  console.log("getGamerPowerGames(steam)", gamerPowerSteam.length);
  const gamerPowerSteamRepull = await getGamerPowerGames(["steam"], {
    categories: ["giveaway", "game", "dlc"],
    forceRefresh: true
  });
  console.log("getGamerPowerGames(steam) forceRefresh", gamerPowerSteamRepull.length);

  const freeToGame = await getFreeToGameGames({
    platforms: ["pc", "browser"],
    category: "mmorpg",
    sortBy: "alphabetical",
    forceRefresh: true
  });
  console.log("getFreeToGameGames", freeToGame.length);

  console.log("epic", (await getEpicGames("US")).length);
  console.log("steam", (await getSteamGames()).length);
  console.log("ubisoft", (await getUbisoftGames()).length);
  console.log("humble", (await getHumbleGames()).length);
  console.log("gog", (await getGogGames()).length);

  // Optional: clear in-memory request cache
  clearRequestCache();
}
```

```javascript
const checker = require("@nekosuneprojects/free-games-checker");

(async () => {
  const data = await checker.getFreeGames("US");
  console.log(data.length);
})();
```

## Exported API
- `getFreeGames(country: string, options?: { forceRefresh?: boolean })`
- `getFreeGamesWithFallbackOptions(country: string, fallbackOptions: { gamerPowerPlatforms?: string[]; gamerPowerCategories?: string[]; freeToGamePlatforms?: string[]; freeToGameCategory?: string; freeToGameSortBy?: "release-date" | "alphabetical" | "relevance" }, options?: { forceRefresh?: boolean })`
- `getEpicGames(country: string, options?: { forceRefresh?: boolean })`
- `getSteamGames(options?: { forceRefresh?: boolean })`
- `getHumbleGames(options?: { forceRefresh?: boolean })`
- `getAmazonGames()`
- `getUbisoftGames(options?: { forceRefresh?: boolean })`
- `getGogGames(options?: { forceRefresh?: boolean })`
- `getGamerPowerGames(platforms?: string[], options?: { categories?: string[]; forceRefresh?: boolean })`
- `getFreeToGameGames(options?: { platforms?: string[]; category?: string; sortBy?: "release-date" | "alphabetical" | "relevance"; forceRefresh?: boolean })`
- `clearRequestCache()`

## Safety (Rate Limits + Cache)
- All outgoing GET requests go through a shared safety layer with:
- In-memory response cache (default TTL: 5 minutes)
- Longer Steam app-page TTL cache (30 minutes)
- Request de-duplication for identical in-flight calls
- Per-service request pacing to avoid API spam
- Rate-limit-aware pacing includes:
- FreeToGame: max 10 req/s (100ms spacing)
- GamerPower: max 4 req/s (250ms spacing)
- Other providers also paced conservatively to reduce bursts
- To bypass cache and repull fresh data immediately, use `forceRefresh: true`.

## GamerPower Platform Filters
`getGamerPowerGames(platforms)` and `getFreeGamesWithFallbackOptions(..., { gamerPowerPlatforms })` support values like:
- `pc`
- `steam`
- `epic-games-store`
- `ubisoft`
- `gog`
- `itchio`
- `ps4`
- `ps5`
- `xbox-one`
- `xbox-series-xs`
- `switch`
- `android`
- `ios`
- `vr`
- `battlenet`
- `origin`
- `drm-free`
- `xbox-360`

## GamerPower Category Filters
`getGamerPowerGames(..., { categories })` and `getFreeGamesWithFallbackOptions(..., { gamerPowerCategories })` support:
- `giveaway` (all active giveaway items)
- `game`
- `dlc`
- `software`
- `game-code`
- `loot`
- `beta`
- `other`

## FreeToGame Filters
`getFreeToGameGames(options)` and fallback options support:
- `platforms`: `pc`, `browser`, `all`
- `category`: genre/category values supported by FreeToGame API (for example `shooter`, `mmorpg`, `strategy`)
- `sortBy`: `release-date`, `alphabetical`, `relevance`

## Output Shape
```json
[
  {
    "id": 3511,
    "title": "Just Move:Clean City Messy Battle (Steam) Giveaway",
    "description": "...",
    "mainImage": "https://www.gamerpower.com/offers/1b/69a1debbeb619.jpg",
    "url": "https://www.gamerpower.com/open/just-move-clean-city-messy-battle-steam-giveaway",
    "platform": "gamerpower",
    "startDate": "2026-02-27T13:13:16.000Z",
    "endDate": "2026-03-04T23:59:00.000Z"
  }
]
```

## Notes
- Ubisoft parser uses news entries with `type = freegame` and non-null `expirationDate`.
- Steam parser uses search results + per-app DLC check (matches your requested Python behavior).
- GOG parser combines homepage giveaway + discounted store page + GOG promotions API, then dedupes.
- If a source request fails, that source safely returns `[]`.

## Support
A GitHub star helps.
