import { FreeGameInterface } from "./interfaces/free-game.interface";
export declare const getFreeGames: (country: string) => Promise<FreeGameInterface[]>;
export interface FallbackOptions {
    gamerPowerPlatforms?: string[];
}
export declare const getFreeGamesWithFallbackOptions: (country: string, fallbackOptions: FallbackOptions) => Promise<FreeGameInterface[]>;
export declare const getEpicGames: (country: string) => Promise<FreeGameInterface[]>;
export declare const getSteamGames: () => Promise<FreeGameInterface[]>;
export declare const getHumbleGames: () => Promise<FreeGameInterface[]>;
export declare const getAmazonGames: () => Promise<FreeGameInterface[]>;
export declare const getUbisoftGames: () => Promise<FreeGameInterface[]>;
export declare const getGogGames: () => Promise<FreeGameInterface[]>;
export declare const getGamerPowerGames: (platforms?: string[] | undefined) => Promise<FreeGameInterface[]>;
export declare const getFreeToGameGames: () => Promise<FreeGameInterface[]>;
//# sourceMappingURL=index.d.ts.map