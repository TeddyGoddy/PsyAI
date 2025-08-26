import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';

const MapContainer = styled.div`
  width: 100%;
  height: 500px;
  border: 1px solid ${props => props.theme.colors.text.light};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.colors.surface};
  position: relative;
  overflow: hidden;
`;

const MapHeader = styled.div`
  padding: ${props => props.theme.spacing.md};
  border-bottom: 1px solid ${props => props.theme.colors.text.light};
`;

const MapTitle = styled.h3`
  color: ${props => props.theme.colors.text.primary};
  font-size: 1.25rem;
  margin: 0;
`;

const ThematicMap = ({ themes = [], userType = 'psychologist' }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!themes || themes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    // Prepare data for word cloud
    const words = themes.map(theme => ({
      text: theme.name,
      size: Math.max(12, Math.min(48, theme.frequency * 2)),
      frequency: theme.frequency,
      sentiment: theme.sentiment || 'neutral',
      category: theme.category || 'general'
    }));

    // Color scale based on sentiment
    const colorScale = d3.scaleOrdinal()
      .domain(['positive', 'negative', 'neutral'])
      .range(['#10b981', '#ef4444', '#64748b']);

    // Create clusters for different categories
    const categoryScale = d3.scaleOrdinal()
      .domain(['emotion', 'behavior', 'thought', 'event', 'general'])
      .range([
        { x: width * 0.2, y: height * 0.3 },
        { x: width * 0.8, y: height * 0.3 },
        { x: width * 0.5, y: height * 0.2 },
        { x: width * 0.5, y: height * 0.8 },
        { x: width * 0.5, y: height * 0.5 }
      ]);

    // Force simulation for positioning
    const simulation = d3.forceSimulation(words)
      .force("charge", d3.forceManyBody().strength(-50))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(d => d.size / 2 + 5))
      .force("category", d3.forceX().x(d => categoryScale(d.category).x).strength(0.3))
      .force("categoryY", d3.forceY().y(d => categoryScale(d.category).y).strength(0.3));

    // Create text elements
    const text = svg.append("g")
      .selectAll("text")
      .data(words)
      .enter().append("text")
      .text(d => d.text)
      .attr("font-size", d => `${d.size}px`)
      .attr("font-family", "Inter, sans-serif")
      .attr("font-weight", d => d.frequency > 5 ? "600" : "400")
      .attr("fill", d => colorScale(d.sentiment))
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("cursor", "pointer")
      .style("opacity", 0.8)
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 1)
          .attr("font-size", `${d.size * 1.2}px`);
      })
      .on("mouseout", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 0.8)
          .attr("font-size", `${d.size}px`);
      });

    // Update positions on simulation tick
    simulation.on("tick", () => {
      text
        .attr("x", d => Math.max(d.size/2, Math.min(width - d.size/2, d.x)))
        .attr("y", d => Math.max(d.size/2, Math.min(height - d.size/2, d.y)));
    });

    // Add category labels
    Object.entries(categoryScale.domain()).forEach(([index, category]) => {
      const pos = categoryScale(category);
      svg.append("text")
        .attr("x", pos.x)
        .attr("y", pos.y - 60)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("font-weight", "600")
        .attr("fill", "#64748b")
        .attr("opacity", 0.6)
        .text(category.charAt(0).toUpperCase() + category.slice(1));
    });

    return () => {
      simulation.stop();
    };
  }, [themes]);

  return (
    <MapContainer>
      <MapHeader>
        <MapTitle>Mappa Tematica</MapTitle>
      </MapHeader>
      <svg
        ref={svgRef}
        width="100%"
        height="calc(100% - 60px)"
        viewBox="0 0 800 400"
        preserveAspectRatio="xMidYMid meet"
      />
    </MapContainer>
  );
};

export default ThematicMap;
