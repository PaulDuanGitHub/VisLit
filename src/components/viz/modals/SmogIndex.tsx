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

const SmogIndex = () => {
    const [data, setData] = useState<AnimatedScatterChartDataPoint[] | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            await fetch(`${BASE_PATH}/data/text-stats.json`)
                .then(res => res.json() as Promise<TextStatType[]>)
                .then(textStats => textStats.map(textStat => {
                    return {
                        x: textStat.year,
                        y: textStat.smog_index,
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
            title="Smog Index (1769-1964)"
            subtitle="This chart shows the Smog index of Canadian literature works by year."
        >
            <div className="flex flex-col items-center justify-center">
                <div className="mb-4 flex flex-col h-[400] w-full p-1 md:p-4 bg-gray-50 rounded-xl shadow-lg justify-center items-center">
                    {data ?
                        <AnimatedScatterChart
                            data={data as AnimatedScatterChartDataPoint[]}
                            xLabel="Year"
                            yLabel="Smog Index"
                            chartTitle="Smog Index vs Year" />
                        :
                        <BounceLoader color="steelblue" speedMultiplier={1.5} />
                    }
                </div>
                <div className="mb-4 w-full">
                    <h1 className="font-bold">Details</h1>
                    The Smog Index is a readability metric that estimates the years of education required to understand a piece of writing. It is calculated based on the number of complex words (words with three or more syllables). A higher Smog Index indicates that the text is more difficult to read. This chart illustrates how the Smog Index of Canadian literature has evolved from 1769 to 1964, reflecting changes in writing style and complexity over time.
                    <div className="my-2 p-2 bg-gray-100 border-l-4 border-green-800 text-wrap">
                        The Smog Index of a ten-sentence sample can be calculated approximately using the formula<sup><a className="text-blue-500 underline" href="#refrence">1</a></sup>:
                        <BlockMath math="1.0430\sqrt{\text{number of polysyllables}\times\frac{30}{\text{number of sentences}}+3.1291}" />
                    </div>
                    The index is designed to estimate the years of education a person needs to understand the text.
                </div>
                <div className="mb-4 w-full">
                    <h1 className="font-bold">Feature Extraction</h1>
                    The Smog Index was computed by leveraging the Python Package <a href="https://pypi.org/project/textstat/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline"><code>textstat</code></a>'s function <code className="">smog_index</code>. This package provides a straightforward way to analyze text and extract various readability metrics.
                </div>
                <div className="mb-4 w-full text-sm" id="refrence">
                    <h1 className="font-bold">Reference</h1>
                    1. <a href="https://en.wikipedia.org/wiki/SMOG" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">SMOG</a>, Wikipedia.
                </div>
            </div>
        </ModalTemplate>
    );
}

export default SmogIndex;