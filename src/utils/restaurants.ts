import restaurants from "../restaurants.json"

export interface Group {
    id: string;
    name: string;
}

export interface School {
    id: string;
    name: string;
    groups: Group[];
}

export function asSourceURL(school: School, group: Group, locale: string, dateMode: number) : string {
    return `https://aromimenu.cgisaas.fi/EspooAromieMenus/${locale}/Default/ESPOO/${school.id}/Rss.aspx?Id=${group.id}&DateMode=${dateMode}`
}

export function useRestaurants() : School[] {
    return restaurants;
}