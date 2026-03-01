# About
This package designed for get free games from online stores. Also thanks to [@Auropic](https://github.com/AuroPick/AuroPick) , I was inspired while doing the project.

## Techs
- [node.js](https://nodejs.org/en/) - As an asynchronous event-driven JavaScript runtime, Node.js is designed to build scalable network applications
- [axios](https://axios-http.com/docs/intro) - Axios is a promise-based HTTP Client for node.js and the browser. It is isomorphic (= it can run in the browser and nodejs with the same codebase). On the server-side it uses the native node.js http module, while on the client (browser) it uses XMLHttpRequests.
- [typescript](https://nodejs.dev/learn/nodejs-with-typescript) - Basically, it's a superset of JavaScript that adds new capabilities to the language. Most notable addition are static type definitions, something that is not present in plain JavaScript.

## Includes
- [x] Epic Store
- [x] Steam (Needs Testing see works) 

## Future Updates

- [ ] Ubisoft

## Installation

``npm i free-games-checker``

## Usage 

```typescript
import { getFreeGames } from "free-games-checker"

async function main() {
    const data = await getFreeGames('TR')

    console.log(data)
}
```
OR

```javascript
var freeGamesChecker = require("free-games-checker")

console.log(await freeGamesChecker.getFreeGames('TR'))
```

## Output

```json
[
  {
    "id": "8d50972d297f448cb3718d6e8094327a",
    "title": "Sonic Mania",
    "description": "Sonic Mania",
    "mainImage": "https://cdn1.epicgames.com/45e7cf3c49054f2fb20b673d9b0ae69e/offer/EGS_SonicMania_Lab42_S6-510x680-b83646998d6a711b6997e076e091c015.jpg",
    "urlSlug": "amethystgeneralaudience",
    "platform": "epicgames",
  },
  {
    "id": 123456,
    "title": "Game Title",
    "description": "Short description of the game.",
    "mainImage": "https://cdn.akamai.steamstatic.com/steam/apps/123456/header.jpg",
    "urlSlug": "https://store.steampowered.com/app/123456",
    "platform": "steam",
  }
]

```

## Support

- The biggest support is a star for me.
