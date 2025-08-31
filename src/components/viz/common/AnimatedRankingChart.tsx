'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { RankingSnapshot, RankedItem } from '@/components/viz/common/types'; // Define your types
import { Button } from '@headlessui/react';

interface AnimatedRankingChartProps {
    data: RankingSnapshot[];
    xLabel?: string;
    yLabel?: string;
    accumulate?: boolean; // Whether to accumulate values over time
}

const AnimatedRankingChart: React.FC<AnimatedRankingChartProps> = ({
    data,
    xLabel = 'x',
    yLabel = 'y',
    accumulate = false,
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [loadedItem, setLoadedItem] = useState<RankedItem[]>([]);
    const [currentItemIdx, setCurrentItemIdx] = useState<number>(0);
    const [currentSnapshotIdx, setCurrentSnapshotIdx] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [timestamps, setTimestamps] = useState<number[]>([]);
    const animationRef = useRef<NodeJS.Timeout | null>(null);
    const latestLoadedItem = useRef(loadedItem);
    const latestTimestamps = useRef(timestamps);

    const viewMdBreakpoint = 768;

    useEffect(() => {
        if (data) {
            setTimestamps(Array.from(new Set(data.map((d, idx) => d.timestamp))));
        }

        const tooltip = d3.select('body').append('div').attr('class', 'tooltip');

        if (data && loadedItem.length == 0 && svgRef.current) {
            loadSnapshot(0);
        }

        return () => {
            tooltip.remove();
        }
    }, [data]);

    useEffect(() => {
        latestTimestamps.current = timestamps;
    }, [timestamps]);

    // Handle animation updates
    useEffect(() => {
        if (isPlaying) {
            startAnimation();
        } else {
            stopAnimation();
        }

        return () => stopAnimation();
    }, [isPlaying, currentSnapshotIdx, currentItemIdx]);

    // Update chart when loadedData changes
    useEffect(() => {
        latestLoadedItem.current = loadedItem;

        if (containerRef.current && svgRef.current) {
            drawChart(loadedItem);
        }
    }, [loadedItem]);

    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            if (!entries[0] || !svgRef.current) return;
            drawChart(latestLoadedItem.current);
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
            resetAnimation();
        };
    }, []);

    // Update the chart with new data
    const drawChart = (chartData: RankedItem[]) => {
        console.log('Drawing chart with data:', chartData);
        if (!svgRef.current || !containerRef.current || !chartData || chartData.length === 0) return;

        const isSmallScreen = window.innerWidth < viewMdBreakpoint;

        const margin = {
            top: 50,
            right: 20,
            bottom: 10,
            left: isSmallScreen ? 20 : 100
        };

        const container = containerRef.current;
        const width = container?.clientWidth || 800;
        const height = container?.clientHeight || 400;

        // Set up dimensions
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const fontScale = d3.scaleLinear()
            .domain([300, 1200]) // chart width range
            .range([14, 16]) // font size range
            .clamp(true);

        const fontSize = `${fontScale(width)}px`;
        const titleFontSize = `${fontScale(width) * 1.2}px`;
        const largeFontSize = `${fontScale(width) * 1.5}px`;

        // Add a transparent background rectangle for better touch handling
        let background: d3.Selection<SVGRectElement, unknown, null, undefined> = d3.select(svgRef.current).select('.background-rect');

        if (background.empty()) {
            background = d3.select(svgRef.current).append('rect')
                .attr('class', 'background-rect')
                .attr('width', width)
                .attr('height', height)
                .attr('fill', 'transparent');
        }

        let svg: d3.Selection<SVGGElement, unknown, null, undefined> = d3.select(svgRef.current).select('.chart-container');

        if (svg.empty()) {
            svg = d3.select(svgRef.current)
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", `0 0 ${width} ${height}`)
                .append('g')
                .attr("class", "chart-container")
                .attr('transform', `translate(${margin.left},${margin.top})`);
        }

        d3.select(svgRef.current).attr("viewBox", `0 0 ${width} ${height}`)

        svg.attr("class", "chart-container")
            .attr('transform', `translate(${margin.left},${margin.top})`);

        if (!svg || chartData.length === 0) return;

        // Set up scales
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(chartData, d => d.value) as number * 1.2])
            .range([0, innerWidth]);

        const yScale = d3.scaleLinear()
            .domain([20, 0])
            .range([innerHeight, 0])
            .nice();

        const xAxis = svg.select<SVGGElement>('.x-axis').empty() ?
            svg.append('g').attr('class', 'x-axis') :
            svg.select<SVGGElement>('.x-axis');

        xAxis
            .attr('transform', `translate(0,0)`)
            .style('font-size', fontSize)
            .transition()
            .duration(500)
            .call(d3.axisTop(xScale).ticks(isSmallScreen ? 5 : 10));

        const yAxis = svg.select<SVGGElement>('.y-axis').empty() ?
            svg.append('g').attr('class', 'y-axis') :
            svg.select<SVGGElement>('.y-axis');

        yAxis
            .style('font-size', fontSize)
            .transition()
            .duration(500)
            .call(d3.axisLeft(yScale)
                .tickValues(Array.from({ length: 20 }, (_, i) => i + 1))
                .tickFormat(() => '')
            );

        // draw axis labels
        const xAxisLabel = svg.select<SVGTextElement>('.x-axis-label').empty() ?
            svg.append('text').attr('class', 'x-axis-label') :
            svg.select<SVGTextElement>('.x-axis-label');

        xAxisLabel
            .attr('x', innerWidth / 2)
            .attr('y', -30)
            .attr('font-size', fontSize)
            .style('text-anchor', 'middle')
            .text(xLabel);

        // draw x-axis grid lines
        const xGrid = svg.select<SVGGElement>('.x-grid').empty() ?
            svg.append('g').attr('class', 'x-grid') :
            svg.select<SVGGElement>('.x-grid');

        xGrid
            .transition()
            .duration(500)
            .call(d3.axisTop(xScale)
                .tickValues(xScale.ticks().slice(1)) // Skip the first tick
                .tickSizeInner(-innerHeight)
                .tickFormat(() => '')
            )
            .selectAll('line')
            .attr('stroke', '#e5e7eb')

        // Add tooltip
        d3.select('.tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('background', 'white')
            .style('padding', '8px')
            .style('border', '1px solid #ddd')
            .style('border-radius', '4px')
            .style('pointer-events', 'none')
            .style('z-index', '1000');

        const barHeight = innerHeight / 20 - 2;
        const tickDistance = innerHeight / 20;
        const barMovementDuration = 700;

        const groups = svg.selectAll<SVGGElement, RankedItem>('g.bar-group')
            .data(chartData, d => d.label)
            .join(
                enter => enter.append('g')
                    .attr('class', 'bar-group')
                    .attr('transform', `translate(0, ${innerHeight + 20})`) // Start off-screen
                    .attr('opacity', 0) // Initial opacity for fade-in
                    .call(enterG => {
                        // Transition for the bar-group itself (movement and fade-in)
                        enterG.transition()
                            .duration(barMovementDuration)
                            .attr('transform', (_, i) => `translate(0, ${i * tickDistance + 1})`)
                            .attr('opacity', 1); // Fade in the entire group

                        // Append rect and label elements within this enterG context
                        enterG.append('rect')
                            .attr('class', 'bar')
                            .attr('fill', 'steelblue')
                            .attr('rx', 4)
                            .attr('ry', 4)
                            .attr('x', 0)
                            .attr('height', barHeight)
                            .attr('width', d => xScale(d.value) / 2) // Start width at 0 for animation
                            .transition().duration(barMovementDuration) // Animate width
                            .attr('width', d => xScale(d.value));

                        // Label group (no need for a separate join here for 'enter' elements)
                        const labelGroup = enterG.append('g')
                            .attr('class', 'bar-label-group');

                        labelGroup.append('text')
                            .attr('class', 'bar-value-label')
                            .attr('text-anchor', 'start')
                            .attr('fill', 'black')
                            .attr('x', d => xScale(d.value) / 2) // Initial x for label
                            .attr('y', barHeight / 2 + 5) // Vertically center it with the bar
                            .attr('font-size', fontSize)
                            .text(d => `${d.value}`)
                            .attr('opacity', 0) // Start with opacity 0 for label
                            .transition().duration(barMovementDuration) // Animate label's x and opacity
                            .attr('x', d => xScale(d.value) + 5) // A little offset from the bar end
                            .attr('opacity', 1);

                        // Add bar label (item name)
                        labelGroup.append('text')
                            .attr('class', 'bar-name-label')
                            .attr('text-anchor', isSmallScreen ? 'start' : 'end') // Adjust text-anchor based on width
                            .attr('fill', isSmallScreen ? 'white' : 'black') // Use Tailwind gray color
                            .attr('x', isSmallScreen ? 5 : -10) // Position relative to group
                            .attr('y', barHeight / 2 + 5) // Vertically center
                            .attr('font-size', fontSize)
                            .text(d => d.label)
                            .attr('opacity', 0) // Start with opacity 0 for label
                            .transition().duration(barMovementDuration) // Animate opacity
                            .attr('opacity', 1);
                    }),
                update => {
                    // Update existing groups
                    update.transition().duration(barMovementDuration)
                        .attr('transform', (_, i) => `translate(0, ${i * tickDistance + 1})`)
                        .attr('opacity', 1); // Ensure opacity is 1 if it somehow became 0

                    update.select('rect.bar')
                        .transition().duration(barMovementDuration)
                        .attr('width', d => xScale(d.value));

                    update.select('.bar-value-label')
                        .transition().duration(barMovementDuration)
                        .attr('x', d => xScale(d.value) + 5)
                        .attr('opacity', 1) // Ensure opacity is 1 if it somehow became 0
                        .attr('font-size', fontSize)
                        .text(d => `${d.value}`);

                    update.select('.bar-name-label')
                        .attr('text-anchor', isSmallScreen ? 'start' : 'end') // Adjust text-anchor based on width
                        .attr('fill', isSmallScreen ? 'white' : 'black') // Use Tailwind gray color
                        .attr('x', isSmallScreen ? 5 : -10) // Position relative to group
                        .transition().duration(barMovementDuration)
                        .attr('opacity', 1) // Ensure opacity is 1 if it somehow became 0
                        .attr('font-size', fontSize)
                        .text(d => d.label);

                    return update;
                },
                exit => exit.call(exitG =>
                    exitG.transition().duration(barMovementDuration)
                        .attr('transform', `translate(0, ${innerHeight + 20})`) // move off-screen before removing
                        .attr('opacity', 0)
                        .remove()
                )
            );

        const highestRankedItemLabelGroup = svg.select<SVGGElement>('.highest-ranked-item-label-group').empty() ?
            svg.append('g').attr('class', 'highest-ranked-item-label-group') :
            svg.select<SVGGElement>('.highest-ranked-item-label-group');

        const highestRankedItemLabel = svg.select<SVGTextElement>('.highest-ranked-item-label').empty() ?
            highestRankedItemLabelGroup.append('text').attr('class', 'highest-ranked-item-label') :
            svg.select<SVGTextElement>('.highest-ranked-item-label');

        highestRankedItemLabel
            .attr('text-anchor', 'end')
            .attr('fill', 'black')
            .text(`${chartData[0].label.toUpperCase()}`)
            .attr('x', innerWidth - 10)
            .attr('y', innerHeight)
            .transition().duration(500)
            .attr('dy', '-2em')
            .attr('font-size', `${largeFontSize}`)
            .attr('font-weight', 'bold');

        const currentTimestampLabel = svg.select<SVGTextElement>('.current-timestamp-label').empty() ?
            highestRankedItemLabelGroup.append('text').attr('class', 'current-timestamp-label') :
            svg.select<SVGTextElement>('.current-timestamp-label');

        currentTimestampLabel
            .attr('text-anchor', 'end')
            .attr('fill', 'black')
            .text(`${latestTimestamps.current[currentSnapshotIdx]}`)
            .attr('x', innerWidth - 10)
            .attr('y', innerHeight)
            .transition().duration(500)
            .attr('dy', '-1em')
            .attr('font-size', `${largeFontSize}`)
            .attr('font-weight', 'bold');

        const tooltip = d3.select('.tooltip');
        // Add hover effects
        background.on('touchstart', function () {
            if (tooltip.style('opacity') === '1') {
                tooltip.transition()
                    .duration(500)
                    .style('opacity', 0);
            }
        });
        svg.selectAll<SVGRectElement, RankedItem>('rect.bar')
            .on('mouseover', function (event, d) {
                // alert(tooltip.style('opacity'));
                tooltip.transition()
                    .duration(200)
                    .style('opacity', 1);
                tooltip.html(`Label: ${d.label}<br/>Rank: ${chartData.indexOf(d) + 1}<br/>${xLabel}: ${d.value}`)
                    .style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY - 28}px`);

            })
            .on('touchstart', function (event, d) {
                tooltip.transition()
                    .duration(200)
                    .style('opacity', 1);
                tooltip.html(`Label: ${d.label}<br/>Rank: ${chartData.indexOf(d) + 1}<br/>${xLabel}: ${d.value}`)
                    .style('left', `${event.touches[0].pageX + 10}px`)
                    .style('top', `${event.touches[0].pageY - 28}px`);
                event.stopPropagation();
            })
            .on('mouseout', function () {
                tooltip.transition()
                    .duration(500)
                    .style('opacity', 0);
            });
    }

    const loadNextItem = () => {
        if (currentSnapshotIdx >= data.length) {
            setIsPlaying(false);
            return;
        }

        const entries = data[currentSnapshotIdx].entries;
        if (currentItemIdx < entries.length) {
            console.log('Loading next item:', entries[currentItemIdx]);
            setLoadedItem(prev => mergeOneItem([...prev], entries[currentItemIdx]));
            setCurrentItemIdx(prev => prev + 1);
        } else {
            setCurrentSnapshotIdx(prev => prev + 1);
            setCurrentItemIdx(0);
        }
    };

    const loadNextSnapshot = () => {
        if (currentSnapshotIdx >= data.length) {
            setIsPlaying(false);
            return;
        }
        const entries = data[currentSnapshotIdx].entries;
        console.log('Loading next snapshot:', entries);
        setLoadedItem([...entries]);
        setCurrentSnapshotIdx(prev => prev + 1);
    }

    const onYearButtonClick = (e: React.MouseEvent<HTMLButtonElement>, idx: number) => {
        e.currentTarget.scrollIntoView({
            behavior: "smooth",
            inline: "center",
            block: "nearest",
        });
        loadSnapshot(idx);
    }

    const loadSnapshot = (idx: number) => {
        if (idx >= data.length) {
            setIsPlaying(false);
            return;
        }
        const entries = data[idx].entries;
        console.log('Loading snapshot:', entries);
        setLoadedItem([...entries]);
        setCurrentSnapshotIdx(idx);
    }

    const mergeOneItem = (existing: RankedItem[], newItem: RankedItem) => {
        const existingIndex = existing.findIndex(d => d.label === newItem.label);
        if (existingIndex !== -1) {
            const updated = [...existing];
            updated[existingIndex].value += newItem.value;

            return updated.sort((a, b) => b.value - a.value);
        }
        return [...existing, newItem]
            .sort((a, b) => b.value - a.value)
            .slice(0, 20);
    };

    const startAnimation = () => {
        if (animationRef.current) return;

        animationRef.current = setInterval(() => {
            if (accumulate) {
                loadNextItem();
            } else {
                loadNextSnapshot();
            }
        }, 1000);
    };

    const stopAnimation = () => {
        if (animationRef.current) {
            clearInterval(animationRef.current);
            animationRef.current = null;
        }
    };

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const resetAnimation = () => {
        stopAnimation();
        setLoadedItem([]);
        setCurrentSnapshotIdx(0);
        setCurrentItemIdx(0);
        setIsPlaying(false);
    };

    return (

        <div className='flex flex-col justify-center h-full w-full'>
            <div ref={containerRef} className="flex justify-center h-[90%] items-center w-full">
                <svg ref={svgRef} />
            </div>
            <div className="w-full mb-4 h-fit">
                <div className="overflow-x-auto scroll-smooth scrollbar-thumb-gray-400 scrollbar-track-gray-200 scrollbar-">
                    <div
                        className="min-w-max pb-12"
                        style={{
                            scrollbarColor: '#a0aec0 white' // Tailwind gray colors
                        }}>
                        <div className="flex gap-10 min-w-max px-5 h-5 bg-gray-200 rounded-full">
                            {timestamps.map((timestamp, idx) => (
                                <Button
                                    className={`h-2.5 w-2.5 ${currentSnapshotIdx === idx ? 'bg-blue-500' : 'bg-gray-300'} ${accumulate ? 'bg-transparent' : ''} m-auto flex flex-col items-center rounded-full transition-all duration-300`}
                                    onClick={(e) => onYearButtonClick(e, idx)}
                                    key={idx}>
                                    <div
                                        className={`relative top-5 hover:bg-blue-500 hover:text-white ${currentSnapshotIdx === idx ? 'bg-blue-500 text-white' : ''} transition-all duration-200 px-1 rounded-full`}>{timestamp}</div>
                                </Button>
                            ))}
                        </div>
                        {accumulate && <div className="relative -top-[15px] left-0 mx-5 h-2.5 bg-gray-200 rounded-full">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                style={{
                                    width: `${((currentSnapshotIdx) / (timestamps.length - 1)) * 100}%`
                                }} />
                        </div>}
                    </div>
                </div>
            </div>
            {/* <Button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105"
                onClick={togglePlay}>
                <span className="text-white">Click Me</span>
            </Button> */}
        </div>
    );
};

export default AnimatedRankingChart;