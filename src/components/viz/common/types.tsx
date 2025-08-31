export type AnimatedLineChartDataPoint = {
    x: number;
    y: number;
}

export type AnimatedScatterChartDataPoint = {
    x: number;
    y: number;
    details: object;
}

export type RankingSnapshot = {
    timestamp: number; // e.g., year or other time marker
    entries: RankedItem[]; // Ranked items at this time
};

export type RankedItem = {
    label: string;      // Entity being ranked (word, product, user, etc.)
    value: number;      // The numeric value driving the ranking (e.g., frequency)
};

export type GeoHeatMapItem = {
    label: string;      // Name of the region
    value: number;      // Numeric value for heat mapping (e.g., frequency, count)
    coordinates: [number, number]; // Latitude and longitude coordinates
}

export type CanadaProvinceData = { 
    [key: string]: GeoHeatMapItem[];
}

export type BarItem = {
    label: string;      // Entity being represented (e.g., word, product, user)
    value: number;      // Numeric value for the bar (e.g., frequency, count)
};

export type PieItem = {
    label: string;
    value: number;
}