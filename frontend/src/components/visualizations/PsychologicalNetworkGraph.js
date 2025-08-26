import React, { useRef, useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import * as d3 from 'd3';
import { FiFilter, FiLayers, FiZoomIn, FiZoomOut, FiRotateCw, FiInfo } from 'react-icons/fi';

const NetworkContainer = styled.div`
  position: relative;
  width: 100%;
  height: ${props => props.height || '600px'};
  border-radius: 12px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border: 1px solid #334155;
  overflow: hidden;
`;

const SVGContainer = styled.svg`
  width: 100%;
  height: 100%;
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
`;

const ControlPanel = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
`;

const ControlButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(79, 70, 229, 0.3);
    border-color: rgba(79, 70, 229, 0.5);
    transform: scale(1.05);
  }

  &.active {
    background: rgba(79, 70, 229, 0.6);
    border-color: rgba(79, 70, 229, 0.8);
  }
`;

const FilterPanel = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  min-width: 250px;
  transform: translateX(${props => props.visible ? '0' : '-100%'});
  transition: transform 0.3s ease;
`;

const FilterGroup = styled.div`
  margin-bottom: 16px;
  
  h4 {
    margin: 0 0 8px 0;
    font-size: 14px;
    color: #a1a1aa;
  }
`;

const FilterCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  cursor: pointer;
  font-size: 12px;
  
  input {
    width: 14px;
    height: 14px;
  }
  
  .color-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${props => props.color};
  }
`;

const NodeTooltip = styled.div`
  position: absolute;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  color: white;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 12px;
  max-width: 300px;
  z-index: 20;
  pointer-events: none;
  transform: translate(-50%, -100%);
  
  .node-title {
    font-weight: 600;
    color: #4f46e5;
    margin-bottom: 4px;
  }
  
  .node-type {
    color: #a1a1aa;
    font-size: 10px;
    margin-bottom: 8px;
  }
  
  .node-description {
    line-height: 1.4;
    margin-bottom: 8px;
  }
  
  .node-connections {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 8px;
    font-size: 11px;
    
    .connection-item {
      margin-bottom: 2px;
      color: #cbd5e1;
    }
  }
`;

const LegendPanel = styled.div`
  position: absolute;
  bottom: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  min-width: 200px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
  
  .legend-color {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${props => props.color};
  }
  
  .legend-label {
    font-weight: 500;
  }
  
  .legend-count {
    color: #a1a1aa;
    margin-left: auto;
  }
`;

// Psychological domain configurations
const PSYCHOLOGICAL_DOMAINS = {
  core_emotions: {
    color: '#ef4444',
    label: 'Emozioni Primarie',
    description: 'Emozioni fondamentali e reazioni affettive'
  },
  cognitive_patterns: {
    color: '#3b82f6',
    label: 'Pattern Cognitivi',
    description: 'Schemi di pensiero e processi mentali'
  },
  behavioral_responses: {
    color: '#10b981',
    label: 'Risposte Comportamentali',
    description: 'Azioni e comportamenti osservabili'
  },
  defense_mechanisms: {
    color: '#f59e0b',
    label: 'Meccanismi di Difesa',
    description: 'Strategie inconsce di protezione psicologica'
  },
  interpersonal_dynamics: {
    color: '#8b5cf6',
    label: 'Dinamiche Interpersonali',
    description: 'Relazioni e interazioni sociali'
  },
  developmental_factors: {
    color: '#06b6d4',
    label: 'Fattori Evolutivi',
    description: 'Influenze dello sviluppo e storia personale'
  },
  environmental_triggers: {
    color: '#84cc16',
    label: 'Trigger Ambientali',
    description: 'Stimoli esterni e situazioni scatenanti'
  },
  coping_strategies: {
    color: '#ec4899',
    label: 'Strategie di Coping',
    description: 'Meccanismi di gestione e adattamento'
  }
};

const CONNECTION_TYPES = {
  triggers: { color: '#ef4444', width: 3, style: 'solid', label: 'Scatena' },
  reinforces: { color: '#10b981', width: 2, style: 'solid', label: 'Rinforza' },
  mitigates: { color: '#3b82f6', width: 2, style: 'dashed', label: 'Mitiga' },
  compensates: { color: '#f59e0b', width: 2, style: 'dotted', label: 'Compensa' },
  relates: { color: '#6b7280', width: 1, style: 'solid', label: 'Correlato' }
};

const PsychologicalNetworkGraph = ({ data, width = 900, height = 600, onNodeClick }) => {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, node: null });
  const [showFilters, setShowFilters] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [activeFilters, setActiveFilters] = useState(
    Object.keys(PSYCHOLOGICAL_DOMAINS).reduce((acc, key) => ({ ...acc, [key]: true }), {})
  );
  const [simulation, setSimulation] = useState(null);

  // Process and enrich data
  const processedData = useMemo(() => {
    if (!data?.nodes || !data?.edges) return { nodes: [], edges: [] };

    // Classify nodes into psychological domains
    const enrichedNodes = data.nodes.map(node => {
      const domain = classifyNode(node);
      return {
        ...node,
        domain,
        color: PSYCHOLOGICAL_DOMAINS[domain]?.color || '#6b7280',
        radius: calculateNodeRadius(node),
        clinicalSignificance: calculateClinicalSignificance(node, data.edges)
      };
    });

    // Enrich edges with psychological meaning
    const enrichedEdges = data.edges.map(edge => {
      const connectionType = CONNECTION_TYPES[edge.type] || CONNECTION_TYPES.relates;
      return {
        ...edge,
        ...connectionType,
        strength: edge.weight || 0.5,
        mechanism: edge.mechanism || generateConnectionMechanism(edge, enrichedNodes)
      };
    });

    return { nodes: enrichedNodes, edges: enrichedEdges };
  }, [data]);

  // Filter data based on active filters
  const filteredData = useMemo(() => {
    const filteredNodes = processedData.nodes.filter(node => activeFilters[node.domain]);
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = processedData.edges.filter(edge => 
      nodeIds.has(edge.source.id || edge.source) && nodeIds.has(edge.target.id || edge.target)
    );
    
    return { nodes: filteredNodes, edges: filteredEdges };
  }, [processedData, activeFilters]);

  useEffect(() => {
    if (!filteredData.nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create main group for zooming
    const g = svg.append("g");

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Create force simulation with psychological clustering
    const sim = d3.forceSimulation(filteredData.nodes)
      .force("link", d3.forceLink(filteredData.edges)
        .id(d => d.id)
        .distance(d => 100 + (1 - d.strength) * 100)
        .strength(d => d.strength * 0.8)
      )
      .force("charge", d3.forceManyBody()
        .strength(d => -300 - (d.clinicalSignificance * 200))
      )
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide()
        .radius(d => d.radius + 10)
      )
      .force("cluster", forceCluster()
        .centers(getClusterCenters())
        .strength(0.3)
      );

    setSimulation(sim);

    // Create arrow markers for directed edges
    const defs = svg.append("defs");
    Object.entries(CONNECTION_TYPES).forEach(([type, config]) => {
      defs.append("marker")
        .attr("id", `arrow-${type}`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", config.color);
    });

    // Draw edges
    const links = g.append("g")
      .selectAll("line")
      .data(filteredData.edges)
      .enter().append("line")
      .attr("stroke", d => d.color)
      .attr("stroke-width", d => d.width)
      .attr("stroke-dasharray", d => {
        if (d.style === 'dashed') return "5,5";
        if (d.style === 'dotted') return "2,2";
        return null;
      })
      .attr("marker-end", d => `url(#arrow-${d.type || 'relates'})`)
      .attr("opacity", 0.7);

    // Draw nodes
    const nodes = g.append("g")
      .selectAll("circle")
      .data(filteredData.nodes)
      .enter().append("circle")
      .attr("r", d => d.radius)
      .attr("fill", d => d.color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
      );

    // Add node labels
    const labels = g.append("g")
      .selectAll("text")
      .data(filteredData.nodes)
      .enter().append("text")
      .text(d => d.id)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "#fff")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .style("pointer-events", "none");

    // Add glow effect for high significance nodes
    nodes.filter(d => d.clinicalSignificance > 0.7)
      .style("filter", "drop-shadow(0 0 8px rgba(79, 70, 229, 0.8))");

    // Mouse events
    nodes
      .on("mouseover", (event, d) => {
        setTooltip({
          visible: true,
          x: event.pageX,
          y: event.pageY,
          node: d
        });
      })
      .on("mouseout", () => {
        setTooltip({ visible: false, x: 0, y: 0, node: null });
      })
      .on("click", (event, d) => {
        onNodeClick?.(d);
      });

    // Update positions on simulation tick
    sim.on("tick", () => {
      links
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      nodes
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      labels
        .attr("x", d => d.x)
        .attr("y", d => d.y);
    });

    function dragstarted(event, d) {
      if (!event.active) sim.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) sim.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      sim.stop();
    };
  }, [filteredData, width, height]);

  // Helper functions
  function classifyNode(node) {
    const type = node.type?.toLowerCase() || '';
    const id = node.id?.toLowerCase() || '';
    const category = node.category?.toLowerCase() || '';

    if (type.includes('emotion') || id.includes('ansia') || id.includes('paura') || id.includes('rabbia')) {
      return 'core_emotions';
    }
    if (type.includes('cognitive') || id.includes('pensiero') || id.includes('credenza')) {
      return 'cognitive_patterns';
    }
    if (type.includes('pattern') || type.includes('behavior') || id.includes('comportamento')) {
      return 'behavioral_responses';
    }
    if (type.includes('defense') || id.includes('difesa') || id.includes('evitamento')) {
      return 'defense_mechanisms';
    }
    if (type.includes('interpersonal') || id.includes('relazione') || id.includes('sociale')) {
      return 'interpersonal_dynamics';
    }
    if (type.includes('developmental') || id.includes('infanzia') || id.includes('famiglia')) {
      return 'developmental_factors';
    }
    if (type.includes('trigger') || id.includes('stress') || id.includes('situazione')) {
      return 'environmental_triggers';
    }
    if (type.includes('coping') || id.includes('strategia') || id.includes('gestione')) {
      return 'coping_strategies';
    }
    
    return 'cognitive_patterns'; // default
  }

  function calculateNodeRadius(node) {
    const baseRadius = 20;
    const weight = node.weight || 0.5;
    return baseRadius + (weight * 15);
  }

  function calculateClinicalSignificance(node, edges) {
    const connections = edges.filter(e => 
      e.source === node.id || e.target === node.id
    );
    const avgWeight = connections.reduce((sum, e) => sum + (e.weight || 0.5), 0) / connections.length || 0;
    return Math.min(1, (node.weight || 0.5) * 0.7 + avgWeight * 0.3);
  }

  function generateConnectionMechanism(edge, nodes) {
    const mechanisms = {
      triggers: "Attivazione diretta del pattern",
      reinforces: "Rinforzo positivo del comportamento",
      mitigates: "Riduzione dell'intensità",
      compensates: "Meccanismo compensatorio",
      relates: "Correlazione osservata"
    };
    return mechanisms[edge.type] || "Connessione psicologica";
  }

  function getClusterCenters() {
    const domains = Object.keys(PSYCHOLOGICAL_DOMAINS);
    const angleStep = (2 * Math.PI) / domains.length;
    const radius = Math.min(width, height) * 0.3;
    
    return domains.reduce((centers, domain, i) => {
      const angle = i * angleStep;
      centers[domain] = {
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius
      };
      return centers;
    }, {});
  }

  function forceCluster() {
    let nodes, centers, strength = 0.1;

    function force(alpha) {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const center = centers[node.domain];
        if (center) {
          node.vx += (center.x - node.x) * strength * alpha;
          node.vy += (center.y - node.y) * strength * alpha;
        }
      }
    }

    force.initialize = function(_) {
      nodes = _;
    };

    force.centers = function(_) {
      return arguments.length ? (centers = _, force) : centers;
    };

    force.strength = function(_) {
      return arguments.length ? (strength = +_, force) : strength;
    };

    return force;
  }

  const toggleFilter = (domain) => {
    setActiveFilters(prev => ({
      ...prev,
      [domain]: !prev[domain]
    }));
  };

  const resetView = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().duration(750).call(
      d3.zoom().transform,
      d3.zoomIdentity
    );
  };

  const reheatSimulation = () => {
    if (simulation) {
      simulation.alpha(1).restart();
    }
  };

  return (
    <NetworkContainer height={height}>
      <SVGContainer
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      />

      <ControlPanel>
        <ControlButton 
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? 'active' : ''}
          title="Filtri Domini"
        >
          <FiFilter />
        </ControlButton>
        <ControlButton 
          onClick={() => setShowLegend(!showLegend)}
          className={showLegend ? 'active' : ''}
          title="Legenda"
        >
          <FiLayers />
        </ControlButton>
        <ControlButton onClick={resetView} title="Reset Vista">
          <FiZoomOut />
        </ControlButton>
        <ControlButton onClick={reheatSimulation} title="Riorganizza">
          <FiRotateCw />
        </ControlButton>
      </ControlPanel>

      <FilterPanel visible={showFilters}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Domini Psicologici</h3>
        {Object.entries(PSYCHOLOGICAL_DOMAINS).map(([key, domain]) => (
          <FilterGroup key={key}>
            <FilterCheckbox color={domain.color}>
              <input
                type="checkbox"
                checked={activeFilters[key]}
                onChange={() => toggleFilter(key)}
              />
              <div className="color-indicator" />
              <div>
                <div style={{ fontWeight: '500' }}>{domain.label}</div>
                <div style={{ fontSize: '10px', color: '#a1a1aa' }}>
                  {domain.description}
                </div>
              </div>
            </FilterCheckbox>
          </FilterGroup>
        ))}
      </FilterPanel>

      {showLegend && (
        <LegendPanel>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Connessioni</h4>
          {Object.entries(CONNECTION_TYPES).map(([type, config]) => (
            <LegendItem key={type} color={config.color}>
              <div className="legend-color" />
              <div className="legend-label">{config.label}</div>
            </LegendItem>
          ))}
        </LegendPanel>
      )}

      {tooltip.visible && tooltip.node && (
        <NodeTooltip
          style={{
            left: tooltip.x,
            top: tooltip.y
          }}
        >
          <div className="node-title">{tooltip.node.id}</div>
          <div className="node-type">
            {PSYCHOLOGICAL_DOMAINS[tooltip.node.domain]?.label}
          </div>
          <div className="node-description">
            {tooltip.node.description || "Elemento del profilo psicologico"}
          </div>
          <div className="node-connections">
            <div><strong>Significato Clinico:</strong> {Math.round(tooltip.node.clinicalSignificance * 100)}%</div>
            <div><strong>Peso:</strong> {Math.round((tooltip.node.weight || 0.5) * 100)}%</div>
          </div>
        </NodeTooltip>
      )}
    </NetworkContainer>
  );
};

export default PsychologicalNetworkGraph;
