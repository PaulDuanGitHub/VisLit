'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { AnimatedLineChartDataPoint } from '@/components/viz/common/types';

interface LineChartProps {
  data: AnimatedLineChartDataPoint[];
  xLabel?: string;
  yLabel?: string;
  chartTitle?: string;
}

const AnimatedLineChart: React.FC<LineChartProps> = ({
  data,
  xLabel = 'x',
  yLabel = 'y',
  chartTitle = 'Animated Line Chart'
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const xScaleRef = useRef<d3.ScaleLinear<number, number>>(null);
  const yScaleRef = useRef<d3.ScaleLinear<number, number>>(null);

  const viewMdBreakpoint = 768;

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
  }, [data]);

  const drawChart = () => {
    // Clear previous SVG content
    d3.select(svgRef.current).selectAll('*').remove();
    const container = containerRef.current;
    const width = container?.clientWidth || 800;
    const height = container?.clientHeight || 400;
    const isSmallScreen = window.innerWidth < viewMdBreakpoint;

    const fontScale = d3.scaleLinear()
      .domain([300, 1200]) // chart width range
      .range([12, 14]) // font size range
      .clamp(true);

    const fontSize = `${fontScale(width)}px`;
    const titleFontSize = `${fontScale(width) * 1.2}px`;
    const largeFontSize = `${fontScale(width) * 1.5}px`;

    const margin = {
      top: 30,
      right: 20,
      bottom: 55,
      left: 90
    };

    // Set up dimensions
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Add a transparent background rectangle for better touch handling

    // Create SVG container
    const svg = d3.select(svgRef.current)
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const background = svg.append('rect')
      .attr('class', 'background-rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'transparent')
      .style("pointer-events", "all");

    svg.append("defs")
      .append("clipPath")
      .attr("id", "chart-clip")
      .append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight);

    const clippableContent = svg.append("g")
      .attr("class", "chart-content")
      .attr("clip-path", "url(#chart-clip)");

    // Add chart title
    svg.append('text')
      .attr('class', 'chart-title')
      .attr('x', innerWidth / 2 - margin.left / 2)
      .attr('y', "-1em")
      .style('font-weight', 'bold')
      .attr('font-size', titleFontSize)
      .style('text-anchor', 'middle')
      .text(chartTitle);

    // Set up scales
    xScaleRef.current = d3.scaleLinear()
      .domain(d3.extent(data, d => d.x) as [number, number])
      .range([0, innerWidth]);

    yScaleRef.current = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.y) as number])
      .range([innerHeight, 0])
      .nice();

    const originalXScale = xScaleRef.current?.copy();
    const originalYScale = yScaleRef.current?.copy();

    // Create stripes background
    const tickValues = xScaleRef.current.ticks();
    const stripeGroup = clippableContent.append("g").attr("class", "x-stripes");

    for (let i = 0; i < tickValues.length - 1; i++) {
      const x0 = tickValues[i];
      const x1 = tickValues[i + 1];

      // Alternate: stripe every other interval
      if (i % 2 === 0) {
        stripeGroup.append("rect")
          .attr("x", xScaleRef.current(x0))
          .attr("y", 0)
          .attr("width", xScaleRef.current(x1) - xScaleRef.current(x0))
          .attr("height", innerHeight)
          .attr("fill", "#f7f7f7");
      }
    }

    // Create axes
    const xAxis = d3.axisBottom(xScaleRef.current).tickFormat(d3.format('d')).ticks(isSmallScreen ? 5 : 10);
    const yAxis = d3.axisLeft(yScaleRef.current);

    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .style('font-size', fontSize);

    svg.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .style('font-size', fontSize);

    // Add axis labels
    svg.append('text')
      .attr('class', 'x-axis-label')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + margin.bottom - 10)
      .attr('font-size', fontSize)
      .style('text-anchor', 'middle')
      .text(`${xLabel}`);

    svg.append('text')
      .attr('class', 'y-axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -margin.left + 20)
      .attr('font-size', fontSize)
      .style('text-anchor', 'middle')
      .text(`${yLabel}`);

    // Create line generator
    const line = d3.line<AnimatedLineChartDataPoint>()
      .x(d => xScaleRef.current ? xScaleRef.current(d.x) : 0)
      .y(d => yScaleRef.current ? yScaleRef.current(d.y) : 0)
      .curve(d3.curveMonotoneX);

    // Add the line path with initial state (invisible)
    const path = clippableContent.append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('d', line)
      .attr('stroke', 'steelblue')
      .attr('stroke-width', isSmallScreen ? 1 : 1.5)
      .attr('fill', 'none')
      .attr('stroke-dasharray', function () { return this.getTotalLength() + ' ' + this.getTotalLength(); })
      .attr('stroke-dashoffset', function () { return this.getTotalLength(); });

    // Animate the line drawing
    path.transition()
      .duration(1500)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0);

    // Add circles for data points with enter animation
    clippableContent.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScaleRef.current ? xScaleRef.current(d.x) : 0)
      .attr('cy', d => yScaleRef.current ? yScaleRef.current(d.y) : 0)
      .attr('r', 0) // Start with radius 0
      .attr('fill', 'steelblue')
      .transition()
      .delay((d, i) => i * 10) // Staggered animation
      .duration(1000)
      .attr('r', isSmallScreen ? 2 : 2.5);

    // Add Transparent hit‑areas for data points
    clippableContent.selectAll('.dot.hit-area')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('class', 'hit-area')
      .attr('cx', d => xScaleRef.current ? xScaleRef.current(d.x) : 0)
      .attr('cy', d => yScaleRef.current ? yScaleRef.current(d.y) : 0)
      .attr('r', 0) // Start with radius 0
      .attr('fill', 'transparent') // Transparent fill for hit area
      .attr('r', 7);

    const focusLine = clippableContent.append('line')
      .attr('class', 'focus-line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .style('stroke', '#aaa')
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0);

    // Add tooltip
    const tooltip = d3.select('.tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', 'white')
      .style('padding', '8px')
      .style('border', '1px solid #ddd')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('z-index', '1000');

    // Add hover/touch effects
    background.on('touchstart', function () {
      if (tooltip.style('opacity') === '1') {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);

        focusLine
          .transition().style('opacity', 0);
      }
    });
    svg.selectAll<SVGCircleElement, AnimatedLineChartDataPoint>('.hit-area')
      .on('mouseover', function (event, d) {
        tooltip.transition()
          .duration(200)
          .style('opacity', 1);

        tooltip.html(`${xLabel}: ${d.x}<br/>${yLabel}: ${d.y.toFixed(2)}`)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`);

        focusLine
          .attr('x1', xScaleRef.current ? xScaleRef.current(d.x) : 0)
          .attr('x2', xScaleRef.current ? xScaleRef.current(d.x) : 0)
          .transition().style('opacity', 1);
      })
      .on('touchstart', function (event, d) {
        tooltip.transition()
          .duration(200)
          .style('opacity', 1);
        tooltip.html(`${xLabel}: ${d.x}<br/>${yLabel}: ${d.y.toFixed(2)}`)
          .style('left', `${event.touches[0].pageX + 10}px`)
          .style('top', `${event.touches[0].pageY - 28}px`);
        focusLine
          .attr('x1', xScaleRef.current ? xScaleRef.current(d.x) : 0)
          .attr('x2', xScaleRef.current ? xScaleRef.current(d.x) : 0)
          .transition().style('opacity', 1);
        event.stopPropagation();
      })
      .on('mouseout', function () {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);

        focusLine
          .transition().style('opacity', 0);
      });

    const shouldRenderDot = (x: number, y: number) => {
      return x >= 0 && x <= innerWidth && y >= 0 && y <= innerHeight;
    }

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .on("zoom", (event) => {

        xScaleRef.current = event.transform.rescaleX(originalXScale);

        // Update axes
        svg.select<SVGGElement>('.x-axis')
          .call(xAxis.scale(xScaleRef.current ? xScaleRef.current : d3.scaleLinear().range([0, innerWidth])))
          .style('font-size', fontSize);
        svg.select<SVGGElement>('.y-axis')
          .call(yAxis.scale(yScaleRef.current ? yScaleRef.current : d3.scaleLinear().range([innerHeight, 0])))
          .style('font-size', fontSize);

        // Update stripes
        const newTickValues = xScaleRef.current ? xScaleRef.current.ticks() : [];
        stripeGroup.selectAll("rect").remove();

        for (let i = 0; i < newTickValues.length - 1; i++) {
          const x0 = newTickValues[i];
          const x1 = newTickValues[i + 1];

          // Alternate: stripe every other interval
          if (i % 2 === 0) {
            stripeGroup.append("rect")
              .attr("x", xScaleRef.current ? xScaleRef.current(x0) : 0)
              .attr("y", 0)
              .attr("width", xScaleRef.current ? xScaleRef.current(x1) - xScaleRef.current(x0) : 0)
              .attr("height", innerHeight)
              .attr("fill", "#f7f7f7");
          }
        }

        // Update line path
        svg.select<SVGPathElement>('.line')
          .remove();

        const newPath = clippableContent.append('path')
          .datum(data)
          .attr('class', 'line')
          .attr('d', line)
          .attr('stroke', 'steelblue')
          .attr('stroke-width', isSmallScreen ? 1 : 1.5)
          .attr('fill', 'none');

        
        // Update circle positions
        svg.selectAll<SVGCircleElement, AnimatedLineChartDataPoint>('.dot')
          .style('display', d => {
            const newX = xScaleRef.current ? xScaleRef.current(d.x) : 0;
            const newY = yScaleRef.current ? yScaleRef.current(d.y) : 0;
            return shouldRenderDot(newX, newY) ? null : 'none';
          })
          .attr('cx', d => xScaleRef.current ? xScaleRef.current(d.x) : 0)
          .attr('cy', d => yScaleRef.current ? yScaleRef.current(d.y) : 0);

        // Update hit-area positions
        svg.selectAll<SVGCircleElement, AnimatedLineChartDataPoint>('.hit-area')
          .style('display', d => {
            const newX = xScaleRef.current ? xScaleRef.current(d.x) : 0;
            const newY = yScaleRef.current ? yScaleRef.current(d.y) : 0;
            return shouldRenderDot(newX, newY) ? null : 'none';
          })
          .attr('cx', d => xScaleRef.current ? xScaleRef.current(d.x) : 0)
          .attr('cy', d => yScaleRef.current ? yScaleRef.current(d.y) : 0);

      });

    // Attach zoom to SVG so it can listen to wheel/drag
    svg.call(zoom as any)
      .on("dblclick.zoom", null) // Disable double-click zoom

    const originalWheeledListener = svg.on("wheel.zoom") as ((this: SVGGElement, event: any, d: unknown) => void);

    svg.on("wheel.zoom", function (event) {
      if (event.ctrlKey) {
        // Prevent default zoom behavior if ctrl key is pressed
        event.preventDefault();
        return;
      }
      originalWheeledListener.call(this, event, null);
      event.preventDefault();
    });
  }

  return (
    <div ref={containerRef} className="flex justify-center items-center h-full w-full">
      <svg ref={svgRef} />
    </div>
  );
};

export default AnimatedLineChart;