// interfaces/free-game.interface.ts
export interface FreeGameInterface {
    id: string | number;
    title: string;
    description: string;
    mainImage: string;
    url: string;
    platform: "epicgames" | "steam" | "humble" | "amazon" | "ubisoft" | "gog" | "gamerpower" | "freetogame";
    category?: string;
    startDate?: string;
    endDate?: string;
}
