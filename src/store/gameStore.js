import { create } from 'zustand';
import dayjs from 'dayjs';
import {
  GAME,
  MEMBERS,
  LOANS,
  SUPPLIERS,
  FURNITURE,
  STORE,
  PRICE_CONTROL,
  HAPPINESS,
  EVENTS,
  WIN_CONDITIONS,
} from '../constants/gameConstants.js';
import { NPC_DATABASE } from '../data/npcData.js';
import { randomInt, pickRandom, shuffleArray, seededRandom } from '../utils/random.js';
import { clampStorePosition } from '../utils/storeBounds.js';

// ─── Helper: clamp happiness between 0 and 100 ────────────────────────────────
const clamp = (val, min = 0, max = 100) => Math.max(min, Math.min(max, val));

// ─── Helper: generate a unique id ─────────────────────────────────────────────
let _uid = 0;
const uid = () => `${Date.now()}-${++_uid}`;

const displayName = (person) => person?.nama || person?.name || person?.memberName || person?.namaAnggota || 'Warga Desa';
const ITEM_LABELS = {
  rice: 'beras',
  cookingOil: 'minyak goreng',
  lpgGas: 'gas LPG',
};

const storyMomentPatch = (state, id, moment) => {
  if (state.storyFlags[id]) return {};

  const storyMoment = {
    id,
    tone: 'normal',
    ...moment,
  };
  const nextQueue = state.currentStoryMoment
    ? [...state.storyQueue, storyMoment]
    : state.storyQueue;

  return {
    storyFlags: { ...state.storyFlags, [id]: true },
    currentStoryMoment: state.currentStoryMoment || storyMoment,
    storyQueue: nextQueue,
  };
};

const createStoryMoment = (id, moment) => ({
  id,
  tone: 'normal',
  ...moment,
});

// ─── Initial state factory ────────────────────────────────────────────────────
const createInitialState = () => ({
  // Time
  currentDate: GAME.START_DATE, // '2026-01-01'
  dayNumber: 1,

  // Resources
  money: GAME.STARTING_MONEY, // 5,000,000
  happiness: GAME.STARTING_HAPPINESS, // 50

  // Members
  memberCount: 0,
  members: [],
  pendingApplications: [],

  // Inventory
  stock: { ...GAME.STARTING_STOCK }, // { rice: 20, cookingOil: 20, lpgGas: 20 }
  stockCapacity: { rice: 0, cookingOil: 0, lpgGas: 0 },
  sellingPrices: { rice: 16000, cookingOil: 29000, lpgGas: 35000 },

  // Furniture / Store
  furniture: {
    riceRack: 0,
    oilRack: 0,
    goodsRack: 0,
    cashier: 0,
    carpet: 0,
    indoorPlant: 0,
    prabowoPicture: 0,
  },
  storeSize: 'small',
  furniturePositions: [],
  placementMode: null, // { type, rotation, color, price }
  managerSession: null,
  monthlyPaymentPreset: 'normal',
  loanCapacityMultiplier: 1,

  // Loans
  activeLoans: [],
  completedLoans: [],
  pendingLoanRequests: [],
  loanSchedule: [],

  // Suppliers
  supplierStockPT: { ...SUPPLIERS.PT.dailyStock },
  supplierStockUMKM: { ...SUPPLIERS.UMKM.baseDailyStock },
  supplierPricesUMKM: { ...SUPPLIERS.UMKM.basePrices },

  // Purchase cost tracking (for margin / happiness calculations)
  purchasePrices: {
    rice: { lastPT: 15000, lastUMKM: 16000 },
    cookingOil: { lastPT: 27000, lastUMKM: 29000 },
    lpgGas: { lastPT: 30000, lastUMKM: 35000 },
  },

  // Events
  activeEvents: [],
  eventLog: [],
  boughtFromUMKMToday: false,
  gagalPanenDay: 15, // pre-scheduled for Jan 15th
  krisisStartDay: 8, // pre-scheduled for Jan 8th
  krisisDaysRemaining: 0,

  // UI state
  gamePhase: 'storeOpen',
  currentView: 'dashboard',
  activeModal: null,
  restockFocusItem: null,
  storyIntroSeen: false,
  notifications: [],
  selectedNpc: null,
  selectedLoan: null,
  dayReport: null,
  currentStoryMoment: null,
  storyQueue: [],
  storyFlags: {},
  pendingMorningStoryMoments: [],

  // Statistics
  statistics: {
    totalItemsSold: 0,
    totalLoansGiven: 0,
    totalLoansSuccessful: 0,
  },

  // End-game
  gameOver: false,
  gameResult: null,
});

// ─── Zustand Store ────────────────────────────────────────────────────────────
export const useGameStore = create((set, get) => ({
  ...createInitialState(),

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║  1-6 — UI / Navigation Actions                                          ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  /** 1. setView */
  setView: (view) => set({ currentView: view }),

  /** 2. setActiveModal */
  setActiveModal: (modal) => set({
    activeModal: modal,
    ...(modal !== 'pasar' ? { restockFocusItem: null } : {}),
  }),

  /** 2a. openRestockPanel */
  openRestockPanel: (item = null) => set({ activeModal: 'pasar', restockFocusItem: item }),

  /** 2b. openStoreForDay */
  openStoreForDay: () =>
    set((state) => {
      const pendingMoments = state.pendingMorningStoryMoments || [];
      const [firstMoment, ...remainingMoments] = pendingMoments;
      const managerPrompt = createStoryMoment(`manager_prompt_${state.dayNumber}`, {
        speaker: 'Bu Siti',
        title: 'Pilih cara membuka toko',
        text: state.dayNumber <= 2
          ? 'Setelah restok, coba masuk ke toko 3D dan layani warga langsung sebagai pengelola. Kalau ingin cepat, hari berikutnya kamu juga bisa memakai simulasi.'
          : 'Pasokan sudah siap. Kamu bisa masuk ke toko 3D untuk melayani warga langsung, atau memakai simulasi harian dari layar utama.',
        avatar: '/assets/avatars/female_1_siti.jpg',
        actionLabel: 'Masuk Toko 3D',
        actionView: 'store3d',
      });
      const queuedMoments = [...(firstMoment ? pendingMoments : []), managerPrompt];
      const [nextMoment, ...remainingQueuedMoments] = queuedMoments;

      return {
        gamePhase: 'readyToOpen',
        activeModal: null,
        restockFocusItem: null,
        pendingMorningStoryMoments: [],
        ...(nextMoment
          ? {
              currentStoryMoment: state.currentStoryMoment || nextMoment,
              storyQueue: state.currentStoryMoment
                ? [...state.storyQueue, ...queuedMoments]
                : [...state.storyQueue, ...remainingQueuedMoments],
            }
          : {}),
      };
    }),

  /** 2c. completeStoryIntro */
  completeStoryIntro: () =>
    set((state) => ({
      storyIntroSeen: true,
      gamePhase: 'setupStore',
      currentView: 'store3d',
      ...storyMomentPatch(state, 'welcome_mission', {
        speaker: 'Bu Siti',
        title: 'Susun toko pertama',
        text: 'Mulai dari toko kecil dulu. Masuk ke koperasi 3D, pasang minimal satu kasir dan satu rak agar warga bisa dilayani.',
        avatar: '/assets/avatars/female_1_siti.jpg',
        actionLabel: 'Masuk Toko',
        actionView: 'store3d',
      }),
    })),

  /** 2c. dismissStoryMoment */
  dismissStoryMoment: () =>
    set((state) => {
      const [nextMoment, ...remainingQueue] = state.storyQueue;
      return {
        currentStoryMoment: nextMoment || null,
        storyQueue: remainingQueue,
      };
    }),

  /** 2d. openStoryMoment */
  openStoryMoment: (moment) =>
    set((state) => ({
      currentStoryMoment: {
        id: uid(),
        tone: 'normal',
        ...moment,
      },
      storyQueue: state.storyQueue,
    })),

  /** 3. setSelectedNpc */
  setSelectedNpc: (npc) => set({ selectedNpc: npc }),

  /** 4. setSelectedLoan */
  setSelectedLoan: (loan) => set({ selectedLoan: loan }),

  /** 5. addNotification */
  addNotification: (message) => {
    const id = uid();
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id, text: message },
      ],
    }));
    setTimeout(() => {
      get().dismissNotification(id);
    }, 2000);
  },

  /** 6. dismissNotification */
  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║  7-8 — Member Management                                                ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  /** 7. acceptMember */
  acceptMember: (npcId) =>
    set((state) => {
      const npc = state.pendingApplications.find((a) => a.id === npcId);
      if (!npc) return {};

      const newMembers = [...state.members, { ...npc, joinDate: state.currentDate, hasAppliedForLoan: false }];
      const newPending = state.pendingApplications.filter((a) => a.id !== npcId);
      const newMemberCount = state.memberCount + 1;

      // Recalculate stock capacity based on furniture
      const newStockCapacity = recalcStockCapacity(state.furniture);

      // Schedule a loan for 1-5 days later
      const loanDelay = randomInt(1, 5);
      const scheduledDay = state.dayNumber + loanDelay;
      const loanTemplate = pickRandom(npc.loanTemplates);

      const scheduledLoan = {
        dayNumber: scheduledDay,
        memberId: npc.id,
        memberName: npc.nama || npc.name,
        jumlahPinjaman: loanTemplate.jumlah,
        tenorBulan: loanTemplate.tenor,
        alasan: loanTemplate.tujuan,
        barangTerkait: loanTemplate.barangTerkait || null,
      };

      const newLoanSchedule = [...state.loanSchedule, scheduledLoan];

      return {
        members: newMembers,
        pendingApplications: newPending,
        memberCount: newMemberCount,
        stockCapacity: newStockCapacity,
        loanSchedule: newLoanSchedule,
        notifications: [
          ...state.notifications,
          { id: uid(), text: `${displayName(npc)} telah diterima sebagai anggota koperasi!` },
        ],
        ...storyMomentPatch(state, `member_${newMemberCount}`, {
          speaker: displayName(npc),
          title: newMemberCount === 1 ? 'Anggota pertama bergabung' : 'Kepercayaan mulai tumbuh',
          text: newMemberCount === 1
            ? 'Saya ikut koperasi karena ingin harga yang adil dan tempat usaha kecil bisa dibantu.'
            : `Sekarang sudah ${newMemberCount} anggota. Semakin ramai, semakin kuat simpanan dan jaringan koperasi.`,
          avatar: npc.avatar,
          actionLabel: 'Lihat Buku Kerja',
          actionModal: 'kalender',
        }),
      };
    }),

  /** 8. denyMember */
  denyMember: (npcId) =>
    set((state) => ({
      pendingApplications: state.pendingApplications.filter((a) => a.id !== npcId),
    })),

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║  9-10 — Loan Management                                                 ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  /** 9. approveLoan */
  approveLoan: (loanId) =>
    set((state) => {
      const loanReq = state.pendingLoanRequests.find((l) => l.id === loanId);
      if (!loanReq) return {};
      if (!Number.isFinite(loanReq.jumlahPinjaman) || loanReq.jumlahPinjaman <= 0) return {};
      if (state.money < loanReq.jumlahPinjaman) return {}; // Saldo tidak cukup

      // Interest is fixed at 6% p.a., tenor is 1 month. Total repayment = Pokok + (Pokok * 0.005)
      const cicilanPerBulan = Math.round(loanReq.jumlahPinjaman * 1.005);

      const activeLoan = {
        id: uid(),
        memberId: loanReq.memberId,
        namaAnggota: loanReq.memberName,
        avatar: state.members.find((m) => m.id === loanReq.memberId)?.avatar,
        pekerjaanAnggota: state.members.find((m) => m.id === loanReq.memberId)?.pekerjaan,
        jumlahPinjaman: loanReq.jumlahPinjaman,
        tenorBulan: loanReq.tenorBulan, // typically 1
        sisaBulan: loanReq.tenorBulan,
        bungaPersen: 6,
        cicilanPerBulan,
        tujuanPinjaman: loanReq.alasan,
        barangTerkait: loanReq.barangTerkait,
        status: 'aktif',
        startDate: state.currentDate,
      };

      const newMoney = state.money - loanReq.jumlahPinjaman;
      const newHappiness = clamp(state.happiness); // No penalty for standard 6% interest

      return {
        pendingLoanRequests: state.pendingLoanRequests.filter((l) => l.id !== loanId),
        activeLoans: [...state.activeLoans, activeLoan],
        money: newMoney,
        happiness: newHappiness,
        statistics: {
          ...state.statistics,
          totalLoansGiven: state.statistics.totalLoansGiven + 1,
        },
        notifications: [
          ...state.notifications,
          { id: uid(), text: `Pinjaman Rp ${loanReq.jumlahPinjaman.toLocaleString('id-ID')} disetujui.` },
        ],
      };
    }),

  /** 10. denyLoan */
  denyLoan: (loanId) =>
    set((state) => ({
      pendingLoanRequests: state.pendingLoanRequests.filter((l) => l.id !== loanId),
    })),

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║  11-12 — Supply Chain                                                   ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  /** 11. buySupply */
  buySupply: (supplier, item, quantity) =>
    set((state) => {
      if (state.gamePhase !== 'restockPhase') return {};
      if (!Number.isInteger(quantity) || quantity <= 0) return {};
      if (!state.stock[item] && state.stock[item] !== 0) return {};
      if (supplier !== 'PT' && supplier !== 'UMKM') return {};

      // Determine supplier stock & prices
      const isPT = supplier === 'PT';
      const supplierStock = isPT ? state.supplierStockPT : state.supplierStockUMKM;
      const prices = isPT ? SUPPLIERS.PT.prices : state.supplierPricesUMKM;
      const unitPrice = prices[item];
      const totalCost = unitPrice * quantity;

      // Validations
      const spaceAvailable = state.stockCapacity[item] - state.stock[item];
      if (quantity > spaceAvailable) return {};
      if (totalCost > state.money) return {};
      if (quantity > supplierStock[item]) return {};

      // Update stock
      const newStock = { ...state.stock, [item]: state.stock[item] + quantity };

      // Update supplier stock
      const newSupplierStock = { ...supplierStock, [item]: supplierStock[item] - quantity };
      const supplierStockKey = isPT ? 'supplierStockPT' : 'supplierStockUMKM';

      // Track purchase price
      const priceKey = isPT ? 'lastPT' : 'lastUMKM';
      const newPurchasePrices = {
        ...state.purchasePrices,
        [item]: {
          ...state.purchasePrices[item],
          [priceKey]: unitPrice,
        },
      };

      // Happiness: +2 UMKM, -2 PT
      const happinessDelta = isPT ? -2 : 2;
      const newHappiness = clamp(state.happiness + happinessDelta);

      // Track UMKM purchase for Gagal Panen
      const newBoughtFromUMKM = isPT ? state.boughtFromUMKMToday : true;

      return {
        money: state.money - totalCost,
        stock: newStock,
        [supplierStockKey]: newSupplierStock,
        purchasePrices: newPurchasePrices,
        happiness: newHappiness,
        boughtFromUMKMToday: newBoughtFromUMKM,
        ...(!isPT
          ? storyMomentPatch(state, 'first_umkm_purchase', {
              speaker: 'Pak Dedi',
              title: 'UMKM desa ikut bergerak',
              text: 'Koperasi yang membeli dari UMKM membuat uang berputar di desa. Harganya bisa naik turun, tapi dampaknya besar untuk warga.',
              avatar: '/assets/avatars/male_4_dedi.jpg',
              tone: 'success',
              actionLabel: 'Atur Harga',
              actionModal: 'harga',
            })
          : {}),
      };
    }),

  /** 11b. autoRestockSupply */
  autoRestockSupply: (supplier, item) =>
    set((state) => {
      if (state.gamePhase !== 'restockPhase') return {};
      if (!state.stock[item] && state.stock[item] !== 0) return {};
      if (supplier !== 'PT' && supplier !== 'UMKM') return {};

      const isPT = supplier === 'PT';
      const supplierStock = isPT ? state.supplierStockPT : state.supplierStockUMKM;
      const prices = isPT ? SUPPLIERS.PT.prices : state.supplierPricesUMKM;
      const unitPrice = prices[item];
      const needed = Math.max(0, state.stockCapacity[item] - state.stock[item]);
      const affordable = unitPrice > 0 ? Math.floor(state.money / unitPrice) : 0;
      const quantity = Math.min(needed, supplierStock[item] || 0, affordable);

      if (quantity <= 0) {
        return {
          notifications: [
            ...state.notifications,
            {
              id: uid(),
              text: needed <= 0
                ? 'Stok sudah penuh. Tidak perlu restok otomatis.'
                : 'Restok otomatis gagal: saldo, kapasitas, atau stok pemasok tidak cukup.',
            },
          ],
        };
      }

      const totalCost = unitPrice * quantity;
      const newStock = { ...state.stock, [item]: state.stock[item] + quantity };
      const newSupplierStock = { ...supplierStock, [item]: supplierStock[item] - quantity };
      const supplierStockKey = isPT ? 'supplierStockPT' : 'supplierStockUMKM';
      const priceKey = isPT ? 'lastPT' : 'lastUMKM';
      const newPurchasePrices = {
        ...state.purchasePrices,
        [item]: {
          ...state.purchasePrices[item],
          [priceKey]: unitPrice,
        },
      };

      const happinessDelta = isPT ? -2 : 2;
      const newBoughtFromUMKM = isPT ? state.boughtFromUMKMToday : true;
      const fullyRestocked = quantity === needed;
      const itemLabel = {
        rice: 'beras',
        cookingOil: 'minyak goreng',
        lpgGas: 'gas LPG',
      }[item] || 'barang';

      return {
        money: state.money - totalCost,
        stock: newStock,
        [supplierStockKey]: newSupplierStock,
        purchasePrices: newPurchasePrices,
        happiness: clamp(state.happiness + happinessDelta),
        boughtFromUMKMToday: newBoughtFromUMKM,
        notifications: [
          ...state.notifications,
          {
            id: uid(),
            text: fullyRestocked
              ? `Restok otomatis mengisi penuh ${itemLabel}: ${quantity} unit.`
              : `Restok otomatis hanya membeli ${quantity}/${needed} unit ${itemLabel} karena batas saldo atau stok pemasok.`,
          },
        ],
      };
    }),

  /** 12. setSellingPrice */
  setSellingPrice: (item, price) =>
    set((state) => {
      if (!state.sellingPrices[item] && state.sellingPrices[item] !== 0) return {};
      if (!Number.isFinite(price) || price < 0) return {};

      return {
        sellingPrices: { ...state.sellingPrices, [item]: price },
      };
    }),

  /** 12b. startSalesSimulation */
  startSalesSimulation: () => {
    const state = get();
    if (state.gamePhase !== 'readyToOpen' && state.gamePhase !== 'storeOpen') return;
    if (!isStoreReadyToOpen(state)) {
      set({
        notifications: [
          ...state.notifications,
          { id: uid(), text: 'Pasang kasir, rak, dan isi stok sebelum membuka toko.' },
        ],
      });
      return;
    }
    set({ gamePhase: 'storeOpen', activeModal: null, currentView: 'dashboard' });
    get().endDay();
  },

  /** 12c. startManagerMode */
  startManagerMode: () =>
    set((state) => {
      if (state.gamePhase !== 'readyToOpen') return {};
      if (!isStoreReadyToOpen(state)) {
        return {
          notifications: [
            ...state.notifications,
            { id: uid(), text: 'Pasang kasir, rak, dan isi stok sebelum membuka toko.' },
          ],
        };
      }

      const cashierCount = Math.max(1, state.furniture.cashier || 0);
      const totalCustomers = randomInt(5 * cashierCount, 10 * cashierCount);
      const availableItems = Object.keys(state.stock).filter((item) => state.stock[item] > 0);
      const customerQueue = Array.from({ length: totalCustomers }, (_, index) => ({
        id: `customer-${state.dayNumber}-${index + 1}`,
        item: pickRandom(availableItems),
      }));

      return {
        gamePhase: 'managerMode',
        currentView: 'store3d',
        activeModal: null,
        currentStoryMoment: null,
        storyQueue: state.storyQueue,
        managerSession: {
          startedAt: Date.now(),
          durationSeconds: 60,
          totalCustomers,
          customerQueue,
          currentIndex: 0,
          served: 0,
          wrong: 0,
          missed: 0,
          revenue: 0,
          feedback: '',
          salesBreakdown: createEmptySalesBreakdown(),
          applicantsGenerated: 0,
        },
      };
    }),

  /** 12d. serveManagerCustomer */
  serveManagerCustomer: (item) =>
    set((state) => {
      if (state.gamePhase !== 'managerMode' || !state.managerSession) return {};

      const session = state.managerSession;
      const request = session.customerQueue[session.currentIndex];
      if (!request) return {};

      if (item !== request.item) {
        return {
          managerSession: {
            ...session,
            wrong: session.wrong + 1,
            feedback: `Bukan itu. Warga meminta ${ITEM_LABELS[request.item] || request.item}.`,
          },
        };
      }

      if ((state.stock[item] || 0) <= 0) {
        return {
          managerSession: {
            ...session,
            currentIndex: session.currentIndex + 1,
            missed: session.missed + 1,
            feedback: `${ITEM_LABELS[item] || item} habis. Warga pergi kecewa.`,
          },
        };
      }

      const price = state.sellingPrices[item] || 0;
      const salesBreakdown = {
        ...(session.salesBreakdown || createEmptySalesBreakdown()),
        [item]: {
          sold: ((session.salesBreakdown?.[item]?.sold) || 0) + 1,
          revenue: ((session.salesBreakdown?.[item]?.revenue) || 0) + price,
        },
      };

      return {
        stock: { ...state.stock, [item]: state.stock[item] - 1 },
        money: state.money + price,
        managerSession: {
          ...session,
          currentIndex: session.currentIndex + 1,
          served: session.served + 1,
          revenue: session.revenue + price,
          salesBreakdown,
          feedback: `Benar. ${ITEM_LABELS[item] || item} terjual.`,
        },
      };
    }),

  /** 12e. finishManagerMode */
  finishManagerMode: () =>
    set((state) => finishManagerDay(state)),

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║  13-14 — Store & Furniture                                              ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  /** 13a. startPlacement */
  startPlacement: (type, price) =>
    set((state) => {
      if (state.money < price) return {};
      const def = FURNITURE[type];
      if (state.furniture[type] >= def.maxCount) return {};
      
      return {
        placementMode: {
          type,
          rotation: 0,
          color: '#B45309', // Default Wood color
          price,
        },
      };
    }),

  /** 13b. updatePlacement */
  updatePlacement: (updates) =>
    set((state) => {
      if (!state.placementMode) return {};
      return {
        placementMode: { ...state.placementMode, ...updates },
      };
    }),

  /** 13c. cancelPlacement */
  cancelPlacement: () => set({ placementMode: null }),

  /** 13d. confirmPlacement */
  confirmPlacement: (x, y) =>
    set((state) => {
      if (!state.placementMode) return {};
      const { type, rotation, color, price } = state.placementMode;
      const def = FURNITURE[type];

      if (state.money < price) return {};
      if (state.furniture[type] >= def.maxCount) return {};

      const newFurniture = {
        ...state.furniture,
        [type]: state.furniture[type] + 1,
      };

      // Stock capacity bonus
      let newStockCapacity = { ...state.stockCapacity };
      if (def.stockBonus) {
        Object.entries(def.stockBonus).forEach(([key, val]) => {
          newStockCapacity[key] = (newStockCapacity[key] || 0) + val;
        });
      }

      // Happiness bonus (one-time on purchase)
      let happinessDelta = 0;
      if (def.happinessBonus) {
        happinessDelta = def.happinessBonus;
      }
      const newHappiness = clamp(state.happiness + happinessDelta);

      const newPositions = [
        ...state.furniturePositions,
        {
          id: uid(),
          type,
          ...clampStorePosition({ x, y }, state.storeSize, type),
          rotation,
          color,
        },
      ];
      const setupComplete = state.gamePhase === 'setupStore' && isStoreSetupComplete(newFurniture);

      return {
        money: state.money - price,
        furniture: newFurniture,
        stockCapacity: newStockCapacity,
        happiness: newHappiness,
        furniturePositions: newPositions,
        placementMode: null,
        ...(setupComplete
          ? {
              gamePhase: 'restockPhase',
              currentView: 'dashboard',
              activeModal: 'pasar',
            }
          : {}),
        notifications: [
          ...state.notifications,
          {
            id: uid(),
            text: setupComplete
              ? 'Toko siap. Buka Pasar untuk mengisi stok pertama.'
              : `Membeli ${def.label || def.name || type} untuk toko!`,
          },
        ],
        ...storyMomentPatch(state, setupComplete ? 'setup_store_complete' : `furniture_${type}`, {
          speaker: 'Bu Siti',
          title: setupComplete ? 'Toko siap diisi stok' : (type === 'cashier' ? 'Kasir siap melayani' : 'Toko makin lengkap'),
          text: setupComplete
            ? 'Kasir dan rak sudah terpasang. Sekarang kembali ke layar utama dan buka Pasar untuk restok sebelum toko dibuka.'
            : type === 'cashier'
            ? 'Dengan kasir, warga bisa mulai berbelanja setiap hari. Sekarang stok dan harga jadi keputusan penting.'
            : `${def.label || 'Furnitur baru'} membantu koperasi melayani lebih rapi dan nyaman.`,
          avatar: '/assets/avatars/female_1_siti.jpg',
          actionLabel: 'Buka Pasar',
          actionModal: 'pasar',
        }),
      };
    }),

  /** 13e. changeFurnitureColor */
  changeFurnitureColor: (id, color) =>
    set((state) => {
      const newPositions = state.furniturePositions.map((f) => {
        if (f.id === id) {
          return { ...f, color };
        }
        return f;
      });
      return { furniturePositions: newPositions };
    }),

  /** 14. upgradeStore */
  upgradeStore: () =>
    set((state) => {
      if (state.money < STORE.UPGRADE_COST) return {};
      return {
        money: state.money - STORE.UPGRADE_COST,
        storeSize: 'large',
        notifications: [
          ...state.notifications,
          { id: uid(), text: 'Toko telah di-upgrade ke ukuran besar!' },
        ],
        ...storyMomentPatch(state, 'store_upgraded', {
          speaker: 'Pak Budi',
          title: 'Koperasi naik kelas',
          text: 'Toko yang lebih besar berarti warga makin bergantung pada pengurus. Isi kapasitasnya dengan pasokan yang stabil.',
          avatar: '/assets/avatars/male_1_budi.jpg',
          tone: 'success',
          actionLabel: 'Buka Pasar',
          actionModal: 'pasar',
        }),
      };
    }),

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║  15 — endDay  (CORE SIMULATION)                                         ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  /** 15. endDay */
  endDay: () =>
    set((state) => {
      if (state.gamePhase !== 'storeOpen') return {};
      // ── a. Calculate total customers ──
      const totalCustomers =
        state.furniture.cashier * (STORE.BASE_CUSTOMERS_PER_CASHIER || 10);

      // ── b-e. Simulate customer purchases ──
      const itemKeys = Object.keys(state.stock);
      let currentStock = { ...state.stock };
      let revenue = 0;
      let happinessDelta = 0;
      const salesBreakdown = {};
      
      const validItems = [];
      itemKeys.forEach((k) => {
        salesBreakdown[k] = { sold: 0, revenue: 0 };
        if (currentStock[k] > 0) {
          const sellPrice = state.sellingPrices[k];
          const pp = state.purchasePrices[k];
          const avgCost = Math.round(((pp.lastPT || 0) + (pp.lastUMKM || 0)) / 2);
          const markupPercent = avgCost > 0 ? ((sellPrice - avgCost) / avgCost) * 100 : 0;
          
          if (markupPercent > 50) {
             happinessDelta -= 5;
          } else {
             validItems.push(k);
          }
        }
      });

      let totalItemsSoldToday = 0;

      for (let i = 0; i < totalCustomers; i++) {
        // Items with stock > 0 from the valid items
        const availableItems = validItems.filter((k) => currentStock[k] > 0);

        if (availableItems.length === 0) {
          // No items → customer leaves unhappy
          happinessDelta -= 0.5;
          continue;
        }

        // Pick random item
        const chosenItem = pickRandom(availableItems);
        currentStock[chosenItem] -= 1;

        const sellPrice = state.sellingPrices[chosenItem];
        revenue += sellPrice;
        salesBreakdown[chosenItem].sold += 1;
        salesBreakdown[chosenItem].revenue += sellPrice;
        totalItemsSoldToday += 1;

        // Calculate markup happiness effect
        const pp = state.purchasePrices[chosenItem];
        const avgCost = Math.round(((pp.lastPT || 0) + (pp.lastUMKM || 0)) / 2);
        const markupPercent = avgCost > 0 ? ((sellPrice - avgCost) / avgCost) * 100 : 0;

        if (markupPercent > 30) {
          happinessDelta -= 1; // Overpriced
        } else if (markupPercent < 5) {
          happinessDelta += 0.5; // Very fair price
        }
      }

      // ── f. Apply active event effects ──
      if (state.krisisDaysRemaining > 0) {
        // Krisis Ekonomi: if selling prices of rice, oil, gas are not below purchase prices → happiness -10
        let sellingBelowCost = true;
        ['rice', 'cookingOil', 'lpgGas'].forEach((item) => {
          const pp = state.purchasePrices[item];
          const avgCost = Math.round(((pp?.lastPT || 0) + (pp?.lastUMKM || 0)) / 2);
          if (state.sellingPrices[item] >= avgCost) {
            sellingBelowCost = false;
          }
        });
        if (!sellingBelowCost) {
          happinessDelta -= 10;
        }
      }

      // ── g. Gagal Panen check ──
      if (state.gagalPanenDay === state.dayNumber && !state.boughtFromUMKMToday) {
        happinessDelta -= 25;
      }

      // ── h. Decrement krisis days ──
      const newKrisisDaysRemaining = Math.max(0, state.krisisDaysRemaining - 1);

      // ── i. Add revenue to money ──
      const newMoney = state.money + revenue;

      // ── j. Clamp happiness ──
      const newHappiness = clamp(state.happiness + happinessDelta);

      // ── k. Create day report ──
      const dayReport = {
        playMode: 'simulation',
        dayNumber: state.dayNumber,
        date: state.currentDate,
        totalCustomers,
        totalItemsSold: totalItemsSoldToday,
        revenue,
        salesBreakdown,
        happinessChange: happinessDelta,
        happinessAfter: newHappiness,
        moneyAfter: newMoney,
        stockAfter: { ...currentStock },
        eventsActive: [...state.activeEvents],
        gagalPanenTriggered:
          state.gagalPanenDay === state.dayNumber && !state.boughtFromUMKMToday,
        krisisActive: state.krisisDaysRemaining > 0,
      };

      const memberApplicationPatch = generateCustomerApplications(
        state,
        Math.floor(totalItemsSoldToday / 3)
      );

      // ── l-m. Determine which modal to show ──
      const nextDate = dayjs(state.currentDate).add(1, 'day');
      const isEndOfMonth = dayjs(state.currentDate).endOf('month').isSame(state.currentDate, 'day');
      const modalToShow = isEndOfMonth ? 'bagiHasil' : 'laporanHarian';

      // ── n. Advance date ──
      const newDayNumber = state.dayNumber + 1;
      const newDate = nextDate.format('YYYY-MM-DD');

      // ── o. Check game over conditions ──
      let gameOver = false;
      let gameResult = null;

      if (newMoney < 0) {
        gameOver = true;
        gameResult = {
          outcome: 'lose',
          reason: 'Koperasi bangkrut! Uang kas habis.',
        };
      } else if (newHappiness <= 0) {
        gameOver = true;
        gameResult = {
          outcome: 'lose',
          reason: 'Kepuasan anggota jatuh ke nol. Koperasi ditutup paksa.',
        };
      } else if (newDayNumber > 365) {
        // Win check is handled in startNewDay on day 365
        gameOver = true;
        gameResult = {
          outcome: 'lose',
          reason: 'Waktu habis! Koperasi gagal mencapai target.',
        };
      }

      return {
        stock: currentStock,
        money: newMoney,
        happiness: newHappiness,
        krisisDaysRemaining: newKrisisDaysRemaining,
        dayReport,
        activeModal: gameOver ? 'gameOver' : modalToShow,
        gamePhase: gameOver ? state.gamePhase : 'closingReport',
        currentDate: newDate,
        dayNumber: newDayNumber,
        gameOver,
        gameResult,
        statistics: {
          ...state.statistics,
          totalItemsSold: state.statistics.totalItemsSold + totalItemsSoldToday,
        },
        ...memberApplicationPatch,
        ...(dayReport.gagalPanenTriggered
          ? storyMomentPatch(state, `harvest_missed_${state.dayNumber}`, {
              speaker: 'Pak Budi',
              title: 'Warga kecewa pada hari gagal panen',
              text: 'Saat sawah gagal panen, koperasi perlu hadir lebih dulu untuk petani. Besok, utamakan belanja UMKM saat peringatan muncul.',
              avatar: '/assets/avatars/male_1_budi.jpg',
              tone: 'danger',
              actionLabel: 'Buka Pasar',
              actionModal: 'pasar',
            })
          : totalItemsSoldToday >= 10
            ? storyMomentPatch(state, 'first_busy_day', {
                speaker: 'Bu Rina',
                title: 'Toko mulai ramai',
                text: 'Penjualan harian menunjukkan warga mulai memakai koperasi. Jaga ritme stok agar mereka tidak kembali ke toko besar.',
                avatar: '/assets/avatars/female_3_rina.jpg',
                tone: 'success',
                actionLabel: 'Lihat Buku Kerja',
                actionModal: 'kalender',
              })
            : {}),
      };
    }),

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║  16 — startNewDay                                                       ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  /** 16. startNewDay */
  startNewDay: () =>
    set((state) => {
      const today = dayjs(state.currentDate);
      const dayOfMonth = today.date();
      const isFirstOfMonth = dayOfMonth === 1;
      const morningStoryEvents = [];

      // ── a. Reset supplier stocks ──
      const newSupplierStockPT = { ...SUPPLIERS.PT.dailyStock };
      const newSupplierStockUMKM = { ...SUPPLIERS.UMKM.baseDailyStock };

      // ── b. Randomize UMKM prices ──
      const variance = SUPPLIERS.UMKM.variance || 2000;
      const newSupplierPricesUMKM = {};
      Object.entries(SUPPLIERS.UMKM.basePrices).forEach(([item, basePrice]) => {
        // Factor in any permanent price reductions from successful UMKM loans
        const currentBase = state.supplierPricesUMKM[item] || basePrice;
        // Use the lower of currentBase and basePrice as floor reference
        const effectiveBase = Math.min(currentBase, basePrice);
        newSupplierPricesUMKM[item] = effectiveBase + randomInt(-variance, variance);
      });

      // ── c. Member applications now come from served customers, not morning auto-spawns ──
      const newPendingApplications = [...state.pendingApplications];

      // ── d. Check loanSchedule for today's loan requests ──
      let newPendingLoanRequests = [...state.pendingLoanRequests];
      let newLoanSchedule = [];
      let newMembers = state.members.map(m => ({ ...m }));

      // At start of month, reset application trackers for everyone
      if (isFirstOfMonth) {
        newMembers.forEach(m => m.hasAppliedForLoan = false);
      }

      state.loanSchedule.forEach((entry) => {
        const member = newMembers.find((m) => m.id === entry.memberId);
        const isMember = !!member;
        const hasActiveLoan = state.activeLoans.some(
          (l) => l.memberId === entry.memberId && l.status === 'aktif'
        );
        const hasPendingLoan = newPendingLoanRequests.some(
          (l) => l.memberId === entry.memberId
        );
        const alreadyApplied = member?.hasAppliedForLoan;

        if (entry.dayNumber <= state.dayNumber) {
          if (isMember && !hasActiveLoan && !hasPendingLoan && !alreadyApplied) {
            // Check if we hit the limit of requests on the dashboard
            const MAX_REQUESTS = 2; // Keep max loan requests at 2 for the HUD
            if (newPendingLoanRequests.length < MAX_REQUESTS) {
              const loanRequest = {
                id: uid(),
                memberId: entry.memberId,
                memberName: entry.memberName,
                avatar: member ? member.avatar : null,
                pekerjaan: member ? member.pekerjaan : null,
                pendapatanBulanan: member ? member.pendapatanBulanan : 0,
                jumlahPinjaman: entry.jumlahPinjaman,
                tenorBulan: entry.tenorBulan,
                alasan: entry.alasan,
                barangTerkait: entry.barangTerkait || null,
                requestDate: state.currentDate,
              };
              newPendingLoanRequests.push(loanRequest);
              morningStoryEvents.push({
                type: 'loanRequest',
                dayNumber: state.dayNumber,
                loan: loanRequest,
              });
              // Mark member as having applied
              if (member) member.hasAppliedForLoan = true;
            } else {
              // Keep for tomorrow if HUD is full
              newLoanSchedule.push(entry);
            }
          }
        } else {
          // Not yet due
          newLoanSchedule.push(entry);
        }
      });

      // ── e. First-of-month processing ──
      let money = state.money;
      let newActiveLoans = [...state.activeLoans];
      let newCompletedLoans = [...state.completedLoans];
      let happinessDelta = 0;
      let statsUpdate = { ...state.statistics };
      let umkmPriceAdjustments = {};
      let umkmStockAdjustments = {};
      let monthlyNotifications = [];

      if (isFirstOfMonth && state.memberCount > 0) {
        morningStoryEvents.push({
          type: 'monthlyMeeting',
          dayNumber: state.dayNumber,
        });
      }

      if (isFirstOfMonth && state.memberCount > 0 && state.gamePhase !== 'monthlyMeeting') {
        // Monthly savings are now decided by the player in the monthly meeting.
      } else if (isFirstOfMonth && state.memberCount > 0) {
        // Collect savings: money += memberCount * MEMBERS.MONTHLY_SAVING
        const savings = state.memberCount * (MEMBERS.MONTHLY_SAVING || 50000);
        money += savings;
        monthlyNotifications.push({
          id: uid(),
          text: `Simpanan bulanan terkumpul: Rp ${savings.toLocaleString('id-ID')} dari ${state.memberCount} anggota.`,
        });

        // Process loan repayments
        const stillActive = [];
        newActiveLoans.forEach((loan) => {
          if (loan.status !== 'aktif') {
            stillActive.push(loan);
            return;
          }

          money += loan.cicilanPerBulan;
          const updatedLoan = {
            ...loan,
            totalTerbayar: loan.totalTerbayar + loan.cicilanPerBulan,
            sisaBulan: loan.sisaBulan - 1,
          };

          if (updatedLoan.sisaBulan <= 0) {
            // Loan term complete — 100% chance of success
            const isSuccess = true;
            if (isSuccess) {
              updatedLoan.status = 'lunas';
              statsUpdate = {
                ...statsUpdate,
                totalLoansSuccessful: statsUpdate.totalLoansSuccessful + 1,
              };

              // If barangTerkait (related good): reduce UMKM base price by 2%, increase stock by 5
              if (updatedLoan.barangTerkait) {
                const relatedItem = updatedLoan.barangTerkait;
                const currentBasePrice = state.supplierPricesUMKM[relatedItem];
                const priceReduction = Math.round(currentBasePrice * 0.02);
                
                umkmPriceAdjustments[relatedItem] =
                  (umkmPriceAdjustments[relatedItem] || 0) - priceReduction;
                umkmStockAdjustments[relatedItem] =
                  (umkmStockAdjustments[relatedItem] || 0) + 5;
              }

              monthlyNotifications.push({
                id: uid(),
                text: `Pinjaman ${updatedLoan.namaAnggota} lunas! Kapasitas UMKM +5, Harga -2%.`,
              });
            } else {
              updatedLoan.status = 'gagal';
              monthlyNotifications.push({
                id: uid(),
                text: `Pinjaman ${updatedLoan.namaAnggota} selesai tapi usaha kurang berhasil.`,
              });
            }
            newCompletedLoans.push(updatedLoan);
          } else {
            stillActive.push(updatedLoan);
          }
        });
        newActiveLoans = stillActive;
      }

      // Apply UMKM adjustments from successful loans
      const adjustedUMKMPrices = { ...newSupplierPricesUMKM };
      const adjustedUMKMStock = { ...newSupplierStockUMKM };
      Object.entries(umkmPriceAdjustments).forEach(([item, delta]) => {
        if (adjustedUMKMPrices[item] !== undefined) {
          adjustedUMKMPrices[item] = Math.max(1000, adjustedUMKMPrices[item] + delta);
        }
      });
      Object.entries(umkmStockAdjustments).forEach(([item, delta]) => {
        if (adjustedUMKMStock[item] !== undefined) {
          adjustedUMKMStock[item] += delta;
        }
      });

      // ── f. Generate loanSchedule at start of each month ──
      if (isFirstOfMonth) {
        const monthlySchedule = generateMonthlyLoanSchedule(
          today,
          newMembers,
          state.activeLoans,
          state.dayNumber
        );
        newLoanSchedule = [...newLoanSchedule, ...monthlySchedule];
      }

      // ── g. Check and schedule events ──
      let newGagalPanenDay = state.gagalPanenDay;
      let newKrisisStartDay = state.krisisStartDay;
      let newKrisisDaysRemaining = state.krisisDaysRemaining;
      let newActiveEvents = [...state.activeEvents];
      let newEventLog = [...state.eventLog];

      // Gagal Panen: random day 10-20 each month (schedule on 1st)
      if (isFirstOfMonth) {
        const gagalDay = randomInt(10, 20);
        // Calculate the absolute day number for this event
        const daysInMonth = today.daysInMonth();
        const gagalAbsoluteDay = state.dayNumber + gagalDay - 1;
        newGagalPanenDay = gagalAbsoluteDay;
      }

      // Krisis Ekonomi: every month, random start, 7 days
      if (isFirstOfMonth) {
        const currentMonth = today.month() + 1; // 1-indexed
        if (state.krisisDaysRemaining <= 0) {
          const krisisStartOffset = randomInt(1, 15);
          newKrisisStartDay = state.dayNumber + krisisStartOffset;
          newActiveEvents = newActiveEvents.filter((e) => e.type !== 'krisisEkonomi');
          newEventLog.push({
            type: 'krisisEkonomi',
            scheduledDay: newKrisisStartDay,
            month: currentMonth,
          });
        }
      }

      // Activate Krisis if today is the start day
      if (state.dayNumber === newKrisisStartDay && newKrisisDaysRemaining <= 0) {
        newKrisisDaysRemaining = EVENTS?.KRISIS_EKONOMI?.durationDays || 7;
        if (!newActiveEvents.some((e) => e.type === 'krisisEkonomi')) {
          newActiveEvents.push({
            type: 'krisisEkonomi',
            startDay: state.dayNumber,
            daysRemaining: newKrisisDaysRemaining,
          });
        }
        monthlyNotifications.push({
          id: uid(),
          text: '⚠️ KRISIS EKONOMI! Harga-harga melonjak selama 7 hari. Jual di bawah harga beli untuk menjaga kepuasan!',
        });
        morningStoryEvents.push({
          type: 'krisisEkonomi',
          dayNumber: state.dayNumber,
        });
      }

      // Activate Gagal Panen notification and price hike if today
      if (state.dayNumber === newGagalPanenDay) {
        if (!newActiveEvents.some((e) => e.type === 'gagalPanen')) {
          newActiveEvents.push({
            type: 'gagalPanen',
            day: state.dayNumber,
          });
        }
        
        // Increase UMKM price for rice by 50%
        if (adjustedUMKMPrices['rice'] !== undefined) {
          adjustedUMKMPrices['rice'] = Math.round(adjustedUMKMPrices['rice'] * 1.5);
        }

        monthlyNotifications.push({
          id: uid(),
          text: '🌾 GAGAL PANEN! Harga beras UMKM naik 50%. Beli dari UMKM hari ini untuk mendukung petani!',
        });
        morningStoryEvents.push({
          type: 'gagalPanen',
          dayNumber: state.dayNumber,
        });
      }

      const pendingMorningStoryMoments = buildMorningStoryMoments(morningStoryEvents);
      let storyPatch = storyMomentPatch(state, `restock_${state.dayNumber}`, {
        speaker: 'Bu Siti',
        title: 'Waktunya restok pasokan',
        text: 'Toko sudah tutup. Sebelum hari baru dibuka, isi kembali beras, minyak, dan gas LPG lewat pembelian manual atau otomatis agar warga tidak kecewa besok.',
        avatar: '/assets/avatars/female_1_siti.jpg',
        tone: 'success',
      });

      // Clean up expired events
      if (newKrisisDaysRemaining <= 0) {
        newActiveEvents = newActiveEvents.filter((e) => e.type !== 'krisisEkonomi');
      }
      // Gagal panen is a single-day event — clean up previous
      if (state.dayNumber !== newGagalPanenDay) {
        newActiveEvents = newActiveEvents.filter((e) => e.type !== 'gagalPanen');
      }

      // ── h. Reset boughtFromUMKMToday ──
      const resetBoughtFromUMKM = false;

      // ── i. Close modal ──
      // (will be set below)

      // ── j. Check win condition on day 365 ──
      let gameOver = state.gameOver;
      let gameResult = state.gameResult;
      if (state.dayNumber >= 365 && !state.gameOver) {
        const wc = WIN_CONDITIONS || {};
        const moneyGoal = wc.MONEY || 50000000;
        const happinessGoal = wc.HAPPINESS || 70;
        const memberGoal = wc.MEMBERS || 50;

        if (
          money >= moneyGoal &&
          clamp(state.happiness + happinessDelta) >= happinessGoal &&
          state.memberCount >= memberGoal
        ) {
          gameOver = true;
          gameResult = {
            outcome: 'win',
            reason: 'Selamat! Koperasi Merah Putih berhasil mencapai semua target!',
            stats: {
              finalMoney: money,
              finalHappiness: clamp(state.happiness + happinessDelta),
              finalMembers: state.memberCount,
              totalItemsSold: state.statistics.totalItemsSold,
              totalLoansGiven: state.statistics.totalLoansGiven,
              totalLoansSuccessful: statsUpdate.totalLoansSuccessful,
            },
          };
        } else {
          gameOver = true;
          gameResult = {
            outcome: 'lose',
            reason: 'Waktu habis! Target koperasi belum tercapai.',
            stats: {
              finalMoney: money,
              finalHappiness: clamp(state.happiness + happinessDelta),
              finalMembers: state.memberCount,
              moneyGoal,
              happinessGoal,
              memberGoal,
            },
          };
        }
      }

      const newHappiness = clamp(state.happiness + happinessDelta);

      return {
        members: newMembers,
        supplierStockPT: newSupplierStockPT,
        supplierStockUMKM: adjustedUMKMStock,
        supplierPricesUMKM: adjustedUMKMPrices,
        pendingApplications: newPendingApplications,
        pendingLoanRequests: newPendingLoanRequests,
        money,
        activeLoans: newActiveLoans,
        completedLoans: newCompletedLoans,
        loanSchedule: newLoanSchedule,
        gagalPanenDay: newGagalPanenDay,
        krisisStartDay: newKrisisStartDay,
        krisisDaysRemaining: newKrisisDaysRemaining,
        activeEvents: newActiveEvents,
        eventLog: newEventLog,
        boughtFromUMKMToday: resetBoughtFromUMKM,
        activeModal: gameOver ? 'gameOver' : (isFirstOfMonth && state.memberCount > 0 ? 'monthlyMeeting' : 'pasar'),
        gamePhase: gameOver ? state.gamePhase : (isFirstOfMonth && state.memberCount > 0 ? 'monthlyMeeting' : 'restockPhase'),
        restockFocusItem: null,
        pendingMorningStoryMoments,
        happiness: newHappiness,
        statistics: statsUpdate,
        gameOver,
        gameResult,
        notifications: [
          ...state.notifications,
          ...monthlyNotifications,
        ],
        ...(isFirstOfMonth && state.memberCount > 0
          ? storyMomentPatch(state, `monthly_meeting_${state.dayNumber}`, {
              speaker: 'Bu Siti',
              title: 'Rapat simpanan bulanan',
              text: 'Anggota berkumpul untuk menentukan simpanan wajib bulan ini. Pilihanmu memengaruhi kas koperasi, ruang pinjaman, dan kebahagiaan anggota.',
              avatar: '/assets/avatars/female_1_siti.jpg',
              actionLabel: 'Mulai Rapat',
              actionModal: 'monthlyMeeting',
            })
          : storyPatch),
      };
    }),

  /** 16b. chooseMonthlyPayment */
  chooseMonthlyPayment: (preset) =>
    set((state) => {
      if (state.gamePhase !== 'monthlyMeeting') return {};
      const options = {
        low: { amount: 25_000, happinessDelta: 5, loanCapacityMultiplier: 0.6, leaveChance: 0 },
        normal: { amount: MEMBERS.MONTHLY_SAVING || 50_000, happinessDelta: 0, loanCapacityMultiplier: 1, leaveChance: 0 },
        high: { amount: 100_000, happinessDelta: -10, loanCapacityMultiplier: 1.5, leaveChance: 0.25 },
      };
      const choice = options[preset] || options.normal;
      const contribution = choice.amount * state.memberCount;
      const remainingMembers = choice.leaveChance > 0
        ? state.members.filter(() => seededRandom() >= choice.leaveChance)
        : state.members;
      const leftCount = state.members.length - remainingMembers.length;

      return {
        money: state.money + contribution,
        happiness: clamp(state.happiness + choice.happinessDelta),
        members: remainingMembers,
        memberCount: remainingMembers.length,
        monthlyPaymentPreset: preset,
        loanCapacityMultiplier: choice.loanCapacityMultiplier,
        activeModal: 'pasar',
        gamePhase: 'restockPhase',
        notifications: [
          ...state.notifications,
          {
            id: uid(),
            text: leftCount > 0
              ? `${leftCount} anggota keluar karena simpanan wajib terlalu tinggi.`
              : `Simpanan bulanan terkumpul: Rp ${contribution.toLocaleString('id-ID')}.`,
          },
        ],
        ...storyMomentPatch(state, `monthly_payment_${state.dayNumber}_${preset}`, {
          speaker: 'Bu Siti',
          title: 'Keputusan rapat dicatat',
          text: preset === 'high'
            ? 'Kas bertambah besar, tetapi anggota akan lebih sensitif terhadap keputusan koperasi berikutnya.'
            : preset === 'low'
              ? 'Anggota merasa ringan, tetapi ruang koperasi untuk memberi pinjaman bulan ini lebih terbatas.'
              : 'Simpanan bulanan berjalan seimbang. Anggota menerima keputusan rapat tanpa gejolak.',
          avatar: '/assets/avatars/female_1_siti.jpg',
          actionLabel: 'Lanjut Restok',
          actionModal: 'pasar',
        }),
      };
    }),

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║  17 — processBagiHasil                                                  ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  /** 17. processBagiHasil */
  processBagiHasil: (percent) =>
    set((state) => {
      if (!Number.isFinite(percent)) return {};
      const monthlySaving = MEMBERS.MONTHLY_SAVING || 50000;
      const cost = Math.round((percent / 100) * monthlySaving * state.memberCount);

      let happinessDelta = 0;
      if (percent === 0) {
        happinessDelta = -10;
      } else if (percent >= 1 && percent <= 10) {
        happinessDelta = percent;
      } else if (percent > 10) {
        happinessDelta = 10; // Cap at +10
      }

      const newHappiness = clamp(state.happiness + happinessDelta);
      const newMoney = state.money - cost;

      return {
        money: newMoney,
        happiness: newHappiness,
        activeModal: null, // Close the bagiHasil modal; startNewDay will be called next
        notifications: [
          ...state.notifications,
          {
            id: uid(),
            text:
              percent === 0
                ? 'Tidak ada bagi hasil bulan ini. Anggota kecewa.'
                : `Bagi hasil ${percent}% dibagikan — total Rp ${cost.toLocaleString('id-ID')}.`,
          },
        ],
      };
    }),

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║  18 — resetGame                                                         ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  /** 18. resetGame */
  resetGame: () => set(() => createInitialState()),

  /** 19. moveFurniture */
  moveFurniture: (id, dx, dy) =>
    set((state) => {
      const item = state.furniturePositions.find((f) => f.id === id);
      if (!item) return {};

      const newPositions = state.furniturePositions.map((f) => {
        if (f.id === id) {
          const nextPosition = clampStorePosition(
            { x: f.x + dx, y: f.y + dy },
            state.storeSize,
            f.type
          );
          return { ...f, ...nextPosition };
        }
        return f;
      });

      return { furniturePositions: newPositions };
    }),

  /** 19b. setFurniturePosition */
  setFurniturePosition: (id, x, y, rotation = null) =>
    set((state) => {
      const newPositions = state.furniturePositions.map((f) => {
        if (f.id !== id) return f;
        const nextPosition = clampStorePosition({ x, y }, state.storeSize, f.type);

        return {
          ...f,
          ...nextPosition,
          ...(rotation !== null && rotation !== undefined ? { rotation } : {}),
        };
      });

      return { furniturePositions: newPositions };
    }),

  /** 20. rotateFurniture */
  rotateFurniture: (id) =>
    set((state) => {
      const newPositions = state.furniturePositions.map((f) => {
        if (f.id === id) {
          const currentRotation = f.rotation || 0;
          return { ...f, rotation: (currentRotation + 90) % 360 };
        }
        return f;
      });
      return { furniturePositions: newPositions };
    }),

  /** 21. deleteFurniture */
  deleteFurniture: (id) =>
    set((state) => {
      const item = state.furniturePositions.find((f) => f.id === id);
      if (!item) return {};

      const type = item.type;
      const newFurniture = {
        ...state.furniture,
        [type]: Math.max(0, state.furniture[type] - 1),
      };

      // Recalculate capacity
      const newCapacity = recalcStockCapacity(newFurniture);

      const newPositions = state.furniturePositions.filter((f) => f.id !== id);

      return {
        furniture: newFurniture,
        stockCapacity: newCapacity,
        furniturePositions: newPositions,
        notifications: [
          ...state.notifications,
          { id: uid(), text: `Menghapus furnitur dari toko.` },
        ],
      };
    }),
}));

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS (module-level)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Recalculate stock capacity based on current furniture.
 * Base capacity 20 per item. Each rack type adds its bonus.
 */
function recalcStockCapacity(furniture) {
  const capacity = { rice: 20, cookingOil: 20, lpgGas: 20 };

  // Apply furniture bonuses
  Object.entries(furniture).forEach(([type, count]) => {
    const def = FURNITURE[type];
    if (def && def.stockBonus) {
      Object.entries(def.stockBonus).forEach(([item, bonus]) => {
        capacity[item] = (capacity[item] || 0) + bonus * count;
      });
    }
  });

  return capacity;
}

function createEmptySalesBreakdown() {
  return {
    rice: { sold: 0, revenue: 0 },
    cookingOil: { sold: 0, revenue: 0 },
    lpgGas: { sold: 0, revenue: 0 },
  };
}

function isStoreReadyToOpen(state) {
  const hasStock = Object.values(state.stock || {}).some((qty) => qty > 0);
  return isStoreSetupComplete(state.furniture) && hasStock;
}

function isStoreSetupComplete(furniture) {
  const hasCashier = (furniture.cashier || 0) > 0;
  const hasCapacityFurniture = Object.entries(furniture).some(([type, count]) =>
    count > 0 && !!FURNITURE[type]?.stockBonus
  );
  return hasCashier && hasCapacityFurniture;
}

function generateCustomerApplications(state, count) {
  if (count <= 0) return {};

  const existingIds = new Set(state.members.map((member) => member.id));
  const pendingIds = new Set(state.pendingApplications.map((applicant) => applicant.id));
  const availableApplicants = NPC_DATABASE.filter(
    (npc) => !existingIds.has(npc.id) && !pendingIds.has(npc.id)
  );
  const newApplicants = shuffleArray([...availableApplicants]).slice(0, count);
  if (newApplicants.length === 0) return {};

  return {
    pendingApplications: [...state.pendingApplications, ...newApplicants],
    notifications: [
      ...state.notifications,
      {
        id: uid(),
        text: `${newApplicants.length} pelanggan tertarik menjadi anggota koperasi.`,
      },
    ],
    ...storyMomentPatch(state, `customer_applicants_${state.dayNumber}`, {
      speaker: 'Bu Siti',
      title: 'Pelanggan tertarik bergabung',
      text: `${newApplicants.length} pelanggan hari ini ingin dipertimbangkan sebagai anggota. Periksa daftar calon anggota setelah laporan harian selesai.`,
      avatar: '/assets/avatars/female_1_siti.jpg',
    }),
  };
}

function finishManagerDay(state) {
  if (state.gamePhase !== 'managerMode' || !state.managerSession) return {};

  const session = state.managerSession;
  const unresolved = Math.max(0, session.totalCustomers - session.currentIndex);
  const totalMissed = session.missed + unresolved;
  const happinessDelta = -0.5 * totalMissed;
  const newHappiness = clamp(state.happiness + happinessDelta);
  const nextDate = dayjs(state.currentDate).add(1, 'day');
  const isEndOfMonth = dayjs(state.currentDate).endOf('month').isSame(state.currentDate, 'day');
  const newDayNumber = state.dayNumber + 1;
  const newDate = nextDate.format('YYYY-MM-DD');
  const salesBreakdown = session.salesBreakdown || createEmptySalesBreakdown();
  const dayReport = {
    playMode: 'manager',
    dayNumber: state.dayNumber,
    date: state.currentDate,
    totalCustomers: session.totalCustomers,
    totalItemsSold: session.served,
    revenue: session.revenue,
    salesBreakdown,
    happinessChange: happinessDelta,
    happinessAfter: newHappiness,
    moneyAfter: state.money,
    stockAfter: { ...state.stock },
    eventsActive: [...state.activeEvents],
    gagalPanenTriggered:
      state.gagalPanenDay === state.dayNumber && !state.boughtFromUMKMToday,
    krisisActive: state.krisisDaysRemaining > 0,
    manager: {
      served: session.served,
      wrong: session.wrong,
      missed: totalMissed,
    },
  };
  const memberApplicationPatch = generateCustomerApplications(
    state,
    Math.floor(session.served / 3)
  );

  return {
    happiness: newHappiness,
    dayReport,
    activeModal: isEndOfMonth ? 'bagiHasil' : 'laporanHarian',
    gamePhase: 'closingReport',
    currentDate: newDate,
    dayNumber: newDayNumber,
    managerSession: null,
    statistics: {
      ...state.statistics,
      totalItemsSold: state.statistics.totalItemsSold + session.served,
    },
    ...memberApplicationPatch,
  };
}

/**
 * Generate a loan schedule for the given month.
 * Ensures at least 3 loan requests in the month, spread across random days.
 * Only eligible members (no current active loan) are selected.
 */
function generateMonthlyLoanSchedule(monthStart, members, activeLoans, currentDayNumber) {
  if (members.length === 0) return [];

  const daysInMonth = monthStart.daysInMonth();
  const activeBorrowerIds = new Set(
    activeLoans.filter((l) => l.status === 'aktif').map((l) => l.memberId)
  );

  const eligibleMembers = members.filter((m) => !activeBorrowerIds.has(m.id));
  if (eligibleMembers.length === 0) return [];

  const numLoans = Math.max(3, Math.min(eligibleMembers.length, randomInt(3, 6)));
  const schedule = [];

  for (let i = 0; i < numLoans; i++) {
    const member = eligibleMembers[i % eligibleMembers.length];
    const dayInMonth = randomInt(2, daysInMonth); // Avoid day 1 (processing day)

    // Calculate absolute day number
    const targetDate = monthStart.date(dayInMonth);
    const diffFromStart = targetDate.diff(monthStart, 'day');
    const scheduledAbsoluteDay = currentDayNumber ? currentDayNumber + diffFromStart : dayInMonth;

    // Loan amount ranges (kelipatan 100k between 500k and 1m)
    const amounts = [500000, 600000, 700000, 800000, 900000, 1000000];
    const tenors = [1];
    const pairs = [
      { barang: 'rice', alasan: 'Meningkatkan produksi beras' },
      { barang: 'cookingOil', alasan: 'Memperbesar produksi minyak goreng' },
      { barang: 'lpgGas', alasan: 'Menambah armada distribusi gas LPG' }
    ];
    
    const pickedPair = pickRandom(pairs);

    schedule.push({
      dayNumber: scheduledAbsoluteDay,
      memberId: member.id,
      memberName: member.nama || member.name,
      jumlahPinjaman: pickRandom(amounts),
      tenorBulan: pickRandom(tenors),
      alasan: pickedPair.alasan,
      barangTerkait: pickedPair.barang,
    });
  }

  return schedule;
}

function buildMorningStoryMoments(storyEvents) {
  const moments = [];
  const priority = {
    krisisEkonomi: 10,
    gagalPanen: 20,
    loanRequest: 30,
    memberApplication: 40,
  };

  [...storyEvents].sort((a, b) => (priority[a.type] || 99) - (priority[b.type] || 99)).forEach((event) => {
    if (event.type === 'krisisEkonomi') {
      moments.push(createStoryMoment(`krisis_${event.dayNumber}`, {
        speaker: 'Dewan Pengawas',
        title: 'Krisis ekonomi dimulai',
        text: 'Harga sedang menekan warga. Selama krisis, turunkan margin agar kebahagiaan tidak runtuh.',
        avatar: '/assets/avatars/female_2_dewi.jpg',
        tone: 'danger',
        actionLabel: 'Atur Harga',
        actionModal: 'harga',
      }));
    } else if (event.type === 'gagalPanen') {
      moments.push(createStoryMoment(`gagal_panen_${event.dayNumber}`, {
        speaker: 'Pak Budi',
        title: 'Sawah desa gagal panen',
        text: 'Petani butuh koperasi hari ini. Beli dari UMKM agar dukungan terasa langsung dan warga tetap percaya.',
        avatar: '/assets/avatars/male_1_budi.jpg',
        tone: 'warning',
        actionLabel: 'Buka Pasar',
        actionModal: 'pasar',
      }));
    } else if (event.type === 'loanRequest') {
      moments.push(createStoryMoment(`loan_request_${event.dayNumber}_${event.loan.id}`, {
        speaker: displayName(event.loan),
        title: 'Pengajuan modal usaha',
        text: `${displayName(event.loan)} mengajukan pinjaman untuk ${event.loan.alasan}. Pilih bunga yang membantu usaha tetap hidup.`,
        avatar: event.loan.avatar || '/assets/avatars/male_2_ahmad.jpg',
        actionLabel: 'Tinjau Pinjaman',
        actionModal: 'pinjamanAktifList',
      }));
    } else if (event.type === 'memberApplication') {
      const extraApplicants = Math.max(0, (event.totalApplicants || 1) - 1);
      const extraText = extraApplicants > 0
        ? ` dan ${extraApplicants} warga lain juga menunggu di daftar calon anggota`
        : '';
      moments.push(createStoryMoment(`application_intro_${event.dayNumber}_${event.applicant.id}`, {
        speaker: 'Bu Siti',
        title: 'Ada warga ingin bergabung',
        text: `${displayName(event.applicant)} datang mengajukan diri sebagai anggota koperasi${extraText}. Tinjau profil calon anggota sebelum diterima, karena anggota baru akan ikut menyetor simpanan dan bisa mengajukan pinjaman.`,
        avatar: '/assets/avatars/female_1_siti.jpg',
        actionLabel: 'Lanjut',
        actionModal: null,
      }));
      moments.push(createStoryMoment(`application_${event.dayNumber}_${event.applicant.id}`, {
        speaker: displayName(event.applicant),
        title: 'Calon anggota menunggu',
        text: 'Saya ingin ikut koperasi supaya simpanan dan kebutuhan usaha lebih jelas. Mohon ditinjau, Pengurus.',
        avatar: event.applicant.avatar,
        actionLabel: 'Lihat Anggota',
        actionModal: 'pinjamanAktifList',
      }));
    }
  });

  return moments;
}
