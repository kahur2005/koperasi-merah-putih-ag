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

  // Keep the color treatment tied to the live happiness threshold.
  let happinessClass = 'happiness-yellow';
  if (happiness >= 60) happinessClass = 'happiness-green';
  else if (happiness < 30) happinessClass = 'happiness-red';

  return (
    <header className="top-bar top-ledger" aria-label="Ringkasan koperasi">
      <dl className="top-ledger-items">
        <div className="top-ledger-item top-ledger-saldo"><dt>{UI.SALDO}</dt><dd>{formatRupiah(money)}</dd></div>
        <div className={`top-ledger-item top-ledger-happiness ${happinessClass}`}><dt>{UI.KEBAHAGIAAN}</dt><dd>{happiness}%</dd></div>
        <div className="top-ledger-item top-ledger-members"><dt>{UI.ANGGOTA}</dt><dd><button onClick={() => setActiveModal('pinjamanAktifList')} title={UI.ANGGOTA}>{memberCount}</button></dd></div>
        <div className="top-ledger-item top-ledger-stock">
          <dt>Stok</dt>
          <dd style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title="Beras">
              <img src="/assets/images/icon_beras.png" alt="Beras" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
              <span>{stock.rice || 0}/{stockCapacity.rice || 0}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title="Minyak">
              <img src="/assets/images/icon_minyak.png" alt="Minyak" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
              <span>{stock.cookingOil || 0}/{stockCapacity.cookingOil || 0}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title="Gas LPG">
              <img src="/assets/images/icon_gas.png" alt="Gas LPG" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
              <span>{stock.lpgGas || 0}/{stockCapacity.lpgGas || 0}</span>
            </div>
          </dd>
        </div>
      </dl>
    </header>
  );
}
