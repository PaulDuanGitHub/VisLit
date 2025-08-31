'use client';
import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { TopoJSON, GeometryCollection, Objects, Topology } from 'topojson-specification';
import { Feature, FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import { GeoHeatMapItem } from './common/types';
import { on } from 'events';

interface GeoMapHeatMapProps {
    data: GeoHeatMapItem[];
    topology: Topology;
    onProvinceClick?: (province: string | null) => void;
    chartTitle?: string;
    disableZoom?: boolean;
}

const AnimatedGeoHeatMap: React.FC<GeoMapHeatMapProps> = ({
    data,
    topology,
    onProvinceClick = () => {},
    chartTitle = "",
    disableZoom = false
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
    };

    useEffect(() => {
        if (!data || data.length === 0 || !svgRef.current) return;

        // Initialize resize observer
        const resizeObserver = new ResizeObserver((entries) => {
            if (!entries[0] || !svgRef.current) return;
            drawChart();
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        const tooltip = d3.select('body').append('div').attr('class', 'tooltip');

        return () => {
            resizeObserver.disconnect();
            if (svgRef.current) {
                d3.select(svgRef.current).selectAll('*').remove();
            }
            tooltip.remove();
        };
    }, [data, topology]);

    const drawChart = () => {
        if (!topology || !svgRef.current || !data) return;

        const canada = topojson.feature(topology, topology.objects.canada_provinces) as FeatureCollection;

        // Clear previous SVG content
        d3.select(svgRef.current).selectAll('*').remove();
        const container = containerRef.current;
        const width = container?.clientWidth || 800;
        const height = container?.clientHeight || 400;

        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const cities = data;
        
        const fontScale = d3.scaleLinear()
            .domain([300, 1200]) // chart width range
            .range([12, 14]) // font size range
            .clamp(true);

        const fontSsize = `${fontScale(width)}px`;
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

        // Create SVG container
        const svg = d3.select(svgRef.current)
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        
        // Add chart title
        svg.append('text')
            .attr('class', 'chart-title')
            .attr('x', innerWidth / 2)
            .attr('y', 0)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'hanging')
            .style('font-size', titleFontSize)
            .text(chartTitle);

        svg.append("rect")
            .attr("class", "zoom-capture")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all");

        const projection = d3.geoTransverseMercator()
            .rotate([100, 0]) // Central meridian around -100 degrees longitude (longitude is first element in rotate)
            // Latitude of origin is usually 0 for Transverse Mercator (second element)npm install -g topojson topojson-simplify
            .translate([innerWidth / 2, innerHeight / 2]); // Pixel center of your SVG

        projection.fitSize([innerWidth, innerHeight], canada); // Fit the projection to the Canada geometry

        const pathGenerator = d3.geoPath().projection(projection);

        const g = svg.append('g')
            .attr('class', 'map-container')

        const provincesGroup = g.append("g").attr("class", "provinces");
        const citiesGroup = g.append("g").attr("class", "cities");

        const nonInteractiveProvinces = ["Nunavut", "Northwest Territories"];

        // Draw provinces
        provincesGroup.selectAll<SVGPathElement, Feature<Geometry, GeoJsonProperties>[]>(".provience")
            .data(canada.features)
            .join("path")
            .attr("class", "province")
            .attr("d", pathGenerator)
            .attr("fill", "#e6f7ff")
                .on("mouseover touchstart", function (event, d) {
                    if (nonInteractiveProvinces.includes(d.properties?.name)) return;
                    d3.select(this)
                        .attr("fill", "#bae7ff")
                })
                .on("mouseout touchend", function (event, d) {
                    if (nonInteractiveProvinces.includes(d.properties?.name)) return;
                    d3.select(this)
                        .attr("fill", "#e6f7ff")
                })
                .on("click", (event, d) => {
                    if (nonInteractiveProvinces.includes(d.properties?.name)) return;
                    onProvinceClick(d.properties?.name);
                })
            .attr("stroke", "#1890ff")
            .attr("stroke-width", 1)
            .attr('stroke-dasharray', function () { return this.getTotalLength() + ' ' + this.getTotalLength(); })
            .attr('stroke-dashoffset', function () { return this.getTotalLength(); })
            .transition()
            .duration(2500)
            .ease(d3.easeLinear)
            .attr('stroke-dashoffset', 0)
            

        const cityPoints = citiesGroup.selectAll(".city")
            .data(cities)
            .enter()
            .append("circle")
            .attr("class", "city")
            .attr("pointer-events", "none")

            .attr("cx", d => {
                const [x] = projection(d.coordinates as [number, number]) || [0, 0];
                return x;
            })
            .attr("cy", d => {
                const [, y] = projection(d.coordinates as [number, number]) || [0, 0];
                return y;
            })
            .attr("r", 0)
            .attr("fill", "green")
            .attr("opacity", 0)
            .transition()
            .duration(2000)
            .attr("r", d => {
                return 7;
            })
            .attr("opacity", d => {
                const value = d.value || 0;
                const maxValue = Math.max(...cities.map(city => city.value));

                const scale = d3.scaleLinear()
                    .domain([0, maxValue])
                    .range([0.2, 0.4]);

                const opacity = scale(value);
                return opacity;
            });

            if (!disableZoom) {
                // Create zoom behavior
                const zoom = d3.zoom<SVGSVGElement, unknown>()
                    .scaleExtent([1, 5]) // Min and max zoom
                    .translateExtent([[-100, -100], [width + 100, height + 100]]) // minXY, maxXY in SVG coords
                    .on("zoom", (event) => {
                        provincesGroup.attr("transform", event.transform)
                            .selectAll("path")
                            .attr("stroke-width", 1 / event.transform.k); // Keep stroke width constant

                        // For the cities: move them but don't scale radius
                        citiesGroup.attr("transform", event.transform)
                            .selectAll("circle")
                            .attr("r", 7 / event.transform.k); // Keep visual size
                    });

                // Attach zoom to SVG so it can listen to wheel/drag
                svg.call(zoom as any)
                    .on("dblclick.zoom", null) // Disable double-click zoom

                const originalWheeledListener = svg.on("wheel.zoom") as ((this: SVGGElement, event: any, d: unknown) => void);

                svg.on("wheel.zoom", function(event) {
                        if (event.ctrlKey) {
                            // Prevent default zoom behavior if ctrl key is pressed
                            event.preventDefault();
                            return;
                        }
                        originalWheeledListener.call(this, event, null);
                        event.preventDefault();
                    });
            }
    }

    return (
        <>
            <div ref={containerRef} className="flex justify-center items-center h-full w-full">
                <svg ref={svgRef} />
            </div>
        </>
    );
};

export default AnimatedGeoHeatMap;