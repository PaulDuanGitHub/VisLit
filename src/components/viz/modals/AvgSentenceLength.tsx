'use client'

import { BounceLoader } from "react-spinners";
import AnimatedScatterChart from "../common/AnimatedScatterChart";
import ModalTemplate from "../common/ModalTemplate";
import { AnimatedScatterChartDataPoint } from "../common/types";
import React, { useEffect, useState } from "react";
import { BASE_PATH } from "@/lib/constants";
import { BlockMath } from "react-katex";
import 'katex/dist/katex.min.css';

type TextStatType = {  
    title: string;
    author: string;
    year: number;
    avg_sentence_length: number;
    smog_index: number;
    flesch_reading_ease: number;
}

const AvgSentenceLength = () => {
    const [data, setData] = useState<AnimatedScatterChartDataPoint[] | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            await fetch(`${BASE_PATH}/data/text-stats.json`)
                .then(res => res.json() as Promise<TextStatType[]>)
                .then(textStats => textStats.map(textStat => {
                    return {
                        x: textStat.year,
                        y: textStat.avg_sentence_length,
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
            title="Average Sentence Length (1769-1964)"
            subtitle="This chart shows the average sentence length of Canadian literature works by year."
        >
            <div className="flex flex-col items-center justify-center">
                <div className="mb-4 flex flex-col h-[400] w-full p-1 md:p-4 bg-gray-50 rounded-xl shadow-lg justify-center items-center">
                    {data ?
                        <AnimatedScatterChart
                            data={data as AnimatedScatterChartDataPoint[]}
                            xLabel="Year"
                            yLabel="Average Sentence Length"
                            chartTitle="Average Sentence Length vs Year" />
                        :
                        <BounceLoader color="steelblue" speedMultiplier={1.5} />
                    }
                </div>
                <div className="mb-4 w-full">
                    <h1 className="font-bold">Details</h1>
                    This timeline traces how the length of published works evolved over time. Each point represents a literary work, positioned by its publication year (x-axis) and average sentence length (y-axis).
                    <div className="my-2 p-2 bg-gray-100 border-l-4 border-green-800">
                        Average Sentence Length (ASL) is calculated using the formula:
                        <BlockMath math="ASL = \frac{\text{number of words}}{\text{number of sentences}}" />
                    </div>
                </div>
                <div className="mb-4 w-full">
                    <h1 className="font-bold">Feature Extraction</h1>
                    The average sentence length was computed by leveraging the Python Package <a href="https://pypi.org/project/textstat/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline"><code>textstat</code></a>'s function <code className="">avg_sentence_length</code>. This package provides a straightforward way to analyze text and extract various readability metrics, including average sentence length.
                </div>
            </div>
        </ModalTemplate>
    );
}

export default AvgSentenceLength;