"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFreeToGameGames = exports.getGamerPowerGames = exports.getGogGames = exports.getUbisoftGames = exports.getAmazonGames = exports.getHumbleGames = exports.getSteamGames = exports.getEpicGames = exports.getFreeGamesWithFallbackOptions = exports.getFreeGames = exports.clearRequestCache = void 0;
var axios_1 = __importDefault(require("axios"));
var config = __importStar(require("../config.json"));
var responseCache = new Map();
var inFlightRequests = new Map();
var limiterNextAllowedAt = new Map();
var CACHE_TTL_DEFAULT_MS = 5 * 60 * 1000;
var CACHE_TTL_STEAM_APP_MS = 30 * 60 * 1000;
var RATE_LIMIT_INTERVALS_MS = {
    freetogame: 100,
    gamerpower: 250,
    humble: 500,
    epic: 200,
    steam: 350,
    ubisoft: 350,
    gog: 350,
    default: 350
};
var sleep = function (ms) { return new Promise(function (resolve) { return setTimeout(resolve, ms); }); };
var getServiceFromUrl = function (url) {
    if (url.includes("freetogame.com"))
        return "freetogame";
    if (url.includes("gamerpower.com"))
        return "gamerpower";
    if (url.includes("humblebundle.com"))
        return "humble";
    if (url.includes("epicgames.com"))
        return "epic";
    if (url.includes("steampowered.com"))
        return "steam";
    if (url.includes("ubiservices.ubi.com") || url.includes("ubisoft.com"))
        return "ubisoft";
    if (url.includes("gog.com"))
        return "gog";
    return "default";
};
var buildCacheKey = function (url, requestConfig) {
    var _a, _b;
    return JSON.stringify({
        url: url,
        params: (_a = requestConfig === null || requestConfig === void 0 ? void 0 : requestConfig.params) !== null && _a !== void 0 ? _a : null,
        headers: (_b = requestConfig === null || requestConfig === void 0 ? void 0 : requestConfig.headers) !== null && _b !== void 0 ? _b : null
    });
};
var pruneCache = function () {
    if (responseCache.size <= 1000)
        return;
    var now = Date.now();
    responseCache.forEach(function (entry, key) {
        if (entry.expiresAt <= now)
            responseCache.delete(key);
    });
    while (responseCache.size > 750) {
        var firstKey = responseCache.keys().next().value;
        if (!firstKey)
            break;
        responseCache.delete(firstKey);
    }
};
var waitForRateLimit = function (url) { return __awaiter(void 0, void 0, void 0, function () {
    var service, intervalMs, now, nextAllowedAt, waitMs;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                service = getServiceFromUrl(url);
                intervalMs = (_a = RATE_LIMIT_INTERVALS_MS[service]) !== null && _a !== void 0 ? _a : RATE_LIMIT_INTERVALS_MS.default;
                now = Date.now();
                nextAllowedAt = (_b = limiterNextAllowedAt.get(service)) !== null && _b !== void 0 ? _b : now;
                waitMs = Math.max(0, nextAllowedAt - now);
                limiterNextAllowedAt.set(service, Math.max(now, nextAllowedAt) + intervalMs);
                if (!(waitMs > 0)) return [3 /*break*/, 2];
                return [4 /*yield*/, sleep(waitMs)];
            case 1:
                _c.sent();
                _c.label = 2;
            case 2: return [2 /*return*/];
        }
    });
}); };
var safeGet = function (url, requestConfig, options) { return __awaiter(void 0, void 0, void 0, function () {
    var ttlMs, forceRefresh, cacheKey, now, cached, inFlight, requestPromise;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                ttlMs = (_a = options === null || options === void 0 ? void 0 : options.ttlMs) !== null && _a !== void 0 ? _a : CACHE_TTL_DEFAULT_MS;
                forceRefresh = (options === null || options === void 0 ? void 0 : options.forceRefresh) === true;
                cacheKey = buildCacheKey(url, requestConfig);
                now = Date.now();
                cached = forceRefresh ? undefined : responseCache.get(cacheKey);
                if (cached && cached.expiresAt > now)
                    return [2 /*return*/, cached.data];
                inFlight = forceRefresh ? undefined : inFlightRequests.get(cacheKey);
                if (inFlight)
                    return [2 /*return*/, inFlight];
                requestPromise = (function () { return __awaiter(void 0, void 0, void 0, function () {
                    var response;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, waitForRateLimit(url)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, axios_1.default.get(url, requestConfig)];
                            case 2:
                                response = _a.sent();
                                responseCache.set(cacheKey, { expiresAt: Date.now() + ttlMs, data: response.data });
                                pruneCache();
                                return [2 /*return*/, response.data];
                        }
                    });
                }); })();
                inFlightRequests.set(cacheKey, requestPromise);
                _b.label = 1;
            case 1:
                _b.trys.push([1, , 3, 4]);
                return [4 /*yield*/, requestPromise];
            case 2: return [2 /*return*/, _b.sent()];
            case 3:
                inFlightRequests.delete(cacheKey);
                return [7 /*endfinally*/];
            case 4: return [2 /*return*/];
        }
    });
}); };
var clearRequestCache = function () {
    responseCache.clear();
    inFlightRequests.clear();
};
exports.clearRequestCache = clearRequestCache;
/* ================================
   Main Aggregator
================================ */
var getFreeGames = function (country, options) { return __awaiter(void 0, void 0, void 0, function () {
    var primaryGames, _a, gamerPowerGames, freeToGameGames;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!country)
                    throw new Error("Country is required");
                return [4 /*yield*/, getPrimaryGames(country, options)];
            case 1:
                primaryGames = _b.sent();
                if (primaryGames.length > 0)
                    return [2 /*return*/, primaryGames];
                return [4 /*yield*/, Promise.all([
                        exports.getGamerPowerGames(undefined, options),
                        exports.getFreeToGameGames({ forceRefresh: options === null || options === void 0 ? void 0 : options.forceRefresh })
                    ])];
            case 2:
                _a = _b.sent(), gamerPowerGames = _a[0], freeToGameGames = _a[1];
                return [2 /*return*/, __spreadArray(__spreadArray([], gamerPowerGames), freeToGameGames)];
        }
    });
}); };
exports.getFreeGames = getFreeGames;
var getPrimaryGames = function (country, options) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, epicGames, steamGames, humbleGames, amazonGames, gogGames, ubisoftGames, primaryGames;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, Promise.all([
                    exports.getEpicGames(country, options),
                    exports.getSteamGames(options),
                    exports.getHumbleGames(options),
                    exports.getAmazonGames(),
                    exports.getGogGames(options),
                    exports.getUbisoftGames(options)
                ])];
            case 1:
                _a = _b.sent(), epicGames = _a[0], steamGames = _a[1], humbleGames = _a[2], amazonGames = _a[3], gogGames = _a[4], ubisoftGames = _a[5];
                primaryGames = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], epicGames), steamGames), humbleGames), amazonGames), gogGames), ubisoftGames);
                return [2 /*return*/, primaryGames];
        }
    });
}); };
var getFreeGamesWithFallbackOptions = function (country, fallbackOptions, options) { return __awaiter(void 0, void 0, void 0, function () {
    var primaryGames, _a, gamerPowerGames, freeToGameGames;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!country)
                    throw new Error("Country is required");
                return [4 /*yield*/, getPrimaryGames(country, options)];
            case 1:
                primaryGames = _b.sent();
                if (primaryGames.length > 0)
                    return [2 /*return*/, primaryGames];
                return [4 /*yield*/, Promise.all([
                        exports.getGamerPowerGames(fallbackOptions.gamerPowerPlatforms, {
                            categories: fallbackOptions.gamerPowerCategories,
                            forceRefresh: options === null || options === void 0 ? void 0 : options.forceRefresh
                        }),
                        exports.getFreeToGameGames({
                            platforms: fallbackOptions.freeToGamePlatforms,
                            category: fallbackOptions.freeToGameCategory,
                            sortBy: fallbackOptions.freeToGameSortBy,
                            forceRefresh: options === null || options === void 0 ? void 0 : options.forceRefresh
                        })
                    ])];
            case 2:
                _a = _b.sent(), gamerPowerGames = _a[0], freeToGameGames = _a[1];
                return [2 /*return*/, __spreadArray(__spreadArray([], gamerPowerGames), freeToGameGames)];
        }
    });
}); };
exports.getFreeGamesWithFallbackOptions = getFreeGamesWithFallbackOptions;
/* ================================
   Epic Games
================================ */
var getEpicGames = function (country, options) { return __awaiter(void 0, void 0, void 0, function () {
    var data, games;
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0: return [4 /*yield*/, safeGet(config.epic_games_api_url + country, undefined, { forceRefresh: options === null || options === void 0 ? void 0 : options.forceRefresh })];
            case 1:
                data = _e.sent();
                games = (_d = (_c = (_b = (_a = data === null || data === void 0 ? void 0 : data.data) === null || _a === void 0 ? void 0 : _a.Catalog) === null || _b === void 0 ? void 0 : _b.searchStore) === null || _c === void 0 ? void 0 : _c.elements) !== null && _d !== void 0 ? _d : [];
                return [2 /*return*/, games
                        .filter(function (game) {
                        var _a, _b, _c;
                        return ((_a = game.price) === null || _a === void 0 ? void 0 : _a.totalPrice) &&
                            game.price.totalPrice.originalPrice - game.price.totalPrice.discount === 0 &&
                            game.promotions &&
                            ((_c = (_b = game.promotions) === null || _b === void 0 ? void 0 : _b.promotionalOffers) === null || _c === void 0 ? void 0 : _c.length) > 0;
                    })
                        .map(function (game) {
                        var _a, _b, _c, _d, _e;
                        var promo = game.promotions.promotionalOffers[0].promotionalOffers[0];
                        var urlSlug = game.productSlug || ((_b = (_a = game.offerMappings) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.pageSlug) || game.urlSlug;
                        var urlPath = game.offerType === "BUNDLE" ? "bundles" : "p";
                        return {
                            id: game.id,
                            title: game.title,
                            description: game.description,
                            mainImage: (_e = (_d = (_c = game.keyImages) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.url) !== null && _e !== void 0 ? _e : "",
                            url: urlSlug ? "https://store.epicgames.com/" + urlPath + "/" + urlSlug : "https://store.epicgames.com/store/",
                            platform: "epicgames",
                            startDate: promo.startDate,
                            endDate: promo.endDate
                        };
                    })];
        }
    });
}); };
exports.getEpicGames = getEpicGames;
/* ================================
   Steam
================================ */
var extractSteamRows = function (resultsHtml) {
    var _a;
    var rows = [];
    var rowRegex = /<a[^>]*class="[^"]*search_result_row[^"]*ds_collapse_flag[^"]*"[\s\S]*?<\/a>/g;
    var matchedRows = (_a = resultsHtml.match(rowRegex)) !== null && _a !== void 0 ? _a : [];
    for (var _i = 0, matchedRows_1 = matchedRows; _i < matchedRows_1.length; _i++) {
        var row = matchedRows_1[_i];
        var appIdMatch = row.match(/data-ds-appid="(\d+)"/);
        var discountMatch = row.match(/<div[^>]*class="discount_pct"[^>]*>\s*([^<]+)\s*<\/div>/);
        var titleMatch = row.match(/<span[^>]*class="title"[^>]*>([\s\S]*?)<\/span>/);
        if (!appIdMatch || !discountMatch || !titleMatch)
            continue;
        if (discountMatch[1].trim() !== "-100%")
            continue;
        rows.push({
            id: appIdMatch[1],
            title: titleMatch[1].replace(/<[^>]+>/g, "").trim()
        });
    }
    return rows;
};
var isSteamDlc = function (appId, options) { return __awaiter(void 0, void 0, void 0, function () {
    var html, hasDlcArea, hasPurchaseArea, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, safeGet("" + config.steam_app_url + appId, undefined, { ttlMs: CACHE_TTL_STEAM_APP_MS, forceRefresh: options === null || options === void 0 ? void 0 : options.forceRefresh })];
            case 1:
                html = _b.sent();
                hasDlcArea = html.includes("game_area_dlc_bubble");
                hasPurchaseArea = html.includes("game_area_purchase_game_wrapper");
                if (hasDlcArea && hasPurchaseArea)
                    return [2 /*return*/, true];
                if (!hasDlcArea && hasPurchaseArea)
                    return [2 /*return*/, false];
                return [2 /*return*/, null];
            case 2:
                _a = _b.sent();
                return [2 /*return*/, null];
            case 3: return [2 /*return*/];
        }
    });
}); };
var getSteamGames = function (options) { return __awaiter(void 0, void 0, void 0, function () {
    var data, resultsHtml, steamRows, parsedGames, _i, steamRows_1, row, dlc;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, safeGet(config.steam_search_results_url, undefined, { forceRefresh: options === null || options === void 0 ? void 0 : options.forceRefresh })];
            case 1:
                data = _b.sent();
                resultsHtml = (_a = data === null || data === void 0 ? void 0 : data.results_html) !== null && _a !== void 0 ? _a : "";
                steamRows = extractSteamRows(resultsHtml);
                parsedGames = [];
                _i = 0, steamRows_1 = steamRows;
                _b.label = 2;
            case 2:
                if (!(_i < steamRows_1.length)) return [3 /*break*/, 5];
                row = steamRows_1[_i];
                return [4 /*yield*/, isSteamDlc(row.id, options)];
            case 3:
                dlc = _b.sent();
                if (dlc === false) {
                    parsedGames.push({
                        id: row.id,
                        title: row.title,
                        description: "Limited-time free on Steam",
                        mainImage: "https://cdn.akamai.steamstatic.com/steam/apps/" + row.id + "/header.jpg",
                        url: "" + config.steam_app_url + row.id,
                        platform: "steam"
                    });
                }
                _b.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5: return [2 /*return*/, parsedGames];
        }
    });
}); };
exports.getSteamGames = getSteamGames;
/* ================================
   Humble Bundle
================================ */
var getHumbleGames = function (options) { return __awaiter(void 0, void 0, void 0, function () {
    var data, results, _a;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                return [4 /*yield*/, safeGet(config.humble_bundle_api_url, undefined, { forceRefresh: options === null || options === void 0 ? void 0 : options.forceRefresh })];
            case 1:
                data = _c.sent();
                results = (_b = data === null || data === void 0 ? void 0 : data.results) !== null && _b !== void 0 ? _b : [];
                return [2 /*return*/, results
                        .filter(function (game) { var _a; return ((_a = game.current_price) === null || _a === void 0 ? void 0 : _a.amount) === 0; })
                        .map(function (game) { return ({
                        id: game.machine_name || game.human_url || game.human_name,
                        title: game.human_name,
                        description: "Free on Humble Bundle (limited-time)",
                        mainImage: game.tile || game.thumbnail || "",
                        url: "" + config.humble_bundle_store_url + game.human_url,
                        platform: "humble"
                    }); })];
            case 2:
                _a = _c.sent();
                return [2 /*return*/, []];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getHumbleGames = getHumbleGames;
/* ================================
   Amazon Games (Prime Gaming)
   (Stub - requires HTML parsing)
================================ */
var getAmazonGames = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        // TODO: Parse __NEXT_DATA__ from https://gaming.amazon.com/home
        return [2 /*return*/, []];
    });
}); };
exports.getAmazonGames = getAmazonGames;
/* ================================
   Ubisoft / Ubisoft Connect
================================ */
var getUbisoftGames = function (options) { return __awaiter(void 0, void 0, void 0, function () {
    var data, news, _a;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                return [4 /*yield*/, safeGet(config.ubisoft_news_api_url, {
                        headers: {
                            "ubi-appid": config.ubisoft_app_id,
                            "ubi-localecode": "en-US",
                            "user-agent": "Mozilla/5.0"
                        }
                    }, { forceRefresh: options === null || options === void 0 ? void 0 : options.forceRefresh })];
            case 1:
                data = _c.sent();
                news = (_b = data === null || data === void 0 ? void 0 : data.news) !== null && _b !== void 0 ? _b : [];
                return [2 /*return*/, news
                        .filter(function (item) { return item.type === "freegame" && item.expirationDate; })
                        .map(function (item) {
                        var _a, _b;
                        return ({
                            id: item.newsId,
                            title: item.title,
                            description: item.summary || "Free on Ubisoft Connect (limited-time)",
                            mainImage: item.mediaURL || "",
                            url: ((_b = (_a = item.links) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.param) || config.ubisoft_store_url,
                            platform: "ubisoft",
                            startDate: item.publicationDate,
                            endDate: item.expirationDate
                        });
                    })];
            case 2:
                _a = _c.sent();
                return [2 /*return*/, []];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getUbisoftGames = getUbisoftGames;
/* ================================
   GOG
================================ */
var normalizeUrl = function (url, base) {
    if (!url)
        return base;
    if (url.startsWith("//"))
        return "https:" + url;
    if (url.startsWith("/"))
        return "https://www.gog.com" + url;
    return url;
};
var getGogStoreGames = function (html) {
    var _a;
    var games = [];
    var gridMatch = html.match(/<div[^>]*selenium-id="paginatedProductsGrid"[\s\S]*?<\/div>\s*<\/div>/);
    var gridHtml = gridMatch ? gridMatch[0] : html;
    var cardMatches = (_a = gridHtml.match(/<a[^>]*class="[^"]*product-tile--grid[^"]*"[\s\S]*?<\/a>/g)) !== null && _a !== void 0 ? _a : [];
    for (var _i = 0, cardMatches_1 = cardMatches; _i < cardMatches_1.length; _i++) {
        var card = cardMatches_1[_i];
        var titleMatch = card.match(/selenium-id="productTileGameTitle"[^>]*title="([^"]+)"/);
        if (!titleMatch)
            continue;
        var hrefMatch = card.match(/href="([^"]+)"/);
        var imageMatch = card.match(/<source[^>]*srcset="([^"]+)"/);
        var imageRaw = imageMatch ? imageMatch[1].trim().split(/\s+/)[0] : "";
        games.push({
            id: titleMatch[1].toLowerCase().replace(/\s+/g, "_"),
            title: titleMatch[1],
            description: "Free on GOG (discounted store item)",
            mainImage: normalizeUrl(imageRaw, ""),
            url: normalizeUrl(hrefMatch ? hrefMatch[1] : "", "https://www.gog.com/"),
            platform: "gog"
        });
    }
    return games;
};
var getGogGiveawayGame = function (html) {
    var giveawayMatch = html.match(/<giveaway[\s\S]*?<\/giveaway>/);
    if (!giveawayMatch)
        return [];
    var giveawayHtml = giveawayMatch[0];
    var linkMatch = giveawayHtml.match(/selenium-id="giveawayOverlayLink"[^>]*href="([^"]+)"/);
    var imageMatch = giveawayHtml.match(/<source[^>]*srcset="([^"]+)"/);
    var altMatch = giveawayHtml.match(/<img[^>]*alt="([^"]+)"/);
    var imageRaw = imageMatch ? imageMatch[1].trim().split(/\s+/)[0] : "";
    var rawTitle = altMatch ? altMatch[1] : "GOG Giveaway";
    var title = rawTitle.replace(/\s+giveaway$/i, "");
    return [{
            id: title.toLowerCase().replace(/\s+/g, "_"),
            title: title,
            description: "Free on GOG giveaway",
            mainImage: normalizeUrl(imageRaw, ""),
            url: normalizeUrl(linkMatch ? linkMatch[1] : "", "https://www.gog.com/"),
            platform: "gog"
        }];
};
var getGogGames = function (options) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, promoResponse, storeResponse, homeResponse, promoProducts, promoGames, storeGames, giveawayGames, combined, deduped, _i, combined_1, game, key, _b;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, , 3]);
                return [4 /*yield*/, Promise.all([
                        safeGet(config.gog_promotions_api_url, undefined, { forceRefresh: options === null || options === void 0 ? void 0 : options.forceRefresh }),
                        safeGet(config.gog_store_free_discounted_url, { headers: { "user-agent": "Mozilla/5.0" } }, { forceRefresh: options === null || options === void 0 ? void 0 : options.forceRefresh }),
                        safeGet(config.gog_home_url, { headers: { "user-agent": "Mozilla/5.0" } }, { forceRefresh: options === null || options === void 0 ? void 0 : options.forceRefresh })
                    ])];
            case 1:
                _a = _d.sent(), promoResponse = _a[0], storeResponse = _a[1], homeResponse = _a[2];
                promoProducts = (_c = promoResponse === null || promoResponse === void 0 ? void 0 : promoResponse.products) !== null && _c !== void 0 ? _c : [];
                promoGames = promoProducts.map(function (game) {
                    var _a;
                    return ({
                        id: game.id,
                        title: game.title,
                        description: "Free on GOG (limited-time)",
                        mainImage: normalizeUrl((_a = game.image) !== null && _a !== void 0 ? _a : "", ""),
                        url: "https://www.gog.com/game/" + game.slug,
                        platform: "gog"
                    });
                });
                storeGames = getGogStoreGames(storeResponse);
                giveawayGames = getGogGiveawayGame(homeResponse);
                combined = __spreadArray(__spreadArray(__spreadArray([], giveawayGames), storeGames), promoGames);
                deduped = new Map();
                for (_i = 0, combined_1 = combined; _i < combined_1.length; _i++) {
                    game = combined_1[_i];
                    key = game.id + ":" + game.url;
                    if (!deduped.has(key))
                        deduped.set(key, game);
                }
                return [2 /*return*/, Array.from(deduped.values())];
            case 2:
                _b = _d.sent();
                return [2 /*return*/, []];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getGogGames = getGogGames;
/* ================================
   Fallback Providers
================================ */
var toIsoDate = function (rawDate) {
    if (!rawDate)
        return undefined;
    var normalized = rawDate.replace(" ", "T");
    var parsed = new Date(normalized.endsWith("Z") ? normalized : normalized + "Z");
    if (Number.isNaN(parsed.getTime()))
        return undefined;
    return parsed.toISOString();
};
var normalizeGiveawayCategory = function (item) {
    var _a, _b, _c;
    var rawType = String((_a = item === null || item === void 0 ? void 0 : item.type) !== null && _a !== void 0 ? _a : "").toLowerCase();
    var text = (((_b = item === null || item === void 0 ? void 0 : item.title) !== null && _b !== void 0 ? _b : "") + " " + ((_c = item === null || item === void 0 ? void 0 : item.description) !== null && _c !== void 0 ? _c : "")).toLowerCase();
    if (text.includes("dlc"))
        return "dlc";
    if (text.includes("software"))
        return "software";
    if (text.includes("game code") || text.includes("game codes") || text.includes("game key") || text.includes("cd key") || text.includes("key giveaway")) {
        return "game-code";
    }
    if (rawType.includes("game"))
        return "game";
    if (rawType.includes("loot"))
        return "loot";
    if (rawType.includes("beta"))
        return "beta";
    return rawType || "other";
};
var normalizeCategoryFilter = function (input) {
    var value = String(input || "").toLowerCase().trim().replace(/\s+/g, "-");
    if (value === "giveaways")
        return "giveaway";
    if (value === "games")
        return "game";
    if (value === "dlcs")
        return "dlc";
    if (value === "softwares")
        return "software";
    if (value === "game-codes" || value === "game-code" || value === "codes" || value === "code")
        return "game-code";
    return value;
};
var mapGamerPowerGiveaways = function (giveaways, categoryFilter) {
    return giveaways
        .filter(function (item) { return item.status === "Active"; })
        .map(function (item) { return ({
        item: item,
        normalizedCategory: normalizeGiveawayCategory(item)
    }); })
        .filter(function (mapped) {
        return !categoryFilter ||
            categoryFilter.size === 0 ||
            categoryFilter.has("giveaway") ||
            categoryFilter.has(mapped.normalizedCategory);
    })
        .map(function (item) { return ({
        id: item.item.id,
        title: item.item.title,
        description: item.item.description || "Free giveaway listed on GamerPower",
        mainImage: item.item.image || item.item.thumbnail || "",
        url: item.item.open_giveaway || item.item.open_giveaway_url || item.item.gamerpower_url || "https://www.gamerpower.com/",
        platform: "gamerpower",
        category: item.normalizedCategory,
        startDate: toIsoDate(item.item.published_date),
        endDate: toIsoDate(item.item.end_date)
    }); });
};
var getGamerPowerGames = function (platforms, options) { return __awaiter(void 0, void 0, void 0, function () {
    var categoryFilter, data, responsesData, deduped, all, _i, responsesData_1, data, _a, all_1, game, key, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 4, , 5]);
                categoryFilter = (options === null || options === void 0 ? void 0 : options.categories) && options.categories.length > 0
                    ? new Set(options.categories.map(function (category) { return normalizeCategoryFilter(category); }))
                    : undefined;
                if (!(!platforms || platforms.length === 0)) return [3 /*break*/, 2];
                return [4 /*yield*/, safeGet(config.gamerpower_api_url, undefined, { forceRefresh: options === null || options === void 0 ? void 0 : options.forceRefresh })];
            case 1:
                data = _c.sent();
                return [2 /*return*/, mapGamerPowerGiveaways(data !== null && data !== void 0 ? data : [], categoryFilter)];
            case 2: return [4 /*yield*/, Promise.all(platforms.map(function (platform) {
                    return safeGet(config.gamerpower_api_url + "?platform=" + encodeURIComponent(platform), undefined, { forceRefresh: options === null || options === void 0 ? void 0 : options.forceRefresh });
                }))];
            case 3:
                responsesData = _c.sent();
                deduped = new Map();
                all = [];
                for (_i = 0, responsesData_1 = responsesData; _i < responsesData_1.length; _i++) {
                    data = responsesData_1[_i];
                    all.push.apply(all, mapGamerPowerGiveaways(data !== null && data !== void 0 ? data : [], categoryFilter));
                }
                for (_a = 0, all_1 = all; _a < all_1.length; _a++) {
                    game = all_1[_a];
                    key = String(game.id);
                    if (!deduped.has(key))
                        deduped.set(key, game);
                }
                return [2 /*return*/, Array.from(deduped.values())];
            case 4:
                _b = _c.sent();
                return [2 /*return*/, []];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.getGamerPowerGames = getGamerPowerGames;
var mapFreeToGameGames = function (games) {
    return games.map(function (item) { return ({
        id: item.id,
        title: item.title,
        description: item.short_description || "Free-to-play game listed on FreeToGame",
        mainImage: item.thumbnail || "",
        url: item.game_url || item.freetogame_profile_url || "https://www.freetogame.com/",
        platform: "freetogame",
        category: item.genre ? String(item.genre).toLowerCase() : "game",
        startDate: toIsoDate(item.release_date)
    }); });
};
var getFreeToGameGames = function (options) { return __awaiter(void 0, void 0, void 0, function () {
    var params, queryPrefix_1, data, responsesData, deduped, all, _i, responsesData_2, data, _a, all_2, game, key, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 4, , 5]);
                params = [];
                if (options === null || options === void 0 ? void 0 : options.category)
                    params.push("category=" + encodeURIComponent(options.category));
                if (options === null || options === void 0 ? void 0 : options.sortBy)
                    params.push("sort-by=" + encodeURIComponent(options.sortBy));
                queryPrefix_1 = params.length > 0 ? "&" + params.join("&") : "";
                if (!(!(options === null || options === void 0 ? void 0 : options.platforms) || options.platforms.length === 0)) return [3 /*break*/, 2];
                return [4 /*yield*/, safeGet(config.freetogame_api_url + "?platform=all" + queryPrefix_1, undefined, { forceRefresh: options === null || options === void 0 ? void 0 : options.forceRefresh })];
            case 1:
                data = _c.sent();
                return [2 /*return*/, mapFreeToGameGames(data !== null && data !== void 0 ? data : [])];
            case 2: return [4 /*yield*/, Promise.all(options.platforms.map(function (platform) {
                    return safeGet(config.freetogame_api_url + "?platform=" + encodeURIComponent(platform) + queryPrefix_1, undefined, { forceRefresh: options === null || options === void 0 ? void 0 : options.forceRefresh });
                }))];
            case 3:
                responsesData = _c.sent();
                deduped = new Map();
                all = [];
                for (_i = 0, responsesData_2 = responsesData; _i < responsesData_2.length; _i++) {
                    data = responsesData_2[_i];
                    all.push.apply(all, mapFreeToGameGames(data !== null && data !== void 0 ? data : []));
                }
                for (_a = 0, all_2 = all; _a < all_2.length; _a++) {
                    game = all_2[_a];
                    key = String(game.id);
                    if (!deduped.has(key))
                        deduped.set(key, game);
                }
                return [2 /*return*/, Array.from(deduped.values())];
            case 4:
                _b = _c.sent();
                return [2 /*return*/, []];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.getFreeToGameGames = getFreeToGameGames;
//# sourceMappingURL=index.js.map