// ─────────────────────────────────────────────────────────────────────────────
// VetaFarm API Client
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:5000';

// ─── Token helpers ───────────────────────────────────────────────────────────

export function getToken(): string | null {
  return localStorage.getItem('vetafarm_token');
}

export function setToken(token: string): void {
  localStorage.setItem('vetafarm_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('vetafarm_token');
  localStorage.removeItem('vetafarm_user');
}

export function getStoredUser(): LoginResponse | null {
  const raw = localStorage.getItem('vetafarm_user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function setStoredUser(user: LoginResponse): void {
  localStorage.setItem('vetafarm_user', JSON.stringify(user));
}

// ─── Generic fetch wrapper ───────────────────────────────────────────────────

interface ApiResult<T> {
  isSuccess: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

interface PaginatedData<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResult<T>> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    clearToken();
    window.location.hash = '#/login';
    throw new Error('Unauthorized');
  }

  if (res.status === 204) {
    return { isSuccess: true, data: null as T };
  }

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || json.errors?.join(', ') || `API Error ${res.status}`);
  }
  return json;
}

// ─── Auth API ────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  token: string;
  tokenExpiration: string;
  roles: string[];
  permissions: string[];
}

export async function login(dto: LoginRequest): Promise<ApiResult<LoginResponse>> {
  return apiFetch<LoginResponse>('/Auth/Login', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

// ─── Users API ───────────────────────────────────────────────────────────────

export interface UserListItem {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  status: string;
  department?: string;
  notes?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
  roles: string[];
}

export interface AddUserRequest {
  fullName: string;
  email: string;
  password: string;
  role: string;
  status: string;
  department?: string;
  notes?: string;
  phoneNumber?: string;
  employeeId?: number;
}

export interface UpdateUserRequest {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  role: string;
  status: string;
  department?: string;
  notes?: string;
}

export interface GetUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  roleFilter?: string;
  statusFilter?: string;
}

export const usersApi = {
  getList: (params: GetUsersParams = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set('Page', String(params.page));
    if (params.pageSize) qs.set('PageSize', String(params.pageSize));
    if (params.search) qs.set('Search', params.search);
    if (params.roleFilter) qs.set('RoleFilter', params.roleFilter);
    if (params.statusFilter) qs.set('StatusFilter', params.statusFilter);
    return apiFetch<PaginatedData<UserListItem>>(`/api/users?${qs}`);
  },
  getById: (id: string) => apiFetch<UserListItem>(`/api/users/${id}`),
  create: (dto: AddUserRequest) => apiFetch<string>('/api/users', { method: 'POST', body: JSON.stringify(dto) }),
  update: (id: string, dto: UpdateUserRequest) => apiFetch<string>(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
  delete: (id: string) => apiFetch<void>(`/api/users/${id}`, { method: 'DELETE' }),
  changeStatus: (id: string, status: string) => apiFetch<void>(`/api/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  resetPassword: (id: string, newPassword: string) => apiFetch<void>(`/api/users/${id}/reset-password`, { method: 'POST', body: JSON.stringify({ newPassword }) }),
  getRolesDDL: () => apiFetch<Array<{ id: string; name: string }>>('/Role/GetAllRolesDDL'),
};

// ─── Roles API ───────────────────────────────────────────────────────────────

export const rolesApi = {
  getAll: () => apiFetch<Array<{ id: string; name: string; description?: string; isActive: boolean }>>('/Role/GetAllRoles'),
  getDDL: () => apiFetch<Array<{ id: string; name: string }>>('/Role/GetAllRolesDDL'),
};

// ─── Customers API ───────────────────────────────────────────────────────────

export interface CustomerListItem {
  id: number;
  code?: string;
  name: string;
  companyName?: string;
  phone: string;
  email?: string;
  customerCategory?: string;
  status: string;
  balance: number;
  registeredAt?: string;
  lastOrderDate?: string;
}

export interface CustomerDetails extends CustomerListItem {
  address?: string;
  taxNumber?: string;
  creditLimit?: number;
  notes?: string;
}

export interface CreateCustomerRequest {
  code?: string;
  name: string;
  companyName?: string;
  phone: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  customerCategory?: string;
  status: string;
  creditLimit?: number;
  registeredAt?: string;
  notes?: string;
}

export interface UpdateCustomerRequest extends CreateCustomerRequest {
  id: number;
}

export interface AccountTransaction {
  id: number;
  transactionDate: string;
  transactionType: string;
  referenceType?: string;
  referenceId?: number;
  debitAmount: number;
  creditAmount: number;
  balanceAfter?: number;
  notes?: string;
  createdBy?: string;
}

export interface AddAccountTransactionRequest {
  transactionType: string;
  referenceType?: string;
  referenceId?: number;
  debitAmount: number;
  creditAmount: number;
  notes?: string;
}

export const customersApi = {
  getList: (page = 1, pageSize = 10, search?: string, category?: string, status?: string) => {
    const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search) qs.set('search', search);
    if (category) qs.set('category', category);
    if (status) qs.set('status', status);
    return apiFetch<PaginatedData<CustomerListItem>>(`/api/customers?${qs}`);
  },
  getById: (id: number) => apiFetch<CustomerDetails>(`/api/customers/${id}`),
  create: (dto: CreateCustomerRequest) => apiFetch<number>('/api/customers', { method: 'POST', body: JSON.stringify(dto) }),
  update: (id: number, dto: UpdateCustomerRequest) => apiFetch<void>(`/api/customers/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
  delete: (id: number) => apiFetch<void>(`/api/customers/${id}`, { method: 'DELETE' }),
  changeStatus: (id: number, status: string) => apiFetch<void>(`/api/customers/${id}/status`, { method: 'PATCH', body: JSON.stringify(status), headers: { 'Content-Type': 'application/json' } }),
  getDropdown: () => apiFetch<Array<{ id: number; name: string }>>('/api/customers/dropdown'),
  getTransactions: (id: number, page = 1, pageSize = 10) =>
    apiFetch<PaginatedData<AccountTransaction>>(`/api/customers/${id}/account-transactions?page=${page}&pageSize=${pageSize}`),
  addTransaction: (id: number, dto: AddAccountTransactionRequest) =>
    apiFetch<void>(`/api/customers/${id}/account-transactions`, { method: 'POST', body: JSON.stringify(dto) }),
};

// ─── Items API ───────────────────────────────────────────────────────────────

export interface ItemListItem {
  id: number;
  itemCode: string;
  name: string;
  alternateName?: string;
  barcode?: string;
  imageUrl?: string;
  itemCategoryId: number;
  itemCategoryName?: string;
  unitOfMeasureId: number;
  unitOfMeasureName?: string;
  itemType: string;
  trackingType: string;
  minQuantity: number;
  maxQuantity: number;
  reorderPoint: number;
  reorderQuantity: number;
  dailyUsage: number;
  averageDeliveryDays: number;
  status: string;
  notes?: string;
  currentStockQuantity: number;
  currentStockWeight: number;
  stockStatus: string;
}

export interface CreateItemRequest {
  itemCode: string;
  name: string;
  alternateName?: string;
  barcode?: string;
  imageUrl?: string;
  itemCategoryId: number;
  unitOfMeasureId: number;
  itemType: string;
  trackingType: string;
  minQuantity: number;
  maxQuantity: number;
  reorderPoint: number;
  reorderQuantity: number;
  dailyUsage: number;
  averageDeliveryDays: number;
  status: string;
  notes?: string;
}

export interface UpdateItemRequest extends CreateItemRequest {
  id: number;
}

export const itemsApi = {
  getList: (page = 1, pageSize = 50, search?: string, categoryId?: number) => {
    const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search) qs.set('search', search);
    if (categoryId) qs.set('categoryId', String(categoryId));
    return apiFetch<PaginatedData<ItemListItem>>(`/api/items?${qs}`);
  },
  getById: (id: number) => apiFetch<ItemListItem>(`/api/items/${id}`),
  create: (dto: CreateItemRequest) => apiFetch<number>('/api/items', { method: 'POST', body: JSON.stringify(dto) }),
  update: (id: number, dto: UpdateItemRequest) => apiFetch<void>(`/api/items/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
  delete: (id: number) => apiFetch<void>(`/api/items/${id}`, { method: 'DELETE' }),
  changeStatus: (id: number, status: string) => apiFetch<void>(`/api/items/${id}/status`, { method: 'PATCH', body: JSON.stringify(status) }),
  getDropdown: () => apiFetch<Array<{ id: number; name: string }>>('/api/items/dropdown'),
};

// ─── Item Categories API ─────────────────────────────────────────────────────

export interface ItemCategory {
  id: number;
  name: string;
  code: string;
  description?: string;
  parentCategoryId?: number;
  parentCategoryName?: string;
  displayColor?: string;
  iconName?: string;
  isActive: boolean;
}

export interface ItemCategoryTree extends ItemCategory {
  subCategories: ItemCategoryTree[];
}

export interface CreateItemCategoryRequest {
  name: string;
  code: string;
  description?: string;
  parentCategoryId?: number;
  displayColor?: string;
  iconName?: string;
  isActive: boolean;
}

export interface UpdateItemCategoryRequest extends CreateItemCategoryRequest {
  id: number;
}

export const itemCategoriesApi = {
  getAll: () => apiFetch<ItemCategory[]>('/api/item-categories'),
  getTree: () => apiFetch<ItemCategoryTree[]>('/api/item-categories/tree'),
  getDropdown: () => apiFetch<Array<{ id: number; name: string }>>('/api/item-categories/dropdown'),
  getById: (id: number) => apiFetch<ItemCategory>(`/api/item-categories/${id}`),
  create: (dto: CreateItemCategoryRequest) => apiFetch<number>('/api/item-categories', { method: 'POST', body: JSON.stringify(dto) }),
  update: (id: number, dto: UpdateItemCategoryRequest) => apiFetch<void>(`/api/item-categories/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
  delete: (id: number) => apiFetch<void>(`/api/item-categories/${id}`, { method: 'DELETE' }),
};

// ─── Warehouses API ──────────────────────────────────────────────────────────

export interface WarehouseItem {
  id: number;
  warehouseCode: string;
  name: string;
  warehouseType: string;
  status: string;
  responsibleEmployeeId?: number;
  responsibleEmployeeName?: string;
  totalCapacity: number;
  currentUtilization: number;
  notes?: string;
}

export interface CreateWarehouseRequest {
  warehouseCode: string;
  name: string;
  warehouseType: string;
  status: string;
  responsibleEmployeeId?: number;
  totalCapacity: number;
  currentUtilization: number;
  notes?: string;
}

export interface UpdateWarehouseRequest extends CreateWarehouseRequest {
  id: number;
}

export const warehousesApi = {
  getAll: () => apiFetch<WarehouseItem[]>('/api/warehouses'),
  getDropdown: () => apiFetch<Array<{ id: number; name: string }>>('/api/warehouses/dropdown'),
  getById: (id: number) => apiFetch<WarehouseItem>(`/api/warehouses/${id}`),
  create: (dto: CreateWarehouseRequest) => apiFetch<number>('/api/warehouses', { method: 'POST', body: JSON.stringify(dto) }),
  update: (id: number, dto: UpdateWarehouseRequest) => apiFetch<void>(`/api/warehouses/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
  delete: (id: number) => apiFetch<void>(`/api/warehouses/${id}`, { method: 'DELETE' }),
};

// ─── Warehouse Locations API ─────────────────────────────────────────────────

export interface WarehouseLocation {
  id: number;
  warehouseId: number;
  warehouseName: string;
  code: string;
  name: string;
  parentLocationId?: number;
  parentLocationName?: string;
  isActive: boolean;
}

export const warehouseLocationsApi = {
  getAll: (warehouseId = 0) => apiFetch<WarehouseLocation[]>(`/api/warehouse-locations?warehouseId=${warehouseId}`),
  create: (dto: { warehouseId: number; code: string; name: string; parentLocationId?: number; isActive: boolean }) =>
    apiFetch<number>('/api/warehouse-locations', { method: 'POST', body: JSON.stringify(dto) }),
  update: (id: number, dto: { id: number; warehouseId: number; code: string; name: string; parentLocationId?: number; isActive: boolean }) =>
    apiFetch<void>(`/api/warehouse-locations/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
  delete: (id: number) => apiFetch<void>(`/api/warehouse-locations/${id}`, { method: 'DELETE' }),
};

// ─── Inventory Transactions API ──────────────────────────────────────────────

export interface InventoryTransactionLine {
  id: number;
  itemId: number;
  itemName: string;
  warehouseId: number;
  warehouseName: string;
  warehouseLocationId?: number;
  warehouseLocationName?: string;
  quantity: number;
  weight: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  sequenceNumber: number;
}

export interface InventoryTransactionItem {
  id: number;
  transactionNumber: string;
  transactionDate: string;
  transactionType: string;
  transactionDirection: string;
  warehouseId?: number;
  warehouseName?: string;
  warehouseLocationId?: number;
  warehouseLocationName?: string;
  partnerId?: number;
  partnerName?: string;
  costCenterId?: number;
  costCenterName?: string;
  equipmentId?: number;
  equipmentName?: string;
  requiresCostCenter: boolean;
  weightBridgeReference?: string;
  externalReferenceNumber?: string;
  invoiceImageUrl?: string;
  status: string;
  notes?: string;
  createdAt: string;
  lines: InventoryTransactionLine[];
}

export interface CreateTransactionLineRequest {
  itemId: number;
  warehouseId: number;
  warehouseLocationId?: number;
  quantity: number;
  weight: number;
  unitPrice: number;
  notes?: string;
}

export interface CreateInventoryTransactionRequest {
  transactionDate: string;
  transactionType: string;
  transactionDirection: string;
  warehouseId?: number;
  warehouseLocationId?: number;
  partnerId?: number;
  costCenterId?: number;
  equipmentId?: number;
  requiresCostCenter: boolean;
  weightBridgeReference?: string;
  externalReferenceNumber?: string;
  invoiceImageUrl?: string;
  status: string;
  notes?: string;
  lines: CreateTransactionLineRequest[];
}

export interface UpdateInventoryTransactionRequest extends CreateInventoryTransactionRequest {
  id: number;
}

export const inventoryTransactionsApi = {
  getList: (page = 1, pageSize = 50, search?: string, type?: string, status?: string, fromDate?: string, toDate?: string) => {
    const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search) qs.set('search', search);
    if (type) qs.set('type', type);
    if (status) qs.set('status', status);
    if (fromDate) qs.set('fromDate', fromDate);
    if (toDate) qs.set('toDate', toDate);
    return apiFetch<PaginatedData<InventoryTransactionItem>>(`/api/inventory-transactions?${qs}`);
  },
  getReceipts: (page = 1, pageSize = 50, search?: string, status?: string) => {
    const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search) qs.set('search', search);
    if (status) qs.set('status', status);
    return apiFetch<PaginatedData<InventoryTransactionItem>>(`/api/inventory-transactions/receipts?${qs}`);
  },
  getIssues: (page = 1, pageSize = 50, search?: string, status?: string) => {
    const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search) qs.set('search', search);
    if (status) qs.set('status', status);
    return apiFetch<PaginatedData<InventoryTransactionItem>>(`/api/inventory-transactions/issues?${qs}`);
  },
  getById: (id: number) => apiFetch<InventoryTransactionItem>(`/api/inventory-transactions/${id}`),
  create: (dto: CreateInventoryTransactionRequest) => apiFetch<number>('/api/inventory-transactions', { method: 'POST', body: JSON.stringify(dto) }),
  update: (id: number, dto: UpdateInventoryTransactionRequest) => apiFetch<void>(`/api/inventory-transactions/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
  delete: (id: number) => apiFetch<void>(`/api/inventory-transactions/${id}`, { method: 'DELETE' }),
  changeStatus: (id: number, status: string) => apiFetch<void>(`/api/inventory-transactions/${id}/status`, { method: 'PATCH', body: JSON.stringify(status) }),
};

// ─── Livestock Batches API ───────────────────────────────────────────────────

export interface LivestockBatchItem {
  id: number;
  batchCode?: string;
  name: string;
  batchType?: string;
  startDate: string;
  endDate?: string;
  targetWeight?: number;
  status: string;
  numberOfHeads: number;
}

export interface LivestockBatchDetails extends LivestockBatchItem {
  createdAt: string;
  createdBy?: string;
}

export interface CreateBatchRequest {
  batchCode?: string;
  name: string;
  batchType?: string;
  startDate: string;
  endDate?: string;
  targetWeight?: number;
  status: string;
  notes?: string;
}

export interface UpdateBatchRequest extends CreateBatchRequest {
  id: number;
}

export const livestockBatchesApi = {
  getList: (page = 1, pageSize = 10, search?: string, status?: string, fromDate?: string, toDate?: string) => {
    const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search) qs.set('search', search);
    if (status) qs.set('status', status);
    if (fromDate) qs.set('fromDate', fromDate);
    if (toDate) qs.set('toDate', toDate);
    return apiFetch<PaginatedData<LivestockBatchItem>>(`/api/livestock-batches?${qs}`);
  },
  getById: (id: number) => apiFetch<LivestockBatchDetails>(`/api/livestock-batches/${id}`),
  create: (dto: CreateBatchRequest) => apiFetch<number>('/api/livestock-batches', { method: 'POST', body: JSON.stringify(dto) }),
  update: (id: number, dto: UpdateBatchRequest) => apiFetch<void>(`/api/livestock-batches/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
  delete: (id: number) => apiFetch<void>(`/api/livestock-batches/${id}`, { method: 'DELETE' }),
  changeStatus: (id: number, status: string) => apiFetch<void>(`/api/livestock-batches/${id}/status`, { method: 'PATCH', body: JSON.stringify(status) }),
  getDropdown: () => apiFetch<Array<{ id: number; name: string }>>('/api/livestock-batches/dropdown'),
};

// ─── Livestock Heads API ─────────────────────────────────────────────────────

export interface LivestockHeadItem {
  id: number;
  headCode?: string;
  tag?: string;
  livestockBatchId: number;
  batchName: string;
  headType?: string;
  breed?: string;
  averageWeight?: number;
  entryDate: string;
  status: string;
  activeHealthAlertsCount: number;
}

export interface LivestockHeadDetails extends LivestockHeadItem {
  vehicleNumber?: string;
  weighbridgePhotoUrl?: string;
  createdAt: string;
  createdBy?: string;
}

export interface CreateHeadRequest {
  headCode?: string;
  tag?: string;
  livestockBatchId: number;
  headType?: string;
  breed?: string;
  averageWeight?: number;
  entryDate: string;
  status: string;
  vehicleNumber?: string;
  weighbridgePhotoUrl?: string;
}

export interface CreateHeadsBulkRequest {
  livestockBatchId: number;
  count: number;
  headType?: string;
  breed?: string;
  averageWeight?: number;
  entryDate: string;
  status: string;
  vehicleNumber?: string;
  weighbridgePhotoUrl?: string;
}

export interface UpdateHeadRequest extends CreateHeadRequest {
  id: number;
}

export const livestockHeadsApi = {
  getList: (page = 1, pageSize = 10, search?: string, batchId?: number, status?: string) => {
    const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search) qs.set('search', search);
    if (batchId) qs.set('batchId', String(batchId));
    if (status) qs.set('status', status);
    return apiFetch<PaginatedData<LivestockHeadItem>>(`/api/livestock-heads?${qs}`);
  },
  getById: (id: number) => apiFetch<LivestockHeadDetails>(`/api/livestock-heads/${id}`),
  create: (dto: CreateHeadRequest) => apiFetch<number>('/api/livestock-heads', { method: 'POST', body: JSON.stringify(dto) }),
  createBulk: (dto: CreateHeadsBulkRequest) => apiFetch<number>('/api/livestock-heads/bulk', { method: 'POST', body: JSON.stringify(dto) }),
  update: (id: number, dto: UpdateHeadRequest) => apiFetch<void>(`/api/livestock-heads/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
  delete: (id: number) => apiFetch<void>(`/api/livestock-heads/${id}`, { method: 'DELETE' }),
  changeStatus: (id: number, status: string) => apiFetch<void>(`/api/livestock-heads/${id}/status`, { method: 'PATCH', body: JSON.stringify(status) }),
  getDropdown: (batchId?: number) => {
    const qs = batchId ? `?batchId=${batchId}` : '';
    return apiFetch<Array<{ id: number; name: string }>>(`/api/livestock-heads/dropdown${qs}`);
  },
};

// ─── Livestock Health Alerts API ─────────────────────────────────────────────

export interface HealthAlertItem {
  id: number;
  livestockHeadId: number;
  headCode?: string;
  headTag?: string;
  alertType: string;
  severity: string;
  title: string;
  status: string;
  alertDate: string;
  closedAt?: string;
}

export interface HealthAlertDetails extends HealthAlertItem {
  description?: string;
  createdBy?: string;
  createdAt: string;
}

export interface CreateHealthAlertRequest {
  livestockHeadId: number;
  alertType: string;
  severity: string;
  title: string;
  description?: string;
  status: string;
}

export interface UpdateHealthAlertRequest extends CreateHealthAlertRequest {
  id: number;
}

export const healthAlertsApi = {
  getList: (page = 1, pageSize = 10, search?: string, headId?: number, severity?: string, status?: string) => {
    const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search) qs.set('search', search);
    if (headId) qs.set('headId', String(headId));
    if (severity) qs.set('severity', severity);
    if (status) qs.set('status', status);
    return apiFetch<PaginatedData<HealthAlertItem>>(`/api/livestock-health-alerts?${qs}`);
  },
  getById: (id: number) => apiFetch<HealthAlertDetails>(`/api/livestock-health-alerts/${id}`),
  create: (dto: CreateHealthAlertRequest) => apiFetch<number>('/api/livestock-health-alerts', { method: 'POST', body: JSON.stringify(dto) }),
  update: (id: number, dto: UpdateHealthAlertRequest) => apiFetch<void>(`/api/livestock-health-alerts/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
  delete: (id: number) => apiFetch<void>(`/api/livestock-health-alerts/${id}`, { method: 'DELETE' }),
  changeStatus: (id: number, status: string) => apiFetch<void>(`/api/livestock-health-alerts/${id}/status`, { method: 'PATCH', body: JSON.stringify(status) }),
};
