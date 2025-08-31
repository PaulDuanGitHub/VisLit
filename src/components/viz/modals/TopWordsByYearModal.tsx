'use client'

import AnimatedRankingChart from "../common/AnimatedRankingChart";
import ModalTemplate from "../common/ModalTemplate";
import { useEffect, useState } from "react";
import { RankingSnapshot } from "../common/types";
import { BounceLoader } from "react-spinners";
import { BASE_PATH } from "@/lib/constants";

export default function TopWordsByYearModal() {
    const [data, setData] = useState<RankingSnapshot[] | null>(null);

    useEffect(() => {
        fetch(`${BASE_PATH}/data/top-words-by-year.json`)
            .then(res => res.json())
            .then(setData)
            .catch(err => console.error('Failed to load JSON:', err));
    }, []);

    return (
        <ModalTemplate
            title="Top Words by Year"
            subtitle="(1769-1964)"
        >
            <div className="flex flex-col items-center justify-center">
                <div className="flex flex-col h-[700] w-full p-1 md:p-4 bg-gray-50 rounded-xl shadow-lg justify-center items-center">
                    {data ?
                        <AnimatedRankingChart data={data as RankingSnapshot[]} xLabel="Word Count" yLabel="Rank" />
                        :
                        <BounceLoader color="steelblue" speedMultiplier={1.5}/>
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