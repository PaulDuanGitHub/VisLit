'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { BarItem, PieItem } from '@/components/viz/common/types';
import _ from 'lodash';
import { Button, Switch } from '@headlessui/react';
import { ChartTypeIconEnum, ChartTypeEnumToIconComponent } from "@/components/ChartTypeIconMap";
import { ChartBarIcon, ChartPieIcon } from '@heroicons/react/24/outline';

interface AnimatedBarPieChartProps {
    data: BarItem[];
    xLabel?: string;
    yLabel?: string;
    barChartTitle?: string;
    pieChartTitle?: string;
    pieChartDefaultMode?: boolean;
    hideSwitch?: boolean; 
}

interface PathWithCurrent extends SVGPathElement {
    _current?: {
        startAngle: number,
        endAngle: number
    };
}

const AnimatedBarPieChart: React.FC<AnimatedBarPieChartProps> = ({
    data,
    xLabel = 'x',
    yLabel = 'y',
    barChartTitle = 'Animated Bar Chart',
    pieChartTitle = 'Animated Pie Chart',
    pieChartDefaultMode = true,
    hideSwitch = false
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [pieChartMode, setPieChartMode] = useState<boolean>(pieChartDefaultMode);
    const [loadedItem, setLoadedItem] = useState<BarItem[]>([]);
    const latestLoadedItem = useRef(loadedItem);
    const latestPieChartMode = useRef(pieChartMode);

    const viewMdBreakpoint = 768;

    const margin = {
        top: 70,
        right: 20,
        bottom: 10,
        left: 30
    };

    const pieColors: readonly string[] = [
        "#003c66", // Deepest color
        "#19547b",
        "#326c90",
        "#4a84a5",
        "#639cbb",
        "#7bb4d0",
        "#94cce5",
        "#ace4fa",
        "#b2e6ff",
        "#bae7ff"  // Lightest color (provided)
    ] as const;

    useEffect(() => {
        const tooltip = d3.select('body').append('div').attr('class', 'tooltip');
        if (data) {
            setLoadedItem([...data]);
        }

        return () => {
            tooltip.remove();
        }
    }, [data]);

    // Update chart when loadedData changes
    useEffect(() => {
        latestLoadedItem.current = loadedItem;

        if (containerRef.current && svgRef.current) {
            if (latestPieChartMode.current) {
                drawPieChart(loadedItem as PieItem[]);
            } else {
                drawBarChart(loadedItem);
            }
        }
    }, [loadedItem]);

    useEffect(() => {
        latestPieChartMode.current = pieChartMode;

        d3.select(svgRef.current).selectAll('*').remove();

        if (containerRef.current && svgRef.current) {
            if (pieChartMode) {
                drawPieChart(latestLoadedItem.current as PieItem[]);
            } else {
                drawBarChart(latestLoadedItem.current);
            }
        }
    }, [pieChartMode]);

    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            if (!entries[0] || !svgRef.current) return;
            if (latestPieChartMode.current) {
                drawPieChart(latestLoadedItem.current as PieItem[]);
            } else {
                drawBarChart(latestLoadedItem.current);
            }
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, [pieChartMode, barChartTitle, pieChartTitle]);

    // Update the chart with new data
    const drawBarChart = (chartData: BarItem[]) => {       
        if (!svgRef.current || !containerRef.current || !chartData || chartData.length === 0) return;

        const container = containerRef.current;
        const width = container?.clientWidth || 800;
        const height = container?.clientHeight || 400;
        
        const fontScale = d3.scaleLinear()
            .domain([300, 1200]) // chart width range
            .range([14, 16]) // font size range
            .clamp(true);

        const fontSize = `${fontScale(width)}px`;
        const titleFontSize = `${fontScale(width) * 1.2}px`;
        const largeFontSize = `${fontScale(width) * 1.5}px`;

        const isSmallScreen = window.innerWidth < viewMdBreakpoint;
        const isSmallChart = width < viewMdBreakpoint;

        // Set up dimensions
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        d3.select(svgRef.current).selectAll('*').remove();

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

        // Add chart title
        svg.select<SVGTextElement>('.chart-title').empty() ?
            svg.append('text').attr('class', 'chart-title') :
            svg.select<SVGTextElement>('.chart-title');
        svg.select<SVGTextElement>('.chart-title')
            .attr('x', innerWidth / 2)
            .attr('y', -margin.top)
            .attr('font-size', titleFontSize)
            .style('font-weight', 'bold')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'hanging')
            .text(barChartTitle);

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
            .call(d3.axisTop(xScale).tickFormat(d3.format('d')).ticks(isSmallScreen || isSmallChart? 5 : 10));

        const yAxis = svg.select<SVGGElement>('.y-axis').empty() ?
            svg.append('g').attr('class', 'y-axis') :
            svg.select<SVGGElement>('.y-axis');

        yAxis
            .style('font-size', fontSize)
            .transition()
            .duration(500)
            .call(d3.axisLeft(yScale)
                .tickValues(Array.from({ length: 20 }, (_, i) => i + 1))
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

        const groups = svg.selectAll<SVGGElement, BarItem>('g.bar-group')
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

                        // Add bar label (item name)
                        labelGroup.append('text')
                            .attr('class', 'bar-name-label')
                            .attr('text-anchor', 'start')
                            .attr('fill', 'black')
                            .attr('x', d => xScale(d.value) / 2) // Initial x for label
                            .attr('y', barHeight / 2 + 5) // Vertically center it with the bar
                            .attr('font-size', fontSize)
                            .text(d => _.startCase(d.label))
                            .attr('opacity', 0) // Start with opacity 0 for label
                            .transition().duration(barMovementDuration) // Animate opacity
                            .attr('x', d => xScale(d.value) + 5) // A little offset from the bar end
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

                    update.select('.bar-name-label')
                        .transition().duration(barMovementDuration)
                        .attr('x', d => xScale(d.value) + 5)
                        .attr('opacity', 1) // Ensure opacity is 1 if it somehow became 0
                        .attr('font-size', fontSize)
                        .text(d => _.startCase(d.label));

                    return update;
                },
                exit => exit.call(exitG =>
                    exitG.transition().duration(barMovementDuration)
                        .attr('transform', `translate(0, ${innerHeight + 20})`) // move off-screen before removing
                        .attr('opacity', 0)
                        .remove()
                )
            );

        const tooltip = d3.select('.tooltip');
        // Add hover effects
        background.on('touchstart', function () {
            const bars = svg.selectAll('rect.bar');
            bars.transition()
                .duration(200)
                .attr("filter", "none");

            if (tooltip.style('opacity') === '1') {
                tooltip.transition()
                    .duration(500)
                    .style('opacity', 0);
            }
        });
        svg.selectAll<SVGGElement, BarItem>('.bar-group')
            .on('mouseover', function (event, d) {
                const barGroup = d3.select(this);
                const bar = barGroup.select('rect.bar');
                bar.transition()
                    .duration(200)
                    .attr("filter", "drop-shadow(0 0 0.25rem rgba(0, 0, 0, .7))");

                tooltip.transition()
                    .duration(200)
                    .style('opacity', 1);
                tooltip.html(`Label: ${_.startCase(d.label)}<br/>Rank: ${chartData.indexOf(d) + 1}<br/>${xLabel}: ${d.value}`)
                    .style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY - 28}px`);

            })
            .on('touchstart', function (event, d) {
                const barGroup = d3.select(this);
                const bar = barGroup.select('rect.bar');
                bar.transition()
                    .duration(200)
                    .attr("filter", "drop-shadow(0 0 0.25rem rgba(0, 0, 0, .7))");

                tooltip.transition()
                    .duration(200)
                    .style('opacity', 1);
                tooltip.html(`Label: ${d.label}<br/>Rank: ${chartData.indexOf(d) + 1}<br/>${xLabel}: ${d.value}`)
                    .style('left', `${event.touches[0].pageX + 10}px`)
                    .style('top', `${event.touches[0].pageY - 28}px`);
                event.stopPropagation();
            })
            .on('mouseout', function () {
                const barGroup = d3.select(this);
                const bar = barGroup.select('rect.bar');
                bar.transition()
                    .duration(200)
                    .attr("filter", "none");

                tooltip.transition()
                    .duration(500)
                    .style('opacity', 0);
            });
    }

    const drawPieChart = (chartData: PieItem[]) => {
        chartData = chartData.slice(0, 10); // Limit to top 10

        if (!svgRef.current || !containerRef.current || !chartData || chartData.length === 0) return;

        const container = containerRef.current;
        const width = container?.clientWidth || 800;
        const height = container?.clientHeight || 400;

        const fontScale = d3.scaleLinear()
            .domain([300, 1200]) // chart width range
            .range([12, 16]) // font size range
            .clamp(true);

        const fontSize = `${fontScale(width)}px`;
        const titleFontSize = `${fontScale(width) * 1.2}px`;
        const largeFontSize = `${fontScale(width) * 1.3}px`;

        // Set up dimensions
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        d3.select(svgRef.current).selectAll('*').remove();

        let background: d3.Selection<SVGRectElement, unknown, null, undefined> = d3.select(svgRef.current).select('.background-rect');

        if (background.empty()) {
            background = d3.select(svgRef.current).append('rect')
                .attr('class', 'background-rect')
                .attr('width', width)
                .attr('height', height)
                .attr('fill', 'transparent');
        }

        let svg: d3.Selection<SVGGElement, unknown, null, undefined> = d3.select(svgRef.current).select('.chart-container');

        const radius = Math.min(innerWidth, innerHeight) / 2 * 0.7;

        svg = d3.select(svgRef.current)
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .append('g')
            .attr("class", "chart-container")
            .attr('transform', `translate(${margin.left + innerWidth / 2}, ${margin.top + innerHeight / 2})`)
            .attr("viewBox", `0 0 ${width} ${height}`);

        if (!svg || chartData.length === 0) return;

        // Add chart title
        svg.select<SVGTextElement>('.chart-title').empty() ?
            svg.append('text').attr('class', 'chart-title') :
            svg.select<SVGTextElement>('.chart-title');
        svg.select<SVGTextElement>('.chart-title')
            .attr('x', 0)
            .attr('y', -innerHeight / 2 + 20)
            .attr('font-size', titleFontSize)
            .style('font-weight', 'bold')
            .attr('text-anchor', 'middle')
            .text(pieChartTitle);

        const pie = d3.pie<PieItem>().value(d => d.value).padAngle(0.01);
        const pieData = pie(chartData);

        const arc = d3.arc<any, d3.PieArcDatum<PieItem>>()
            .cornerRadius(3)
            .outerRadius(radius)
            .innerRadius(radius * 0.6);

        // Use a common update function for the transition
        const updateArc = (d: d3.PieArcDatum<PieItem>) => arc(d) || "";

        const slices = svg.selectAll<SVGPathElement, d3.PieArcDatum<PieItem>>("path.slice")
            .data(pieData, d => d.data.label)
            .join(
                enter => enter.append("path")
                    .attr("class", "slice")
                    .attr('fill', (d, i) => pieColors[i % pieColors.length])
                    .attr("transform", `translate(${innerWidth / 2 - radius}, 0)`)
                    .each(function (d) {
                        // Initialize new slices at an angle of 0 so they animate in
                        (this as PathWithCurrent)._current = {
                            startAngle: 0,
                            endAngle: 0
                        };
                    }),
                update => update, // No changes needed for the update selection itself
                exit => exit.remove()
            );

        const setPieCenter = (data: d3.PieArcDatum<PieItem>) => {

            const percentage = (data.endAngle - data.startAngle) / (2 * Math.PI) * 100;
            const percentageText = d3.format(".1f")(percentage) + "%";

            const pieCenterG = svg.select<SVGGElement>('g.pie-center').empty() ?
                svg.append('g').attr('class', 'pie-center') : svg.select<SVGGElement>('g.pie-center');

            const pieCenterLabel = pieCenterG.select<SVGTextElement>('text.pie-center-label').empty() ?
                pieCenterG.append('text').attr('class', 'pie-center-label') : pieCenterG.select<SVGTextElement>('text.pie-center-label');

            const pieCenterValue = pieCenterG.select<SVGTextElement>('text.pie-center-value').empty() ?
                pieCenterG.append('text').attr('class', 'pie-center-value') : pieCenterG.select<SVGTextElement>('text.pie-center-value');

            pieCenterG.attr('transform', `translate(${innerWidth / 2 - radius}, 0)`);
            pieCenterLabel
                .style('text-anchor', 'middle')
                .style('font-size', largeFontSize)
                .style('font-weight', 'bold')
                .attr('y', -10)
                .text(_.startCase(data.data.label));
            pieCenterValue
                .style('text-anchor', 'middle')
                .attr('y', 15)
                .style('font-size', largeFontSize)
                .style('font-weight', 'bold')
                .text(`${percentageText}`);
        }

        // Now, handle the transition for BOTH entering and updating slices
        slices.transition()
            .duration(1000)
            .attrTween("d", function (d) {
                // Interpolate from the previous state (_current) to the new state (d)
                const interpolate = d3.interpolate((this as PathWithCurrent)._current, d);

                // Update the stored state for the next transition
                (this as PathWithCurrent)._current = d;

                // Return the interpolator function
                return t => updateArc(interpolate(t)) || "";
            })
            .on("end", function (d) {
                background.on('touchstart', function () {
                    const slices = d3.selectAll("path.slice");

                    slices
                        .transition()
                        .duration(100)
                        .attr("stroke", "none")
                        .attr("filter", null);
                });
                // Add hover effects
                svg.selectAll<SVGPathElement, d3.PieArcDatum<PieItem>>("path.slice")
                    .on("mouseover", function (event, d) {
                        const slice = d3.select(this);

                        // Bring slice to front so it isn't hidden behind neighbors
                        slice.raise();

                        slice
                            .transition()
                            .duration(200)
                            .attr("filter", "drop-shadow(0 0 0.25rem rgba(0, 0, 0, .7))");

                        setPieCenter(d);
                    })
                    .on("touchstart", function (event, d) {
                        const slices = d3.selectAll("path.slice");

                        slices
                            .transition()
                            .duration(100)
                            .attr("stroke", "none")
                            .attr("filter", null);

                        const slice = d3.select(this);

                        // Bring slice to front so it isn't hidden behind neighbors
                        slice.raise();

                        slice
                            .transition()
                            .duration(200)
                            .attr("filter", "drop-shadow(0 0 0.25rem rgba(0, 0, 0, .7))");

                        setPieCenter(d);
                        event.stopPropagation();
                    })
                    .on("mouseout", function (event, d) {
                        const slice = d3.select(this);

                        slice
                            .transition()
                            .duration(100)
                            .attr("stroke", "none")
                            .attr("filter", null);
                    });
            });

        const legends = svg.selectAll<SVGGElement, d3.PieArcDatum<PieItem>>("g.legend")
            .data(pieData, d => d.data.label)
            .join(
                enter => enter.append("g")
                    .attr("class", "legend")
                    .attr("transform", (d, i) => `translate(${- innerWidth / 2}, ${-5 * chartData.length + (i * 20)})`)
                    .attr("opacity", 0)
                    .call(enterG => {
                        enterG.append("rect")
                            .attr("width", 15)
                            .attr("height", 15)
                            .attr("fill", (d, i) => pieColors[i % pieColors.length])
                            .attr("rx", 4)
                            .attr("ry", 4);

                        enterG.append("text")
                            .attr("x", 20)
                            .attr("y", 12)
                            .style("font-size", fontSize)
                            .text(d => _.startCase(d.data.label));
                    }),
                update => update,
                exit => exit.remove()
            );

        legends.transition()
        .duration(500)
        .attr("opacity", 1)
        .attr("transform", (d, i) => `translate(${- innerWidth / 2}, ${-10 * chartData.length + (i * 20)})`)
        .transition()
        .delay(500)
        .on("end", function (d) {
            d3.select<SVGGElement, d3.PieArcDatum<PieItem>>(this).on("mouseover", function (event, d) {
                const slice = svg.selectAll<SVGPathElement, d3.PieArcDatum<PieItem>>("path.slice")
                    .filter(s => s.data.label === d.data.label);
                const legendIcon = d3.select(this).select("rect");
    
                // Bring slice to front so it isn't hidden behind neighbors
                slice.raise();
    
                slice
                    .transition()
                    .duration(200)
                    .attr("filter", "drop-shadow(0 0 0.25rem rgba(0, 0, 0, .7))");
    
                legendIcon
                    .transition()
                    .duration(200)
                    .attr("stroke", "black")
                    .attr("stroke-width", 1);
    
                setPieCenter(d);
            })
                .on("mouseout", function (event, d) {
                    const slice = svg.selectAll<SVGPathElement, d3.PieArcDatum<PieItem>>("path.slice")
                        .filter(s => s.data.label === d.data.label);
                    const legendIcon = d3.select(this).select("rect");
    
                    slice
                        .transition()
                        .duration(100)
                        .attr("stroke", "none")
                        .attr("filter", null);
                    legendIcon
                        .transition()
                        .duration(100)
                        .attr("stroke", "none");
                });
        });

    }

    return (

        <div className='flex relative flex-col justify-center h-full w-full'>
            <div ref={containerRef} className="flex justify-center h-full items-center w-full">
                {!hideSwitch && <div
                    className='bg-[#639cbb] absolute bottom-0 right-0 inline-flex items-center rounded-sm hover:bg-[#19547b] transition-colors duration-200'>
                    <Button onClick={() => {setPieChartMode(false);}} className={`${pieChartMode ? '' : 'hidden'} text-[#e6f7ff] p-1.5`}>
                        {ChartTypeEnumToIconComponent(ChartTypeIconEnum.HorizontalBarChart, 18, false)}
                    </Button>
                    <Button onClick={() => {setPieChartMode(true);}} className={`${pieChartMode ? 'hidden' : ''} text-[#e6f7ff] p-1.5`}>
                        {ChartTypeEnumToIconComponent(ChartTypeIconEnum.PieChart, 18, false)}
                    </Button>
                </div>}
                <svg ref={svgRef} />
            </div>
        </div>
    );
};

export default AnimatedBarPieChart;