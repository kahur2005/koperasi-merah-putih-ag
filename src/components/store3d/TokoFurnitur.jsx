import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { UI } from '../../constants/uiStrings';
import { FURNITURE, STORE } from '../../constants/gameConstants';
import { formatRupiah } from '../../utils/formatRupiah';

export default function TokoFurnitur({ selectedId, setSelectedId }) {
  const money = useGameStore((s) => s.money);
  const furniture = useGameStore((s) => s.furniture);
  const storeSize = useGameStore((s) => s.storeSize);
  const furniturePositions = useGameStore((s) => s.furniturePositions);
  const buyFurniture = useGameStore((s) => s.buyFurniture);
  const placementMode = useGameStore((s) => s.placementMode);
  const startPlacement = useGameStore((s) => s.startPlacement);
  const updatePlacement = useGameStore((s) => s.updatePlacement);
  const cancelPlacement = useGameStore((s) => s.cancelPlacement);
  const changeFurnitureColor = useGameStore((s) => s.changeFurnitureColor);

  const upgradeStore = useGameStore((s) => s.upgradeStore);
  const moveFurniture = useGameStore((s) => s.moveFurniture);
  const rotateFurniture = useGameStore((s) => s.rotateFurniture);
  const deleteFurniture = useGameStore((s) => s.deleteFurniture);
  const setView = useGameStore((s) => s.setView);

  const predefinedColors = [
    { name: 'Wood', hex: '#B45309' },
    { name: 'Steel', hex: '#64748B' },
    { name: 'Red', hex: '#EF4444' },
    { name: 'Green', hex: '#10B981' },
    { name: 'Yellow', hex: '#F59E0B' }
  ];

  const selectedItem = furniturePositions.find((f) => f.id === selectedId);

  const handleBuy = (type) => {
    const price = FURNITURE[type].price;
    if (money < price) return;
    startPlacement(type, price);
  };

  const handleUpgrade = () => {
    if (money < STORE.UPGRADE_COST) return;
    upgradeStore();
  };

  const handleMove = (dx, dy) => {
    if (!selectedId) return;
    moveFurniture(selectedId, dx, dy);
  };

  const handleRotate = () => {
    if (!selectedId) return;
    rotateFurniture(selectedId);
  };

  const handleDelete = () => {
    if (!selectedId) return;
    deleteFurniture(selectedId);
    setSelectedId(null);
  };

  return (
    <div className="three-sidebar glass-card" style={{ overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '800' }}>🏪 {UI.TOKO_FURNITUR}</h2>
        <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--accent-yellow)' }}>{formatRupiah(money)}</span>
      </div>

      {/* Placement Mode Controls */}
      {placementMode && (
        <div className="glass-card" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'var(--accent-green)', padding: '12px', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-green)', marginBottom: '8px' }}>
            Penempatan: {FURNITURE[placementMode.type]?.label}
          </h3>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Arahkan kursor ke lantai toko. Klik untuk meletakkan.
          </p>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button className="btn btn-secondary" style={{ flex: 1, padding: '8px' }} onClick={() => updatePlacement({ rotation: (placementMode.rotation + 90) % 360 })}>
              🔄 Putar
            </button>
          </div>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '12px', justifyContent: 'space-between' }}>
            {predefinedColors.map(c => (
              <button 
                key={c.hex} 
                style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: c.hex, border: placementMode.color === c.hex ? '2px solid white' : '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}
                onClick={() => updatePlacement({ color: c.hex })}
                title={c.name}
              />
            ))}
          </div>
          <button className="btn btn-danger" style={{ width: '100%', padding: '8px' }} onClick={cancelPlacement}>
            ❌ Batal
          </button>
        </div>
      )}

      {/* Selected Item Controls */}
      {selectedItem && (
        <div className="glass-card" style={{ background: 'rgba(59, 130, 246, 0.15)', borderColor: 'var(--accent-blue)', padding: '12px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-blue)', marginBottom: '8px' }}>
            Pilihan: {FURNITURE[selectedItem.type]?.label || selectedItem.type}
          </h3>
          
          {/* Movement buttons grid */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', margin: '8px 0' }}>
            <button className="btn btn-secondary" style={{ padding: '6px 12px' }} onClick={() => handleMove(0, -5)}>▲</button>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button className="btn btn-secondary" style={{ padding: '6px 12px' }} onClick={() => handleMove(-5, 0)}>◀</button>
              <button className="btn btn-secondary" style={{ padding: '6px 12px' }} onClick={() => handleMove(5, 0)}>▶</button>
            </div>
            <button className="btn btn-secondary" style={{ padding: '6px 12px' }} onClick={() => handleMove(0, 5)}>▼</button>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button className="btn btn-secondary" style={{ flex: 1, padding: '8px' }} onClick={handleRotate}>
              🔄 Putar
            </button>
            <button className="btn btn-danger" style={{ flex: 1, padding: '8px' }} onClick={handleDelete}>
              ❌ Hapus
            </button>
          </div>

          <div style={{ display: 'flex', gap: '4px', marginTop: '12px', justifyContent: 'center' }}>
            {predefinedColors.map(c => (
              <button 
                key={c.hex} 
                style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: c.hex, border: selectedItem.color === c.hex ? '2px solid white' : '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}
                onClick={() => changeFurnitureColor(selectedId, c.hex)}
                title={c.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* Items list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Daftar Furnitur</h3>
        
        {Object.entries(FURNITURE).map(([type, def]) => {
          const count = furniture[type] || 0;
          const max = def.maxCount;
          const isMaxed = count >= max;
          const canAfford = money >= def.price;

          // Build description
          let desc = '';
          if (def.stockBonus) {
            desc = `Kapasitas: ${Object.entries(def.stockBonus).map(([k, v]) => `+${v} ${k === 'rice' ? '🍚' : '🛢'}`).join(', ')}`;
          } else if (def.customerBonus) {
            desc = `Bonus pelanggan: +${def.customerBonus} orang/hari`;
          } else if (def.happinessBonus) {
            desc = `Bonus Kebahagiaan: +${def.happinessBonus}% (sekali beli)`;
          }

          return (
            <div key={type} className="glass-card" style={{ padding: '10px', background: 'rgba(15,23,42,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700' }}>{def.label}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Dimiliki: {count}{max !== Infinity ? `/${max}` : ''}</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{desc}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--accent-yellow)' }}>{formatRupiah(def.price)}</span>
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '4px 10px', fontSize: '11px' }}
                  disabled={isMaxed || !canAfford || placementMode !== null}
                  onClick={() => handleBuy(type)}
                >
                  {UI.BTN_BELI_PASANG}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upgrade Store */}
      {storeSize === 'small' && (
        <div className="glass-card" style={{ background: 'rgba(234, 179, 8, 0.1)', borderColor: 'var(--accent-yellow)', padding: '12px', marginTop: '12px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-yellow)', marginBottom: '4px' }}>📐 {UI.PERBESAR_TOKO}</h3>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '10px' }}>Ubah ukuran toko dari 10m x 15m menjadi 20m x 30m.</p>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '8px', background: 'var(--accent-yellow)', color: 'var(--bg-primary)' }}
            disabled={money < STORE.UPGRADE_COST}
            onClick={handleUpgrade}
          >
            Upgrade - {formatRupiah(STORE.UPGRADE_COST)}
          </button>
        </div>
      )}

      {/* Close button */}
      <button className="btn btn-secondary" style={{ marginTop: 'auto', width: '100%' }} onClick={() => setView('dashboard')}>
        {UI.KEMBALI_KE_DASHBOARD}
      </button>
    </div>
  );
}
