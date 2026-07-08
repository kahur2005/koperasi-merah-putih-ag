import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { UI } from '../../constants/uiStrings';
import { formatRupiah } from '../../utils/formatRupiah';

export default function TopBar() {
  const stock = useGameStore((s) => s.stock);
  const stockCapacity = useGameStore((s) => s.stockCapacity);
  const happiness = useGameStore((s) => s.happiness);
  const memberCount = useGameStore((s) => s.memberCount);
  const money = useGameStore((s) => s.money);
  const setActiveModal = useGameStore((s) => s.setActiveModal);

  // Determine happiness color class
  let happinessClass = 'happiness-yellow';
  if (happiness >= 60) happinessClass = 'happiness-green';
  else if (happiness < 30) happinessClass = 'happiness-red';

  return (
    <div className="top-bar">
      {/* Stock counters */}
      <div className="stat-pills">
        <div className="stat-pill" title={`${UI.STOK_BERAS}: ${stock.rice}/${stockCapacity.rice}`}>
          <img src="/assets/images/icon_beras.png" alt="Beras" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
          <span>{stock.rice}/{stockCapacity.rice}</span>
        </div>
        <div className="stat-pill" title={`${UI.STOK_MINYAK}: ${stock.cookingOil}/${stockCapacity.cookingOil}`}>
          <img src="/assets/images/icon_minyak.png" alt="Minyak" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
          <span>{stock.cookingOil}/{stockCapacity.cookingOil}</span>
        </div>
        <div className="stat-pill" title={`${UI.STOK_GAS}: ${stock.lpgGas}/${stockCapacity.lpgGas}`}>
          <img src="/assets/images/icon_gas.png" alt="Gas" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
          <span>{stock.lpgGas}/{stockCapacity.lpgGas}</span>
        </div>
      </div>

      {/* Happiness and Members */}
      <div className="stat-pills">
        <div className={`stat-pill happiness-pill ${happinessClass}`} title={UI.KEBAHAGIAAN}>
          <span>😊</span>
          <span>{happiness}%</span>
        </div>
        <button
          className="stat-pill stat-button" 
          onClick={() => setActiveModal('pinjamanAktifList')} // Open member/active loan detail
          title={UI.ANGGOTA}
        >
          <img src="/assets/images/icon_anggota.png" alt="Anggota" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
          <span>{memberCount}</span>
        </button>
      </div>

      {/* Saldo / Money */}
      <div className="stat-pill money-pill">
        <img src="/assets/images/icon_uang.png" alt="Saldo" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
        <span>{formatRupiah(money)}</span>
      </div>
    </div>
  );
}
