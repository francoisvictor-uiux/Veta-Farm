# Cattle Module Integration Test Plan

## Status: ✅ IMPLEMENTATION COMPLETE
All code changes are implemented and compiled successfully. Ready for manual testing.

## What Was Changed

### CattlePage.tsx Integration
- **Removed**: All mock data (INIT_BATCHES, INIT_CATTLE constants)
- **Added**: Real API integration with `livestockBatchesApi` and `livestockHeadsApi`
- **Added**: Data loading with useEffect on component mount
- **Added**: Loading and error states with UI feedback
- **Updated**: All handlers (add/edit/delete) to call real APIs instead of modifying local state
- **Added**: entryDate capture in form
- **Fixed**: Type mappings from API responses to UI types
- **Fixed**: Numeric ID handling (changed from string IDs to numeric IDs)

### API Integration Points
| Operation | Before | After |
|-----------|--------|-------|
| Load Batches | Mock data | `livestockBatchesApi.getList()` |
| Load Cattle | Mock data | `livestockHeadsApi.getList()` |
| Create Batch | Local state update | `livestockBatchesApi.create()` |
| Create Heads | Local state update | `livestockHeadsApi.createBulk()` or `.create()` |
| Update Batch | Local state update | `livestockBatchesApi.update()` |
| Update Head | Local state update | `livestockHeadsApi.update()` |
| Delete Batch | Filter local state | `livestockBatchesApi.delete()` |
| Delete Head | Filter local state | `livestockHeadsApi.delete()` |

## Test Execution Instructions

### Prerequisites
1. Backend running on `http://localhost:5000`
2. Frontend running on `http://localhost:5174/Veta-Farm/`
3. User logged in with valid JWT token (test user recommended)

### Test Cases

#### 1. Initial Load
- [ ] Navigate to Cattle page
- [ ] Observe loading indicator (should appear briefly)
- [ ] Verify batches list loads from API
- [ ] Verify cattle/heads list loads from API
- [ ] Verify no console errors
- **Check**: Browser console for API response logs

#### 2. Add Batch Test
- [ ] Click "فتح دورة جديدة" (Open New Batch) button
- [ ] Fill form:
  - Name: "دورة اختبار 2026"
  - Type: Select "تسمين" or "حلاب"
  - Start Date: Any past/current date
  - End Date: Leave blank or set future date
  - Target Weight: 450
- [ ] Click "فتح الدورة" (Open Batch)
- [ ] Verify new batch appears in table
- [ ] Verify API was called (check console logs)
- [ ] Verify batch can be viewed/edited/deleted

#### 3. Create Heads - Single
- [ ] Click "إضافة رأس / عدد" (Add Head/Number) button
- [ ] Fill form:
  - Batch: Select from dropdown (filtered for active only)
  - Type: Select "تسمين" or "حلاب"
  - Count: Set to "1" (single head)
  - Average Weight: 150
  - Entry Date: Today's date (can be changed)
  - Breed: "هولشتاين"
  - Tag: "TEST-001"
  - Vehicle: "ط ج ح 123"
- [ ] Click "إضافة وحفظ" (Add & Save)
- [ ] Verify new head appears in table
- [ ] Verify payload sent to backend contains all required fields

#### 4. Create Heads - Bulk
- [ ] Click "إضافة رأس / عدد" (Add Head/Number) button
- [ ] Fill form:
  - Batch: Select from dropdown
  - Type: Select "تسمين"
  - Count: Set to "5" (bulk operation)
  - Average Weight: 180
  - Entry Date: Today's date
  - Breed: "بلدي"
- [ ] Click "إضافة وحفظ" (Add & Save)
- [ ] Verify 5 new heads appear in table
- [ ] Verify API called bulk endpoint

#### 5. Edit Batch
- [ ] Click edit icon on any batch row
- [ ] Modify a field (e.g., target weight)
- [ ] Click "حفظ التعديلات" (Save Changes)
- [ ] Verify change applied immediately
- [ ] Verify API update was called

#### 6. Edit Head
- [ ] Click edit icon on any head row
- [ ] Modify fields (e.g., breed, tag)
- [ ] Click "حفظ التعديلات" (Save Changes)
- [ ] Verify change applied
- [ ] Verify batch relationship maintained

#### 7. Delete Batch
- [ ] Click delete icon on a batch row
- [ ] Confirm deletion
- [ ] Verify batch removed from table
- [ ] Verify API delete was called
- [ ] Check if associated heads are handled correctly

#### 8. Delete Head
- [ ] Click delete icon on a head row
- [ ] Confirm deletion
- [ ] Verify head removed from table
- [ ] Verify API delete was called

#### 9. Filtering Tests
- [ ] Filter by type (حلاب / تسمين)
- [ ] Filter by batch dropdown
- [ ] Search by tag/breed
- [ ] Verify pagination works
- [ ] Verify filter combinations work

#### 10. Error Handling
- [ ] Stop backend service
- [ ] Try to load page (should show error)
- [ ] Try to create/edit/delete (should show error message)
- [ ] Restart backend and reload
- [ ] Verify recovery works

## Expected API Payloads

### Create Batch Request
```json
{
  "name": "دورة تسمين 2026",
  "batchType": "fattening",
  "startDate": "2026-01-10",
  "endDate": null,
  "targetWeight": 450,
  "status": "Active"
}
```

### Create Head (Single) Request
```json
{
  "livestockBatchId": 1,
  "headType": "fattening",
  "tag": "TEST-001",
  "breed": "هولشتاين",
  "averageWeight": 150,
  "entryDate": "2026-01-15",
  "status": "Active",
  "vehicleNumber": "ط ج ح 123",
  "weighbridgePhotoUrl": null
}
```

### Create Heads (Bulk) Request
```json
{
  "livestockBatchId": 1,
  "count": 5,
  "headType": "fattening",
  "breed": "بلدي",
  "averageWeight": 180,
  "entryDate": "2026-01-15",
  "status": "Active",
  "vehicleNumber": null,
  "weighbridgePhotoUrl": null
}
```

## Known Areas Requiring Verification

1. **Date Format**: Verify ISO date format (YYYY-MM-DD) is accepted by backend
2. **Status Values**: Confirm backend returns "Active"/"Closed" or similar case variations
3. **Type Mapping**: Verify headType/batchType values from backend (dairy/Dairy/fattening/Fattening)
4. **Numeric Fields**: Verify averageWeight/targetWeight decimal handling
5. **Null Handling**: Verify optional fields can be null/undefined
6. **Dropdown Batch Filter**: Only shows active batches or already-selected batch

## Browser Console Debugging

Enable console to see:
1. API response logs: `console.log('Batches response:', batchesRes)`
2. Mapping logs: `console.log('Mapping batch:', b)`
3. Error logs: `console.error('Error loading cattle data:', err)`

## Success Criteria

✅ All CRUD operations complete without errors
✅ API requests contain correct field names and data types
✅ API responses are correctly mapped to UI
✅ Loading states display appropriately
✅ Error states display with meaningful messages
✅ No console errors related to data binding
✅ Pagination works correctly
✅ Filtering works with various combinations
✅ Dropdown batch filter respects ID types

## Session Summary
- Frontend: http://localhost:5174/Veta-Farm/
- Backend: http://localhost:5000
- Test User: Check AuthContext for credentials
- Database: SQL Server / VetaFarmDb

---
*Integration test created: $(date)*
*Status: Ready for manual testing*
