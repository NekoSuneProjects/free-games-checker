import { FreeGameInterface } from "./interfaces/free-game.interface";
export interface FetchControlOptions {
    forceRefresh?: boolean;
}
export declare const clearRequestCache: () => void;
export declare const getFreeGames: (country: string, options?: FetchControlOptions | undefined) => Promise<FreeGameInterface[]>;
export interface FallbackOptions {
    gamerPowerPlatforms?: string[];
    gamerPowerCategories?: string[];
    freeToGamePlatforms?: string[];
    freeToGameCategory?: string;
    freeToGameSortBy?: "release-date" | "alphabetical" | "relevance";
}
export declare const getFreeGamesWithFallbackOptions: (country: string, fallbackOptions: FallbackOptions, options?: FetchControlOptions | undefined) => Promise<FreeGameInterface[]>;
export declare const getEpicGames: (country: string, options?: FetchControlOptions | undefined) => Promise<FreeGameInterface[]>;
export declare const getSteamGames: (options?: FetchControlOptions | undefined) => Promise<FreeGameInterface[]>;
export declare const getHumbleGames: (options?: FetchControlOptions | undefined) => Promise<FreeGameInterface[]>;
export declare const getAmazonGames: () => Promise<FreeGameInterface[]>;
export declare const getUbisoftGames: (options?: FetchControlOptions | undefined) => Promise<FreeGameInterface[]>;
export declare const getGogGames: (options?: FetchControlOptions | undefined) => Promise<FreeGameInterface[]>;
export interface GamerPowerOptions extends FetchControlOptions {
    categories?: string[];
}
export declare const getGamerPowerGames: (platforms?: string[] | undefined, options?: GamerPowerOptions | undefined) => Promise<FreeGameInterface[]>;
export interface FreeToGameOptions {
    platforms?: string[];
    category?: string;
    sortBy?: "release-date" | "alphabetical" | "relevance";
    forceRefresh?: boolean;
}
export declare const getFreeToGameGames: (options?: FreeToGameOptions | undefined) => Promise<FreeGameInterface[]>;
//# sourceMappingURL=index.d.ts.map