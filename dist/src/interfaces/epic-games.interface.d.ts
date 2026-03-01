export interface EpicGamesInterface {
    id: string;
    title: string;
    offerType: string;
    description: string;
    keyImages: {
        url: string;
    }[];
    urlSlug: string;
    promotions: {
        promotionalOffers: {
            promotionalOffers: {
                startDate: string;
                endDate: string;
            }[];
        }[];
    };
}
//# sourceMappingURL=epic-games.interface.d.ts.map