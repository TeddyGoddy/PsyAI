import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';

const ForestContainer = styled.div`
  width: 100%;
  height: 600px;
  border: 1px solid ${props => props.theme.colors.text.light};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.colors.surface};
  position: relative;
  overflow: hidden;
`;

const TooltipContainer = styled.div`
  position: absolute;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: 0.875rem;
  pointer-events: none;
  z-index: 1000;
  opacity: ${props => props.visible ? 1 : 0};
  transition: opacity 0.2s ease;
`;

const RandomForest = ({ data, onNodeClick, userType = 'psychologist' }) => {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '' });

  useEffect(() => {
    if (!data || !data.nodes || !data.links) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    // Create simulation
    const simulation = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink(data.links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30));

    // Create color scale based on node type
    const colorScale = d3.scaleOrdinal()
      .domain(['event', 'pattern', 'emotion', 'behavior'])
      .range(['#ef4444', '#3b82f6', '#10b981', '#f59e0b']);

    // Create links
    const link = svg.append("g")
      .selectAll("line")
      .data(data.links)
      .enter().append("line")
      .attr("stroke", "#94a3b8")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => Math.sqrt(d.weight || 1) * 2);

    // Create nodes
    const node = svg.append("g")
      .selectAll("circle")
      .data(data.nodes)
      .enter().append("circle")
      .attr("r", d => Math.sqrt(d.importance || 1) * 15 + 10)
      .attr("fill", d => colorScale(d.type))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Add labels
    const labels = svg.append("g")
      .selectAll("text")
      .data(data.nodes)
      .enter().append("text")
      .text(d => d.label)
      .attr("font-size", "12px")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("fill", "#1e293b")
      .style("pointer-events", "none");

    // Add event listeners
    node
      .on("mouseover", (event, d) => {
        setTooltip({
          visible: true,
          x: event.pageX + 10,
          y: event.pageY - 10,
          content: `${d.label}\nType: ${d.type}\nImportance: ${d.importance || 1}`
        });
      })
      .on("mouseout", () => {
        setTooltip(prev => ({ ...prev, visible: false }));
      })
      .on("click", (event, d) => {
        if (onNodeClick) {
          onNodeClick(d);
        }
      });

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      labels
        .attr("x", d => d.x)
        .attr("y", d => d.y);
    });

    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [data, onNodeClick]);

  return (
    <ForestContainer>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid meet"
      />
      <TooltipContainer
        visible={tooltip.visible}
        style={{ left: tooltip.x, top: tooltip.y }}
      >
        {tooltip.content.split('\n').map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </TooltipContainer>
    </ForestContainer>
  );
};

export default RandomForest;
