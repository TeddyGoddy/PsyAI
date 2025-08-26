import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import * as THREE from 'three';
import { FiRotateCw, FiZoomIn, FiZoomOut, FiMaximize2 } from 'react-icons/fi';

const NetworkContainer = styled.div`
  position: relative;
  width: 100%;
  height: ${props => props.height || '500px'};
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border: 1px solid #334155;
`;

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
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
  background: rgba(0, 0, 0, 0.3);
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
`;

const NodeInfo = styled.div`
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 16px;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transform: translateY(${props => props.visible ? '0' : '100%'});
  transition: transform 0.3s ease;
`;

const NodeTitle = styled.h4`
  margin: 0 0 8px 0;
  color: #4f46e5;
  font-size: 16px;
  font-weight: 600;
`;

const NodeDescription = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.8);
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  opacity: ${props => props.visible ? 1 : 0};
  pointer-events: ${props => props.visible ? 'all' : 'none'};
  transition: opacity 0.3s ease;
`;

const Advanced3DNetwork = ({ data, width = 800, height = 500, onNodeClick }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const nodesRef = useRef([]);
  const edgesRef = useRef([]);
  const animationIdRef = useRef(null);
  
  const [selectedNode, setSelectedNode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRotating, setIsRotating] = useState(false);

  // Node type colors and sizes
  const getNodeConfig = (type) => {
    const configs = {
      emotion: { color: 0xff6b6b, size: 1.2, glow: 0xff9999 },
      trigger: { color: 0xff8c42, size: 1.0, glow: 0xffb366 },
      pattern: { color: 0x4ecdc4, size: 1.1, glow: 0x7dd3db },
      defense: { color: 0x45b7d1, size: 0.9, glow: 0x6bc5e0 },
      attachment: { color: 0x96ceb4, size: 1.3, glow: 0xb8dcc6 },
      cognitive: { color: 0xfeca57, size: 1.0, glow: 0xffd93d },
      interpersonal: { color: 0xff9ff3, size: 1.1, glow: 0xffb3f7 },
      developmental: { color: 0x54a0ff, size: 1.2, glow: 0x74b9ff }
    };
    return configs[type] || { color: 0x888888, size: 1.0, glow: 0xaaaaaa };
  };

  useEffect(() => {
    if (!data || !mountRef.current) return;

    initializeScene();
    createNetwork();
    animate();
    
    setTimeout(() => setIsLoading(false), 1000);

    return () => {
      cleanup();
    };
  }, [data]);

  const initializeScene = () => {
    // Scene
    sceneRef.current = new THREE.Scene();
    sceneRef.current.background = new THREE.Color(0x0f172a);

    // Camera
    cameraRef.current = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    );
    cameraRef.current.position.set(0, 0, 20);

    // Renderer
    rendererRef.current = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    rendererRef.current.setSize(width, height);
    rendererRef.current.shadowMap.enabled = true;
    rendererRef.current.shadowMap.type = THREE.PCFSoftShadowMap;
    
    mountRef.current.appendChild(rendererRef.current.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    sceneRef.current.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    sceneRef.current.add(directionalLight);

    // Point lights for glow effect
    const pointLight1 = new THREE.PointLight(0x4f46e5, 1, 50);
    pointLight1.position.set(10, 10, 10);
    sceneRef.current.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x7c3aed, 0.8, 50);
    pointLight2.position.set(-10, -10, 10);
    sceneRef.current.add(pointLight2);

    // Mouse controls
    addMouseControls();
  };

  const createNetwork = () => {
    if (!data.nodes || !data.edges) return;

    const nodePositions = {};
    nodesRef.current = [];
    edgesRef.current = [];

    // Create nodes
    data.nodes.forEach((node, index) => {
      const config = getNodeConfig(node.type);
      
      // Position nodes in 3D space
      const angle = (index / data.nodes.length) * Math.PI * 2;
      const radius = Math.min(data.nodes.length * 0.8, 12);
      const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 4;
      const y = Math.sin(angle) * radius + (Math.random() - 0.5) * 4;
      const z = (Math.random() - 0.5) * 8;

      nodePositions[node.id] = { x, y, z };

      // Create node geometry
      const geometry = new THREE.SphereGeometry(config.size, 32, 32);
      const material = new THREE.MeshPhongMaterial({ 
        color: config.color,
        shininess: 100,
        transparent: true,
        opacity: 0.9
      });
      
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(x, y, z);
      sphere.castShadow = true;
      sphere.receiveShadow = true;
      sphere.userData = { ...node, originalColor: config.color };

      // Add glow effect
      const glowGeometry = new THREE.SphereGeometry(config.size * 1.5, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: config.glow,
        transparent: true,
        opacity: 0.2
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.copy(sphere.position);
      
      sceneRef.current.add(sphere);
      sceneRef.current.add(glow);
      nodesRef.current.push({ mesh: sphere, glow, data: node });

      // Add text label
      createTextLabel(node.id, x, y + config.size + 1, z);
    });

    // Create edges
    data.edges.forEach(edge => {
      const sourcePos = nodePositions[edge.source];
      const targetPos = nodePositions[edge.target];
      
      if (sourcePos && targetPos) {
        createEdge(sourcePos, targetPos, edge);
      }
    });
  };

  const createEdge = (sourcePos, targetPos, edgeData) => {
    const points = [
      new THREE.Vector3(sourcePos.x, sourcePos.y, sourcePos.z),
      new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z)
    ];

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    // Edge color based on type
    const edgeColors = {
      triggers: 0xff6b6b,
      reinforces: 0x4ecdc4,
      relates: 0x45b7d1,
      defends: 0x96ceb4,
      compensates: 0xfeca57
    };
    
    const material = new THREE.LineBasicMaterial({ 
      color: edgeColors[edgeData.type] || 0x888888,
      transparent: true,
      opacity: 0.6,
      linewidth: edgeData.weight * 3 || 1
    });

    const line = new THREE.Line(geometry, material);
    sceneRef.current.add(line);
    edgesRef.current.push({ mesh: line, data: edgeData });
  };

  const createTextLabel = (text, x, y, z) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    
    context.fillStyle = '#ffffff';
    context.font = '20px Arial';
    context.textAlign = 'center';
    context.fillText(text, 128, 40);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    
    sprite.position.set(x, y, z);
    sprite.scale.set(4, 1, 1);
    sceneRef.current.add(sprite);
  };

  const addMouseControls = () => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event) => {
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current);
      
      const nodeObjects = nodesRef.current.map(n => n.mesh);
      const intersects = raycaster.intersectObjects(nodeObjects);

      if (intersects.length > 0) {
        const clickedNode = intersects[0].object.userData;
        setSelectedNode(clickedNode);
        onNodeClick?.(clickedNode);
        
        // Highlight effect
        highlightNode(intersects[0].object);
      } else {
        setSelectedNode(null);
        resetHighlights();
      }
    };

    rendererRef.current.domElement.addEventListener('click', onMouseClick);
  };

  const highlightNode = (nodeMesh) => {
    // Reset all nodes
    resetHighlights();
    
    // Highlight selected node
    nodeMesh.material.emissive.setHex(0x444444);
    nodeMesh.scale.set(1.3, 1.3, 1.3);
  };

  const resetHighlights = () => {
    nodesRef.current.forEach(({ mesh }) => {
      mesh.material.emissive.setHex(0x000000);
      mesh.scale.set(1, 1, 1);
    });
  };

  const animate = () => {
    animationIdRef.current = requestAnimationFrame(animate);

    if (isRotating && sceneRef.current) {
      sceneRef.current.rotation.y += 0.005;
    }

    // Animate node pulsing
    nodesRef.current.forEach(({ mesh, glow }, index) => {
      const time = Date.now() * 0.001;
      const pulse = Math.sin(time + index * 0.5) * 0.1 + 1;
      glow.scale.setScalar(pulse);
    });

    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  const cleanup = () => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }
    
    if (rendererRef.current && mountRef.current) {
      mountRef.current.removeChild(rendererRef.current.domElement);
      rendererRef.current.dispose();
    }
  };

  const handleRotateToggle = () => {
    setIsRotating(!isRotating);
  };

  const handleZoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(0.8);
    }
  };

  const handleZoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(1.2);
    }
  };

  const handleReset = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0, 20);
      cameraRef.current.lookAt(0, 0, 0);
    }
    setSelectedNode(null);
    resetHighlights();
  };

  return (
    <NetworkContainer height={height}>
      <CanvasContainer ref={mountRef} />
      
      <ControlPanel>
        <ControlButton onClick={handleRotateToggle} title="Auto Rotate">
          <FiRotateCw />
        </ControlButton>
        <ControlButton onClick={handleZoomIn} title="Zoom In">
          <FiZoomIn />
        </ControlButton>
        <ControlButton onClick={handleZoomOut} title="Zoom Out">
          <FiZoomOut />
        </ControlButton>
        <ControlButton onClick={handleReset} title="Reset View">
          <FiMaximize2 />
        </ControlButton>
      </ControlPanel>

      <NodeInfo visible={selectedNode}>
        {selectedNode && (
          <>
            <NodeTitle>{selectedNode.id}</NodeTitle>
            <NodeDescription>
              <strong>Tipo:</strong> {selectedNode.type}<br/>
              <strong>Categoria:</strong> {selectedNode.category}<br/>
              <strong>Peso:</strong> {selectedNode.weight}<br/>
              {selectedNode.description && (
                <>
                  <strong>Descrizione:</strong> {selectedNode.description}
                </>
              )}
            </NodeDescription>
          </>
        )}
      </NodeInfo>

      <LoadingOverlay visible={isLoading}>
        Generazione network 3D...
      </LoadingOverlay>
    </NetworkContainer>
  );
};

export default Advanced3DNetwork;
