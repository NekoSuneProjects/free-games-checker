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
  getEpicGames,
  getSteamGames,
  getUbisoftGames,
  getHumbleGames,
  getGogGames
} from "@nekosuneprojects/free-games-checker";

async function main() {
  const all = await getFreeGames("US");
  console.log("getFreeGames", all.length);

  const fallbackFiltered = await getFreeGamesWithFallbackOptions("US", {
    gamerPowerPlatforms: ["pc", "steam", "epic-games-store"]
  });
  console.log("getFreeGamesWithFallbackOptions", fallbackFiltered.length);

  const gamerPowerSteam = await getGamerPowerGames(["steam"]);
  console.log("getGamerPowerGames(steam)", gamerPowerSteam.length);

  const freeToGame = await getFreeToGameGames();
  console.log("getFreeToGameGames", freeToGame.length);

  console.log("epic", (await getEpicGames("US")).length);
  console.log("steam", (await getSteamGames()).length);
  console.log("ubisoft", (await getUbisoftGames()).length);
  console.log("humble", (await getHumbleGames()).length);
  console.log("gog", (await getGogGames()).length);
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
- `getFreeGames(country: string)`
- `getFreeGamesWithFallbackOptions(country: string, fallbackOptions: { gamerPowerPlatforms?: string[] })`
- `getEpicGames(country: string)`
- `getSteamGames()`
- `getHumbleGames()`
- `getAmazonGames()`
- `getUbisoftGames()`
- `getGogGames()`
- `getGamerPowerGames(platforms?: string[])`
- `getFreeToGameGames()`

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
