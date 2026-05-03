import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface RadarChartProps {
  data: {
    axis: string;
    value: number; // 1-10
  }[];
  width?: number;
  height?: number;
}

export function RadarChart({ data, width = 400, height = 400 }: RadarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const radius = Math.min(innerWidth, innerHeight) / 2;

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const axes = data.map(d => d.axis);
    const totalAxes = axes.length;
    const angleSlice = (Math.PI * 2) / totalAxes;

    const rScale = d3.scaleLinear()
      .range([0, radius])
      .domain([0, 10]);

    // Circular grid
    const levels = 5;
    for (let i = 0; i < levels; i++) {
      const levelFactor = radius * ((i + 1) / levels);
      g.selectAll(".levels")
        .data(axes)
        .enter()
        .append("line")
        .attr("x1", (d, i) => levelFactor * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("y1", (d, i) => levelFactor * Math.sin(angleSlice * i - Math.PI / 2))
        .attr("x2", (d, i) => levelFactor * Math.cos(angleSlice * (i + 1) - Math.PI / 2))
        .attr("y2", (d, i) => levelFactor * Math.sin(angleSlice * (i + 1) - Math.PI / 2))
        .style("stroke", "hsl(var(--primary))")
        .style("stroke-opacity", "0.2")
        .style("stroke-width", "1px");
    }

    // Axes
    const axisGrid = g.selectAll(".axis")
      .data(axes)
      .enter()
      .append("g")
      .attr("class", "axis");

    axisGrid.append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", (d, i) => rScale(10) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("y2", (d, i) => rScale(10) * Math.sin(angleSlice * i - Math.PI / 2))
      .style("stroke", "hsl(var(--primary))")
      .style("stroke-opacity", "0.4")
      .style("stroke-width", "1px");

    // Labels
    axisGrid.append("text")
      .attr("class", "legend")
      .style("font-size", "11px")
      .style("font-family", "var(--font-mono)")
      .style("fill", "hsl(var(--foreground))")
      .style("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("x", (d, i) => rScale(11.5) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("y", (d, i) => rScale(11.5) * Math.sin(angleSlice * i - Math.PI / 2))
      .text(d => d.toUpperCase());

    // Radar line
    const radarLine = d3.lineRadial<{axis: string, value: number}>()
      .curve(d3.curveLinearClosed)
      .radius(d => rScale(d.value))
      .angle((d, i) => i * angleSlice);

    // Area
    g.append("path")
      .datum(data)
      .attr("d", radarLine)
      .style("fill", "hsl(var(--primary))")
      .style("fill-opacity", 0.2)
      .style("stroke", "hsl(var(--primary))")
      .style("stroke-width", 2)
      .style("filter", "drop-shadow(0 0 8px hsl(var(--primary)))");

    // Points
    g.selectAll(".radarCircle")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "radarCircle")
      .attr("r", 4)
      .attr("cx", (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("cy", (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2))
      .style("fill", "hsl(var(--background))")
      .style("stroke", "hsl(var(--primary))")
      .style("stroke-width", 2);

  }, [data, width, height]);

  return <svg ref={svgRef} className="mx-auto" />;
}
