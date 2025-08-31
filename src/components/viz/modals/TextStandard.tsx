'use client'

import { BounceLoader } from "react-spinners";
import ModalTemplate from "../common/ModalTemplate";
import { AnimatedLineChartDataPoint } from "../common/types";
import React, { useEffect, useState } from "react";
import AnimatedLineChart from "../common/AnimatedLineChart";
import { BASE_PATH } from "@/lib/constants";

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
            await fetch(`${BASE_PATH}/data/text-stats.json`)
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
                <div className="mb-4 flex flex-col h-[400] w-full p-1 md:p-4 bg-gray-50 rounded-xl shadow-lg justify-center items-center">
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
                <div className="mb-4 w-full">
                    <h1 className="font-bold">Details</h1>
                    This timeline traces how the average text standard (grade level) of published works evolved over time, reflecting shifts in literary style and narrative complexity as Canadian authors sought to capture the nation's diverse voices and stories. Each point represents the average text standard of literary works collected in that year, illustrating trends in the readability and accessibility of Canadian literature from 1769 to 1964.
                </div>
                <div className="mb-4 w-full">
                    <h1 className="font-bold">Feature Extraction</h1>
                    The Text Standard was computed by leveraging the Python Package <a href="https://pypi.org/project/textstat/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline"><code>textstat</code></a>'s function <code className="">text_standard</code>. This package provides a straightforward way to analyze text and extract various readability metrics. The Text Standard indicates the U.S. school grade level required to comprehend the text. It is determined using a combination of factors and formulas<sup><a href="#reference" className="text-blue-500 underline">1</a></sup>.
                </div>
                <div className="mb-4 w-full text-sm text-gray-600">
                    <h1 className="font-bold">Reference</h1>
                    1. <a href="https://pypi.org/project/textstat/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">textstat</a>, PyPI.
                </div>
            </div>
        </ModalTemplate>
    );
}

export default TextStandard;