import React from 'react';
import HeroChart from './HeroChart';
import _ from 'lodash';

const Hero: React.FC = () => {
    return (
        <div className="mx-auto w-[60%] flex min-h-120 items-center justify-between bg-white">
            <div className="flex flex-col w-full lg:w-[50%] my-5">
                <h1 className="text-6xl font-bold mb-4 wrap-break-word">
                    Welcome to
                    <br />
                    <span style={{ color: 'green' }}>
                        Canadian
                    </span>
                    <br />
                    Literature
                    <br />
                    Visualizations
                </h1>
                <p className="text-lg text-gray-700 mb-8">
                    Explore a collection of visualizations that delve into various aspects of Canadian literature from 1769 to 1964. Discover trends, patterns, and insights through interactive charts and graphs.
                </p>
            </div>
            <div className='h-100 w-120 hidden lg:block'>
                <HeroChart />
            </div>
        </div>
    );
}

export default Hero;