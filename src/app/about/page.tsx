'use client'

import Header from '@/components/Header'
import { useEffect, useState } from 'react';
import Footer from "@/components/Footer";
import AnimatedLineChart from '@/components/viz/common/AnimatedLineChart';
import { AnimatedLineChartDataPoint } from '@/components/viz/common/types';

export default function About() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [booksCountData, setbooksCountData] = useState<AnimatedLineChartDataPoint[] | null>(null);
    
    useEffect(() => {
        const fetchData = async () => {
            await fetch('/data/collected-book-counts-by-year.json')
                .then(res => res.json())
                .then(setbooksCountData)
                .catch(err => console.error('Failed to load JSON:', err));
        }

        fetchData();
    }, []);
    
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden">
            <header className="sticky top-0 z-50">
                <Header toggleSidebar={toggleSidebar}></Header>
            </header>
            <main className="relative bg-white overflow-auto">
                <div className="mx-auto w-[60%] flex flex-col justify-normal bg-white p-10">
                    <h1 className="text-4xl font-bold mb-6">About This Project</h1>
                    <p className="text-lg text-gray-700 mb-4">
                        This project is dedicated to visualizing various aspects of Canadian literature from 1769 to 1964. Through a series of interactive charts and graphs, we aim to provide insights into the trends, patterns, and characteristics of literary works during this period.
                    </p>
                    <p className="text-lg text-gray-700 mb-4">
                        The visualizations are built using modern web technologies and libraries, ensuring a smooth and engaging user experience. We hope that these visualizations will serve as a valuable resource for researchers, students, and enthusiasts of Canadian literature.
                    </p>
                    <h2 className="text-2xl font-bold mb-4 mt-8">Data Sources</h2>
                    <p className="text-lg text-gray-700 mb-4">
                        The data used in this project mainly comes from the <a href="https://gutenberg.ca/index.html" className="text-blue-500 underline">Project Gutenberg Canada</a>. We have curated and processed the data to ensure its accuracy and relevance to the visualizations presented here.
                        <br />
                        <b>All the used text are in public domain</b>.
                    </p>
                    <div className="flex flex-col h-[500] w-full p-1 md:p-4 bg-gray-50 rounded-xl shadow-lg justify-center items-center mt-8">
                        <AnimatedLineChart 
                            data={booksCountData as AnimatedLineChartDataPoint[]}
                            xLabel="Year"
                            yLabel="Number of Books"
                            chartTitle="Collected Book Counts by Year (1769-1964)" />
                    </div>
                </div>
                <Footer />
            </main>
        </div>
    );
}
