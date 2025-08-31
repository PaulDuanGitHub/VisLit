'use client'

import { BounceLoader } from "react-spinners";
import ModalTemplate from "../common/ModalTemplate";
import { BarItem, CanadaProvinceData, GeoHeatMapItem } from "../common/types";
import React, { useEffect, useRef, useState } from "react";
import AnimatedGeoHeatMap from "../AnimatedGeoHeatMap";
import { Topology } from 'topojson-specification';
import AnimatedBarPieChart from "../common/AnimatedBarPieChart";
import { BASE_PATH } from "@/lib/constants";

const CanadaHeatMapModal = () => {
    const [data, setData] = useState<CanadaProvinceData | null>(null);
    const [geoHeatMapData, setGeoHeatMapData] = useState<GeoHeatMapItem[] | null>(null);
    const [barChartData, setBarChartData] = useState<BarItem[]>([]);
    const [topology, setTopology] = useState<Topology | null>(null);
    const [hideSwitch, setHideSwitch] = useState<boolean>(false);
    const [selectedProvince, setSelectedProvince] = useState<string>('Canada');
    const modalRef = useRef<HTMLDivElement>(null);

    const viewLgBreakpoint = 1024;
    const viewXlBreakpoint = 1280;

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

            if (barChartData.length === 0) {
                setBarChartData(
                    Object.entries(data)
                        .flatMap(([_, cities]) => cities.map(city => ({
                            label: city.label,
                            value: city.value
                        })))
                        .sort((a, b) => b.value - a.value)
                        .slice(0, 20)
                );
            }
        }
    }, [data]);

    const handleProvinceClick = (province: string | null) => {
        if (!province || !data) return;
        const cities = data[province];
        setSelectedProvince(province);
        setBarChartData(
            cities
                ? [...cities].map(city => ({
                    label: city.label,
                    value: city.value
                })).slice(0, 20)
                : []
        );
    }

    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            setHideSwitch(
                window.innerWidth >= viewLgBreakpoint &&
                window.innerWidth < viewXlBreakpoint
            );
        });

        if (modalRef.current) resizeObserver.observe(modalRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    return (
        <div ref={modalRef}>
            <ModalTemplate
                title="Canadian Literature Distribution"
                subtitle="1769–1964 · Across Canadian Cities"
            >
                <div className="flex flex-col items-center justify-center">
                    <div className="flex xl:flex-row flex-col xl:h-[500] gap-2 w-full justify-center items-center">
                        <div className="h-[500] xl:w-[55%] w-full p-1 md:p-4 bg-gray-50 rounded-xl shadow-lg flex justify-center items-center">
                            {data ?
                                <AnimatedGeoHeatMap
                                    data={geoHeatMapData as GeoHeatMapItem[]}
                                    topology={topology as Topology}
                                    onProvinceClick={(province) => { handleProvinceClick(province) }}
                                    chartTitle={""} />
                                :
                                <BounceLoader color="steelblue" speedMultiplier={1.5} />
                            }
                        </div>
                        <div className="flex w-full xl:w-[45%] gap-2">
                            <div className={`h-[500] xl:w-full w-full p-1 md:p-4 bg-gray-50 rounded-xl shadow-lg flex justify-center items-center`}>
                                {barChartData.length > 0 ?
                                    <AnimatedBarPieChart
                                        data={barChartData as BarItem[]}
                                        pieChartDefaultMode={true}
                                        hideSwitch={hideSwitch}
                                        xLabel="Word Count"
                                        yLabel="Rank"
                                        barChartTitle={`Top 20 Cities in ${selectedProvince}`}
                                        pieChartTitle={`Top 10 Cities in ${selectedProvince}`} />
                                    :
                                    <BounceLoader color="steelblue" speedMultiplier={1.5} />
                                }
                            </div>
                            <div className={`hidden sm:hidden md:hidden xl:hidden h-[500] xl:w-[45%] w-full p-1 md:p-4 bg-gray-50 rounded-xl shadow-lg lg:flex justify-center items-center`}>
                                {barChartData.length > 0 ?
                                    <AnimatedBarPieChart
                                        data={barChartData as BarItem[]}
                                        pieChartDefaultMode={false}
                                        hideSwitch={hideSwitch}
                                        xLabel="Word Count"
                                        yLabel="Rank"
                                        barChartTitle={`Top 20 Cities in ${selectedProvince}`}
                                        pieChartTitle={`Top 10 Cities in ${selectedProvince}`} />
                                    :
                                    <BounceLoader color="steelblue" speedMultiplier={1.5} />
                                }
                            </div>
                        </div>
                    </div>
                    {/* <div className="mb-4 flex justify-start w-full">
                        <h1 className="font-bold">Details</h1>
                    </div>
                    <div className="mb-4 flex justify-start w-full">
                        <h1 className="font-bold">Dataset download</h1>
                    </div> */}
                </div>
            </ModalTemplate>
        </div>
    );
}

export default CanadaHeatMapModal;