const API_BASE_URL = "http://localhost:8080/api/v1";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  userId: number;
  fullName: string;
  email: string;
}

export interface BusinessSummary {
  currency: string;
  totalRevenue: number;
  totalExpenses: number;
  netCashFlow: number;
}

export interface ExpenseRequest {
  description: string;
  category: string;
  amount: number;
  currency: string;
  incurredAt: string;
}

export interface ExpenseResponse {
  id: number;
  description: string;
  category: string;
  amount: number;
  currency: string;
  incurredAt: string;
}

export interface AssistantRequest {
  message: string;
}

export interface AssistantResponse {
  answer: string;
  intent: string;
  startDate: string | null;
  endDate: string | null;
  summaries: BusinessSummary[] | null;
  lowStockItems: Record<string, unknown>[] | null;
  restockRecommendations: Record<string, unknown>[] | null;
  bestSellingProducts: Record<string, unknown>[] | null;
  inactiveProductResponses: Record<string, unknown>[] | null;
  inventoryValuations: Record<string, unknown>[] | null;
  dailyFinancialTrends: Record<string, unknown>[] | null;
  financialComparisons: Record<string, unknown>[] | null;
}


export type SaleType = "PRODUCT" | "SERVICE";

export interface CreateSaleRequest {
  itemName: string;
  saleType: SaleType;
  quantity: number;
  unitPrice: number;
  currency: string;
  soldAt: string;
}

export interface SaleResponse {
  id: number;
  itemName: string;
  saleType: SaleType;
  quantity: number;
  unitPrice: number;
  currency: string;
  soldAt: string;
  totalAmount: number;
}


export interface InventoryRequest {
  productName: string;
  sku: string;
  quantityInStock: number;
  unitCost: number;
  sellingPrice: number;
  currency: string;
  lowStockThreshold: number;
  targetStockLevel: number;
}

export interface InventoryResponse extends InventoryRequest {
  id: number;
}

export interface InventoryItem {
  id: number;
  productName: string;
  sku: string;
  quantityInStock: number;
  unitCost: number;
  sellingPrice: number;
  currency: string;
  lowStockThreshold: number;
  targetStockLevel: number;
}

export interface InventorySaleRequest {
  inventoryItemId: number;
  quantity: number;
  unitPrice: number;
  soldAt: string;
}





async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const authApi = {
  login: (data: LoginRequest) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  register: (data: RegisterRequest) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

    getBusinessSummary: () =>
  request<BusinessSummary[]>("/business/summary"),

    chat: (message: string) =>
  request<AssistantResponse>("/assistant/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
  }),

  
createSale: (data: CreateSaleRequest) =>
  request<SaleResponse>("/sales", {
    method: "POST",
    body: JSON.stringify(data),
  }),

getSales: () =>
  request<SaleResponse[]>("/sales"),

getExpenses: () =>
  request<ExpenseResponse[]>("/expenses"),

createExpense: (data: ExpenseRequest) =>
  request<ExpenseResponse>("/expenses", {
    method: "POST",
    body: JSON.stringify(data),
  }),

  
getInventory: () =>
  request<InventoryResponse[]>("/inventory"),

createInventoryItem: (data: InventoryRequest) =>
  request<InventoryResponse>("/inventory", {
    method: "POST",
    body: JSON.stringify(data),
  }),

getLowStockInventory: () =>
  request<InventoryResponse[]>("/inventory/low-stock"),

searchInventory: (productName: string) =>
  request<InventoryResponse[]>(
    `/inventory/search?productName=${encodeURIComponent(productName)}`
  ),

  getInventoryItems: () =>
  request<InventoryItem[]>("/inventory"),

recordInventorySale: (data: InventorySaleRequest) =>
  request<unknown>("/sales/from-inventory", {
    method: "POST",
    body: JSON.stringify(data),
  }),

    
};