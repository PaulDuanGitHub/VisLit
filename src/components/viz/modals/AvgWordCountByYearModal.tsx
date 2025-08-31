'use client'

import { BounceLoader } from "react-spinners";
import AnimatedLineChart from "../common/AnimatedLineChart";
import ModalTemplate from "../common/ModalTemplate";
import { AnimatedLineChartDataPoint } from "../common/types";
import React, { useEffect, useState } from "react";

const AvgWordCountByYearModal = () => {
    const [data, setData] = useState<AnimatedLineChartDataPoint[] | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            await fetch('/data/avg-word-count-by-year.json')
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
                <div className="flex flex-col h-[400] w-full p-1 md:p-4 bg-gray-50 rounded-xl shadow-lg justify-center items-center">
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

export default AvgWordCountByYearModal;