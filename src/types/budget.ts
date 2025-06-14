export type BudgetPeriod = 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'semi-annually' | 'annually' | 'custom';

export type TagOption = string | null;

export interface SubBudgetItem {
  id: string;
  name: string;
  amount: number;
  note?: string;
  tag?: TagOption;
  hasExpenses?: boolean;
}

export interface BudgetItem {
  id: string;
  name: string;
  amount: number;
  spent: number;
  subItems: SubBudgetItem[];
  deadline?: Date | null;
  isImpulse?: boolean;
  isContinuous?: boolean;
  isRecurring?: boolean;
  note?: string;
  tag?: TagOption;
}

export interface BudgetDateRange {
  startDate: Date;
  endDate: Date;
}

export interface BudgetContextType {
  period: BudgetPeriod | null;
  totalBudget: number;
  budgetItems: BudgetItem[];
  setPeriod: (period: BudgetPeriod) => void;
  setTotalBudget: (amount: number) => void;
  setBudgetItems: React.Dispatch<React.SetStateAction<BudgetItem[]>>;
  addBudgetItem: (name: string, amount: number, isImpulse?: boolean, isContinuous?: boolean, isRecurring?: boolean) => Promise<void>;
  updateBudgetItem: (id: string, updates: Partial<BudgetItem>) => Promise<void>;
  deleteBudgetItem: (id: string) => Promise<void>;
  addSubItem: (budgetItemId: string, name: string, amount: number, note?: string, tag?: TagOption) => Promise<any>;
  deleteSubItem: (budgetItemId: string, subItemId: string) => Promise<void>;
  updateSubItem: (budgetItemId: string, subItemId: string, updates: Partial<SubBudgetItem>) => Promise<void>;
  addExpense: (budgetItemId: string, amount: number, subItemId?: string) => Promise<void>;
  resetBudget: () => void;
  getRemainingBudget: () => number;
  getTotalSpent: () => number;
  getTotalAllocated: () => number;
  updateItemDeadline: (id: string, deadline: Date | null) => Promise<void>;
  isLoading: boolean;
  currentBudgetId: string | null;
  initializeBudget: (period: BudgetPeriod, amount: number) => Promise<void>;
  loadBudget: () => Promise<void>;
  budgetDateRange: BudgetDateRange | null;
  isBudgetExpired: boolean;
  createNewBudgetPeriod: (period: BudgetPeriod, amount: number) => Promise<void>;
  previousRemainingBudget: number;
  continuousBudgetItems: BudgetItem[];
  markItemAsContinuous: (itemId: string, isContinuous: boolean) => Promise<void>;
  setPreviousRemainingBudget: React.Dispatch<React.SetStateAction<number>>;
  setContinuousBudgetItems: React.Dispatch<React.SetStateAction<BudgetItem[]>>;
}
