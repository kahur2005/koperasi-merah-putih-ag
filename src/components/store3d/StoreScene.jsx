import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useGameStore } from '../../store/gameStore';
import StoreFloor from './StoreFloor';
import Furniture from './Furniture';
import TokoFurnitur from './TokoFurnitur';
import PasarPasokan from '../hud/PasarPasokan';
import { clampStorePosition, isWallFurniture } from '../../utils/storeBounds.js';

export default function StoreScene() {
  const furniturePositions = useGameStore((s) => s.furniturePositions);
  const placementMode = useGameStore((s) => s.placementMode);
  const confirmPlacement = useGameStore((s) => s.confirmPlacement);
  const activeModal = useGameStore((s) => s.activeModal);
  const cancelPlacement = useGameStore((s) => s.cancelPlacement);
  const moveFurniture = useGameStore((s) => s.moveFurniture);
  const rotateFurniture = useGameStore((s) => s.rotateFurniture);
  const deleteFurniture = useGameStore((s) => s.deleteFurniture);
  const setFurniturePosition = useGameStore((s) => s.setFurniturePosition);

  const storeSize = useGameStore((s) => s.storeSize);
  const updatePlacement = useGameStore((s) => s.updatePlacement);

  const [selectedId, setSelectedId] = useState(null);
  const [ghostPlacement, setGhostPlacement] = useState({ x: 50, y: 50, rot: 0 });

  const handleFurnitureClick = (id) => {
    if (placementMode) return;
    setSelectedId(id);
  };

  const getSnappedPosition = (point, type = placementMode?.type) => {
    let xWorld = point.x;
    let zWorld = point.z;
    
    if (isWallFurniture(type)) {
      const width = storeSize === 'large' ? 20 : 10;
      const depth = storeSize === 'large' ? 30 : 15;
      
      const dBack = Math.abs(zWorld - (-depth / 2));
      const dFront = Math.abs(zWorld - (depth / 2));
      const dLeft = Math.abs(xWorld - (-width / 2));
      const dRight = Math.abs(xWorld - (width / 2));
      
      const minD = Math.min(dBack, dFront, dLeft, dRight);
      
      let rot = 0;
      if (minD === dBack) {
        zWorld = -depth / 2 + 0.1;
        rot = 0;
      } else if (minD === dFront) {
        zWorld = depth / 2 - 0.1;
        rot = 180;
      } else if (minD === dLeft) {
        xWorld = -width / 2 + 0.1;
        rot = 90;
      } else if (minD === dRight) {
        xWorld = width / 2 - 0.1;
        rot = -90;
        // Avoid door area on right wall
        if (zWorld > -3 && zWorld < 3) {
          zWorld = zWorld > 0 ? 3 : -3;
        }
      }
      const clamped = clampStorePosition({
        x: Math.round(xWorld * 10 + 50), 
        y: Math.round(zWorld * 10 + 50),
      }, storeSize, type);
      return {
        ...clamped,
        rot
      };
    }
    
    return clampStorePosition({
      x: Math.round(xWorld * 10 + 50),
      y: Math.round(zWorld * 10 + 50)
    }, storeSize, type);
  };

  const confirmGhostPlacement = () => {
    if (!placementMode) return;
    if (isWallFurniture(placementMode.type) && placementMode.rotation !== ghostPlacement.rot) {
      updatePlacement({ rotation: ghostPlacement.rot });
    }
    confirmPlacement(ghostPlacement.x, ghostPlacement.y);
  };

  const moveSelectedToPoint = (point) => {
    const selectedItem = furniturePositions.find((f) => f.id === selectedId);
    if (!selectedItem) return;

    const snapped = getSnappedPosition(point, selectedItem.type);
    setFurniturePosition(selectedItem.id, snapped.x, snapped.y, snapped.rot);
  };

  const handleFloorPointerMove = (e) => {
    if (!placementMode) return;
    const snapped = getSnappedPosition(e.point);
    setGhostPlacement({ x: snapped.x, y: snapped.y, rot: snapped.rot || 0 });
    if (isWallFurniture(placementMode.type) && placementMode.rotation !== snapped.rot) {
      updatePlacement({ rotation: snapped.rot });
    }
  };

  const handleFloorClick = (e) => {
    e.stopPropagation();
    if (placementMode) {
      confirmGhostPlacement();
      return;
    }
    if (selectedId) {
      moveSelectedToPoint(e.point);
      return;
    }
    setSelectedId(null);
  };

  const handleFloorDoubleClick = (e) => {
    if (placementMode) {
      e.stopPropagation();
      confirmGhostPlacement();
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return;
      if (activeModal) return;

      const key = event.key.toLowerCase();
      const moveStep = event.shiftKey ? 10 : 5;

      if (placementMode) {
        if (key === 'escape') {
          event.preventDefault();
          cancelPlacement();
        } else if (key === 'r') {
          event.preventDefault();
          updatePlacement({ rotation: (placementMode.rotation + 90) % 360 });
        }
        return;
      }

      if (!selectedId) return;

      if (key === 'escape') {
        event.preventDefault();
        setSelectedId(null);
      } else if (key === 'r') {
        event.preventDefault();
        rotateFurniture(selectedId);
      } else if (key === 'delete' || key === 'backspace') {
        event.preventDefault();
        deleteFurniture(selectedId);
        setSelectedId(null);
      } else if (key === 'arrowup' || key === 'w') {
        event.preventDefault();
        moveFurniture(selectedId, 0, -moveStep);
      } else if (key === 'arrowdown' || key === 's') {
        event.preventDefault();
        moveFurniture(selectedId, 0, moveStep);
      } else if (key === 'arrowleft' || key === 'a') {
        event.preventDefault();
        moveFurniture(selectedId, -moveStep, 0);
      } else if (key === 'arrowright' || key === 'd') {
        event.preventDefault();
        moveFurniture(selectedId, moveStep, 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    cancelPlacement,
    activeModal,
    deleteFurniture,
    moveFurniture,
    placementMode,
    rotateFurniture,
    selectedId,
    updatePlacement,
  ]);

  return (
    <div className="three-container" style={{ width: '100vw', height: '100vh', display: 'flex' }}>
      {/* 3D Canvas */}
      <div style={{ flex: 1, height: '100%' }}>
        <Canvas 
          camera={{ position: [10, 12, 14], fov: 45 }}
          shadows
          onDoubleClick={handleFloorDoubleClick}
        >
          <color attach="background" args={['#fdd798']} />
          
          {/* Lighting */}
          <ambientLight intensity={0.75} />
          <directionalLight 
            position={[8, 12, 5]} 
            intensity={1.35} 
            castShadow 
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-8, 6, -5]} intensity={0.5} />

          {/* Controls */}
          <OrbitControls 
            enableDamping
            dampingFactor={0.05}
            maxPolarAngle={Math.PI / 2.1} // Prevent going under floor
            minDistance={5}
            maxDistance={40}
          />

          {/* Floor & walls */}
          <StoreFloor 
            onPointerMove={handleFloorPointerMove}
            onClick={handleFloorClick}
            onDoubleClick={handleFloorDoubleClick}
          />

          {/* Placement Ghost */}
          {placementMode && (
            <Furniture 
              id="ghost"
              type={placementMode.type}
              x={ghostPlacement.x}
              y={ghostPlacement.y}
              rotation={isWallFurniture(placementMode.type) ? ghostPlacement.rot : placementMode.rotation}
              color={placementMode.color}
              isGhost={true}
              onClick={() => {}}
            />
          )}

          {/* Furniture items */}
          {furniturePositions.map((f) => (
            <Furniture 
              key={f.id} 
              id={f.id}
              type={f.type}
              x={f.x}
              y={f.y}
              rotation={f.rotation}
              color={f.color}
              isSelected={selectedId === f.id}
              onClick={handleFurnitureClick}
            />
          ))}
        </Canvas>
      </div>

      {/* HTML overlay sidebar */}
      <TokoFurnitur selectedId={selectedId} setSelectedId={setSelectedId} />
      {activeModal === 'pasar' && <PasarPasokan />}
    </div>
  );
}
