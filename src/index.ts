import { FreeGameInterface } from "./interfaces/free-game.interface";
import axios from "axios";
import * as config from "../config.json";

type ServiceKey =
    "freetogame"
    | "gamerpower"
    | "humble"
    | "epic"
    | "steam"
    | "ubisoft"
    | "gog"
    | "default";

interface CacheEntry {
    expiresAt: number;
    data: any;
}

interface RequestOptions {
    ttlMs?: number;
    forceRefresh?: boolean;
}

export interface FetchControlOptions {
    forceRefresh?: boolean;
}

const responseCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<any>>();
const limiterNextAllowedAt = new Map<ServiceKey, number>();

const CACHE_TTL_DEFAULT_MS = 5 * 60 * 1000;
const CACHE_TTL_STEAM_APP_MS = 30 * 60 * 1000;

const RATE_LIMIT_INTERVALS_MS: Record<ServiceKey, number> = {
    freetogame: 100,
    gamerpower: 250,
    humble: 500,
    epic: 200,
    steam: 350,
    ubisoft: 350,
    gog: 350,
    default: 350
};

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const getServiceFromUrl = (url: string): ServiceKey => {
    if (url.includes("freetogame.com")) return "freetogame";
    if (url.includes("gamerpower.com")) return "gamerpower";
    if (url.includes("humblebundle.com")) return "humble";
    if (url.includes("epicgames.com")) return "epic";
    if (url.includes("steampowered.com")) return "steam";
    if (url.includes("ubiservices.ubi.com") || url.includes("ubisoft.com")) return "ubisoft";
    if (url.includes("gog.com")) return "gog";
    return "default";
};

const buildCacheKey = (url: string, requestConfig?: any): string => {
    return JSON.stringify({
        url,
        params: requestConfig?.params ?? null,
        headers: requestConfig?.headers ?? null
    });
};

const pruneCache = (): void => {
    if (responseCache.size <= 1000) return;
    const now = Date.now();

    responseCache.forEach((entry, key) => {
        if (entry.expiresAt <= now) responseCache.delete(key);
    });

    while (responseCache.size > 750) {
        const firstKey = responseCache.keys().next().value;
        if (!firstKey) break;
        responseCache.delete(firstKey);
    }
};

const waitForRateLimit = async (url: string): Promise<void> => {
    const service = getServiceFromUrl(url);
    const intervalMs = RATE_LIMIT_INTERVALS_MS[service] ?? RATE_LIMIT_INTERVALS_MS.default;
    const now = Date.now();
    const nextAllowedAt = limiterNextAllowedAt.get(service) ?? now;
    const waitMs = Math.max(0, nextAllowedAt - now);

    limiterNextAllowedAt.set(service, Math.max(now, nextAllowedAt) + intervalMs);
    if (waitMs > 0) await sleep(waitMs);
};

const safeGet = async (url: string, requestConfig?: any, options?: RequestOptions): Promise<any> => {
    const ttlMs = options?.ttlMs ?? CACHE_TTL_DEFAULT_MS;
    const forceRefresh = options?.forceRefresh === true;
    const cacheKey = buildCacheKey(url, requestConfig);
    const now = Date.now();
    const cached = forceRefresh ? undefined : responseCache.get(cacheKey);

    if (cached && cached.expiresAt > now) return cached.data;

    const inFlight = forceRefresh ? undefined : inFlightRequests.get(cacheKey);
    if (inFlight) return inFlight;

    const requestPromise = (async () => {
        await waitForRateLimit(url);
        const response = await axios.get(url, requestConfig);
        responseCache.set(cacheKey, { expiresAt: Date.now() + ttlMs, data: response.data });
        pruneCache();
        return response.data;
    })();

    inFlightRequests.set(cacheKey, requestPromise);

    try {
        return await requestPromise;
    } finally {
        inFlightRequests.delete(cacheKey);
    }
};

export const clearRequestCache = (): void => {
    responseCache.clear();
    inFlightRequests.clear();
};

/* ================================
   Main Aggregator
================================ */

export const getFreeGames = async (country: string, options?: FetchControlOptions): Promise<FreeGameInterface[]> => {
    if (!country) throw new Error("Country is required");

    const primaryGames = await getPrimaryGames(country, options);
    if (primaryGames.length > 0) return primaryGames;

    const [gamerPowerGames, freeToGameGames] = await Promise.all([
        getGamerPowerGames(undefined, options),
        getFreeToGameGames({ forceRefresh: options?.forceRefresh })
    ]);

    return [...gamerPowerGames, ...freeToGameGames];
};

const getPrimaryGames = async (country: string, options?: FetchControlOptions): Promise<FreeGameInterface[]> => {
    const [
        epicGames,
        steamGames,
        humbleGames,
        amazonGames,
        gogGames,
        ubisoftGames
    ] = await Promise.all([
        getEpicGames(country, options),
        getSteamGames(options),
        getHumbleGames(options),
        getAmazonGames(),
        getGogGames(options),
        getUbisoftGames(options)
    ]);

    const primaryGames = [
        ...epicGames,
        ...steamGames,
        ...humbleGames,
        ...amazonGames,
        ...gogGames,
        ...ubisoftGames
    ];

    return primaryGames;
};

export interface FallbackOptions {
    gamerPowerPlatforms?: string[];
    gamerPowerCategories?: string[];
    freeToGamePlatforms?: string[];
    freeToGameCategory?: string;
    freeToGameSortBy?: "release-date" | "alphabetical" | "relevance";
}

export const getFreeGamesWithFallbackOptions = async (
    country: string,
    fallbackOptions: FallbackOptions,
    options?: FetchControlOptions
): Promise<FreeGameInterface[]> => {
    if (!country) throw new Error("Country is required");

    const primaryGames = await getPrimaryGames(country, options);
    if (primaryGames.length > 0) return primaryGames;

    const [gamerPowerGames, freeToGameGames] = await Promise.all([
        getGamerPowerGames(
            fallbackOptions.gamerPowerPlatforms,
            {
                categories: fallbackOptions.gamerPowerCategories,
                forceRefresh: options?.forceRefresh
            }
        ),
        getFreeToGameGames({
            platforms: fallbackOptions.freeToGamePlatforms,
            category: fallbackOptions.freeToGameCategory,
            sortBy: fallbackOptions.freeToGameSortBy,
            forceRefresh: options?.forceRefresh
        })
    ]);

    return [...gamerPowerGames, ...freeToGameGames];
};

/* ================================
   Epic Games
================================ */

export const getEpicGames = async (country: string, options?: FetchControlOptions): Promise<FreeGameInterface[]> => {
    const data = await safeGet(config.epic_games_api_url + country, undefined, { forceRefresh: options?.forceRefresh });
    const games = data?.data?.Catalog?.searchStore?.elements ?? [];

    return games
        .filter((game: any) =>
            game.price?.totalPrice &&
            game.price.totalPrice.originalPrice - game.price.totalPrice.discount === 0 &&
            game.promotions &&
            game.promotions?.promotionalOffers?.length > 0
        )
        .map((game: any): FreeGameInterface => {
            const promo = game.promotions.promotionalOffers[0].promotionalOffers[0];
            const urlSlug = game.productSlug || game.offerMappings?.[0]?.pageSlug || game.urlSlug;
            const urlPath = game.offerType === "BUNDLE" ? "bundles" : "p";

            return {
                id: game.id,
                title: game.title,
                description: game.description,
                mainImage: game.keyImages?.[0]?.url ?? "",
                url: urlSlug ? `https://store.epicgames.com/${urlPath}/${urlSlug}` : "https://store.epicgames.com/store/",
                platform: "epicgames",
                startDate: promo.startDate,
                endDate: promo.endDate
            };
        });
};

/* ================================
   Steam
================================ */

const extractSteamRows = (resultsHtml: string): { id: string; title: string }[] => {
    const rows: { id: string; title: string }[] = [];
    const rowRegex = /<a[^>]*class="[^"]*search_result_row[^"]*ds_collapse_flag[^"]*"[\s\S]*?<\/a>/g;
    const matchedRows = resultsHtml.match(rowRegex) ?? [];

    for (const row of matchedRows) {
        const appIdMatch = row.match(/data-ds-appid="(\d+)"/);
        const discountMatch = row.match(/<div[^>]*class="discount_pct"[^>]*>\s*([^<]+)\s*<\/div>/);
        const titleMatch = row.match(/<span[^>]*class="title"[^>]*>([\s\S]*?)<\/span>/);

        if (!appIdMatch || !discountMatch || !titleMatch) continue;
        if (discountMatch[1].trim() !== "-100%") continue;

        rows.push({
            id: appIdMatch[1],
            title: titleMatch[1].replace(/<[^>]+>/g, "").trim()
        });
    }

    return rows;
};

const isSteamDlc = async (appId: string, options?: FetchControlOptions): Promise<boolean | null> => {
    try {
        const html = await safeGet(
            `${config.steam_app_url}${appId}`,
            undefined,
            { ttlMs: CACHE_TTL_STEAM_APP_MS, forceRefresh: options?.forceRefresh }
        ) as string;
        const hasDlcArea = html.includes("game_area_dlc_bubble");
        const hasPurchaseArea = html.includes("game_area_purchase_game_wrapper");

        if (hasDlcArea && hasPurchaseArea) return true;
        if (!hasDlcArea && hasPurchaseArea) return false;
        return null;
    } catch {
        return null;
    }
};

export const getSteamGames = async (options?: FetchControlOptions): Promise<FreeGameInterface[]> => {
    const data = await safeGet(config.steam_search_results_url, undefined, { forceRefresh: options?.forceRefresh });
    const resultsHtml = data?.results_html ?? "";
    const steamRows = extractSteamRows(resultsHtml);
    const parsedGames: FreeGameInterface[] = [];

    for (const row of steamRows) {
        const dlc = await isSteamDlc(row.id, options);
        if (dlc === false) {
            parsedGames.push({
                id: row.id,
                title: row.title,
                description: "Limited-time free on Steam",
                mainImage: `https://cdn.akamai.steamstatic.com/steam/apps/${row.id}/header.jpg`,
                url: `${config.steam_app_url}${row.id}`,
                platform: "steam"
            });
        }
    }

    return parsedGames;
};

/* ================================
   Humble Bundle
================================ */

export const getHumbleGames = async (options?: FetchControlOptions): Promise<FreeGameInterface[]> => {
    try {
        const data = await safeGet(config.humble_bundle_api_url, undefined, { forceRefresh: options?.forceRefresh });
        const results = data?.results ?? [];

        return results
            .filter((game: any) => game.current_price?.amount === 0)
            .map((game: any): FreeGameInterface => ({
                id: game.machine_name || game.human_url || game.human_name,
                title: game.human_name,
                description: "Free on Humble Bundle (limited-time)",
                mainImage: game.tile || game.thumbnail || "",
                url: `${config.humble_bundle_store_url}${game.human_url}`,
                platform: "humble"
            }));
    } catch {
        return [];
    }
};

/* ================================
   Amazon Games (Prime Gaming)
   (Stub - requires HTML parsing)
================================ */

export const getAmazonGames = async (): Promise<FreeGameInterface[]> => {
    // TODO: Parse __NEXT_DATA__ from https://gaming.amazon.com/home
    return [];
};

/* ================================
   Ubisoft / Ubisoft Connect
================================ */

export const getUbisoftGames = async (options?: FetchControlOptions): Promise<FreeGameInterface[]> => {
    try {
        const data = await safeGet(config.ubisoft_news_api_url, {
            headers: {
                "ubi-appid": config.ubisoft_app_id,
                "ubi-localecode": "en-US",
                "user-agent": "Mozilla/5.0"
            }
        }, { forceRefresh: options?.forceRefresh });
        const news = data?.news ?? [];

        return news
            .filter((item: any) => item.type === "freegame" && item.expirationDate)
            .map((item: any): FreeGameInterface => ({
                id: item.newsId,
                title: item.title,
                description: item.summary || "Free on Ubisoft Connect (limited-time)",
                mainImage: item.mediaURL || "",
                url: item.links?.[0]?.param || config.ubisoft_store_url,
                platform: "ubisoft",
                startDate: item.publicationDate,
                endDate: item.expirationDate
            }));
    } catch {
        return [];
    }
};

/* ================================
   GOG
================================ */

const normalizeUrl = (url: string, base: string): string => {
    if (!url) return base;
    if (url.startsWith("//")) return `https:${url}`;
    if (url.startsWith("/")) return `https://www.gog.com${url}`;
    return url;
};

const getGogStoreGames = (html: string): FreeGameInterface[] => {
    const games: FreeGameInterface[] = [];
    const gridMatch = html.match(/<div[^>]*selenium-id="paginatedProductsGrid"[\s\S]*?<\/div>\s*<\/div>/);
    const gridHtml = gridMatch ? gridMatch[0] : html;
    const cardMatches = gridHtml.match(/<a[^>]*class="[^"]*product-tile--grid[^"]*"[\s\S]*?<\/a>/g) ?? [];

    for (const card of cardMatches) {
        const titleMatch = card.match(/selenium-id="productTileGameTitle"[^>]*title="([^"]+)"/);
        if (!titleMatch) continue;

        const hrefMatch = card.match(/href="([^"]+)"/);
        const imageMatch = card.match(/<source[^>]*srcset="([^"]+)"/);
        const imageRaw = imageMatch ? imageMatch[1].trim().split(/\s+/)[0] : "";

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

const getGogGiveawayGame = (html: string): FreeGameInterface[] => {
    const giveawayMatch = html.match(/<giveaway[\s\S]*?<\/giveaway>/);
    if (!giveawayMatch) return [];

    const giveawayHtml = giveawayMatch[0];
    const linkMatch = giveawayHtml.match(/selenium-id="giveawayOverlayLink"[^>]*href="([^"]+)"/);
    const imageMatch = giveawayHtml.match(/<source[^>]*srcset="([^"]+)"/);
    const altMatch = giveawayHtml.match(/<img[^>]*alt="([^"]+)"/);
    const imageRaw = imageMatch ? imageMatch[1].trim().split(/\s+/)[0] : "";
    const rawTitle = altMatch ? altMatch[1] : "GOG Giveaway";
    const title = rawTitle.replace(/\s+giveaway$/i, "");

    return [{
        id: title.toLowerCase().replace(/\s+/g, "_"),
        title,
        description: "Free on GOG giveaway",
        mainImage: normalizeUrl(imageRaw, ""),
        url: normalizeUrl(linkMatch ? linkMatch[1] : "", "https://www.gog.com/"),
        platform: "gog"
    }];
};

export const getGogGames = async (options?: FetchControlOptions): Promise<FreeGameInterface[]> => {
    try {
        const [promoResponse, storeResponse, homeResponse] = await Promise.all([
            safeGet(config.gog_promotions_api_url, undefined, { forceRefresh: options?.forceRefresh }),
            safeGet(config.gog_store_free_discounted_url, { headers: { "user-agent": "Mozilla/5.0" } }, { forceRefresh: options?.forceRefresh }),
            safeGet(config.gog_home_url, { headers: { "user-agent": "Mozilla/5.0" } }, { forceRefresh: options?.forceRefresh })
        ]);

        const promoProducts = promoResponse?.products ?? [];
        const promoGames = promoProducts.map((game: any): FreeGameInterface => ({
            id: game.id,
            title: game.title,
            description: "Free on GOG (limited-time)",
            mainImage: normalizeUrl(game.image ?? "", ""),
            url: `https://www.gog.com/game/${game.slug}`,
            platform: "gog"
        }));

        const storeGames = getGogStoreGames(storeResponse as string);
        const giveawayGames = getGogGiveawayGame(homeResponse as string);
        const combined = [...giveawayGames, ...storeGames, ...promoGames];
        const deduped = new Map<string, FreeGameInterface>();

        for (const game of combined) {
            const key = `${game.id}:${game.url}`;
            if (!deduped.has(key)) deduped.set(key, game);
        }

        return Array.from(deduped.values());
    } catch {
        return [];
    }
};

/* ================================
   Fallback Providers
================================ */

const toIsoDate = (rawDate: string | null | undefined): string | undefined => {
    if (!rawDate) return undefined;
    const normalized = rawDate.replace(" ", "T");
    const parsed = new Date(normalized.endsWith("Z") ? normalized : `${normalized}Z`);
    if (Number.isNaN(parsed.getTime())) return undefined;
    return parsed.toISOString();
};

const normalizeGiveawayCategory = (item: any): string => {
    const rawType = String(item?.type ?? "").toLowerCase();
    const text = `${item?.title ?? ""} ${item?.description ?? ""}`.toLowerCase();

    if (text.includes("dlc")) return "dlc";
    if (text.includes("software")) return "software";
    if (text.includes("game code") || text.includes("game codes") || text.includes("game key") || text.includes("cd key") || text.includes("key giveaway")) {
        return "game-code";
    }
    if (rawType.includes("game")) return "game";
    if (rawType.includes("loot")) return "loot";
    if (rawType.includes("beta")) return "beta";
    return rawType || "other";
};

const normalizeCategoryFilter = (input: string): string => {
    const value = String(input || "").toLowerCase().trim().replace(/\s+/g, "-");
    if (value === "giveaways") return "giveaway";
    if (value === "games") return "game";
    if (value === "dlcs") return "dlc";
    if (value === "softwares") return "software";
    if (value === "game-codes" || value === "game-code" || value === "codes" || value === "code") return "game-code";
    return value;
};

const mapGamerPowerGiveaways = (giveaways: any[], categoryFilter?: Set<string>): FreeGameInterface[] => {
    return giveaways
        .filter((item: any) => item.status === "Active")
        .map((item: any) => ({
            item,
            normalizedCategory: normalizeGiveawayCategory(item)
        }))
        .filter((mapped: any) =>
            !categoryFilter ||
            categoryFilter.size === 0 ||
            categoryFilter.has("giveaway") ||
            categoryFilter.has(mapped.normalizedCategory)
        )
        .map((item: any): FreeGameInterface => ({
            id: item.item.id,
            title: item.item.title,
            description: item.item.description || "Free giveaway listed on GamerPower",
            mainImage: item.item.image || item.item.thumbnail || "",
            url: item.item.open_giveaway || item.item.open_giveaway_url || item.item.gamerpower_url || "https://www.gamerpower.com/",
            platform: "gamerpower",
            category: item.normalizedCategory,
            startDate: toIsoDate(item.item.published_date),
            endDate: toIsoDate(item.item.end_date)
        }));
};

export interface GamerPowerOptions extends FetchControlOptions {
    categories?: string[];
}

export const getGamerPowerGames = async (platforms?: string[], options?: GamerPowerOptions): Promise<FreeGameInterface[]> => {
    try {
        const categoryFilter = options?.categories && options.categories.length > 0
            ? new Set(options.categories.map((category: string) => normalizeCategoryFilter(category)))
            : undefined;

        if (!platforms || platforms.length === 0) {
            const data = await safeGet(config.gamerpower_api_url, undefined, { forceRefresh: options?.forceRefresh });
            return mapGamerPowerGiveaways(data ?? [], categoryFilter);
        }

        const responsesData = await Promise.all(
            platforms.map((platform: string) =>
                safeGet(`${config.gamerpower_api_url}?platform=${encodeURIComponent(platform)}`, undefined, { forceRefresh: options?.forceRefresh })
            )
        );
        const deduped = new Map<string, FreeGameInterface>();
        const all: FreeGameInterface[] = [];

        for (const data of responsesData) {
            all.push(...mapGamerPowerGiveaways(data ?? [], categoryFilter));
        }

        for (const game of all) {
            const key = String(game.id);
            if (!deduped.has(key)) deduped.set(key, game);
        }

        return Array.from(deduped.values());
    } catch {
        return [];
    }
};

export interface FreeToGameOptions {
    platforms?: string[];
    category?: string;
    sortBy?: "release-date" | "alphabetical" | "relevance";
    forceRefresh?: boolean;
}

const mapFreeToGameGames = (games: any[]): FreeGameInterface[] => {
    return games.map((item: any): FreeGameInterface => ({
        id: item.id,
        title: item.title,
        description: item.short_description || "Free-to-play game listed on FreeToGame",
        mainImage: item.thumbnail || "",
        url: item.game_url || item.freetogame_profile_url || "https://www.freetogame.com/",
        platform: "freetogame",
        category: item.genre ? String(item.genre).toLowerCase() : "game",
        startDate: toIsoDate(item.release_date)
    }));
};

export const getFreeToGameGames = async (options?: FreeToGameOptions): Promise<FreeGameInterface[]> => {
    try {
        const params: string[] = [];
        if (options?.category) params.push(`category=${encodeURIComponent(options.category)}`);
        if (options?.sortBy) params.push(`sort-by=${encodeURIComponent(options.sortBy)}`);
        const queryPrefix = params.length > 0 ? `&${params.join("&")}` : "";

        if (!options?.platforms || options.platforms.length === 0) {
            const data = await safeGet(
                `${config.freetogame_api_url}?platform=all${queryPrefix}`,
                undefined,
                { forceRefresh: options?.forceRefresh }
            );
            return mapFreeToGameGames(data ?? []);
        }

        const responsesData = await Promise.all(
            options.platforms.map((platform: string) =>
                safeGet(
                    `${config.freetogame_api_url}?platform=${encodeURIComponent(platform)}${queryPrefix}`,
                    undefined,
                    { forceRefresh: options?.forceRefresh }
                )
            )
        );
        const deduped = new Map<string, FreeGameInterface>();
        const all: FreeGameInterface[] = [];

        for (const data of responsesData) {
            all.push(...mapFreeToGameGames(data ?? []));
        }

        for (const game of all) {
            const key = String(game.id);
            if (!deduped.has(key)) deduped.set(key, game);
        }

        return Array.from(deduped.values());
    } catch {
        return [];
    }
};
