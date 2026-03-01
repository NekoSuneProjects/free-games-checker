import { FreeGameInterface } from "./interfaces/free-game.interface";
import axios from "axios";
import * as config from "../config.json";

/* ================================
   Main Aggregator
================================ */

export const getFreeGames = async (country: string): Promise<FreeGameInterface[]> => {
    if (!country) throw new Error("Country is required");

    const primaryGames = await getPrimaryGames(country);
    if (primaryGames.length > 0) return primaryGames;

    const [gamerPowerGames, freeToGameGames] = await Promise.all([
        getGamerPowerGames(),
        getFreeToGameGames()
    ]);

    return [...gamerPowerGames, ...freeToGameGames];
};

const getPrimaryGames = async (country: string): Promise<FreeGameInterface[]> => {
    const [
        epicGames,
        steamGames,
        humbleGames,
        amazonGames,
        gogGames,
        ubisoftGames
    ] = await Promise.all([
        getEpicGames(country),
        getSteamGames(),
        getHumbleGames(),
        getAmazonGames(),
        getGogGames(),
        getUbisoftGames()
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
}

export const getFreeGamesWithFallbackOptions = async (
    country: string,
    fallbackOptions: FallbackOptions
): Promise<FreeGameInterface[]> => {
    if (!country) throw new Error("Country is required");

    const primaryGames = await getPrimaryGames(country);
    if (primaryGames.length > 0) return primaryGames;

    const [gamerPowerGames, freeToGameGames] = await Promise.all([
        getGamerPowerGames(fallbackOptions.gamerPowerPlatforms),
        getFreeToGameGames()
    ]);

    return [...gamerPowerGames, ...freeToGameGames];
};

/* ================================
   Epic Games
================================ */

export const getEpicGames = async (country: string): Promise<FreeGameInterface[]> => {
    const response = await axios.get(config.epic_games_api_url + country);
    const games = response.data?.data?.Catalog?.searchStore?.elements ?? [];

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

const isSteamDlc = async (appId: string): Promise<boolean | null> => {
    try {
        const response = await axios.get(`${config.steam_app_url}${appId}`);
        const html = response.data as string;
        const hasDlcArea = html.includes("game_area_dlc_bubble");
        const hasPurchaseArea = html.includes("game_area_purchase_game_wrapper");

        if (hasDlcArea && hasPurchaseArea) return true;
        if (!hasDlcArea && hasPurchaseArea) return false;
        return null;
    } catch {
        return null;
    }
};

export const getSteamGames = async (): Promise<FreeGameInterface[]> => {
    const response = await axios.get(config.steam_search_results_url);
    const resultsHtml = response.data?.results_html ?? "";
    const steamRows = extractSteamRows(resultsHtml);
    const parsedGames: FreeGameInterface[] = [];

    for (const row of steamRows) {
        const dlc = await isSteamDlc(row.id);
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

export const getHumbleGames = async (): Promise<FreeGameInterface[]> => {
    try {
        const response = await axios.get(config.humble_bundle_api_url);
        const results = response.data?.results ?? [];

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

export const getUbisoftGames = async (): Promise<FreeGameInterface[]> => {
    try {
        const response = await axios.get(config.ubisoft_news_api_url, {
            headers: {
                "ubi-appid": config.ubisoft_app_id,
                "ubi-localecode": "en-US",
                "user-agent": "Mozilla/5.0"
            }
        });
        const news = response.data?.news ?? [];

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

export const getGogGames = async (): Promise<FreeGameInterface[]> => {
    try {
        const [promoResponse, storeResponse, homeResponse] = await Promise.all([
            axios.get(config.gog_promotions_api_url),
            axios.get(config.gog_store_free_discounted_url, { headers: { "user-agent": "Mozilla/5.0" } }),
            axios.get(config.gog_home_url, { headers: { "user-agent": "Mozilla/5.0" } })
        ]);

        const promoProducts = promoResponse.data?.products ?? [];
        const promoGames = promoProducts.map((game: any): FreeGameInterface => ({
            id: game.id,
            title: game.title,
            description: "Free on GOG (limited-time)",
            mainImage: normalizeUrl(game.image ?? "", ""),
            url: `https://www.gog.com/game/${game.slug}`,
            platform: "gog"
        }));

        const storeGames = getGogStoreGames(storeResponse.data as string);
        const giveawayGames = getGogGiveawayGame(homeResponse.data as string);
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

const mapGamerPowerGiveaways = (giveaways: any[]): FreeGameInterface[] => {
    return giveaways
        .filter((item: any) => item.status === "Active" && item.type === "Game")
        .map((item: any): FreeGameInterface => ({
            id: item.id,
            title: item.title,
            description: item.description || "Free giveaway listed on GamerPower",
            mainImage: item.image || item.thumbnail || "",
            url: item.open_giveaway || item.open_giveaway_url || item.gamerpower_url || "https://www.gamerpower.com/",
            platform: "gamerpower",
            startDate: toIsoDate(item.published_date),
            endDate: toIsoDate(item.end_date)
        }));
};

export const getGamerPowerGames = async (platforms?: string[]): Promise<FreeGameInterface[]> => {
    try {
        if (!platforms || platforms.length === 0) {
            const response = await axios.get(config.gamerpower_api_url);
            return mapGamerPowerGiveaways(response.data ?? []);
        }

        const responses = await Promise.all(
            platforms.map((platform: string) =>
                axios.get(`${config.gamerpower_api_url}?platform=${encodeURIComponent(platform)}`)
            )
        );
        const deduped = new Map<string, FreeGameInterface>();
        const all: FreeGameInterface[] = [];

        for (const response of responses) {
            all.push(...mapGamerPowerGiveaways(response.data ?? []));
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

export const getFreeToGameGames = async (): Promise<FreeGameInterface[]> => {
    try {
        const response = await axios.get(config.freetogame_api_url);
        const games = response.data ?? [];

        return games.map((item: any): FreeGameInterface => ({
            id: item.id,
            title: item.title,
            description: item.short_description || "Free-to-play game listed on FreeToGame",
            mainImage: item.thumbnail || "",
            url: item.game_url || item.freetogame_profile_url || "https://www.freetogame.com/",
            platform: "freetogame",
            startDate: toIsoDate(item.release_date)
        }));
    } catch {
        return [];
    }
};
