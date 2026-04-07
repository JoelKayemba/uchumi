import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from 'expo-crypto';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  type CurrencyOptionId,
  CURRENCY_OPTIONS,
  DEFAULT_CURRENCY,
} from '@/src/constants/currencies';
import { DEFAULT_CATEGORIES } from '@/src/constants/default-categories';
import { pickCategoryColor } from '@/src/lib/category-colors';
import {
  isValidMarketSymbol,
  normalizeMarketSymbol,
} from '@/src/lib/market-symbol';
import { nextStreak } from '@/src/domain/streak';
import { advanceNextDue } from '@/src/domain/recurring-due';
import type { AppMode } from '@/src/types/app';
import type { Category } from '@/src/types/category';
import type { Loan } from '@/src/types/loan';
import type { RecurringRule } from '@/src/types/recurring';
import type { SavingsGoal } from '@/src/types/savings-goal';
import type { Transaction } from '@/src/types/transaction';

const STORAGE_KEY = 'uchumi-app-v1';

type ImportPayload = {
  categories: Category[];
  transactions: Transaction[];
  currency?: CurrencyOptionId;
  appMode?: AppMode | null;
  streakCount?: number;
  streakLastDate?: string | null;
  categoryBudgets?: Record<string, number>;
  savingsGoals?: SavingsGoal[];
  recurringRules?: RecurringRule[];
  loans?: Loan[];
  marketWatchlist?: string[];
  appLockEnabled?: boolean;
};

type AppState = {
  hasCompletedOnboarding: boolean;
  appMode: AppMode | null;
  currency: CurrencyOptionId;
  transactions: Transaction[];
  categories: Category[];
  reminderEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  lowBalanceEnabled: boolean;
  lowBalanceThreshold: number | null;
  lastLowBalanceNotificationDay: string | null;
  marketWatchlist: string[];
  streakCount: number;
  streakLastDate: string | null;
  /** Limite mensuelle par catégorie (devise affichage), 0 = pas de limite. */
  categoryBudgets: Record<string, number>;
  savingsGoals: SavingsGoal[];
  recurringRules: RecurringRule[];
  loans: Loan[];
  appLockEnabled: boolean;
  setAppMode: (mode: AppMode) => void;
  setCurrency: (currency: CurrencyOptionId) => void;
  setReminderPreferences: (
    enabled: boolean,
    hour?: number,
    minute?: number
  ) => void;
  setLowBalancePreferences: (enabled: boolean, threshold: number | null) => void;
  setLastLowBalanceNotificationDay: (day: string | null) => void;
  setAppLockEnabled: (enabled: boolean) => void;
  importAppData: (payload: ImportPayload) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  addTransaction: (input: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (
    id: string,
    patch: Partial<
      Pick<
        Transaction,
        | 'kind'
        | 'amount'
        | 'label'
        | 'categoryId'
        | 'isoCurrency'
        | 'rateToDisplayCurrency'
        | 'amountInDisplayCurrency'
        | 'tags'
        | 'note'
        | 'attachmentUri'
      >
    >
  ) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (name: string) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  addMarketWatchSymbol: (raw: string) => boolean;
  removeMarketWatchSymbol: (symbol: string) => void;
  setCategoryBudget: (categoryId: string, monthlyLimit: number | null) => void;
  addSavingsGoal: (input: Omit<SavingsGoal, 'id'>) => void;
  updateSavingsGoal: (id: string, patch: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  addRecurringRule: (input: Omit<RecurringRule, 'id'>) => void;
  updateRecurringRule: (id: string, patch: Partial<RecurringRule>) => void;
  deleteRecurringRule: (id: string) => void;
  applyRecurringRule: (id: string) => void;
  addLoan: (input: Omit<Loan, 'id'>) => void;
  updateLoan: (id: string, patch: Partial<Loan>) => void;
  deleteLoan: (id: string) => void;
};

function ensureCategories(list: Category[]): Category[] {
  if (!list || list.length === 0) {
    return [...DEFAULT_CATEGORIES];
  }
  return list;
}

function ensureCurrency(id: unknown): CurrencyOptionId {
  if (
    typeof id === 'string' &&
    CURRENCY_OPTIONS.some((o) => o.id === id)
  ) {
    return id as CurrencyOptionId;
  }
  return DEFAULT_CURRENCY;
}

function ensureReminderHour(n: unknown): number {
  if (typeof n === 'number' && n >= 0 && n <= 23) return n;
  return 20;
}

function ensureReminderMinute(n: unknown): number {
  if (typeof n === 'number' && n >= 0 && n <= 59) return n;
  return 0;
}

const MAX_WATCHLIST = 20;
const DEFAULT_WATCHLIST: string[] = ['AAPL', 'MSFT'];

function ensureWatchlist(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [...DEFAULT_WATCHLIST];
  const list = raw
    .filter((x): x is string => typeof x === 'string')
    .map((x) => normalizeMarketSymbol(x))
    .filter((x) => isValidMarketSymbol(x));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of list) {
    if (seen.has(s)) continue;
    seen.add(s);
    out.push(s);
    if (out.length >= MAX_WATCHLIST) break;
  }
  return out.length > 0 ? out : [...DEFAULT_WATCHLIST];
}

function ensureTransactionShape(raw: Transaction): Transaction {
  const iso = raw.isoCurrency ?? 'CDF';
  const rate = raw.rateToDisplayCurrency ?? 1;
  const inDisplay = raw.amountInDisplayCurrency ?? raw.amount;
  const tags = Array.isArray(raw.tags) ? raw.tags.filter((x) => typeof x === 'string') : [];
  const note = typeof raw.note === 'string' ? raw.note : '';
  const attachmentUri =
    typeof raw.attachmentUri === 'string' ? raw.attachmentUri : null;
  return {
    ...raw,
    isoCurrency: iso,
    rateToDisplayCurrency: rate,
    amountInDisplayCurrency: inDisplay,
    tags,
    note,
    attachmentUri,
  };
}

function ensureBudgets(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === 'number' && Number.isFinite(v) && v >= 0) {
      out[k] = v;
    }
  }
  return out;
}

function ensureSavingsGoals(raw: unknown): SavingsGoal[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x): x is SavingsGoal => x && typeof (x as SavingsGoal).id === 'string')
    .map((g) => ({
      id: g.id,
      name: typeof g.name === 'string' ? g.name : 'Objectif',
      targetAmount:
        typeof g.targetAmount === 'number' ? g.targetAmount : 0,
      savedAmount:
        typeof g.savedAmount === 'number' ? g.savedAmount : 0,
      targetDate:
        typeof g.targetDate === 'string' || g.targetDate === null
          ? g.targetDate
          : null,
    }));
}

function ensureRecurringRules(raw: unknown): RecurringRule[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((r): r is RecurringRule => r && typeof (r as RecurringRule).id === 'string');
}

function ensureLoans(raw: unknown): Loan[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x): x is Loan => x && typeof (x as Loan).id === 'string')
    .map((l) => ({
      id: l.id,
      name: typeof l.name === 'string' ? l.name : 'Prêt',
      remainingAmount:
        typeof l.remainingAmount === 'number' ? l.remainingAmount : 0,
      monthlyPayment:
        typeof l.monthlyPayment === 'number' ? l.monthlyPayment : 0,
      note: typeof l.note === 'string' ? l.note : '',
    }));
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      appMode: null,
      currency: DEFAULT_CURRENCY,
      transactions: [],
      categories: [...DEFAULT_CATEGORIES],
      reminderEnabled: false,
      reminderHour: 20,
      reminderMinute: 0,
      lowBalanceEnabled: false,
      lowBalanceThreshold: null,
      lastLowBalanceNotificationDay: null,
      marketWatchlist: [...DEFAULT_WATCHLIST],
      streakCount: 0,
      streakLastDate: null,
      categoryBudgets: {},
      savingsGoals: [],
      recurringRules: [],
      loans: [],
      appLockEnabled: false,
      setAppMode: (mode) => set({ appMode: mode }),
      setCurrency: (currency) => set({ currency }),
      setReminderPreferences: (enabled, hour, minute) =>
        set((state) => ({
          reminderEnabled: enabled,
          reminderHour: hour !== undefined ? hour : state.reminderHour,
          reminderMinute: minute !== undefined ? minute : state.reminderMinute,
        })),
      setLowBalancePreferences: (enabled, threshold) =>
        set({
          lowBalanceEnabled: enabled,
          lowBalanceThreshold: threshold,
        }),
      setLastLowBalanceNotificationDay: (day) =>
        set({ lastLowBalanceNotificationDay: day }),
      setAppLockEnabled: (enabled) => set({ appLockEnabled: enabled }),
      importAppData: (payload) =>
        set((state) => ({
          categories:
            payload.categories.length > 0
              ? payload.categories
              : ensureCategories([]),
          transactions: payload.transactions.map(ensureTransactionShape),
          currency:
            payload.currency !== undefined
              ? ensureCurrency(payload.currency)
              : state.currency,
          appMode:
            payload.appMode !== undefined ? payload.appMode : state.appMode,
          streakCount:
            typeof payload.streakCount === 'number'
              ? payload.streakCount
              : state.streakCount,
          streakLastDate:
            payload.streakLastDate !== undefined
              ? payload.streakLastDate
              : state.streakLastDate,
          categoryBudgets:
            payload.categoryBudgets !== undefined
              ? ensureBudgets(payload.categoryBudgets)
              : state.categoryBudgets,
          savingsGoals:
            payload.savingsGoals !== undefined
              ? ensureSavingsGoals(payload.savingsGoals)
              : state.savingsGoals,
          recurringRules:
            payload.recurringRules !== undefined
              ? ensureRecurringRules(payload.recurringRules)
              : state.recurringRules,
          loans:
            payload.loans !== undefined
              ? ensureLoans(payload.loans)
              : state.loans,
          marketWatchlist:
            payload.marketWatchlist !== undefined
              ? ensureWatchlist(payload.marketWatchlist)
              : state.marketWatchlist,
          appLockEnabled:
            typeof payload.appLockEnabled === 'boolean'
              ? payload.appLockEnabled
              : state.appLockEnabled,
        })),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      resetOnboarding: () =>
        set({
          hasCompletedOnboarding: false,
          appMode: null,
        }),
      addTransaction: (input) => {
        if (input.amount <= 0 || !Number.isFinite(input.amount)) {
          return;
        }
        if (
          !Number.isFinite(input.amountInDisplayCurrency) ||
          !Number.isFinite(input.rateToDisplayCurrency)
        ) {
          return;
        }
        set((state) => {
          const tx: Transaction = {
            ...input,
            tags: input.tags ?? [],
            note: input.note ?? '',
            attachmentUri: input.attachmentUri ?? null,
            id: randomUUID(),
            createdAt: new Date().toISOString(),
          };
          const st = nextStreak(state.streakCount, state.streakLastDate);
          return {
            transactions: [tx, ...state.transactions],
            streakCount: st.count,
            streakLastDate: st.lastDate,
          };
        });
      },
      updateTransaction: (id, patch) => {
        if (
          patch.amount !== undefined &&
          (patch.amount <= 0 || !Number.isFinite(patch.amount))
        ) {
          return;
        }
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id
              ? ensureTransactionShape({
                  ...t,
                  ...patch,
                })
              : t
          ),
        }));
      },
      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),
      addCategory: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        set((state) => {
          const color = pickCategoryColor(state.categories.length);
          const cat: Category = {
            id: randomUUID(),
            name: trimmed,
            color,
          };
          return { categories: [...state.categories, cat] };
        });
      },
      updateCategory: (id, name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, name: trimmed } : c
          ),
        }));
      },
      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
          transactions: state.transactions.map((t) =>
            t.categoryId === id ? { ...t, categoryId: null } : t
          ),
        })),
      addMarketWatchSymbol: (raw) => {
        const s = normalizeMarketSymbol(raw);
        if (!isValidMarketSymbol(s)) return false;
        let added = false;
        set((state) => {
          if (state.marketWatchlist.includes(s)) return state;
          if (state.marketWatchlist.length >= MAX_WATCHLIST) return state;
          added = true;
          return { marketWatchlist: [...state.marketWatchlist, s] };
        });
        return added;
      },
      removeMarketWatchSymbol: (symbol) =>
        set((state) => ({
          marketWatchlist: state.marketWatchlist.filter(
            (x) => x !== symbol
          ),
        })),
      setCategoryBudget: (categoryId, monthlyLimit) =>
        set((state) => {
          const next = { ...state.categoryBudgets };
          if (monthlyLimit === null || monthlyLimit <= 0) {
            delete next[categoryId];
          } else {
            next[categoryId] = monthlyLimit;
          }
          return { categoryBudgets: next };
        }),
      addSavingsGoal: (input) =>
        set((state) => ({
          savingsGoals: [
            ...state.savingsGoals,
            { ...input, id: randomUUID() },
          ],
        })),
      updateSavingsGoal: (id, patch) =>
        set((state) => ({
          savingsGoals: state.savingsGoals.map((g) =>
            g.id === id ? { ...g, ...patch } : g
          ),
        })),
      deleteSavingsGoal: (id) =>
        set((state) => ({
          savingsGoals: state.savingsGoals.filter((g) => g.id !== id),
        })),
      addRecurringRule: (input) =>
        set((state) => ({
          recurringRules: [
            ...state.recurringRules,
            { ...input, id: randomUUID() },
          ],
        })),
      updateRecurringRule: (id, patch) =>
        set((state) => ({
          recurringRules: state.recurringRules.map((r) =>
            r.id === id ? { ...r, ...patch } : r
          ),
        })),
      deleteRecurringRule: (id) =>
        set((state) => ({
          recurringRules: state.recurringRules.filter((r) => r.id !== id),
        })),
      applyRecurringRule: (id) =>
        set((state) => {
          const rule = state.recurringRules.find((r) => r.id === id);
          if (!rule) return state;
          const tx: Transaction = {
            kind: rule.kind,
            amount: rule.amount,
            isoCurrency: rule.isoCurrency,
            rateToDisplayCurrency: rule.rateToDisplayCurrency,
            amountInDisplayCurrency: rule.amountInDisplayCurrency,
            label: rule.label,
            categoryId: rule.categoryId,
            tags: [],
            note: '',
            attachmentUri: null,
            id: randomUUID(),
            createdAt: new Date().toISOString(),
          };
          const advanced = advanceNextDue(rule);
          const st = nextStreak(state.streakCount, state.streakLastDate);
          return {
            transactions: [tx, ...state.transactions],
            recurringRules: state.recurringRules.map((r) =>
              r.id === id ? advanced : r
            ),
            streakCount: st.count,
            streakLastDate: st.lastDate,
          };
        }),
      addLoan: (input) =>
        set((state) => ({
          loans: [...state.loans, { ...input, id: randomUUID() }],
        })),
      updateLoan: (id, patch) =>
        set((state) => ({
          loans: state.loans.map((l) =>
            l.id === id ? { ...l, ...patch } : l
          ),
        })),
      deleteLoan: (id) =>
        set((state) => ({
          loans: state.loans.filter((l) => l.id !== id),
        })),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        appMode: state.appMode,
        currency: state.currency,
        transactions: state.transactions,
        categories: state.categories,
        reminderEnabled: state.reminderEnabled,
        reminderHour: state.reminderHour,
        reminderMinute: state.reminderMinute,
        lowBalanceEnabled: state.lowBalanceEnabled,
        lowBalanceThreshold: state.lowBalanceThreshold,
        lastLowBalanceNotificationDay: state.lastLowBalanceNotificationDay,
        marketWatchlist: state.marketWatchlist,
        streakCount: state.streakCount,
        streakLastDate: state.streakLastDate,
        categoryBudgets: state.categoryBudgets,
        savingsGoals: state.savingsGoals,
        recurringRules: state.recurringRules,
        loans: state.loans,
        appLockEnabled: state.appLockEnabled,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<AppState> | undefined;
        const rawTx = p?.transactions ?? [];
        return {
          ...current,
          hasCompletedOnboarding:
            typeof p?.hasCompletedOnboarding === 'boolean'
              ? p.hasCompletedOnboarding
              : current.hasCompletedOnboarding,
          appMode: p?.appMode !== undefined ? p.appMode : current.appMode,
          currency: ensureCurrency(p?.currency),
          categories: ensureCategories(p?.categories ?? current.categories),
          transactions: rawTx.map((t) =>
            ensureTransactionShape(t as Transaction)
          ),
          reminderEnabled:
            typeof p?.reminderEnabled === 'boolean'
              ? p.reminderEnabled
              : current.reminderEnabled,
          reminderHour: ensureReminderHour(p?.reminderHour),
          reminderMinute: ensureReminderMinute(p?.reminderMinute),
          lowBalanceEnabled:
            typeof p?.lowBalanceEnabled === 'boolean'
              ? p.lowBalanceEnabled
              : false,
          lowBalanceThreshold:
            typeof p?.lowBalanceThreshold === 'number'
              ? p.lowBalanceThreshold
              : null,
          lastLowBalanceNotificationDay:
            typeof p?.lastLowBalanceNotificationDay === 'string'
              ? p.lastLowBalanceNotificationDay
              : null,
          marketWatchlist: ensureWatchlist(p?.marketWatchlist),
          streakCount:
            typeof p?.streakCount === 'number' ? p.streakCount : 0,
          streakLastDate:
            typeof p?.streakLastDate === 'string' || p?.streakLastDate === null
              ? p.streakLastDate ?? null
              : null,
          categoryBudgets: ensureBudgets(p?.categoryBudgets),
          savingsGoals: ensureSavingsGoals(p?.savingsGoals),
          recurringRules: ensureRecurringRules(p?.recurringRules),
          loans: ensureLoans(p?.loans),
          appLockEnabled:
            typeof p?.appLockEnabled === 'boolean'
              ? p.appLockEnabled
              : false,
        };
      },
    }
  )
);
