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
                <div className="mb-4 flex flex-col h-[700] w-full p-1 md:p-4 bg-gray-50 rounded-xl shadow-lg justify-center items-center">
                    {data ?
                        <AnimatedRankingChart data={data as RankingSnapshot[]} xLabel="Word Count" yLabel="Rank" />
                        :
                        <BounceLoader color="steelblue" speedMultiplier={1.5}/>
                    }
                </div>
                <div className="mb-4 w-full">
                    <h1 className="font-bold">Details</h1>
                    This ranking visualizes the most frequently used words in Canadian literature from 1769 to 1964, highlighting the evolution of language and themes in the nation’s literary history.
                </div>
                <div className="mb-4 w-full">
                    <h1 className="font-bold">Feature Extraction</h1>
                    The words were extracted using the <code>spaCy</code> with <code>en_core_web_lg</code> model in Python for tokenization and filtered common stop words defined within <code>sklearn</code>'s <code>ENGLISH_STOP_WORDS</code>.
                </div>
            </div>
        </ModalTemplate>
    );
}