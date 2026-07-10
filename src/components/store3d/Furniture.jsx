import React from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { useGameStore } from '../../store/gameStore';

const RiceRack = ({ isSelected, customColor, isGhost, flashColor }) => {
  const rackColor = customColor || '#854D0E';
  const emissiveColor = flashColor === 'green' ? '#22C55E' : flashColor === 'red' ? '#EF4444' : isSelected ? '#3B82F6' : '#000000';
  const emissiveIntensity = flashColor ? 0.8 : isSelected ? 0.3 : 0;
  const rackMaterial = <meshStandardMaterial color={rackColor} roughness={0.8} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} transparent={isGhost} opacity={isGhost ? 0.5 : 1} />;
  const sackMaterial = <meshStandardMaterial color="#E5E7EB" roughness={0.9} transparent={isGhost} opacity={isGhost ? 0.5 : 1} />;
  return (
    <group>
      <mesh position={[-0.55, 0.9, 0]} castShadow={!isGhost} receiveShadow={!isGhost}>
        <boxGeometry args={[0.05, 1.8, 0.6]} />
        {rackMaterial}
      </mesh>
      <mesh position={[0.55, 0.9, 0]} castShadow={!isGhost} receiveShadow={!isGhost}>
        <boxGeometry args={[0.05, 1.8, 0.6]} />
        {rackMaterial}
      </mesh>
      {[0.1, 0.6, 1.1, 1.6].map((y, i) => (
        <group key={i}>
          <mesh position={[0, y, 0]} castShadow={!isGhost} receiveShadow={!isGhost}>
            <boxGeometry args={[1.1, 0.05, 0.55]} />
            {rackMaterial}
          </mesh>
          {i < 3 && [-0.3, 0, 0.3].map((x, j) => (
            <mesh key={j} position={[x, y + 0.15, 0]} castShadow={!isGhost} receiveShadow={!isGhost}>
              <boxGeometry args={[0.25, 0.25, 0.4]} />
              {sackMaterial}
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, 0.9, -0.28]} castShadow={!isGhost} receiveShadow={!isGhost}>
        <boxGeometry args={[1.15, 1.8, 0.02]} />
        {rackMaterial}
      </mesh>
    </group>
  );
};

const OilRack = ({ isSelected, customColor, isGhost, flashColor }) => {
  const rackColor = customColor || '#D97706';
  const emissiveColor = flashColor === 'green' ? '#22C55E' : flashColor === 'red' ? '#EF4444' : isSelected ? '#3B82F6' : '#000000';
  const emissiveIntensity = flashColor ? 0.8 : isSelected ? 0.3 : 0;
  const rackMaterial = <meshStandardMaterial color={rackColor} roughness={0.7} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} transparent={isGhost} opacity={isGhost ? 0.5 : 1} />;
  const bottleMaterial = <meshStandardMaterial color="#FCD34D" roughness={0.2} transparent opacity={isGhost ? 0.4 : 0.8} />;
  const capMaterial = <meshStandardMaterial color="#EF4444" roughness={0.5} transparent={isGhost} opacity={isGhost ? 0.5 : 1} />;
  return (
    <group>
      <mesh position={[-0.55, 0.9, 0]} castShadow={!isGhost} receiveShadow={!isGhost}>
        <boxGeometry args={[0.05, 1.8, 0.6]} />
        {rackMaterial}
      </mesh>
      <mesh position={[0.55, 0.9, 0]} castShadow={!isGhost} receiveShadow={!isGhost}>
        <boxGeometry args={[0.05, 1.8, 0.6]} />
        {rackMaterial}
      </mesh>
      {[0.1, 0.5, 0.9, 1.3, 1.7].map((y, i) => (
        <group key={i}>
          <mesh position={[0, y, 0]} castShadow={!isGhost} receiveShadow={!isGhost}>
            <boxGeometry args={[1.1, 0.05, 0.55]} />
            {rackMaterial}
          </mesh>
          {i < 4 && [-0.4, -0.15, 0.1, 0.35].map((x, j) => (
            <group key={j} position={[x, y + 0.15, 0]}>
              <mesh castShadow={!isGhost} receiveShadow={!isGhost}>
                <cylinderGeometry args={[0.08, 0.08, 0.25, 16]} />
                {bottleMaterial}
              </mesh>
              <mesh position={[0, 0.15, 0]} castShadow={!isGhost} receiveShadow={!isGhost}>
                <cylinderGeometry args={[0.03, 0.03, 0.05, 16]} />
                {capMaterial}
              </mesh>
            </group>
          ))}
        </group>
      ))}
      <mesh position={[0, 0.9, -0.28]} castShadow={!isGhost} receiveShadow={!isGhost}>
        <boxGeometry args={[1.15, 1.8, 0.02]} />
        {rackMaterial}
      </mesh>
    </group>
  );
};

const GoodsRack = ({ isSelected, customColor, isGhost, flashColor }) => {
  const rackColor = customColor || '#64748B';
  const emissiveColor = flashColor === 'green' ? '#22C55E' : flashColor === 'red' ? '#EF4444' : isSelected ? '#3B82F6' : '#000000';
  const emissiveIntensity = flashColor ? 0.8 : isSelected ? 0.3 : 0;
  const rackMaterial = <meshStandardMaterial color={rackColor} roughness={0.6} metalness={0.2} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} transparent={isGhost} opacity={isGhost ? 0.5 : 1} />;
  const boxColors = ['#F87171', '#60A5FA', '#34D399', '#FBBF24'];
  return (
    <group>
      <mesh position={[-0.48, 0.8, 0]} castShadow={!isGhost} receiveShadow={!isGhost}>
        <boxGeometry args={[0.04, 1.6, 0.8]} />
        {rackMaterial}
      </mesh>
      <mesh position={[0.48, 0.8, 0]} castShadow={!isGhost} receiveShadow={!isGhost}>
        <boxGeometry args={[0.04, 1.6, 0.8]} />
        {rackMaterial}
      </mesh>
      {[0.1, 0.6, 1.1, 1.5].map((y, i) => (
        <group key={i}>
          <mesh position={[0, y, 0]} castShadow={!isGhost} receiveShadow={!isGhost}>
            <boxGeometry args={[0.96, 0.04, 0.78]} />
            {rackMaterial}
          </mesh>
          {i < 3 && [-0.25, 0.25].map((x, j) => (
            <mesh key={j} position={[x, y + 0.15, (i%2===0?-0.1:0.1)]} castShadow={!isGhost} receiveShadow={!isGhost}>
              <boxGeometry args={[0.3, 0.25, 0.3]} />
              <meshStandardMaterial color={boxColors[(i+j)%4]} roughness={0.8} transparent={isGhost} opacity={isGhost ? 0.5 : 1} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

const LpgStack = ({ isSelected, customColor, isGhost, flashColor }) => {
  const emissiveColor = flashColor === 'green' ? '#22C55E' : flashColor === 'red' ? '#EF4444' : isSelected ? '#3B82F6' : '#000000';
  const emissiveIntensity = flashColor ? 0.8 : isSelected ? 0.3 : 0;
  const rackMaterial = <meshStandardMaterial color={customColor || '#334155'} roughness={0.7} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} transparent={isGhost} opacity={isGhost ? 0.5 : 1} />;
  const lpgMaterial = <meshStandardMaterial color="#22C55E" roughness={0.6} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} transparent={isGhost} opacity={isGhost ? 0.5 : 1} />;
  const capMaterial = <meshStandardMaterial color="#64748B" roughness={0.5} transparent={isGhost} opacity={isGhost ? 0.5 : 1} />;
  const palletMaterial = <meshStandardMaterial color="#B45309" roughness={0.9} transparent={isGhost} opacity={isGhost ? 0.5 : 1} />;

  return (
    <group>
      {/* Base Pallet */}
      <mesh position={[0, 0.05, 0]} castShadow={!isGhost} receiveShadow={!isGhost}>
        <boxGeometry args={[1.2, 0.1, 1.2]} />
        {palletMaterial}
      </mesh>
      
      {/* 3x3x3 LPG Cylinders */}
      {[0, 1, 2].map(layer => (
        <group key={`layer-${layer}`}>
          {[-0.35, 0, 0.35].map(x => (
            [-0.35, 0, 0.35].map(z => (
              <group key={`${layer}-${x}-${z}`} position={[x, 0.1 + layer * 0.45 + 0.2, z]}>
                <mesh castShadow={!isGhost} receiveShadow={!isGhost}>
                  <cylinderGeometry args={[0.15, 0.15, 0.35, 16]} />
                  {lpgMaterial}
                </mesh>
                <mesh position={[0, 0.18, 0]} castShadow={!isGhost} receiveShadow={!isGhost}>
                  <cylinderGeometry args={[0.15, 0.05, 0.1, 16]} />
                  {lpgMaterial}
                </mesh>
                <mesh position={[0, 0.25, 0]} castShadow={!isGhost} receiveShadow={!isGhost}>
                  <cylinderGeometry args={[0.06, 0.06, 0.08, 16]} />
                  {capMaterial}
                </mesh>
              </group>
            ))
          ))}
        </group>
      ))}
    </group>
  );
};

const CashierDesk = ({ isSelected, customColor, isGhost }) => {
  const deskColor = customColor || '#B45309';
  const deskMaterial = <meshStandardMaterial color={deskColor} roughness={0.7} emissive={isSelected ? '#3B82F6' : '#000000'} emissiveIntensity={isSelected ? 0.3 : 0} transparent={isGhost} opacity={isGhost ? 0.5 : 1} />;
  const registerMaterial = <meshStandardMaterial color="#334155" roughness={0.4} transparent={isGhost} opacity={isGhost ? 0.5 : 1} />;
  const screenMaterial = <meshStandardMaterial color="#38BDF8" roughness={0.2} emissive="#0284C7" emissiveIntensity={0.5} transparent={isGhost} opacity={isGhost ? 0.5 : 1} />;
  
  return (
    <group>
      <mesh position={[0, 0.4, 0]} castShadow={!isGhost} receiveShadow={!isGhost}>
        <boxGeometry args={[1.4, 0.8, 0.8]} />
        {deskMaterial}
      </mesh>
      <mesh position={[0, 0.85, 0]} castShadow={!isGhost} receiveShadow={!isGhost}>
        <boxGeometry args={[1.5, 0.1, 0.9]} />
        <meshStandardMaterial color="#FDE68A" roughness={0.5} transparent={isGhost} opacity={isGhost ? 0.5 : 1} />
      </mesh>
      <group position={[0.4, 1.0, 0]}>
        <mesh castShadow={!isGhost} receiveShadow={!isGhost}>
          <boxGeometry args={[0.4, 0.2, 0.3]} />
          {registerMaterial}
        </mesh>
        <mesh position={[0, 0.15, -0.05]} rotation={[-0.2, 0, 0]} castShadow={!isGhost} receiveShadow={!isGhost}>
          <boxGeometry args={[0.3, 0.2, 0.05]} />
          {registerMaterial}
        </mesh>
        <mesh position={[0, 0.15, -0.076]} rotation={[-0.2, 0, 0]} castShadow={!isGhost} receiveShadow={!isGhost}>
          <planeGeometry args={[0.25, 0.15]} />
          {screenMaterial}
        </mesh>
      </group>
    </group>
  );
};

const Carpet = ({ isSelected, customColor, isGhost }) => {
  const color = customColor || '#DC2626';
  const material = <meshStandardMaterial color={color} roughness={0.9} emissive={isSelected ? '#3B82F6' : '#000000'} emissiveIntensity={isSelected ? 0.3 : 0} transparent={isGhost} opacity={isGhost ? 0.5 : 1} />;
  return (
    <group>
      <mesh position={[0, 0.01, 0]} receiveShadow={!isGhost}>
        <boxGeometry args={[3.0, 0.02, 2.25]} />
        {material}
      </mesh>
      <mesh position={[0, 0.021, 0]} receiveShadow={!isGhost}>
        <boxGeometry args={[2.8, 0.005, 2.05]} />
        <meshStandardMaterial color="#FCA5A5" roughness={0.9} transparent={isGhost} opacity={isGhost ? 0.5 : 1} />
      </mesh>
    </group>
  );
};

const IndoorPlant = ({ isSelected, customColor, isGhost }) => {
  const potColor = customColor || '#F97316';
  const potMaterial = <meshStandardMaterial color={potColor} roughness={0.8} emissive={isSelected ? '#3B82F6' : '#000000'} emissiveIntensity={isSelected ? 0.3 : 0} transparent={isGhost} opacity={isGhost ? 0.5 : 1} />;
  const leafMaterial = <meshStandardMaterial color="#10B981" roughness={0.5} transparent={isGhost} opacity={isGhost ? 0.5 : 1} />;
  const trunkMaterial = <meshStandardMaterial color="#78350F" roughness={0.9} transparent={isGhost} opacity={isGhost ? 0.5 : 1} />;
  return (
    <group>
      <mesh position={[0, 0.2, 0]} castShadow={!isGhost} receiveShadow={!isGhost}>
        <cylinderGeometry args={[0.25, 0.2, 0.4, 16]} />
        {potMaterial}
      </mesh>
      <mesh position={[0, 0.41, 0]} castShadow={!isGhost} receiveShadow={!isGhost}>
        <cylinderGeometry args={[0.24, 0.24, 0.02, 16]} />
        <meshStandardMaterial color="#451A03" roughness={1} transparent={isGhost} opacity={isGhost ? 0.5 : 1} />
      </mesh>
      <mesh position={[0, 0.6, 0]} castShadow={!isGhost} receiveShadow={!isGhost}>
        <cylinderGeometry args={[0.03, 0.04, 0.4, 8]} />
        {trunkMaterial}
      </mesh>
      <mesh position={[0, 0.9, 0]} castShadow={!isGhost} receiveShadow={!isGhost}>
        <sphereGeometry args={[0.3, 16, 16]} />
        {leafMaterial}
      </mesh>
      <mesh position={[0.15, 0.75, 0.1]} castShadow={!isGhost} receiveShadow={!isGhost}>
        <sphereGeometry args={[0.2, 16, 16]} />
        {leafMaterial}
      </mesh>
      <mesh position={[-0.15, 0.75, -0.1]} castShadow={!isGhost} receiveShadow={!isGhost}>
        <sphereGeometry args={[0.2, 16, 16]} />
        {leafMaterial}
      </mesh>
      <mesh position={[0, 0.75, -0.2]} castShadow={!isGhost} receiveShadow={!isGhost}>
        <sphereGeometry args={[0.2, 16, 16]} />
        {leafMaterial}
      </mesh>
    </group>
  );
};

const PictureFrame = ({ type, isSelected, customColor, isGhost }) => {
  const frameColor = customColor || '#D97706';
  const frameMaterial = <meshStandardMaterial color={frameColor} roughness={0.3} metalness={0.6} emissive={isSelected ? '#3B82F6' : '#000000'} emissiveIntensity={isSelected ? 0.3 : 0} transparent={isGhost} opacity={isGhost ? 0.5 : 1} />;
  const texturePath = type === 'gibranPicture' ? '/assets/images/gibran.jpg' : '/assets/images/prabowo.jpg';
  const texture = useLoader(TextureLoader, texturePath);
  const photoMaterial = <meshStandardMaterial map={texture} roughness={0.8} transparent={isGhost} opacity={isGhost ? 0.5 : 1} />;
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.0, 1.2, 0.05]} />
        {frameMaterial}
      </mesh>
      <mesh position={[0, 0, 0.026]}>
        <planeGeometry args={[0.8, 1.0]} />
        {photoMaterial}
      </mesh>
    </group>
  );
};

export default function Furniture({ id, type, x, y, rotation = 0, color, isSelected, isGhost, flashColor, onClick, onDoubleClick }) {
  const posX = (x - 50) / 10;
  const posZ = (y - 50) / 10;
  let posY = 0;

  if (type === 'prabowoPicture' || type === 'gibranPicture') {
    posY = 2.5; 
  }

  const renderModel = () => {
    switch (type) {
      case 'riceRack': return <RiceRack isSelected={isSelected} customColor={color} isGhost={isGhost} flashColor={flashColor} />;
      case 'oilRack': return <OilRack isSelected={isSelected} customColor={color} isGhost={isGhost} flashColor={flashColor} />;
      case 'goodsRack': return <GoodsRack isSelected={isSelected} customColor={color} isGhost={isGhost} flashColor={flashColor} />;
      case 'lpgStack': return <LpgStack isSelected={isSelected} customColor={color} isGhost={isGhost} flashColor={flashColor} />;
      case 'cashier': return <CashierDesk isSelected={isSelected} customColor={color} isGhost={isGhost} />;
      case 'carpet': return <Carpet isSelected={isSelected} customColor={color} isGhost={isGhost} />;
      case 'indoorPlant': return <IndoorPlant isSelected={isSelected} customColor={color} isGhost={isGhost} />;
      case 'prabowoPicture': return <PictureFrame type="prabowoPicture" isSelected={isSelected} customColor={color} isGhost={isGhost} />;
      case 'gibranPicture': return <PictureFrame type="gibranPicture" isSelected={isSelected} customColor={color} isGhost={isGhost} />;
      default:
        return (
          <mesh castShadow={!isGhost} receiveShadow={!isGhost}>
            <boxGeometry args={[1, 1.6, 1]} />
            <meshStandardMaterial color={color || "#B45309"} emissive={isSelected ? '#3B82F6' : '#000000'} emissiveIntensity={isSelected ? 0.3 : 0} transparent={isGhost} opacity={isGhost ? 0.5 : 1} />
          </mesh>
        );
    }
  };

  return (
    <group 
      position={[posX, posY, posZ]} 
      rotation={[0, (rotation * Math.PI) / 180, 0]}
      onClick={(e) => {
        if (!isGhost && onClick) {
          e.stopPropagation();
          onClick(id);
        }
      }}
      onDoubleClick={(e) => {
        if (!isGhost && onDoubleClick) {
          e.stopPropagation();
          onDoubleClick(id, e);
        }
      }}
    >
      {renderModel()}
    </group>
  );
}
