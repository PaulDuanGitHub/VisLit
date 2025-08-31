'use client';

import DashboardCard, { DashboardCardProps } from "@/components/dashboard/DashboardCard";
import { ChartTypeIconEnum } from "../ChartTypeIconMap";

interface DashboardProps {

}

const dashboardCards: DashboardCardProps[] = [
    {
        title: "The Changing Length of Canadian Literature (1769-1964)",
        slug: "changing-length-canadian-literature",
        description: "This timeline traces how the length of published works evolved over time, reflecting shifts in literary style and narrative complexity.",
        chartType: [ChartTypeIconEnum.LineChart],
    },
    {
        title: "What's the Most Common Word in Canadian Literature?  (1769-1964)",
        slug: "most-common-word-canadian-literature",
        description: "This ranking visualizes the most frequently used words in Canadian literature from 1769 to 1964, highlighting the evolution of language and themes in the nation’s literary history.",
        chartType: [ChartTypeIconEnum.HorizontalBarChart],
    },
    {
        title: "What's the popular cities in Canadian Literature (1769-1964)",
        slug: "cities-in-canadian-literature",
        description: "This map visualizes the cities mentioned in Canadian literature from 1769 to 1964, showcasing the geographical diversity and urban landscapes that shaped the nation’s literary narratives.",
        chartType: [ChartTypeIconEnum.GeoHeatmap, ChartTypeIconEnum.HorizontalBarChart, ChartTypeIconEnum.PieChart],
    },
    {
        title: "The Changing Sentence Length of Canadian Literature (1769-1964)",
        slug: "changing-sentence-length-canadian-literature",
        description: "This timeline traces how the sentence length of published works evolved over time, reflecting shifts in literary style and narrative complexity as Canadian authors sought to capture the nation's diverse voices and stories.",
        chartType: [ChartTypeIconEnum.ScatterChart],
    },
    {
        title: "Smog Index of Canadian Literature (1769-1964)",
        slug: "smog-index-canadian-literature",
        description: "This timeline traces how the Smog Index of published works evolved over time, reflecting shifts in literary style and narrative complexity as Canadian authors sought to capture the nation's diverse voices and stories.",
        chartType: [ChartTypeIconEnum.ScatterChart],
    },
    {
        title: "Flesch Reading Ease of Canadian Literature (1769-1964)",
        slug: "flesch-reading-ease-canadian-literature",
        description: "This timeline traces how the Flesch Reading Ease of published works evolved over time, reflecting shifts in literary style and narrative complexity as Canadian authors sought to capture the nation's diverse voices and stories.",
        chartType: [ChartTypeIconEnum.ScatterChart],
    },
    {
        title: "What grade needed to read Canadian literatures (1769-1964)",
        slug: "avg-text-standard-by-year-canadian-literature",
        description: "This timeline traces how the average text standard (grade level) of published works evolved over time, reflecting shifts in literary style and narrative complexity as Canadian authors sought to capture the nation's diverse voices and stories.",
        chartType: [ChartTypeIconEnum.LineChart],
    }
]

const Dashboard: React.FC<DashboardProps> = ({ }) => {
    return (
        <div className="pb-50 flex w-full flex-col justify-start items-center bg-gray-100 transition-all duration-300 ease-in-out">
            <div className="flex flex-row max-w-[90%] flex-wrap justify-center gap-5 p-1 md:p-5">
                {dashboardCards.map((card, i) => (
                    <div key={i}>
                        <DashboardCard
                            title={card.title}
                            slug={card.slug}
                            description={card.description}
                            chartType={card.chartType}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Dashboard;