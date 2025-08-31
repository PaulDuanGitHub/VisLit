'use client'

import { BounceLoader } from "react-spinners";
import AnimatedLineChart from "../common/AnimatedLineChart";
import ModalTemplate from "../common/ModalTemplate";
import { AnimatedLineChartDataPoint } from "../common/types";
import React, { useEffect, useState } from "react";
import { BASE_PATH } from "@/lib/constants";

const AvgWordCountByYearModal = () => {
    const [data, setData] = useState<AnimatedLineChartDataPoint[] | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            await fetch(`${BASE_PATH}/data/avg-word-count-by-year.json`)
                .then(res => res.json())
                .then(setData)
                .catch(err => console.error('Failed to load JSON:', err));
        }

        fetchData();
    }, []);

    return (
        <ModalTemplate
            title="Average Word Count by Year (1769-1964)"
            subtitle="This chart shows the average word count of Canadian literature works by year."
        >
            <div className="flex flex-col items-center justify-center">
                <div className="mb-4 flex flex-col h-[400] w-full p-1 md:p-4 bg-gray-50 rounded-xl shadow-lg justify-center items-center">
                    {data ?
                        <AnimatedLineChart
                            data={data as AnimatedLineChartDataPoint[]}
                            xLabel="Year"
                            yLabel="Average Word Count"
                            chartTitle="Average Word Count vs Year" />
                        :
                        <BounceLoader color="steelblue" speedMultiplier={1.5} />
                    }
                </div>
                <div className="mb-4 w-full">
                    <h1 className="font-bold">Details</h1>
                    This timeline traces how the length of published works evolved over time, reflecting shifts in literary style and narrative complexity. Each point represents the average word count of literary works collected in that year, illustrating trends in the scope and depth of Canadian literature from 1769 to 1964.
                </div>
                <div className="mb-4 w-full">
                    <h1 className="font-bold">Feature Extraction</h1>
                    The average word count for each year was calculated by aggregating the total word counts of all literary works published in that year and dividing by the number of works. We leverage the <code>spaCy</code> with <code>en_core_web_lg</code> model in Python to accurately tokenize the text and count the words.
                </div>
            </div>
        </ModalTemplate>
    );
}

export default AvgWordCountByYearModal;