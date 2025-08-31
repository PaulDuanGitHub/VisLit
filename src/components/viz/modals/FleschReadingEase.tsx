'use client'

import { BounceLoader } from "react-spinners";
import AnimatedScatterChart from "../common/AnimatedScatterChart";
import ModalTemplate from "../common/ModalTemplate";
import { AnimatedScatterChartDataPoint } from "../common/types";
import React, { useEffect, useState } from "react";
import { BASE_PATH } from "@/lib/constants";

type TextStatType = {  
    title: string;
    author: string;
    year: number;
    avg_sentence_length: number;
    smog_index: number;
    flesch_reading_ease: number;
}

const FleschReadingEase = () => {
    const [data, setData] = useState<AnimatedScatterChartDataPoint[] | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            await fetch(`${BASE_PATH}/data/text-stats.json`)
                .then(res => res.json() as Promise<TextStatType[]>)
                .then(textStats => textStats.map(textStat => {
                    return {
                        x: textStat.year,
                        y: textStat.flesch_reading_ease,
                        details: {author: textStat.author, title: textStat.title}
                    };
                }))
                .then(setData)
                .catch(err => console.error('Failed to load JSON:', err));
        }

        fetchData();
    }, []);

    return (
        <ModalTemplate
            title="Flesch Reading Ease (1769-1964)"
            subtitle="This chart shows the Flesch Reading Ease of Canadian literature works by year."
        >
            <div className="flex flex-col items-center justify-center">
                <div className="flex flex-col h-[400] w-full p-1 md:p-4 bg-gray-50 rounded-xl shadow-lg justify-center items-center">
                    {data ?
                        <AnimatedScatterChart
                            data={data as AnimatedScatterChartDataPoint[]}
                            xLabel="Year"
                            yLabel="Flesch Reading Ease"
                            chartTitle="Flesch Reading Ease vs Year" />
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

export default FleschReadingEase;