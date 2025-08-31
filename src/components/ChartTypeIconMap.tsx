import PieIcon from "../../public/icons/pie.svg";
import LineIcon from "../../public/icons/line.svg";
import GeoHeatMapIcon from "../../public/icons/geo-heatmap.svg";
import HorizontalBarIcon from "../../public/icons/bar-horizontal.svg";
import VerticalBarIcon from "../../public/icons/bar-vertical.svg";
import ScatterIcon from "../../public/icons/scatter.svg";


export enum ChartTypeIconEnum {
    LineChart,
    VerticalBarChart,
    HorizontalBarChart,
    PieChart,
    ScatterChart,
    Histogram,
    GeoHeatmap,
}

export const ChartTypeEnumToIconComponent = (type: ChartTypeIconEnum, size: number, useBrandColor: boolean): React.ReactNode => {
    switch (type) {
        case ChartTypeIconEnum.LineChart:
            return <LineIcon
                viewBox="0 0 32 23"
                preserveAspectRatio="xMidYMid meet"
                className={`icon-${useBrandColor ? 'brand' : 'white'}`}
                style={{ width: `${size}px`, height: `${size}px` }} />;
        case ChartTypeIconEnum.VerticalBarChart:
            return <VerticalBarIcon
                viewBox="0 0 32 32"
                preserveAspectRatio="xMidYMid meet"
                className={`icon-${useBrandColor ? 'brand' : 'white'}`}
                style={{ width: `${size}px`, height: `${size}px` }} />;
        case ChartTypeIconEnum.HorizontalBarChart:
            return <HorizontalBarIcon
                viewBox="0 0 32 32"
                preserveAspectRatio="xMidYMid meet"
                className={`icon-${useBrandColor ? 'brand' : 'white'}`}
                style={{ width: `${size}px`, height: `${size}px` }} />;
        case ChartTypeIconEnum.PieChart:
            return <PieIcon
                viewBox="0 0 32 32"
                preserveAspectRatio="xMidYMid meet"
                className={`icon-${useBrandColor ? 'brand' : 'white'}`}
                style={{ width: `${size}px`, height: `${size}px` }} />;
        case ChartTypeIconEnum.GeoHeatmap:
            return <GeoHeatMapIcon
                viewBox="0 0 32 32"
                preserveAspectRatio="xMidYMid meet"
                className={`icon-${useBrandColor ? 'brand' : 'white'}`}
                style={{ width: `${size}px`, height: `${size}px` }} />;
        case ChartTypeIconEnum.ScatterChart:
            return <ScatterIcon
                viewBox="0 0 32 23"
                preserveAspectRatio="xMidYMid meet"
                className={`icon-${useBrandColor ? 'brand' : 'white'}`}
                style={{ width: `${size}px`, height: `${size}px` }} />;
    }
    return <></>;
}