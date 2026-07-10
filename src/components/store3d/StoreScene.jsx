import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useGameStore } from '../../store/gameStore';
import StoreFloor from './StoreFloor';
import Furniture from './Furniture';
import TokoFurnitur from './TokoFurnitur';
import PasarPasokan from '../hud/PasarPasokan';
import { clampStorePosition, isWallFurniture } from '../../utils/storeBounds.js';

const MANAGER_ITEM_BY_FURNITURE = {
  riceRack: 'rice',
  goodsRack: 'rice',
  oilRack: 'cookingOil',
  lpgStack: 'lpgGas',
};

const MANAGER_ITEM_LABELS = {
  rice: 'beras',
  cookingOil: 'minyak goreng',
  lpgGas: 'gas LPG',
};

function ManagerModeOverlay() {
  const managerSession = useGameStore((s) => s.managerSession);
  const finishManagerMode = useGameStore((s) => s.finishManagerMode);
  const beginManagerTimer = useGameStore((s) => s.beginManagerTimer);
  const [secondsLeft, setSecondsLeft] = useState(managerSession?.durationSeconds || 60);

  useEffect(() => {
    if (!managerSession || managerSession.status !== 'playing') return undefined;

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - managerSession.startedAt) / 1000);
      const nextSecondsLeft = Math.max(0, managerSession.durationSeconds - elapsed);
      setSecondsLeft(nextSecondsLeft);
      if (nextSecondsLeft <= 0) {
        finishManagerMode();
      }
    };

    updateTimer();
    const timer = window.setInterval(updateTimer, 250);
    return () => window.clearInterval(timer);
  }, [finishManagerMode, managerSession]);

  useEffect(() => {
    if (!managerSession) return;
    if (managerSession.currentIndex >= managerSession.totalCustomers) {
      finishManagerMode();
    }
  }, [finishManagerMode, managerSession]);

  if (!managerSession) return null;

  if (managerSession.status === 'intro') {
    return (
      <div className="modal-overlay" style={{ zIndex: 9999 }}>
        <div className="modal-content glass-card" style={{ maxWidth: '600px', textAlign: 'center', padding: '40px' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '24px', color: 'var(--accent-yellow)' }}>Simulasi 3D Koperasi</h2>
          <p style={{ fontSize: '20px', margin: '20px 0', lineHeight: '1.6', color: 'var(--ink)' }}>
            Pelanggan akan datang satu per satu meminta barang. 
            Tugas Anda adalah <strong>mengklik rak yang benar</strong> (Beras, Minyak Goreng, atau Gas LPG) 
            sesuai permintaan pelanggan secepat mungkin sebelum waktu habis!
          </p>
          <p style={{ fontSize: '18px', marginBottom: '32px', color: 'var(--accent-red)' }}>
            Waktu: {managerSession.durationSeconds} Detik
          </p>
          <button className="btn btn-primary" onClick={beginManagerTimer} style={{ fontSize: '22px', padding: '12px 32px' }}>
            Mulai Sekarang
          </button>
        </div>
      </div>
    );
  }

  const request = managerSession.customerQueue[managerSession.currentIndex];
  
  // Determine background color based on feedback
  let feedbackBg = 'rgba(36, 26, 16, 0.9)'; // default dark brown
  if (managerSession.feedback) {
    if (managerSession.feedback.startsWith('Benar')) {
      feedbackBg = 'rgba(34, 197, 94, 0.95)'; // Green
    } else if (managerSession.feedback.startsWith('Bukan itu') || managerSession.feedback.includes('habis')) {
      feedbackBg = 'rgba(239, 68, 68, 0.95)'; // Red
    }
  }

  return (
    <>
      <div style={{
        position: 'absolute',
        top: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '20px 40px',
        backgroundColor: feedbackBg,
        color: 'white',
        fontSize: '28px',
        fontWeight: 'bold',
        borderRadius: '12px',
        boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
        zIndex: 1000,
        textAlign: 'center',
        border: '3px solid rgba(255,255,255,0.2)',
        transition: 'background-color 0.3s ease',
        minWidth: '400px'
      }}>
        {request
          ? `Klik Rak: ${MANAGER_ITEM_LABELS[request.item]?.toUpperCase() || request.item}`
          : 'Selesai!'}
        {managerSession.feedback && (
          <div style={{ fontSize: '18px', marginTop: '8px', fontWeight: 'normal', opacity: 0.9 }}>
            {managerSession.feedback}
          </div>
        )}
      </div>

      <div className="manager-mode-hud" role="status">
        <div>
          <span className="manager-kicker">Manager Mode</span>
          <strong>{secondsLeft}s</strong>
        </div>
        <div className="manager-stats">
          <span>{managerSession.currentIndex}/{managerSession.totalCustomers}</span>
          <span>Benar {managerSession.served}</span>
          <span>Salah {managerSession.wrong}</span>
          <span>Lewat {managerSession.missed}</span>
        </div>
        <button className="btn btn-primary" onClick={finishManagerMode}>
          Akhiri Sesi
        </button>
      </div>
    </>
  );
}

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
  const gamePhase = useGameStore((s) => s.gamePhase);
  const serveManagerCustomer = useGameStore((s) => s.serveManagerCustomer);
  const startRelocation = useGameStore((s) => s.startRelocation);

  const storeSize = useGameStore((s) => s.storeSize);
  const updatePlacement = useGameStore((s) => s.updatePlacement);

  const [selectedId, setSelectedId] = useState(null);
  const [ghostPlacement, setGhostPlacement] = useState({ x: 50, y: 50, rot: 0 });
  const [rackFlash, setRackFlash] = useState({ id: null, color: null });

  const handleFurnitureClick = (id) => {
    if (placementMode) return;
    if (gamePhase === 'managerMode') {
      const clickedItem = furniturePositions.find((f) => f.id === id);
      const requestedItem = MANAGER_ITEM_BY_FURNITURE[clickedItem?.type];
      
      const managerSession = useGameStore.getState().managerSession;
      if (managerSession && managerSession.status === 'playing') {
        const currentRequest = managerSession.customerQueue[managerSession.currentIndex];
        
        if (requestedItem) {
          const isCorrect = currentRequest && currentRequest.item === requestedItem;
          setRackFlash({ id, color: isCorrect ? 'green' : 'red' });
          
          if (isCorrect) {
            setTimeout(() => setRackFlash({ id: null, color: null }), 500);
            serveManagerCustomer(requestedItem);
          }
        } else {
          setRackFlash({ id, color: 'red' });
        }
      }
      return;
    }
    setSelectedId(id);
  };

  const handleFurnitureDoubleClick = (id, e) => {
    if (placementMode) return;
    if (gamePhase === 'managerMode') return;
    startRelocation(id);
    setSelectedId(null);
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
      const wallOffset = 0.28; // Wall is 0.5 thick (0.25 inner surface) + frame is 0.05 thick (0.025 to center) = ~0.275
      if (minD === dBack) {
        zWorld = -depth / 2 + wallOffset;
        rot = 0;
      } else if (minD === dFront) {
        zWorld = depth / 2 - wallOffset;
        rot = 180;
      } else if (minD === dLeft) {
        xWorld = -width / 2 + wallOffset;
        rot = 90;
      } else if (minD === dRight) {
        xWorld = width / 2 - wallOffset;
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
          <React.Suspense fallback={null}>
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
                flashColor={rackFlash.id === f.id ? rackFlash.color : null}
                onClick={handleFurnitureClick}
                onDoubleClick={handleFurnitureDoubleClick}
              />
            ))}
          </React.Suspense>
        </Canvas>
      </div>

      {/* HTML overlay sidebar */}
      {gamePhase === 'managerMode' && <ManagerModeOverlay />}
      {gamePhase !== 'managerMode' && <TokoFurnitur selectedId={selectedId} setSelectedId={setSelectedId} onConfirmPlacement={confirmGhostPlacement} />}
      {activeModal === 'pasar' && <PasarPasokan />}
    </div>
  );
}
