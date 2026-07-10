import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { UI } from '../../constants/uiStrings';
import { FURNITURE, STORE } from '../../constants/gameConstants';
import { formatRupiah } from '../../utils/formatRupiah';

const FURNITURE_IMAGES = {
  riceRack: '/assets/images/furniture/rak_beras_preview.jpeg',
  oilRack: '/assets/images/furniture/rak_minyak_preview.jpeg',
  goodsRack: '/assets/images/furniture/rak_barang_preview.jpeg',
  lpgStack: '/assets/images/furniture/rak_gas_preview.jpeg',
  cashier: '/assets/images/furniture/meja_kasir_preview.jpeg',
  carpet: '/assets/images/furniture/karpet_preview.jpeg',
  indoorPlant: '/assets/images/furniture/tanaman_preview.jpeg',
  prabowoPicture: '/assets/images/furniture/foto_presiden_preview.jpeg',
  gibranPicture: '/assets/images/furniture/foto_wapres_peview.jpeg',
};

const RESTOCK_ITEM_BY_FURNITURE = {
  riceRack: 'rice',
  oilRack: 'cookingOil',
  goodsRack: 'rice',
  lpgStack: 'lpgGas',
};

export default function TokoFurnitur({ selectedId, setSelectedId, onConfirmPlacement }) {
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
  const openRestockPanel = useGameStore((s) => s.openRestockPanel);

  const upgradeStore = useGameStore((s) => s.upgradeStore);
  const moveFurniture = useGameStore((s) => s.moveFurniture);
  const rotateFurniture = useGameStore((s) => s.rotateFurniture);
  const deleteFurniture = useGameStore((s) => s.deleteFurniture);
  const setView = useGameStore((s) => s.setView);

  const [hoveredTooltip, setHoveredTooltip] = useState(null);

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

  const handleRestock = () => {
    const item = RESTOCK_ITEM_BY_FURNITURE[selectedItem?.type];
    if (!item) return;
    openRestockPanel(item);
  };

  const handleDelete = () => {
    if (!selectedId) return;
    deleteFurniture(selectedId);
    setSelectedId(null);
  };

  const handleMouseEnter = (e, type, def, tooltipContent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const count = furniture[type] || 0;
    const max = def.maxCount;
    setHoveredTooltip({
      content: tooltipContent,
      countInfo: `Dimiliki: ${count}${max !== Infinity ? `/${max}` : ''}`,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  };

  const handleMouseLeave = () => setHoveredTooltip(null);

  return (
    <>
      <aside className="three-bottombar" aria-label={UI.TOKO_FURNITUR}>
        <div className="bottombar-header">
          <span className="panel-kicker">Manajemen Toko</span>
          <span className="shop-money">{formatRupiah(money)}</span>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button 
              className="btn btn-secondary" 
              style={{ fontSize: '14px', padding: '4px 8px', minHeight: 'auto' }}
              onClick={() => setView('dashboard')}
            >
              Kembali
            </button>
          </div>
        </div>

        <div className="furniture-list-horizontal">
          {Object.entries(FURNITURE).map(([type, def]) => {
            const count = furniture[type] || 0;
            const max = def.maxCount;
            const isMaxed = count >= max;
            const canAfford = money >= def.price;

            // Build description for tooltip
            let tooltipContent = null;
            if (def.stockBonus) {
              tooltipContent = (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Kapasitas:</span>
                  {Object.entries(def.stockBonus).map(([k, v], idx) => {
                    let iconPath = '';
                    if (k === 'rice') iconPath = '/assets/images/icon_beras.png';
                    else if (k === 'lpgGas') iconPath = '/assets/images/icon_gas.png';
                    else iconPath = '/assets/images/icon_minyak.png';
                    
                    return (
                      <span key={k} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        +{v} <img src={iconPath} alt={k} style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                      </span>
                    );
                  })}
                </div>
              );
            } else if (def.customerBonus) {
              tooltipContent = <span>Bonus pelanggan: +{def.customerBonus} / hari</span>;
            } else if (def.happinessBonus) {
              tooltipContent = <span>Bonus Kebahagiaan: +{def.happinessBonus}%</span>;
            }

            return (
              <button 
                key={type} 
                className="furniture-card-bottom" 
                disabled={isMaxed || !canAfford || placementMode !== null}
                onClick={() => handleBuy(type)}
                onMouseEnter={(e) => handleMouseEnter(e, type, def, tooltipContent)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="furniture-image-placeholder">
                  <img src={FURNITURE_IMAGES[type]} alt={def.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="furniture-name">{def.label}</div>
                <div className="furniture-price">{formatRupiah(def.price)}</div>
              </button>
            );
          })}
        </div>

        {storeSize === 'small' && (
          <div className="bottombar-right">
            <span className="panel-kicker">Upgrade Toko</span>
            <span className="shop-money">{formatRupiah(STORE.UPGRADE_COST)}</span>
            <button 
              className="btn btn-primary" 
              style={{ fontSize: '14px', padding: '4px 8px', minHeight: 'auto', marginTop: '8px' }}
              disabled={money < STORE.UPGRADE_COST}
              onClick={handleUpgrade}
            >
              Beli
            </button>
          </div>
        )}
      </aside>

      {hoveredTooltip && (
        <div 
          className="furniture-tooltip-fixed"
          style={{ left: hoveredTooltip.x, top: hoveredTooltip.y, transform: 'translate(-50%, -100%)' }}
        >
          {hoveredTooltip.content}
          <div>{hoveredTooltip.countInfo}</div>
        </div>
      )}

      {placementMode && (
        <div className="floating-action-bar">
          <h3>Penempatan: {FURNITURE[placementMode.type]?.label}</h3>
          <div className="tool-row" style={{ alignItems: 'center' }}>
            <button className="btn btn-primary" onClick={onConfirmPlacement} style={{ fontSize: '16px', padding: '8px 16px' }}>
              Letakkan
            </button>
            <button className="btn btn-secondary" onClick={() => updatePlacement({ rotation: (placementMode.rotation + 90) % 360 })}>
              Putar
            </button>
            <div className="color-swatches" style={{ margin: '0 8px', marginBottom: 0 }} aria-label="Pilih warna furnitur">
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
            <button className="btn btn-danger" onClick={cancelPlacement}>
              Batal
            </button>
          </div>
        </div>
      )}

      {selectedItem && (
        <div className="floating-action-bar">
          <h3>Pilihan: {FURNITURE[selectedItem.type]?.label || selectedItem.type}</h3>
          <div className="tool-row" style={{ alignItems: 'center' }}>
            <button className="btn btn-secondary" onClick={handleRotate}>
              Putar
            </button>
            {RESTOCK_ITEM_BY_FURNITURE[selectedItem.type] && (
              <button className="btn btn-primary" onClick={handleRestock}>
                Restok
              </button>
            )}
            <div className="color-swatches" style={{ margin: '0 8px', marginBottom: 0 }} aria-label="Ganti warna furnitur">
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
            <button className="btn btn-danger" onClick={handleDelete}>
              Hapus
            </button>
          </div>
        </div>
      )}
    </>
  );
}
