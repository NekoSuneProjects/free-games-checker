// interfaces/free-game.interface.ts
export interface FreeGameInterface {
    id: string | number;
    title: string;
    description: string;
    mainImage: string;
    url: string;
    platform: "epicgames" | "steam" | "amazon" | "ubisoft" | "gog";
    startDate?: string;
    endDate?: string;
}
