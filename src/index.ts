import {EpicGamesInterface} from "./interfaces/epic-games.interface";
import axios, {AxiosResponse} from "axios";
import * as config from '../config.json';

export const getFreeGames = async (country: string) => {
    if (!country) {
        throw new Error('Country is required');
    }

    // Fetch games from Epic Games and Steam
    const epicGames = await getEpicGames(country);
    const steamGames = await getSteamGames();

    // Merge and return the results
    return [...epicGames, ...steamGames];
};

export const getEpicGames = async (country: string) => {
    const games = await axios.get(
        config.epic_games_api_url + country
    ).then(response => response.data);

    return await filterEpicGames(games, "epicgames");
}


// Fetch games from Steam API
export const getSteamGames = async () => {
    // Fetch the list of all Steam apps
    const appList = await axios.get(
        config.steam_app_list_url
    ).then((response) => response.data?.applist?.apps);

    if (!appList || appList.length === 0) {
        throw new Error("Failed to retrieve the Steam app list.");
    }

    // Limit the number of games to check for detailed data (to avoid excessive API requests)
    const limitedAppList = appList.slice(0, 50); // Adjust the number of games as needed
    const gameDetailsPromises = limitedAppList.map((app: { appid: number }) =>
        fetchSteamGameDetails(app.appid)
    );

    // Wait for all game details to be fetched
    const gamesWithDetails = await Promise.all(gameDetailsPromises);

    // Filter games based on their price and promotional status
    const filteredGames = gamesWithDetails.filter(
        (game) =>
            game &&
            game.isFree === false && // Exclude always-free games
            game.currentPrice === 0 && // Free for a limited time
            game.discount > 0 // Ensure it's part of a promotion
    );

    // Map the data into a consistent format
    return filteredGames.map((game) => ({
        id: game.appid,
        title: game.name,
        description: game.shortDescription || "No description available.",
        mainImage: game.headerImage,
        urlSlug: `https://store.steampowered.com/app/${game.appid}`,
        platform: "steam",
    }));
};

// Fetch detailed information for a single Steam game
const fetchSteamGameDetails = async (appid: number) => {
    try {
        const response = await axios.get(
            `${config.steam_store_details_url}?appids=${appid}`
        );
        const data = response.data[appid.toString()]?.data;

        if (!data || !data.price_overview) {
            return null; // Skip if price data is not available
        }

        const { price_overview, short_description, header_image } = data;

        return {
            appid: appid,
            name: data.name,
            shortDescription: short_description,
            headerImage: header_image,
            isFree: data.is_free,
            originalPrice: price_overview.initial / 100, // Convert cents to dollars
            currentPrice: price_overview.final / 100, // Convert cents to dollars
            discount: price_overview.discount_percent, // Discount percentage
        };
    } catch (error) {
        console.error(`Failed to fetch details for appid ${appid}:`, error);
        return null;
    }
};

// Filter Epic Games data
async function filterEpicGames(data: any) {
    const gamesObj = data?.data?.Catalog?.searchStore?.elements;

    const filteredGames = gamesObj?.filter(
        (game: { offerType: string; promotions: { promotionalOffers: any[] }; }) =>
            game.offerType === "BASE_GAME" &&
            game.promotions?.promotionalOffers?.length > 0 &&
            Date.parse(game.promotions.promotionalOffers[0]?.promotionalOffers[0]?.startDate) < Date.now()
    );

    if (filteredGames?.length > 0) {
        return filteredGames.map((game: any) => ({
            id: game.id,
            title: game.title,
            description: game.description,
            mainImage: game.keyImages[1]?.url ?? game.keyImages[0]?.url,
            urlSlug: game.urlSlug,
            platform: "epicgames"
        }));
    }

    return [];
}
