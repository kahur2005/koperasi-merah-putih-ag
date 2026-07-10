import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { UI } from '../../constants/uiStrings';
import { formatRupiah } from '../../utils/formatRupiah';
import { getCombinedStockLabel } from './dashboardViewModel';

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
        <div className="top-ledger-item top-ledger-stock"><dt>Stok</dt><dd>{getCombinedStockLabel(stock, stockCapacity)}</dd></div>
      </dl>
    </header>
  );
}
