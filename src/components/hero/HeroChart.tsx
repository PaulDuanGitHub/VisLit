'use client'

import { PuffLoader } from "react-spinners";
import { CanadaProvinceData, GeoHeatMapItem } from "../viz/common/types";
import React, { useEffect, useState } from "react";
import AnimatedGeoHeatMap from "../viz/AnimatedGeoHeatMap";
import { Topology } from 'topojson-specification';
import { BASE_PATH } from "@/lib/constants";

const HeroChart = () => {
    const [data, setData] = useState<CanadaProvinceData | null>(null);
    const [geoHeatMapData, setGeoHeatMapData] = useState<GeoHeatMapItem[] | null>(null);
    const [topology, setTopology] = useState<Topology | null>(null);

    useEffect(() => {
        const fetchData = () => {
            fetch(`${BASE_PATH}/data/city-count-by-province.json`)
                .then(res => res.json())
                .then(setData)
                .catch(err => console.error('Failed to load JSON:', err));

            fetch(`${BASE_PATH}/data/canada-provinces-0.1-tolerance.topojson`)
                .then(res => res.json())
                .then(setTopology)
                .catch(err => console.error('Failed to load TopoJSON:', err));
        }

        fetchData();
    }, []);

    useEffect(() => {
        if (data) {
            setGeoHeatMapData(Object.entries(data).flatMap(([_, cities]) => cities));
        }
    }, [data]);

    const handleProvinceClick = (_: string | null) => { }

    return (
            <div className="h-full w-full flex flex-col items-center justify-center">
                <div className="h-full w-full flex flex-col justify-center items-center">
                    {data ?
                    <>
                        <AnimatedGeoHeatMap
                            data={geoHeatMapData as GeoHeatMapItem[]}
                            topology={topology as Topology}
                            onProvinceClick={(province) => { handleProvinceClick(province) }}
                            chartTitle={""}
                            disableZoom={true} />
                        <div className="text-sm text-gray-500">
                            Heat map of all mentioned cities from (1769 - 1964)
                        </div>
                    </>
                        :
                        <PuffLoader color="steelblue" speedMultiplier={1.5} />
                    }
                </div>
            </div>
    );
}

export default HeroChart;