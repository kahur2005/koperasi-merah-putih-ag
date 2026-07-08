import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useGameStore } from '../../store/gameStore';
import StoreFloor from './StoreFloor';
import Furniture from './Furniture';
import TokoFurnitur from './TokoFurnitur';

export default function StoreScene() {
  const furniturePositions = useGameStore((s) => s.furniturePositions);
  const placementMode = useGameStore((s) => s.placementMode);
  const confirmPlacement = useGameStore((s) => s.confirmPlacement);

  const storeSize = useGameStore((s) => s.storeSize);
  const updatePlacement = useGameStore((s) => s.updatePlacement);

  const [selectedId, setSelectedId] = useState(null);
  const [ghostPos, setGhostPos] = useState({ x: 50, y: 50 });

  const handleFurnitureClick = (id) => {
    if (placementMode) return;
    setSelectedId(id);
  };

  const getSnappedPosition = (point) => {
    let xWorld = point.x;
    let zWorld = point.z;
    
    if (placementMode?.type === 'prabowoPicture') {
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
      return { 
        x: Math.round(xWorld * 10 + 50), 
        y: Math.round(zWorld * 10 + 50),
        rot
      };
    }
    
    return {
      x: Math.round(xWorld * 10 + 50),
      y: Math.round(zWorld * 10 + 50)
    };
  };

  const handleFloorPointerMove = (e) => {
    if (!placementMode) return;
    const snapped = getSnappedPosition(e.point);
    setGhostPos({ x: snapped.x, y: snapped.y });
    if (placementMode.type === 'prabowoPicture' && placementMode.rotation !== snapped.rot) {
      updatePlacement({ rotation: snapped.rot });
    }
  };

  const handleFloorClick = (e) => {
    if (!placementMode) {
      setSelectedId(null);
    }
  };

  const handleFloorDoubleClick = (e) => {
    if (placementMode) {
      e.stopPropagation();
      const snapped = getSnappedPosition(e.point);
      if (placementMode.type === 'prabowoPicture' && placementMode.rotation !== snapped.rot) {
        updatePlacement({ rotation: snapped.rot });
      }
      confirmPlacement(snapped.x, snapped.y);
    }
  };

  return (
    <div className="three-container" style={{ width: '100vw', height: '100vh', display: 'flex' }}>
      {/* 3D Canvas */}
      <div style={{ flex: 1, height: '100%' }}>
        <Canvas 
          camera={{ position: [10, 12, 14], fov: 45 }}
          shadows
          onClick={handleFloorClick}
          onDoubleClick={handleFloorDoubleClick}
        >
          <color attach="background" args={['#ffffff']} />
          
          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight 
            position={[8, 12, 5]} 
            intensity={1.2} 
            castShadow 
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-8, 6, -5]} intensity={0.4} />

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
              x={ghostPos.x}
              y={ghostPos.y}
              rotation={placementMode.rotation}
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
    </div>
  );
}
