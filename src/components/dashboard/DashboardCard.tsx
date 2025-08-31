'use client';

import Link from "next/link";
import { ChartTypeIconEnum, ChartTypeEnumToIconComponent } from "../ChartTypeIconMap";
import Logo from "../../../public/icons/pie.svg";

interface DashboardCardProps {
    title: string;
    slug: string;
    description?: string; 
    chartType?: ChartTypeIconEnum[]; 
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, slug, description = "", chartType = [] }) => {

    return (
        <>
        <Link
            href={`/dashboard/${slug}`}>
            <div
                className="flex flex-col bg-white max-w-100 shadow-md hover:shadow-lg hover:cursor-pointer rounded-lg px-8 py-4 transition-all duration-100 ease-in-out text-wrap break-words">
                <div className="text-lg font-semibold mb-2">{title}</div>
                <div className="mb-4 line-clamp-3 leading-normal text-gray-500" style={{height: "calc(1.5 * 3em)"}}>{description}</div>
                <div className="flex justify-baseline flex-wrap gap-2">
                    {chartType.map((type) => (
                        ChartTypeEnumToIconComponent(type, 28, true)
                    ))}
                </div>
            </div>
        </Link>
        </>
    );
}

export default DashboardCard;
export type { DashboardCardProps };