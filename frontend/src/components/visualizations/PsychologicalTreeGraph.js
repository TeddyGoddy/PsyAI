import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';
import { FiFilter, FiLayers, FiZoomIn, FiZoomOut, FiRotateCw, FiInfo, FiMaximize2, FiMinimize2 } from 'react-icons/fi';

// ===== Helpers (moved outside of styled components) =====
function getPsychologicalConnectionColor(type, themeMode) {
  const light = themeMode === 'light';
  const colors = {
    triggers: light ? '#dc2626' : '#ef4444',
    causes: light ? '#ea580c' : '#f97316',
    reinforces: light ? '#d97706' : '#f59e0b',
    leads_to: light ? '#7c3aed' : '#8b5cf6',
    manifests_as: light ? '#059669' : '#10b981',
    impairs: light ? '#2563eb' : '#60a5fa',
    contributes_to: light ? '#0ea5e9' : '#22d3ee',
    maintains: light ? '#6b7280' : '#94a3b8',
    exacerbates: light ? '#b91c1c' : '#f87171',
    develops_into: light ? '#334155' : '#94a3b8',
    results_in: light ? '#22c55e' : '#34d399',
    feeds_into: light ? '#8b5cf6' : '#a78bfa',
    symptom_of: light ? '#64748b' : '#94a3b8',
    relates: light ? '#64748b' : '#94a3b8'
  };
  return colors[type] || (light ? '#64748b' : '#94a3b8');
}

function getConnectionTypeDistance(type) {
  switch (type) {
    case 'triggers':
    case 'causes':
      return 20;
    case 'reinforces':
    case 'maintains':
      return 40;
    case 'leads_to':
    case 'develops_into':
      return 10;
    case 'manifests_as':
      return 0;
    default:
      return 30;
  }
}

function classifyNodeDomain(n) {
  const text = (n?.name || n?.label || n?.id || '').toString().toLowerCase();
  if (/ansia|panic|paura|fobia|core|problema/.test(text)) return 'core_problem';
  if (/famili|genitor|partner|relaz/.test(text)) return 'family_dynamics';
  if (/lavor|scuola|trigger|stress|ambient/.test(text)) return 'environmental_triggers';
  if (/pensier|cognitiv|convin|schema|perfezion|catastrof/.test(text)) return 'cognitive_patterns';
  if (/emoz|umore|irritab|depress|vergog|colpa/.test(text)) return 'emotional_responses';
  if (/comport|evit|sonno|palpit|sudor|fatica|agitaz/.test(text)) return 'behavioral_manifestations';
  if (/difes|negaz|proiez|controllo/.test(text)) return 'defense_mechanisms';
  if (/svilupp|infanzi|trauma|traumatic/.test(text)) return 'developmental_factors';
  if (/trauma|ptsd|abus/.test(text)) return 'trauma_related';
  if (/relazion|isolament|attacc|interperson/.test(text)) return 'relational_patterns';
  return 'cognitive_patterns';
}

function getNodeRadius(d) {
  const sig = d?.significance ?? d?.data?.significance ?? 0.5;
  const clin = d?.clinicalRelevance ?? d?.data?.clinicalRelevance ?? 0.6;
  const base = 10;
  return base + sig * 12 + clin * 6;
}

function transformConnectionsToEnrichedNetwork(connections) {
  const nodeMap = new Map();

  const ensureNode = (raw) => {
    if (!raw) return null;
    const id = typeof raw === 'string' ? raw : (raw.id || raw.name || raw.label);
    if (!id) return null;
    if (nodeMap.has(id)) return id;
    const labelFromId = id.toString().replace(/_/g, ' ');
    const name = (typeof raw === 'object' && (raw.name || raw.label)) || (labelFromId ? labelFromId.charAt(0).toUpperCase() + labelFromId.slice(1) : undefined);
    const domain = (typeof raw === 'object' && raw.domain) || classifyNodeDomain({ id, name });
    nodeMap.set(id, {
      id,
      name,
      domain,
      significance: typeof raw?.significance === 'number' ? raw.significance : 0.5,
      clinicalRelevance: typeof raw?.clinicalRelevance === 'number' ? raw.clinicalRelevance : (typeof raw?.confidence === 'number' ? raw.confidence : 0.6),
      severity: raw?.severity || PSYCHOLOGICAL_DOMAINS[domain]?.severity || 'medium',
      description: raw?.description,
      fromProfile: !!raw?.fromProfile
    });
    return id;
  };

  const links = [];
  (Array.isArray(connections) ? connections : []).forEach(c => {
    const sourceId = ensureNode(c.source);
    const targetId = ensureNode(c.target);
    if (!sourceId || !targetId) return;
    const strength = typeof c.strength === 'number' ? c.strength : (typeof c.weight === 'number' ? c.weight : 0.5);
    const confidence = typeof c.confidence === 'number' ? c.confidence : 0.7;
    links.push({ source: sourceId, target: targetId, type: c.type || 'relates', strength, confidence });
    const src = nodeMap.get(sourceId);
    const tgt = nodeMap.get(targetId);
    src.significance = Math.min(1, (src.significance || 0.5) * 0.9 + 0.1 * strength);
    tgt.significance = Math.min(1, (tgt.significance || 0.5) * 0.9 + 0.12 * strength);
    src.clinicalRelevance = Math.min(1, (src.clinicalRelevance || 0.6) * 0.9 + 0.1 * confidence);
    tgt.clinicalRelevance = Math.min(1, (tgt.clinicalRelevance || 0.6) * 0.9 + 0.1 * confidence);
  });

  return { nodes: Array.from(nodeMap.values()), links };
}

// ===== Styled Components =====
const TreeContainer = styled.div`
  position: ${props => props.fullscreen ? 'fixed' : 'relative'};
  ${props => props.fullscreen ? 'inset: 0;' : ''}
  width: ${props => props.fullscreen ? '100vw' : '100%'};
  height: ${props => props.fullscreen ? '100vh' : (typeof props.height === 'number' ? `${props.height}px` : (props.height || '700px'))};
  border-radius: 12px;
  background: ${props => props.theme?.mode === 'light' 
    ? 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' 
    : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'};
  border: 1px solid ${props => props.theme?.mode === 'light' ? '#e2e8f0' : '#334155'};
  overflow: hidden;
  box-shadow: ${props => props.theme?.mode === 'light' 
    ? '0 4px 20px rgba(0, 0, 0, 0.08)' 
    : '0 4px 20px rgba(0, 0, 0, 0.25)'};
  z-index: ${props => props.fullscreen ? 9999 : 'auto'};
  border-radius: ${props => props.fullscreen ? '0' : '12px'};
`;

// Small settings panel for label/link/clustering controls
const SettingsPanel = styled.div`
  position: absolute;
  top: 60px;
  right: 16px;
  background: ${props => props.theme?.mode === 'light' 
    ? 'rgba(255, 255, 255, 0.98)' 
    : 'rgba(30, 41, 59, 0.95)'};
  backdrop-filter: blur(12px);
  border: 1px solid ${props => props.theme?.mode === 'light' ? '#e2e8f0' : '#475569'};
  border-radius: 12px;
  padding: 12px 14px;
  width: 280px;
  z-index: 10;
  box-shadow: ${props => props.theme?.mode === 'light' 
    ? '0 8px 32px rgba(0, 0, 0, 0.12)' 
    : '0 8px 32px rgba(0, 0, 0, 0.4)'};

  h4 { margin: 0 0 10px 0; font-size: 14px; }
  .row { display: flex; align-items: center; gap: 10px; margin: 8px 0; }
  .label { color: ${props => props.theme?.mode === 'light' ? '#1e293b' : '#f8fafc'}; font-size: 12px; width: 120px; }
  .val { color: ${props => props.theme?.mode === 'light' ? '#334155' : '#cbd5e1'}; font-size: 12px; width: 36px; text-align: right; }
  input[type="range"] { flex: 1; }
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
  gap: 8px;
  z-index: 10;
  
  button {
    background: ${props => props.theme?.mode === 'light' 
      ? 'rgba(255, 255, 255, 0.95)' 
      : 'rgba(30, 41, 59, 0.95)'};
    border: 1px solid ${props => props.theme?.mode === 'light' ? '#e2e8f0' : '#475569'};
    color: ${props => props.theme?.mode === 'light' ? '#334155' : '#cbd5e1'};
    backdrop-filter: blur(8px);
    transition: all 0.2s ease;
    
    &:hover {
      background: ${props => props.theme?.mode === 'light' 
        ? 'rgba(255, 255, 255, 1)' 
        : 'rgba(51, 65, 85, 0.95)'};
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }
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
  top: 60px;
  left: 16px;
  background: ${props => props.theme?.mode === 'light' 
    ? 'rgba(255, 255, 255, 0.98)' 
    : 'rgba(30, 41, 59, 0.95)'};
  backdrop-filter: blur(12px);
  border: 1px solid ${props => props.theme?.mode === 'light' ? '#e2e8f0' : '#475569'};
  border-radius: 12px;
  padding: 16px;
  max-width: 320px;
  z-index: 10;
  box-shadow: ${props => props.theme?.mode === 'light' 
    ? '0 8px 32px rgba(0, 0, 0, 0.12)' 
    : '0 8px 32px rgba(0, 0, 0, 0.4)'};
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
  background: ${props => props.theme?.mode === 'light' 
    ? 'rgba(255, 255, 255, 0.98)' 
    : 'rgba(15, 23, 42, 0.98)'};
  color: ${props => props.theme?.mode === 'light' ? '#1e293b' : '#f8fafc'};
  padding: 16px;
  border-radius: 12px;
  border: 1px solid ${props => props.theme?.mode === 'light' ? '#e2e8f0' : '#475569'};
  font-size: 13px;
  max-width: 320px;
  z-index: 1000;
  pointer-events: none;
  backdrop-filter: blur(12px);
  box-shadow: ${props => props.theme?.mode === 'light' 
    ? '0 12px 40px rgba(0, 0, 0, 0.15)' 
    : '0 12px 40px rgba(0, 0, 0, 0.5)'};
  
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
  background: ${props => props.theme?.mode === 'light' 
    ? 'rgba(255, 255, 255, 0.98)' 
    : 'rgba(30, 41, 59, 0.95)'};
  backdrop-filter: blur(12px);
  border: 1px solid ${props => props.theme?.mode === 'light' ? '#e2e8f0' : '#475569'};
  border-radius: 12px;
  padding: 16px;
  max-width: 240px;
  z-index: 10;
  box-shadow: ${props => props.theme?.mode === 'light' 
    ? '0 8px 32px rgba(0, 0, 0, 0.12)' 
    : '0 8px 32px rgba(0, 0, 0, 0.4)'};
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

// Comprehensive psychological domains with clinical depth
const PSYCHOLOGICAL_DOMAINS = {
  core_problem: {
    color: '#dc2626',
    lightColor: '#fca5a5',
    label: 'Problema Centrale',
    description: 'Nucleo del disagio psicologico',
    severity: 'high',
    priority: 1
  },
  environmental_triggers: {
    color: '#ea580c',  // Muted orange
    label: 'Trigger Ambientali',
    description: 'Fattori scatenanti esterni',
    severity: 'medium'
  },
  family_dynamics: {
    color: '#7c3aed',  // Muted purple
    label: 'Dinamiche Familiari',
    description: 'Relazioni e pattern familiari',
    severity: 'medium'
  },
  cognitive_patterns: {
    color: '#2563eb',  // Muted blue
    label: 'Pattern Cognitivi',
    description: 'Schemi di pensiero e credenze',
    severity: 'medium'
  },
  emotional_responses: {
    color: '#059669',  // Muted green
    label: 'Risposte Emotive',
    description: 'Reazioni emotive e affettive',
    severity: 'low'
  },
  behavioral_manifestations: {
    color: '#0891b2',  // Muted cyan
    label: 'Manifestazioni Comportamentali',
    description: 'Comportamenti osservabili',
    severity: 'medium'
  },
  defense_mechanisms: {
    color: '#be185d',  // Muted pink
    label: 'Meccanismi di Difesa',
    description: 'Strategie di protezione psicologica',
    severity: 'low'
  },
  developmental_factors: {
    color: '#65a30d',  // Muted lime
    label: 'Fattori Evolutivi',
    description: 'Influenze dello sviluppo',
    severity: 'low'
  },
  trauma_related: {
    color: '#991b1b',  // Dark red
    label: 'Trauma Correlati',
    description: 'Fattori traumatici e stress',
    severity: 'high'
  },
  relational_patterns: {
    color: '#6b21a8',  // Deep purple
    label: 'Pattern Relazionali',
    description: 'Modelli relazionali ricorrenti',
    severity: 'medium'
  }
};

const PsychologicalTreeGraph = ({ data, width = 900, height = 820, onNodeClick, theme = { mode: 'dark' } }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  
  // Enhanced state management
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, node: null });
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [showLegend, setShowLegend] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState('force'); // 'force', 'tree', 'radial'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeFilters, setActiveFilters] = useState(
    Object.keys(PSYCHOLOGICAL_DOMAINS).reduce((acc, key) => ({ ...acc, [key]: true }), {})
  );
  // New controls
  const [labelDensity, setLabelDensity] = useState(0.6); // 0..1 higher = più etichette
  const [topKLabels, setTopKLabels] = useState(8);
  const [hideMinorLinks, setHideMinorLinks] = useState(false);
  const [linkStrengthThreshold, setLinkStrengthThreshold] = useState(0.35);
  const [clusterByDomain, setClusterByDomain] = useState(true);
  
  // Professional color schemes
  const colorScheme = useMemo(() => ({
    background: theme.mode === 'light' ? '#ffffff' : '#0f172a',
    surface: theme.mode === 'light' ? '#f8fafc' : '#1e293b',
    border: theme.mode === 'light' ? '#e2e8f0' : '#334155',
    text: theme.mode === 'light' ? '#1e293b' : '#f8fafc',
    textMuted: theme.mode === 'light' ? '#64748b' : '#94a3b8',
    accent: '#4f46e5',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  }), [theme.mode]);

  // Use REAL data only; do not synthesize
  const enrichedData = useMemo(() => {
    if (!data) return { nodes: [], links: [] };

    if (data.psychologicalConnections) {
      return transformConnectionsToEnrichedNetwork(data.psychologicalConnections);
    }
    if (data.nodes && data.edges) {
      return transformToEnrichedNetwork(data);
    }
    return { nodes: [], links: [] };
  }, [data]);
  
  // Canvas size aware of fullscreen
  const effectiveWidth = isFullscreen && typeof window !== 'undefined' ? window.innerWidth : width;
  const effectiveHeight = isFullscreen && typeof window !== 'undefined' ? window.innerHeight : height;

  // Auto-collapse side panels in fullscreen
  useEffect(() => {
    if (isFullscreen) {
      setShowFilters(false);
      setShowLegend(false);
    }
  }, [isFullscreen]);

  // Helper: map domain to stable index for clustering
  const domainIndex = useCallback((domainKey) => {
    const keys = Object.keys(PSYCHOLOGICAL_DOMAINS);
    const idx = keys.indexOf(domainKey);
    return idx >= 0 ? idx : keys.indexOf('cognitive_patterns');
  }, []);

  // Create force simulation for professional 2D layout
  const simulation = useMemo(() => {
    if (!enrichedData) return null;
    
    return d3.forceSimulation(enrichedData.nodes)
      .force('link', d3.forceLink(enrichedData.links)
        .id(d => d.id)
        .distance(d => {
          // Dynamic link distance based on psychological relationship strength
          const baseDistance = 120; // more spacing
          const strengthMultiplier = (1 - (d.strength || 0.5)) * 80;
          const typeMultiplier = getConnectionTypeDistance(d.type);
          return baseDistance + strengthMultiplier + typeMultiplier;
        })
        .strength(d => (d.strength || 0.5) * 0.8)
      )
      .force('charge', d3.forceManyBody()
        .strength(d => {
          // Stronger repulsion for core nodes, weaker for peripheral
          const baseStrength = -450; // increase repulsion
          const significanceMultiplier = (d.significance || 0.5) * 250;
          return baseStrength - significanceMultiplier;
        })
      )
      .force('center', d3.forceCenter(effectiveWidth / 2, effectiveHeight / 2))
      .force('collision', d3.forceCollide()
        .radius(d => {
          const baseRadius = 30; // bigger collision radius to reduce overlap
          const sizeMultiplier = (d.significance || 0.5) * 18;
          return baseRadius + sizeMultiplier;
        })
        .strength(0.7)
      )
      .force('x', d3.forceX(d => {
        if (!clusterByDomain) return effectiveWidth / 2;
        const idx = domainIndex(d?.domain || 'cognitive_patterns');
        const cols = 3; // grid of cluster centers
        const row = Math.floor(idx / cols);
        const col = idx % cols;
        const hGap = effectiveWidth / (cols + 1);
        return hGap * (col + 1);
      }).strength(clusterByDomain ? 0.2 : 0.1))
      .force('y', d3.forceY(d => {
        if (!clusterByDomain) return effectiveHeight / 2;
        const idx = domainIndex(d?.domain || 'cognitive_patterns');
        const cols = 3;
        const row = Math.floor(idx / cols);
        const vGap = effectiveHeight / (Math.ceil(Object.keys(PSYCHOLOGICAL_DOMAINS).length / cols) + 1);
        return vGap * (row + 1);
      }).strength(clusterByDomain ? 0.2 : 0.1));
  }, [enrichedData, effectiveWidth, effectiveHeight, clusterByDomain]);

  // Filter data based on active filters
  const filteredData = useMemo(() => {
    if (!enrichedData) return null;
    
    const filteredNodes = enrichedData.nodes.filter(node => 
      activeFilters[node?.domain || 'cognitive_patterns'] !== false
    );
    
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    let filteredLinks = enrichedData.links.filter(link => 
      nodeIds.has(link.source.id || link.source) && 
      nodeIds.has(link.target.id || link.target)
    );
    if (hideMinorLinks) {
      filteredLinks = filteredLinks.filter(l => (l.strength ?? 0.5) >= linkStrengthThreshold);
    }
    
    return { nodes: filteredNodes, links: filteredLinks };
  }, [enrichedData, activeFilters, hideMinorLinks, linkStrengthThreshold]);

  // Compute Top-K labels by significance
  const topKLabelIds = useMemo(() => {
    if (!filteredData?.nodes) return new Set();
    const sorted = [...filteredData.nodes].sort((a,b) => (b.significance||0)-(a.significance||0));
    return new Set(sorted.slice(0, Math.max(0, topKLabels)).map(n => n.id));
  }, [filteredData, topKLabels]);

  // Utility for label visibility
  const isLabelVisible = useCallback((d) => {
    const sig = d?.significance ?? d?.data?.significance ?? 0.5;
    const base = 0.8; // stricter when low density
    const min = 0.35; // permissive when high density
    const threshold = base - (base - min) * labelDensity; // interpolate
    const zoomBoost = zoomLevel >= 1.2;
    const isTopK = topKLabelIds.has(d?.id || d?.data?.id);
    const isRoot = d?.depth === 0 || d?.data?.depth === 0;
    return isTopK || isRoot || zoomBoost || sig >= threshold;
  }, [labelDensity, zoomLevel, topKLabelIds]);

  useEffect(() => {
    if (!filteredData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    // Create main group with smooth transitions
    const g = svg.append("g").attr("class", "main-group");
    
    // Add professional gradient definitions
    const defs = svg.append("defs");
    
    // Create gradients for nodes
    Object.entries(PSYCHOLOGICAL_DOMAINS).forEach(([key, domain]) => {
      const gradient = defs.append("radialGradient")
        .attr("id", `gradient-${key}`)
        .attr("cx", "30%")
        .attr("cy", "30%");
      
      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", domain.lightColor || domain.color)
        .attr("stop-opacity", 0.9);
      
      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", domain.color)
        .attr("stop-opacity", 0.7);
    });
    
    // Add shadow filter
    const filter = defs.append("filter")
      .attr("id", "drop-shadow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    
    filter.append("feDropShadow")
      .attr("dx", 2)
      .attr("dy", 4)
      .attr("stdDeviation", 3)
      .attr("flood-color", theme.mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.3)');

    // Enhanced zoom with smooth transitions
    const zoom = d3.zoom()
      .scaleExtent([0.2, 5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom);

    // Professional link rendering with exceptional detail
    const linkGroup = g.append("g").attr("class", "links");
    
    const links = linkGroup.selectAll(".link")
      .data(filteredData.links)
      .enter().append("g")
      .attr("class", "link-group");
    
    // Add link background for better visibility
    links.append("path")
      .attr("class", "link-bg")
      .attr("stroke", colorScheme.surface)
      .attr("stroke-width", d => {
        const baseWidth = 3;
        const strengthWidth = (d.strength || 0.5) * 4;
        return baseWidth + strengthWidth;
      })
      .attr("fill", "none")
      .attr("opacity", 0.3);
    
    // Main links with psychological meaning
    const linkPaths = links.append("path")
      .attr("class", "link")
      .attr("stroke", d => getPsychologicalConnectionColor(d.type, theme.mode))
      .attr("stroke-width", d => {
        const baseWidth = 1.5;
        const strengthWidth = (d.strength || 0.5) * 3;
        const confidenceWidth = (d?.confidence || 0.7) * 2;
        return baseWidth + strengthWidth + confidenceWidth;
      })
      .attr("fill", "none")
      .attr("opacity", d => 0.6 + (d?.confidence || 0.7) * 0.3)
      .attr("stroke-dasharray", d => {
        // Different patterns for different psychological relationships
        switch(d.type) {
          case 'triggers': return "5,5";
          case 'reinforces': return "10,3";
          case 'conflicts': return "3,3,10,3";
          case 'supports': return null;
          default: return "8,4";
        }
      });
    
    // Add directional arrows
    defs.selectAll(".arrow")
      .data(Object.keys(PSYCHOLOGICAL_DOMAINS))
      .enter().append("marker")
      .attr("id", d => `arrow-${d}`)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 8)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", d => PSYCHOLOGICAL_DOMAINS[d]?.color || colorScheme.textMuted);
    
    linkPaths.attr("marker-end", d => {
      const sourceNode = filteredData.nodes.find(n => n.id === (d.source.id || d.source));
      return `url(#arrow-${sourceNode?.domain || 'core_problem'})`;
    });

    // Professional node rendering with exceptional detail
    const nodeGroup = g.append("g").attr("class", "nodes");
    
    const nodes = nodeGroup.selectAll(".node")
      .data(filteredData.nodes)
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x || 0},${d.y || 0})`)
      .style("cursor", "pointer");
    
    // Add node glow effect for important nodes
    nodes.filter(d => d && d.significance && d.significance > 0.8)
      .append("circle")
      .attr("class", "node-glow")
      .attr("r", d => getNodeRadius(d) + 8)
      .attr("fill", d => PSYCHOLOGICAL_DOMAINS[d?.domain || 'cognitive_patterns']?.color || colorScheme.accent)
      .attr("opacity", 0.2)
      .attr("filter", "url(#drop-shadow)");
    
    // Main node circles with gradients
    nodes.append("circle")
      .attr("class", "node-main")
      .attr("r", getNodeRadius)
      .attr("fill", d => `url(#gradient-${d?.domain || 'cognitive_patterns'})`)
      .attr("stroke", d => {
        if (d.severity === 'high') return colorScheme.error;
        if (d.severity === 'medium') return colorScheme.warning;
        return PSYCHOLOGICAL_DOMAINS[d?.domain || 'cognitive_patterns']?.color || colorScheme.accent;
      })
      .attr("stroke-width", d => {
        const baseWidth = 2;
        const significanceWidth = (d.significance || 0.5) * 2;
        return baseWidth + significanceWidth;
      })
      .attr("filter", "url(#drop-shadow)")
      .style("transition", "all 0.3s ease");
    
    // Add inner detail circles for clinical relevance
    nodes.filter(d => d && d.clinicalRelevance && d.clinicalRelevance > 0.7)
      .append("circle")
      .attr("class", "node-inner")
      .attr("r", d => getNodeRadius(d) * 0.4)
      .attr("fill", colorScheme.background)
      .attr("stroke", d => PSYCHOLOGICAL_DOMAINS[d?.domain || 'cognitive_patterns']?.color || colorScheme.accent)
      .attr("stroke-width", 1)
      .attr("opacity", 0.8);
    
    // Professional node labels with intelligent positioning
    nodes.append("text")
      .attr("class", "node-label")
      .attr("text-anchor", "middle")
      .attr("dy", d => getNodeRadius(d) + 20)
      .text(d => {
        // Build robust label to avoid 'Unknown'
        const fromId = (d?.id || '').toString().replace(/_/g, ' ');
        const fallbackFromId = fromId ? fromId.charAt(0).toUpperCase() + fromId.slice(1) : '';
        let label = d?.name || d?.label || fallbackFromId || (d?.description ? d.description.slice(0, 20) : '') || 'Unknown';
        if (d?.fromProfile) label += " ᴾ";
        if (label.length > 20) label = label.substring(0, 17) + "...";
        return label;
      })
      .attr("font-size", d => {
        const baseSize = 11;
        const significanceBonus = (d.significance || 0.5) * 3;
        const zoomAdjustment = Math.max(0.8, Math.min(1.2, zoomLevel));
        return (baseSize + significanceBonus) * zoomAdjustment + "px";
      })
      // Visibility based on density/zoom/topK
      .style("opacity", d => isLabelVisible(d) ? 1 : 0)
      .attr("font-weight", d => {
        if (!d || !d.significance) return "400";
        if (d.significance > 0.8) return "600";
        if (d.significance > 0.6) return "500";
        return "400";
      })
      .attr("fill", colorScheme.text)
      // Outline to improve readability over dark backgrounds
      .attr("stroke", theme.mode === 'light' ? "#ffffff" : "#0f172a")
      .attr("stroke-width", 3)
      .attr("paint-order", "stroke fill");

    // Update positions with smooth animation
    function updatePositions() {
      linkPaths
        .attr("d", d => {
          const source = d.source;
          const target = d.target;
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dr = Math.sqrt(dx * dx + dy * dy) * 0.3;
          return `M${source.x},${source.y}A${dr},${dr} 0 0,1 ${target.x},${target.y}`;
        });
      
      nodes
        .attr("transform", d => `translate(${d.x},${d.y})`);
    }
    
    // Start simulation if available
    if (simulation) {
      simulation.nodes(filteredData.nodes);
      simulation.force("link").links(filteredData.links);
      simulation.on("tick", updatePositions);
      simulation.restart();
    }

    // Enhanced interactivity with professional polish
    nodes
      .on("mouseenter", function(event, d) {
        setHoveredNode(d);
        
        // Highlight connected nodes and links
        const connectedNodeIds = new Set();
        filteredData.links.forEach(link => {
          if (link.source.id === d.id || link.source === d.id) {
            connectedNodeIds.add(link.target.id || link.target);
          }
          if (link.target.id === d.id || link.target === d.id) {
            connectedNodeIds.add(link.source.id || link.source);
          }
        });
        
        // Fade non-connected elements
        nodes.style("opacity", node => 
          node.id === d.id || connectedNodeIds.has(node.id) ? 1 : 0.3
        );
        
        linkPaths.style("opacity", link => {
          const sourceId = link.source.id || link.source;
          const targetId = link.target.id || link.target;
          return (sourceId === d.id || targetId === d.id) ? 0.9 : 0.1;
        });
        
        // Show enhanced tooltip
        setTooltip({
          visible: true,
          x: event.pageX + 10,
          y: event.pageY - 10,
          node: d
        });
      })
      .on("mouseleave", function() {
        setHoveredNode(null);
        
        // Restore opacity
        nodes.style("opacity", 1);
        linkPaths.style("opacity", d => 0.6 + (d?.confidence || 0.7) * 0.3);
        
        setTooltip({ visible: false, x: 0, y: 0, node: null });
      })
      .on("click", function(event, d) {
        event.stopPropagation();
        setSelectedNode(selectedNode?.id === d.id ? null : d);
        onNodeClick?.(d);
      })
      .on("dblclick", function(event, d) {
        event.stopPropagation();
        // Center view on node
        const transform = d3.zoomTransform(svg.node());
        const x = -d.x * transform.k + effectiveWidth / 2;
        const y = -d.y * transform.k + effectiveHeight / 2;
        
        svg.transition()
          .duration(750)
          .call(zoom.transform, d3.zoomIdentity.translate(x, y).scale(transform.k));
      });

    // Add background grid for professional appearance
    const gridSize = 50;
    const gridGroup = g.insert("g", ":first-child").attr("class", "grid");
    
    for (let x = 0; x < effectiveWidth; x += gridSize) {
      gridGroup.append("line")
        .attr("x1", x)
        .attr("y1", 0)
        .attr("x2", x)
        .attr("y2", effectiveHeight)
        .attr("stroke", colorScheme.border)
        .attr("stroke-width", 0.5)
        .attr("opacity", 0.1);
    }
    
    for (let y = 0; y < effectiveHeight; y += gridSize) {
      gridGroup.append("line")
        .attr("x1", 0)
        .attr("y1", y)
        .attr("x2", effectiveWidth)
        .attr("y2", y)
        .attr("stroke", colorScheme.border)
        .attr("stroke-width", 0.5)
        .attr("opacity", 0.1);
    }

    // Note: Removed duplicate radial/tree-specific rendering and interactions
    // to keep the force layout clean and avoid lint/runtime issues.

    // Cleanup function
    return () => {
      if (simulation) {
        simulation.stop();
      }
    };

  }, [filteredData, effectiveWidth, effectiveHeight, onNodeClick, simulation, colorScheme, theme.mode, zoomLevel]);

  // Helper functions for professional 2D network generation
  function generateDefaultPsychologicalNetwork() {
    const nodes = [
      { id: 'ansia_generalizzata', name: 'Ansia Generalizzata', domain: 'core_problem', significance: 0.95, severity: 'high', clinicalRelevance: 0.9 },
      { id: 'preoccupazioni_eccessive', name: 'Preoccupazioni Eccessive', domain: 'cognitive_patterns', significance: 0.85, severity: 'high', clinicalRelevance: 0.8 },
      { id: 'tensione_muscolare', name: 'Tensione Muscolare', domain: 'behavioral_manifestations', significance: 0.75, severity: 'medium', clinicalRelevance: 0.7 },
      { id: 'disturbi_sonno', name: 'Disturbi del Sonno', domain: 'behavioral_manifestations', significance: 0.8, severity: 'medium', clinicalRelevance: 0.75 },
      { id: 'irritabilita', name: 'Irritabilità', domain: 'emotional_responses', significance: 0.7, severity: 'medium', clinicalRelevance: 0.65 },
      { id: 'difficolta_concentrazione', name: 'Difficoltà di Concentrazione', domain: 'cognitive_patterns', significance: 0.8, severity: 'medium', clinicalRelevance: 0.7 },
      { id: 'evitamento_sociale', name: 'Evitamento Sociale', domain: 'behavioral_manifestations', significance: 0.75, severity: 'medium', clinicalRelevance: 0.7 },
      { id: 'pensieri_catastrofici', name: 'Pensieri Catastrofici', domain: 'cognitive_patterns', significance: 0.85, severity: 'high', clinicalRelevance: 0.8 },
      { id: 'palpitazioni', name: 'Palpitazioni', domain: 'behavioral_manifestations', significance: 0.7, severity: 'medium', clinicalRelevance: 0.6 },
      { id: 'sudorazione', name: 'Sudorazione Eccessiva', domain: 'behavioral_manifestations', significance: 0.65, severity: 'low', clinicalRelevance: 0.55 },
      { id: 'perfezionismo', name: 'Perfezionismo', domain: 'cognitive_patterns', significance: 0.8, severity: 'medium', clinicalRelevance: 0.75 },
      { id: 'controllo_eccessivo', name: 'Bisogno di Controllo', domain: 'cognitive_patterns', significance: 0.75, severity: 'medium', clinicalRelevance: 0.7 },
      { id: 'bassa_autostima', name: 'Bassa Autostima', domain: 'emotional_responses', significance: 0.8, severity: 'medium', clinicalRelevance: 0.75 },
      { id: 'paura_giudizio', name: 'Paura del Giudizio', domain: 'emotional_responses', significance: 0.75, severity: 'medium', clinicalRelevance: 0.7 },
      { id: 'stress_lavorativo', name: 'Stress Lavorativo', domain: 'environmental_triggers', significance: 0.7, severity: 'medium', clinicalRelevance: 0.65 },
      { id: 'conflitti_familiari', name: 'Conflitti Familiari', domain: 'family_dynamics', significance: 0.75, severity: 'medium', clinicalRelevance: 0.7 },
      { id: 'isolamento_emotivo', name: 'Isolamento Emotivo', domain: 'relational_patterns', significance: 0.7, severity: 'medium', clinicalRelevance: 0.65 },
      { id: 'rimuginio', name: 'Rimuginio Mentale', domain: 'cognitive_patterns', significance: 0.85, severity: 'high', clinicalRelevance: 0.8 },
      { id: 'ipervigilanza', name: 'Ipervigilanza', domain: 'behavioral_manifestations', significance: 0.75, severity: 'medium', clinicalRelevance: 0.7 },
      { id: 'fatica_cronica', name: 'Fatica Cronica', domain: 'behavioral_manifestations', significance: 0.7, severity: 'medium', clinicalRelevance: 0.65 },
      { id: 'attacchi_panico', name: 'Attacchi di Panico', domain: 'core_problem', significance: 0.9, severity: 'high', clinicalRelevance: 0.85 },
      { id: 'agorafobia', name: 'Agorafobia', domain: 'behavioral_manifestations', significance: 0.8, severity: 'high', clinicalRelevance: 0.75 },
      { id: 'depersonalizzazione', name: 'Depersonalizzazione', domain: 'emotional_responses', significance: 0.75, severity: 'medium', clinicalRelevance: 0.7 },
      { id: 'ipocondria', name: 'Preoccupazioni Ipocondriache', domain: 'cognitive_patterns', significance: 0.7, severity: 'medium', clinicalRelevance: 0.65 }
    ];
    
    const links = [
      { source: 'ansia_generalizzata', target: 'preoccupazioni_eccessive', type: 'triggers', strength: 0.9, confidence: 0.95 },
      { source: 'preoccupazioni_eccessive', target: 'tensione_muscolare', type: 'causes', strength: 0.8, confidence: 0.85 },
      { source: 'ansia_generalizzata', target: 'disturbi_sonno', type: 'causes', strength: 0.85, confidence: 0.9 },
      { source: 'preoccupazioni_eccessive', target: 'difficolta_concentrazione', type: 'impairs', strength: 0.8, confidence: 0.85 },
      { source: 'ansia_generalizzata', target: 'irritabilita', type: 'manifests_as', strength: 0.75, confidence: 0.8 },
      { source: 'pensieri_catastrofici', target: 'preoccupazioni_eccessive', type: 'reinforces', strength: 0.9, confidence: 0.9 },
      { source: 'ansia_generalizzata', target: 'evitamento_sociale', type: 'leads_to', strength: 0.7, confidence: 0.8 },
      { source: 'ansia_generalizzata', target: 'palpitazioni', type: 'causes', strength: 0.75, confidence: 0.8 },
      { source: 'tensione_muscolare', target: 'fatica_cronica', type: 'contributes_to', strength: 0.7, confidence: 0.75 },
      { source: 'perfezionismo', target: 'ansia_generalizzata', type: 'triggers', strength: 0.8, confidence: 0.85 },
      { source: 'controllo_eccessivo', target: 'ansia_generalizzata', type: 'maintains', strength: 0.75, confidence: 0.8 },
      { source: 'bassa_autostima', target: 'paura_giudizio', type: 'causes', strength: 0.85, confidence: 0.9 },
      { source: 'paura_giudizio', target: 'evitamento_sociale', type: 'leads_to', strength: 0.8, confidence: 0.85 },
      { source: 'stress_lavorativo', target: 'ansia_generalizzata', type: 'triggers', strength: 0.75, confidence: 0.8 },
      { source: 'conflitti_familiari', target: 'ansia_generalizzata', type: 'exacerbates', strength: 0.7, confidence: 0.75 },
      { source: 'rimuginio', target: 'disturbi_sonno', type: 'causes', strength: 0.85, confidence: 0.9 },
      { source: 'ipervigilanza', target: 'fatica_cronica', type: 'leads_to', strength: 0.8, confidence: 0.85 },
      { source: 'attacchi_panico', target: 'agorafobia', type: 'develops_into', strength: 0.85, confidence: 0.9 },
      { source: 'ansia_generalizzata', target: 'attacchi_panico', type: 'escalates_to', strength: 0.8, confidence: 0.85 },
      { source: 'agorafobia', target: 'isolamento_emotivo', type: 'results_in', strength: 0.8, confidence: 0.85 },
      { source: 'ipocondria', target: 'ansia_generalizzata', type: 'feeds_into', strength: 0.75, confidence: 0.8 },
      { source: 'depersonalizzazione', target: 'ansia_generalizzata', type: 'symptom_of', strength: 0.7, confidence: 0.75 }
    ];
    
    return { nodes, links };
  }
  
  // removed stray, malformed code block

function transformToEnrichedNetwork(data) {
  const rawNodes = Array.isArray(data?.nodes) ? data.nodes : [];
  const rawEdges = Array.isArray(data?.edges) ? data.edges : [];
  const idToNode = new Map();

  const nodes = rawNodes.map(n => {
    const id = n.id || n.name || n.label;
    const labelFromId = (id || '').toString().replace(/_/g, ' ');
    const name = n.name || n.label || (labelFromId ? labelFromId.charAt(0).toUpperCase() + labelFromId.slice(1) : undefined);
    const domain = n.domain || classifyNodeDomain({ id, name });
    const significance = typeof n.significance === 'number' ? n.significance : (typeof n.weight === 'number' ? n.weight : 0.5);
    const clinicalRelevance = typeof n.clinicalRelevance === 'number' ? n.clinicalRelevance : (typeof n.confidence === 'number' ? n.confidence : 0.6);
    const out = {
      id,
      name,
      domain,
      significance,
      clinicalRelevance,
      severity: n.severity || PSYCHOLOGICAL_DOMAINS[domain]?.severity || 'medium',
      description: n.description,
      fromProfile: !!n.fromProfile
    };
    idToNode.set(id, out);
    return out;
  });

  const links = rawEdges.map(e => {
    const src = typeof e.source === 'object' ? (e.source.id || e.source.name || e.source.label) : e.source;
    const tgt = typeof e.target === 'object' ? (e.target.id || e.target.name || e.target.label) : e.target;
    return {
      source: src,
      target: tgt,
      type: e.type || 'relates',
      strength: typeof e.strength === 'number' ? e.strength : (typeof e.weight === 'number' ? e.weight : 0.5),
      confidence: typeof e.confidence === 'number' ? e.confidence : 0.7
    };
  }).filter(l => idToNode.has(l.source) && idToNode.has(l.target));

  return { nodes, links };
}

  // Final render
  return (
    <TreeContainer ref={containerRef} height={height} fullscreen={isFullscreen} theme={theme}>
      <SVGContainer ref={svgRef} />
      {tooltip.visible && tooltip.node && (
        <NodeTooltip style={{ left: tooltip.x, top: tooltip.y }} theme={theme}>
          <div className="node-title">{tooltip.node.name || tooltip.node.label || String(tooltip.node.id || '')}</div>
          <div className="node-type">{tooltip.node.domain || 'N/A'}</div>
          {tooltip.node.description && (
            <div className="node-description">{tooltip.node.description}</div>
          )}
        </NodeTooltip>
      )}
    </TreeContainer>
  );
};

export default PsychologicalTreeGraph;
