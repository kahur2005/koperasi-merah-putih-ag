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
    <aside className="three-sidebar wooden-panel" aria-label={UI.TOKO_FURNITUR}>
      <div className="shop-header">
        <div>
          <span className="panel-kicker">Manajemen Toko</span>
          <h2>{UI.TOKO_FURNITUR}</h2>
        </div>
        <span className="shop-money">{formatRupiah(money)}</span>
      </div>

      {placementMode && (
        <div className="placement-card">
          <h3>
            Penempatan: {FURNITURE[placementMode.type]?.label}
          </h3>
          <p>
            Arahkan kursor ke lantai toko. Klik dua kali untuk meletakkan furnitur.
          </p>
          <div className="tool-row">
            <button className="btn btn-secondary" onClick={() => updatePlacement({ rotation: (placementMode.rotation + 90) % 360 })}>
              Putar
            </button>
          </div>
          <div className="color-swatches" aria-label="Pilih warna furnitur">
            {predefinedColors.map(c => (
              <button 
                key={c.hex} 
                className={placementMode.color === c.hex ? 'swatch active' : 'swatch'}
                style={{ backgroundColor: c.hex }}
                onClick={() => updatePlacement({ color: c.hex })}
                title={c.name}
              />
            ))}
          </div>
          <button className="btn btn-danger btn-block" onClick={cancelPlacement}>
            Batal
          </button>
        </div>
      )}

      {selectedItem && (
        <div className="selected-card">
          <h3>
            Pilihan: {FURNITURE[selectedItem.type]?.label || selectedItem.type}
          </h3>
          
          <div className="move-pad" aria-label="Pindahkan furnitur">
            <button className="btn btn-secondary" onClick={() => handleMove(0, -5)} title="Geser maju">▲</button>
            <div>
              <button className="btn btn-secondary" onClick={() => handleMove(-5, 0)} title="Geser kiri">◀</button>
              <button className="btn btn-secondary" onClick={() => handleMove(5, 0)} title="Geser kanan">▶</button>
            </div>
            <button className="btn btn-secondary" onClick={() => handleMove(0, 5)} title="Geser mundur">▼</button>
          </div>

          <div className="tool-row">
            <button className="btn btn-secondary" onClick={handleRotate}>
              Putar
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              Hapus
            </button>
          </div>

          <div className="color-swatches" aria-label="Ganti warna furnitur">
            {predefinedColors.map(c => (
              <button 
                key={c.hex} 
                className={selectedItem.color === c.hex ? 'swatch active' : 'swatch'}
                style={{ backgroundColor: c.hex }}
                onClick={() => changeFurnitureColor(selectedId, c.hex)}
                title={c.name}
              />
            ))}
          </div>
        </div>
      )}

      <div className="furniture-list">
        <h3>Daftar Furnitur</h3>
        
        {Object.entries(FURNITURE).map(([type, def]) => {
          const count = furniture[type] || 0;
          const max = def.maxCount;
          const isMaxed = count >= max;
          const canAfford = money >= def.price;

          // Build description
          let desc = '';
          if (def.stockBonus) {
            desc = (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                Kapasitas:{' '}
                {Object.entries(def.stockBonus).map(([k, v], idx) => {
                  let iconPath = '';
                  if (k === 'rice') iconPath = '/assets/images/icon_beras.png';
                  else if (k === 'lpgGas') iconPath = '/assets/images/icon_gas.png';
                  else iconPath = '/assets/images/icon_minyak.png';
                  
                  return (
                    <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      +{v} <img src={iconPath} alt={k} style={{ width: '16px', height: '16px' }} />
                      {idx < Object.keys(def.stockBonus).length - 1 && ', '}
                    </span>
                  );
                })}
              </span>
            );
          } else if (def.customerBonus) {
            desc = `Bonus pelanggan: +${def.customerBonus} orang/hari`;
          } else if (def.happinessBonus) {
            desc = `Bonus Kebahagiaan: +${def.happinessBonus}% (sekali beli)`;
          }

          return (
            <section key={type} className="furniture-card" data-item={type}>
              <div className="furniture-card-top">
                <span>{def.label}</span>
                <span>Dimiliki: {count}{max !== Infinity ? `/${max}` : ''}</span>
              </div>
              <p>{desc}</p>
              <div className="furniture-card-action">
                <span>{formatRupiah(def.price)}</span>
                <button 
                  className="btn btn-primary" 
                  disabled={isMaxed || !canAfford || placementMode !== null}
                  onClick={() => handleBuy(type)}
                >
                  {UI.BTN_BELI_PASANG}
                </button>
              </div>
            </section>
          );
        })}
      </div>

      {storeSize === 'small' && (
        <div className="upgrade-card">
          <h3>{UI.PERBESAR_TOKO}</h3>
          <p>Ubah ukuran toko dari 10m x 15m menjadi 20m x 30m.</p>
          <button 
            className="btn btn-upgrade btn-block" 
            disabled={money < STORE.UPGRADE_COST}
            onClick={handleUpgrade}
          >
            Upgrade - {formatRupiah(STORE.UPGRADE_COST)}
          </button>
        </div>
      )}

      <button className="btn btn-secondary btn-block back-dashboard" onClick={() => setView('dashboard')}>
        {UI.KEMBALI_KE_DASHBOARD}
      </button>
    </aside>
  );
}
