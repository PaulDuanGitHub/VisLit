import { BounceLoader } from "react-spinners";
import AnimatedScatterChart from "../common/AnimatedScatterChart";
import ModalTemplate from "../common/ModalTemplate";
import { AnimatedLineChartDataPoint } from "../common/types";
import React, { useEffect, useState } from "react";
import AnimatedLineChart from "../common/AnimatedLineChart";

type TextStatType = {  
    title: string;
    author: string;
    year: number;
    avg_sentence_length: number;
    smog_index: number;
    flesch_reading_ease: number;
    text_standard: number;
}

const TextStandard = () => {
    const [data, setData] = useState<AnimatedLineChartDataPoint[] | null>(null);

    const calcAvgPerYear = (textStats: TextStatType[]) => {
        const yearMap: {[key: number]: {total: number, count: number}} = {};
        textStats.forEach(textStat => {
            if (!yearMap[textStat.year]) {
                yearMap[textStat.year] = {total: 0, count: 0};
            }
            yearMap[textStat.year].total += textStat.text_standard;
            yearMap[textStat.year].count += 1;
        });
        const result = Object.entries(yearMap).map(([year, {total, count}]) => ({
            x: Number(year),
            y: total / count,
        }));
        return result;
    }

    useEffect(() => {
        const fetchData = async () => {
            await fetch('/data/text-stats.json')
                .then(res => res.json() as Promise<TextStatType[]>)
                .then(textStats => calcAvgPerYear(textStats))
                .then(setData)
                .catch(err => console.error('Failed to load JSON:', err));
        }

        fetchData();
    }, []);

    return (
        <ModalTemplate
            title="Average Text Standards by Year (1769-1964)"
            subtitle="This chart shows the average text standards of Canadian literature works by year."
        >
            <div className="flex flex-col items-center justify-center">
                <div className="flex flex-col h-[400] w-full p-1 md:p-4 bg-gray-50 rounded-xl shadow-lg justify-center items-center">
                    {data ?
                        <AnimatedLineChart
                            data={data as AnimatedLineChartDataPoint[]}
                            xLabel="Year"
                            yLabel="Average Text Standards"
                            chartTitle="Average Text Standards vs Year" />
                        :
                        <BounceLoader color="steelblue" speedMultiplier={1.5} />
                    }
                </div>
                {/* <div className="mb-4 flex justify-start w-full">
                    <h1 className="font-bold">Details</h1>
                </div>
                <div className="mb-4 flex justify-start w-full">
                    <h1 className="font-bold">Dataset download</h1>
                </div> */}
            </div>
        </ModalTemplate>
    );
}

export default TextStandard;