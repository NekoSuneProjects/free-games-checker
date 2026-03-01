import {EpicGamesInterface} from "./interfaces/epic-games.interface";
import { FreeGameInterface } from "./interfaces/free-game.interface";
import axios, {AxiosResponse} from "axios";
import * as config from '../config.json';

/* ================================
   Main Aggregator
================================ */

export const getFreeGames = async (country: string): Promise<FreeGameInterface[]> => {
    if (!country) throw new Error("Country is required");

    const [
        epicGames,
        steamGames,
        amazonGames,
        gogGames,
        ubisoftGames
    ] = await Promise.all([
        getEpicGames(country),
        getSteamGames(),
        getAmazonGames(),
        getGogGames(),
        getUbisoftGames()
    ]);

    return [
        ...epicGames,
        ...steamGames,
        ...amazonGames,
        ...gogGames,
        ...ubisoftGames
    ];
};

/* ================================
   Epic Games
================================ */

export const getEpicGames = async (country: string): Promise<FreeGameInterface[]> => {
    const response = await axios.get(config.epic_games_api_url + country);
    const games = response.data?.data?.Catalog?.searchStore?.elements ?? [];

    return games
        .filter((game: any) =>
            game.offerType === "BASE_GAME" &&
            game.promotions?.promotionalOffers?.length > 0
        )
        .map((game: any): FreeGameInterface => {
            const promo = game.promotions.promotionalOffers[0].promotionalOffers[0];

            return {
                id: game.id,
                title: game.title,
                description: game.description,
                mainImage: game.keyImages?.[0]?.url ?? "",
                url: `https://store.epicgames.com/p/${game.urlSlug}`,
                platform: "epicgames",
                startDate: promo.startDate,
                endDate: promo.endDate
            };
        });
};

/* ================================
   Steam (Featured Specials API)
================================ */

export const getSteamGames = async (): Promise<FreeGameInterface[]> => {
    const response = await axios.get(config.steam_featured_categories_url);
    const specials = response.data?.specials?.items ?? [];

    return specials
        .filter((game: any) =>
            game.type === 0 &&
            game.discounted === true &&
            game.discount_percent === 100 &&
            game.original_price > 0 &&
            game.final_price === 0 &&
            game.discount_expiration
        )
        .map((game: any): FreeGameInterface => ({
            id: game.id,
            title: game.name,
            description: "Limited-time free on Steam",
            mainImage: game.header_image || game.large_capsule_image,
            url: `https://store.steampowered.com/app/${game.id}`,
            platform: "steam",
            endDate: new Date(game.discount_expiration * 1000).toISOString()
        }));
};

/* ================================
   Amazon Games (Prime Gaming)
   (Stub – requires HTML parsing)
================================ */

export const getAmazonGames = async (): Promise<FreeGameInterface[]> => {
    // TODO: Parse __NEXT_DATA__ from https://gaming.amazon.com/home
    return [];
};

/* ================================
   Ubisoft / Uplay
   (Stub – requires store parsing)
================================ */

export const getUbisoftGames = async (): Promise<FreeGameInterface[]> => {
    // TODO: Detect "Free to claim" promotions
    return [];
};

/* ================================
   GOG
================================ */

export const getGogGames = async (): Promise<FreeGameInterface[]> => {
    const response = await axios.get(config.gog_promotions_api_url);
    const products = response.data?.products ?? [];

    return products.map((game: any): FreeGameInterface => ({
        id: game.id,
        title: game.title,
        description: "Free on GOG (limited-time)",
        mainImage: game.image,
        url: `https://www.gog.com/game/${game.slug}`,
        platform: "gog"
    }));
};
