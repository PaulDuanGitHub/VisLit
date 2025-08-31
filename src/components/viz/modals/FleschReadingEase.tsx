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
                <div className="mb-4 flex flex-col h-[400] w-full p-1 md:p-4 bg-gray-50 rounded-xl shadow-lg justify-center items-center">
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
                <div className="mb-4 w-full">
                    <h1 className="font-bold">Details</h1>
                    This timeline traces what's the Flesh reading ease score of the published works evolved over time. Each point represents a literary work, positioned by its publication year (x-axis) and the Flesh reading ease score (y-axis).
                    <div className="my-2 p-2 bg-gray-100 border-l-4 border-green-800 text-wrap">
                        The Flesch Reading Ease score is calculated approximately using the formula<sup><a className="text-blue-500 underline" href="#refrence">1</a></sup>:
                        <BlockMath math="206.835-1.015\left(\frac{\text{total words}}{\text{total sentences}}\right)-84.6\left(\frac{\text{total syllables}}{\text{total words}}\right)" />
                    </div>
                    The Flesch Reading Ease score ranges from 0 to 100, with higher scores indicating material that is easier to read. The following table provides a general guideline for interpreting the scores<sup><a className="text-blue-500 underline" href="#refrence">2</a></sup>:
                    <table className="table-auto border-collapse border border-gray-300 mt-2">
                        <thead>
                            <tr>
                                <th className="border border-gray-300 px-4 py-2">Score Range</th>
                                <th className="border border-gray-300 px-4 py-2">School Level</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2">90-100</td>
                                <td className="border border-gray-300 px-4 py-2">5th Grade</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2">80-90</td>
                                <td className="border border-gray-300 px-4 py-2">6th Grade</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2">70-80</td>
                                <td className="border border-gray-300 px-4 py-2">7th Grade</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2">60-70</td>
                                <td className="border border-gray-300 px-4 py-2">8th and 9th Grade</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2">50-60</td>
                                <td className="border border-gray-300 px-4 py-2">10th to 12th grade (high school)</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2">30-50</td>
                                <td className="border border-gray-300 px-4 py-2">college</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2">0-30</td>
                                <td className="border border-gray-300 px-4 py-2">college graduate</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="mb-4 w-full">
                    <h1 className="font-bold">Feature Extraction</h1>
                    The Flesh reading ease was computed by leveraging the Python Package <a href="https://pypi.org/project/textstat/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline"><code>textstat</code></a>'s function <code className="">flesh_reading_ease</code>. This package provides a straightforward way to analyze text and extract various readability metrics.
                </div>
                <div className="mb-4 w-full text-sm" id="refrence">
                    <h1 className="font-bold">Reference</h1>
                    1. <a href="https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Flesch–Kincaid readability tests</a>, Wikipedia.
                    <br />
                    2. <a href="https://web.archive.org/web/20160712094308/http://www.mang.canterbury.ac.nz/writing_guide/writing/flesch.shtml" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">How to Write Plain English</a>, archived from the original on July 12, 2016. 
                </div>
            </div>
        </ModalTemplate>
    );
}

export default FleschReadingEase;