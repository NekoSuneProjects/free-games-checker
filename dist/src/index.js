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
exports.getFreeToGameGames = exports.getGamerPowerGames = exports.getGogGames = exports.getUbisoftGames = exports.getAmazonGames = exports.getHumbleGames = exports.getSteamGames = exports.getEpicGames = exports.getFreeGamesWithFallbackOptions = exports.getFreeGames = void 0;
var axios_1 = __importDefault(require("axios"));
var config = __importStar(require("../config.json"));
/* ================================
   Main Aggregator
================================ */
var getFreeGames = function (country) { return __awaiter(void 0, void 0, void 0, function () {
    var primaryGames, _a, gamerPowerGames, freeToGameGames;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!country)
                    throw new Error("Country is required");
                return [4 /*yield*/, getPrimaryGames(country)];
            case 1:
                primaryGames = _b.sent();
                if (primaryGames.length > 0)
                    return [2 /*return*/, primaryGames];
                return [4 /*yield*/, Promise.all([
                        exports.getGamerPowerGames(),
                        exports.getFreeToGameGames()
                    ])];
            case 2:
                _a = _b.sent(), gamerPowerGames = _a[0], freeToGameGames = _a[1];
                return [2 /*return*/, __spreadArray(__spreadArray([], gamerPowerGames), freeToGameGames)];
        }
    });
}); };
exports.getFreeGames = getFreeGames;
var getPrimaryGames = function (country) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, epicGames, steamGames, humbleGames, amazonGames, gogGames, ubisoftGames, primaryGames;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, Promise.all([
                    exports.getEpicGames(country),
                    exports.getSteamGames(),
                    exports.getHumbleGames(),
                    exports.getAmazonGames(),
                    exports.getGogGames(),
                    exports.getUbisoftGames()
                ])];
            case 1:
                _a = _b.sent(), epicGames = _a[0], steamGames = _a[1], humbleGames = _a[2], amazonGames = _a[3], gogGames = _a[4], ubisoftGames = _a[5];
                primaryGames = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], epicGames), steamGames), humbleGames), amazonGames), gogGames), ubisoftGames);
                return [2 /*return*/, primaryGames];
        }
    });
}); };
var getFreeGamesWithFallbackOptions = function (country, fallbackOptions) { return __awaiter(void 0, void 0, void 0, function () {
    var primaryGames, _a, gamerPowerGames, freeToGameGames;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!country)
                    throw new Error("Country is required");
                return [4 /*yield*/, getPrimaryGames(country)];
            case 1:
                primaryGames = _b.sent();
                if (primaryGames.length > 0)
                    return [2 /*return*/, primaryGames];
                return [4 /*yield*/, Promise.all([
                        exports.getGamerPowerGames(fallbackOptions.gamerPowerPlatforms),
                        exports.getFreeToGameGames()
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
var getEpicGames = function (country) { return __awaiter(void 0, void 0, void 0, function () {
    var response, games;
    var _a, _b, _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0: return [4 /*yield*/, axios_1.default.get(config.epic_games_api_url + country)];
            case 1:
                response = _f.sent();
                games = (_e = (_d = (_c = (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.Catalog) === null || _c === void 0 ? void 0 : _c.searchStore) === null || _d === void 0 ? void 0 : _d.elements) !== null && _e !== void 0 ? _e : [];
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
var isSteamDlc = function (appId) { return __awaiter(void 0, void 0, void 0, function () {
    var response, html, hasDlcArea, hasPurchaseArea, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, axios_1.default.get("" + config.steam_app_url + appId)];
            case 1:
                response = _b.sent();
                html = response.data;
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
var getSteamGames = function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, resultsHtml, steamRows, parsedGames, _i, steamRows_1, row, dlc;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, axios_1.default.get(config.steam_search_results_url)];
            case 1:
                response = _c.sent();
                resultsHtml = (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.results_html) !== null && _b !== void 0 ? _b : "";
                steamRows = extractSteamRows(resultsHtml);
                parsedGames = [];
                _i = 0, steamRows_1 = steamRows;
                _c.label = 2;
            case 2:
                if (!(_i < steamRows_1.length)) return [3 /*break*/, 5];
                row = steamRows_1[_i];
                return [4 /*yield*/, isSteamDlc(row.id)];
            case 3:
                dlc = _c.sent();
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
                _c.label = 4;
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
var getHumbleGames = function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, results, _a;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, , 3]);
                return [4 /*yield*/, axios_1.default.get(config.humble_bundle_api_url)];
            case 1:
                response = _d.sent();
                results = (_c = (_b = response.data) === null || _b === void 0 ? void 0 : _b.results) !== null && _c !== void 0 ? _c : [];
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
                _a = _d.sent();
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
var getUbisoftGames = function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, news, _a;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, , 3]);
                return [4 /*yield*/, axios_1.default.get(config.ubisoft_news_api_url, {
                        headers: {
                            "ubi-appid": config.ubisoft_app_id,
                            "ubi-localecode": "en-US",
                            "user-agent": "Mozilla/5.0"
                        }
                    })];
            case 1:
                response = _d.sent();
                news = (_c = (_b = response.data) === null || _b === void 0 ? void 0 : _b.news) !== null && _c !== void 0 ? _c : [];
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
                _a = _d.sent();
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
var getGogGames = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, promoResponse, storeResponse, homeResponse, promoProducts, promoGames, storeGames, giveawayGames, combined, deduped, _i, combined_1, game, key, _b;
    var _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 2, , 3]);
                return [4 /*yield*/, Promise.all([
                        axios_1.default.get(config.gog_promotions_api_url),
                        axios_1.default.get(config.gog_store_free_discounted_url, { headers: { "user-agent": "Mozilla/5.0" } }),
                        axios_1.default.get(config.gog_home_url, { headers: { "user-agent": "Mozilla/5.0" } })
                    ])];
            case 1:
                _a = _e.sent(), promoResponse = _a[0], storeResponse = _a[1], homeResponse = _a[2];
                promoProducts = (_d = (_c = promoResponse.data) === null || _c === void 0 ? void 0 : _c.products) !== null && _d !== void 0 ? _d : [];
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
                storeGames = getGogStoreGames(storeResponse.data);
                giveawayGames = getGogGiveawayGame(homeResponse.data);
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
                _b = _e.sent();
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
var mapGamerPowerGiveaways = function (giveaways) {
    return giveaways
        .filter(function (item) { return item.status === "Active" && item.type === "Game"; })
        .map(function (item) { return ({
        id: item.id,
        title: item.title,
        description: item.description || "Free giveaway listed on GamerPower",
        mainImage: item.image || item.thumbnail || "",
        url: item.open_giveaway || item.open_giveaway_url || item.gamerpower_url || "https://www.gamerpower.com/",
        platform: "gamerpower",
        startDate: toIsoDate(item.published_date),
        endDate: toIsoDate(item.end_date)
    }); });
};
var getGamerPowerGames = function (platforms) { return __awaiter(void 0, void 0, void 0, function () {
    var response, responses, deduped, all, _i, responses_1, response, _a, all_1, game, key, _b;
    var _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 4, , 5]);
                if (!(!platforms || platforms.length === 0)) return [3 /*break*/, 2];
                return [4 /*yield*/, axios_1.default.get(config.gamerpower_api_url)];
            case 1:
                response = _e.sent();
                return [2 /*return*/, mapGamerPowerGiveaways((_c = response.data) !== null && _c !== void 0 ? _c : [])];
            case 2: return [4 /*yield*/, Promise.all(platforms.map(function (platform) {
                    return axios_1.default.get(config.gamerpower_api_url + "?platform=" + encodeURIComponent(platform));
                }))];
            case 3:
                responses = _e.sent();
                deduped = new Map();
                all = [];
                for (_i = 0, responses_1 = responses; _i < responses_1.length; _i++) {
                    response = responses_1[_i];
                    all.push.apply(all, mapGamerPowerGiveaways((_d = response.data) !== null && _d !== void 0 ? _d : []));
                }
                for (_a = 0, all_1 = all; _a < all_1.length; _a++) {
                    game = all_1[_a];
                    key = String(game.id);
                    if (!deduped.has(key))
                        deduped.set(key, game);
                }
                return [2 /*return*/, Array.from(deduped.values())];
            case 4:
                _b = _e.sent();
                return [2 /*return*/, []];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.getGamerPowerGames = getGamerPowerGames;
var getFreeToGameGames = function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, games, _a;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                return [4 /*yield*/, axios_1.default.get(config.freetogame_api_url)];
            case 1:
                response = _c.sent();
                games = (_b = response.data) !== null && _b !== void 0 ? _b : [];
                return [2 /*return*/, games.map(function (item) { return ({
                        id: item.id,
                        title: item.title,
                        description: item.short_description || "Free-to-play game listed on FreeToGame",
                        mainImage: item.thumbnail || "",
                        url: item.game_url || item.freetogame_profile_url || "https://www.freetogame.com/",
                        platform: "freetogame",
                        startDate: toIsoDate(item.release_date)
                    }); })];
            case 2:
                _a = _c.sent();
                return [2 /*return*/, []];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getFreeToGameGames = getFreeToGameGames;
//# sourceMappingURL=index.js.map