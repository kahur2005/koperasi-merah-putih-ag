const SAVE_SCHEMA_VERSION = 1;

const SAVE_STATE_KEYS = [
  'currentDate',
  'dayNumber',
  'money',
  'happiness',
  'memberCount',
  'members',
  'pendingApplications',
  'stock',
  'stockCapacity',
  'sellingPrices',
  'furniture',
  'storeSize',
  'furniturePositions',
  'monthlyPaymentPreset',
  'loanCapacityMultiplier',
  'activeLoans',
  'completedLoans',
  'pendingLoanRequests',
  'loanSchedule',
  'supplierStockPT',
  'supplierStockUMKM',
  'supplierPricesUMKM',
  'purchasePrices',
  'activeEvents',
  'eventLog',
  'boughtFromUMKMToday',
  'gagalPanenDay',
  'krisisStartDay',
  'krisisDaysRemaining',
  'gamePhase',
  'currentView',
  'storyIntroSeen',
  'dayReport',
  'currentStoryMoment',
  'storyQueue',
  'storyFlags',
  'pendingMorningStoryMoments',
  'statistics',
  'gameOver',
  'gameResult',
];

const FINITE_NUMBER_KEYS = new Set(['dayNumber', 'money', 'happiness', 'memberCount']);

function cloneValue(value) {
  if (value === undefined) return undefined;
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function normalizeRuntimeState(snapshot) {
  if (snapshot.gamePhase === 'managerMode') {
    return {
      ...snapshot,
      gamePhase: 'readyToOpen',
      managerSession: null,
    };
  }
  return snapshot;
}

export function createGameSaveSnapshot(state) {
  const snapshot = {
    saveSchemaVersion: SAVE_SCHEMA_VERSION,
  };

  for (const key of SAVE_STATE_KEYS) {
    const value = state[key];
    if (value === undefined) continue;
    if (FINITE_NUMBER_KEYS.has(key) && !Number.isFinite(value)) continue;
    snapshot[key] = cloneValue(value);
  }

  return normalizeRuntimeState(snapshot);
}

export function createGameLoadPatch(savedState) {
  if (!savedState || typeof savedState !== 'object' || Array.isArray(savedState)) {
    return {};
  }

  const patch = {};
  for (const key of SAVE_STATE_KEYS) {
    const value = savedState[key];
    if (value === undefined) continue;
    if (FINITE_NUMBER_KEYS.has(key) && !Number.isFinite(value)) continue;
    patch[key] = cloneValue(value);
  }

  return normalizeRuntimeState(patch);
}

export const gameSaveAdapterInternals = {
  SAVE_SCHEMA_VERSION,
  SAVE_STATE_KEYS,
};
