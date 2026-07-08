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
} from '../constants/gameConstants';
import { NPC_DATABASE } from '../data/npcData';
import { randomInt, pickRandom, shuffleArray, seededRandom } from '../utils/random';

// ─── Helper: clamp happiness between 0 and 100 ────────────────────────────────
const clamp = (val, min = 0, max = 100) => Math.max(min, Math.min(max, val));

// ─── Helper: generate a unique id ─────────────────────────────────────────────
let _uid = 0;
const uid = () => `${Date.now()}-${++_uid}`;

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
  gagalPanenDay: null,
  krisisStartDay: null,
  krisisDaysRemaining: 0,

  // UI state
  currentView: 'dashboard',
  activeModal: null,
  notifications: [],
  selectedNpc: null,
  selectedLoan: null,
  dayReport: null,

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
  setActiveModal: (modal) => set({ activeModal: modal }),

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

      const newMembers = [...state.members, { ...npc, joinDate: state.currentDate }];
      const newPending = state.pendingApplications.filter((a) => a.id !== npcId);
      const newMemberCount = state.memberCount + 1;

      // Recalculate stock capacity based on furniture
      const newStockCapacity = recalcStockCapacity(state.furniture);

      return {
        members: newMembers,
        pendingApplications: newPending,
        memberCount: newMemberCount,
        stockCapacity: newStockCapacity,
        notifications: [
          ...state.notifications,
          { id: uid(), text: `${npc.name} telah diterima sebagai anggota koperasi!` },
        ],
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
  approveLoan: (loanId, bungaPersen) =>
    set((state) => {
      const loanReq = state.pendingLoanRequests.find((l) => l.id === loanId);
      if (!loanReq) return {};
      if (state.money < loanReq.jumlahPinjaman) return {};

      const cicilanPerBulan =
        (loanReq.jumlahPinjaman / loanReq.tenorBulan) * (1 + bungaPersen / 100);

      const newLoan = {
        ...loanReq,
        bungaPersen,
        cicilanPerBulan: Math.round(cicilanPerBulan),
        status: 'aktif',
        sisaBulan: loanReq.tenorBulan,
        totalTerbayar: 0,
        approvedDate: state.currentDate,
      };

      // Happiness penalty based on interest rate
      let happinessDelta = 0;
      if (bungaPersen >= 16) happinessDelta = -15;
      else if (bungaPersen >= 11) happinessDelta = -10;
      else if (bungaPersen >= 6) happinessDelta = -5;
      // 1-5%: no penalty

      const newHappiness = clamp(state.happiness + happinessDelta);

      return {
        money: state.money - loanReq.jumlahPinjaman,
        happiness: newHappiness,
        activeLoans: [...state.activeLoans, newLoan],
        pendingLoanRequests: state.pendingLoanRequests.filter((l) => l.id !== loanId),
        statistics: {
          ...state.statistics,
          totalLoansGiven: state.statistics.totalLoansGiven + 1,
        },
        notifications: [
          ...state.notifications,
          {
            id: uid(),
            text: `Pinjaman Rp ${loanReq.jumlahPinjaman.toLocaleString('id-ID')} untuk ${loanReq.memberName} disetujui (bunga ${bungaPersen}%).`,
          },
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
      };
    }),

  /** 12. setSellingPrice */
  setSellingPrice: (item, price) =>
    set((state) => ({
      sellingPrices: { ...state.sellingPrices, [item]: price },
    })),

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
          x,
          y,
          rotation,
          color,
        },
      ];

      return {
        money: state.money - price,
        furniture: newFurniture,
        stockCapacity: newStockCapacity,
        happiness: newHappiness,
        furniturePositions: newPositions,
        placementMode: null,
        notifications: [
          ...state.notifications,
          { id: uid(), text: `Membeli ${def.name || type} untuk toko!` },
        ],
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
      };
    }),

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║  15 — endDay  (CORE SIMULATION)                                         ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  /** 15. endDay */
  endDay: () =>
    set((state) => {
      // ── a. Calculate total customers ──
      const totalCustomers =
        state.furniture.cashier * (STORE.BASE_CUSTOMERS_PER_CASHIER || 10);

      // ── b-e. Simulate customer purchases ──
      const itemKeys = Object.keys(state.stock);
      let currentStock = { ...state.stock };
      let revenue = 0;
      let happinessDelta = 0;
      const salesBreakdown = {};
      itemKeys.forEach((k) => {
        salesBreakdown[k] = { sold: 0, revenue: 0 };
      });

      let totalItemsSoldToday = 0;

      for (let i = 0; i < totalCustomers; i++) {
        // Items with stock > 0
        const availableItems = itemKeys.filter((k) => currentStock[k] > 0);

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
        // Use the average of last PT/UMKM purchase prices as cost basis
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
        // Krisis Ekonomi: if selling prices are not below purchase prices → happiness -10
        let sellingBelowCost = true;
        itemKeys.forEach((item) => {
          const pp = state.purchasePrices[item];
          const avgCost = Math.round(((pp.lastPT || 0) + (pp.lastUMKM || 0)) / 2);
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
        currentDate: newDate,
        dayNumber: newDayNumber,
        gameOver,
        gameResult,
        statistics: {
          ...state.statistics,
          totalItemsSold: state.statistics.totalItemsSold + totalItemsSoldToday,
        },
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

      // ── c. Generate member applications ──
      const existingMemberIds = new Set(state.members.map((m) => m.id));
      const pendingIds = new Set(state.pendingApplications.map((a) => a.id));
      const eligibleNPCs = NPC_DATABASE.filter(
        (npc) => !existingMemberIds.has(npc.id) && !pendingIds.has(npc.id)
      );
      const numApplications = Math.min(randomInt(1, 5), eligibleNPCs.length);
      const shuffled = shuffleArray([...eligibleNPCs]);
      const newApplicants = shuffled.slice(0, numApplications);
      const newPendingApplications = [
        ...state.pendingApplications,
        ...newApplicants,
      ];

      // ── d. Check loanSchedule for today's loan requests ──
      let newPendingLoanRequests = [...state.pendingLoanRequests];
      const todayScheduled = state.loanSchedule.filter(
        (entry) => entry.dayNumber === state.dayNumber
      );
      todayScheduled.forEach((entry) => {
        // Only if member is approved and doesn't have an active loan
        const isMember = state.members.some((m) => m.id === entry.memberId);
        const hasActiveLoan = state.activeLoans.some(
          (l) => l.memberId === entry.memberId && l.status === 'aktif'
        );
        if (isMember && !hasActiveLoan) {
          newPendingLoanRequests.push({
            id: uid(),
            memberId: entry.memberId,
            memberName: entry.memberName,
            jumlahPinjaman: entry.jumlahPinjaman,
            tenorBulan: entry.tenorBulan,
            alasan: entry.alasan,
            barangTerkait: entry.barangTerkait || null,
            requestDate: state.currentDate,
          });
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
            // Loan term complete — 80% chance of success
            const isSuccess = Math.random() < 0.8;
            if (isSuccess) {
              updatedLoan.status = 'lunas';
              statsUpdate = {
                ...statsUpdate,
                totalLoansSuccessful: statsUpdate.totalLoansSuccessful + 1,
              };

              // If barangTerkait (related good): reduce UMKM base price by 1000, increase stock by 3
              if (updatedLoan.barangTerkait) {
                const relatedItem = updatedLoan.barangTerkait;
                umkmPriceAdjustments[relatedItem] =
                  (umkmPriceAdjustments[relatedItem] || 0) - 1000;
                umkmStockAdjustments[relatedItem] =
                  (umkmStockAdjustments[relatedItem] || 0) + 3;
              }

              monthlyNotifications.push({
                id: uid(),
                text: `Pinjaman ${updatedLoan.memberName} telah lunas! Usaha berhasil.`,
              });
            } else {
              updatedLoan.status = 'gagal';
              monthlyNotifications.push({
                id: uid(),
                text: `Pinjaman ${updatedLoan.memberName} selesai tapi usaha kurang berhasil.`,
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
      let newLoanSchedule = state.loanSchedule;
      if (isFirstOfMonth) {
        newLoanSchedule = generateMonthlyLoanSchedule(
          today,
          state.members,
          state.activeLoans
        );
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

      // Krisis Ekonomi: every 2 months, random start, 7 days
      if (isFirstOfMonth) {
        const currentMonth = today.month() + 1; // 1-indexed
        if (currentMonth % 2 === 0 && state.krisisDaysRemaining <= 0) {
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
        newKrisisDaysRemaining = EVENTS?.KRISIS_EKONOMI?.duration || 7;
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
      }

      // Activate Gagal Panen notification if today
      if (state.dayNumber === newGagalPanenDay) {
        if (!newActiveEvents.some((e) => e.type === 'gagalPanen')) {
          newActiveEvents.push({
            type: 'gagalPanen',
            day: state.dayNumber,
          });
        }
        monthlyNotifications.push({
          id: uid(),
          text: '🌾 GAGAL PANEN! Pastikan membeli dari UMKM hari ini untuk mendukung petani lokal!',
        });
      }

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
        activeModal: gameOver ? 'gameOver' : null,
        happiness: newHappiness,
        statistics: statsUpdate,
        gameOver,
        gameResult,
        notifications: [
          ...state.notifications,
          ...monthlyNotifications,
        ],
      };
    }),

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║  17 — processBagiHasil                                                  ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  /** 17. processBagiHasil */
  processBagiHasil: (percent) =>
    set((state) => {
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

      // Bounds checking based on store size
      // Small: 10m x 15m (posX: -5 to 5, posZ: -7.5 to 7.5) -> (x: 0 to 100, y: 0 to 150)
      const isLarge = state.storeSize === 'large';
      const maxX = isLarge ? 200 : 100;
      const maxY = isLarge ? 300 : 150;

      const newPositions = state.furniturePositions.map((f) => {
        if (f.id === id) {
          const nextX = clamp(f.x + dx, 0, maxX);
          const nextY = clamp(f.y + dy, 0, maxY);
          return { ...f, x: nextX, y: nextY };
        }
        return f;
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

/**
 * Generate a loan schedule for the given month.
 * Ensures at least 3 loan requests in the month, spread across random days.
 * Only eligible members (no current active loan) are selected.
 */
function generateMonthlyLoanSchedule(monthStart, members, activeLoans) {
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

    // Calculate absolute day number — this is approximate; will be matched by dayNumber
    const targetDate = monthStart.date(dayInMonth);
    const diffFromStart = targetDate.diff(monthStart, 'day');

    // Loan amount ranges
    const amounts = [500000, 1000000, 1500000, 2000000, 3000000, 5000000];
    const tenors = [3, 6, 12];
    const alasanList = [
      'Modal usaha warung',
      'Beli gerobak jualan',
      'Modal ternak ayam',
      'Beli mesin jahit',
      'Modal toko kelontong',
      'Perbaikan rumah untuk usaha',
      'Modal pertanian',
      'Beli peralatan bengkel',
    ];
    const barangOptions = ['rice', 'cookingOil', 'lpgGas', null, null];

    schedule.push({
      dayNumber: dayInMonth,
      memberId: member.id,
      memberName: member.name,
      jumlahPinjaman: pickRandom(amounts),
      tenorBulan: pickRandom(tenors),
      alasan: pickRandom(alasanList),
      barangTerkait: pickRandom(barangOptions),
    });
  }

  return schedule;
}
