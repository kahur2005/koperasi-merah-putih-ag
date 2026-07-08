import React, { useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { STORE } from '../../constants/gameConstants';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

const SplitWall = ({ position, rotation, length, height, hasDoor, hasText, wallType, storeWidth, storeDepth, onPointerMove, onClick, onDoubleClick }) => {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    const { x, z } = state.camera.position;
    let isVisible = true;
    
    if (wallType === 'back' && z < -storeDepth / 2) isVisible = false;
    if (wallType === 'front' && z > storeDepth / 2) isVisible = false;
    if (wallType === 'left' && x < -storeWidth / 2) isVisible = false;
    if (wallType === 'right' && x > storeWidth / 2) isVisible = false;

    groupRef.current.visible = isVisible;
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} onPointerMove={onPointerMove} onClick={onClick} onDoubleClick={onDoubleClick}>
      {hasDoor ? (
        <>
          <mesh position={[0, height * 0.75, 0]} receiveShadow>
            <boxGeometry args={[length, height * 0.5, 0.2]} />
            <meshStandardMaterial color="#B91C1C" roughness={0.82} />
          </mesh>
          <mesh position={[-(length/4 + 1), height * 0.25, 0]} receiveShadow>
            <boxGeometry args={[length/2 - 2, height * 0.5, 0.2]} />
            <meshStandardMaterial color="#F8F3E8" roughness={0.9} />
          </mesh>
          <mesh position={[(length/4 + 1), height * 0.25, 0]} receiveShadow>
            <boxGeometry args={[length/2 - 2, height * 0.5, 0.2]} />
            <meshStandardMaterial color="#F8F3E8" roughness={0.9} />
          </mesh>
          
          <group position={[0, height * 0.25, 0]}>
            <mesh castShadow receiveShadow position={[0, 1.2, 0]}>
              <boxGeometry args={[4, 0.1, 0.22]} />
              <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh castShadow receiveShadow position={[-1.95, 0, 0]}>
              <boxGeometry args={[0.1, 2.5, 0.22]} />
              <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh castShadow receiveShadow position={[1.95, 0, 0]}>
              <boxGeometry args={[0.1, 2.5, 0.22]} />
              <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
            </mesh>
            
            <mesh position={[-0.95, 0, 0]}>
              <boxGeometry args={[1.9, 2.4, 0.05]} />
              <meshStandardMaterial color="#0284C7" transparent opacity={0.5} roughness={0.1} metalness={0.9} />
            </mesh>
            <mesh position={[0.95, 0, 0]}>
              <boxGeometry args={[1.9, 2.4, 0.05]} />
              <meshStandardMaterial color="#0284C7" transparent opacity={0.5} roughness={0.1} metalness={0.9} />
            </mesh>

            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.1, 2.4, 0.08]} />
              <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
            </mesh>
            
            <mesh position={[-0.15, 0, 0.06]}>
              <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
              <meshStandardMaterial color="#E2E8F0" metalness={1} roughness={0.2} />
            </mesh>
            <mesh position={[0.15, 0, 0.06]}>
              <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
              <meshStandardMaterial color="#E2E8F0" metalness={1} roughness={0.2} />
            </mesh>
            <mesh position={[-0.15, 0, -0.06]}>
              <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
              <meshStandardMaterial color="#E2E8F0" metalness={1} roughness={0.2} />
            </mesh>
            <mesh position={[0.15, 0, -0.06]}>
              <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
              <meshStandardMaterial color="#E2E8F0" metalness={1} roughness={0.2} />
            </mesh>
          </group>
        </>
      ) : (
        <>
          <mesh position={[0, height * 0.75, 0]} receiveShadow>
            <boxGeometry args={[length, height * 0.5, 0.2]} />
            <meshStandardMaterial color="#B91C1C" roughness={0.82} />
          </mesh>
          <mesh position={[0, height * 0.25, 0]} receiveShadow>
            <boxGeometry args={[length, height * 0.5, 0.2]} />
            <meshStandardMaterial color="#F8F3E8" roughness={0.9} />
          </mesh>
        </>
      )}

      {hasText && (
        <Text
          position={[0, height * 0.75, 0.11]}
          fontSize={1}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#991B1B"
        >
          KOPERASI MERAH PUTIH
        </Text>
      )}
    </group>
  );
};

export default function StoreFloor({ onPointerMove, onClick, onDoubleClick }) {
  const storeSize = useGameStore((s) => s.storeSize);

  const width = storeSize === 'large' ? STORE.UPGRADED_SIZE.width : STORE.BASE_SIZE.width;
  const depth = storeSize === 'large' ? STORE.UPGRADED_SIZE.depth : STORE.BASE_SIZE.depth;
  const height = 5; 

  return (
    <group>
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.01, 0]} 
        receiveShadow
        onPointerMove={onPointerMove}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      >
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#D8D1C3" roughness={0.85} />
      </mesh>

      <gridHelper args={[Math.max(width, depth), Math.max(width, depth), '#F8F3E8', '#B7A992']} position={[0, 0, 0]} />

      <SplitWall 
        position={[0, 0, -depth / 2]} 
        rotation={[0, 0, 0]} 
        length={width} 
        height={height} 
        wallType="back"
        storeWidth={width}
        storeDepth={depth}
        onPointerMove={onPointerMove}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      />
      
      <SplitWall 
        position={[-width / 2, 0, 0]} 
        rotation={[0, Math.PI / 2, 0]} 
        length={depth} 
        height={height}
        hasText={true}
        wallType="left"
        storeWidth={width}
        storeDepth={depth}
        onPointerMove={onPointerMove}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      />

      <SplitWall 
        position={[width / 2, 0, 0]} 
        rotation={[0, -Math.PI / 2, 0]} 
        length={depth} 
        height={height}
        hasDoor={true}
        wallType="right"
        storeWidth={width}
        storeDepth={depth}
        onPointerMove={onPointerMove}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      />

      <SplitWall 
        position={[0, 0, depth / 2]} 
        rotation={[0, Math.PI, 0]} 
        length={width} 
        height={height} 
        wallType="front"
        storeWidth={width}
        storeDepth={depth}
        onPointerMove={onPointerMove}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      />
    </group>
  );
}
