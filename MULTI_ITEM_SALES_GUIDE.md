# Multi-Item Sales Feature Guide

## Overview
Your sales system now supports **customers buying multiple items in a single transaction**, just like a real invoice. Instead of creating separate sales for each item, customers can add multiple different materials to one sale order.

## What's New

### 1. **Multiple Items Per Sale**
When recording a sale, customers can now:
- Add multiple materials to the same customer order
- Specify different quantities and rates for each material
- See the subtotal for each item and grand total
- Apply a single payment to the entire order

**Example Use Case:**
Customer ABC wants to buy:
- 100 KG of Material A at Rs. 155/KG = Rs. 15,500
- 50 KG of Material B at Rs. 200/KG = Rs. 10,000
- **Total Invoice = Rs. 25,500** (single transaction)

### 2. **Invoice-Style Form**
The new sales form works like an invoice:

```
Customer Name: [Customer ABC]

Items:
┌─────────────────────────────────────────┐
│ Material: Material A                     │
│ Quantity: 100 KG                        │
│ Rate: 155 Rs/KG                         │
│ Subtotal: 15,500                        │
│ [x] Remove Item                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Material: Material B                     │
│ Quantity: 50 KG                         │
│ Rate: 200 Rs/KG                         │
│ Subtotal: 10,000                        │
│ [x] Remove Item                         │
└─────────────────────────────────────────┘

[+ Add Item]

Paid Amount: [________]

─────────────────────────────────────────
Grand Total: 25,500
Paid: 10,000
Due: 15,500
─────────────────────────────────────────

[Record Sale]
```

## How to Use

### Recording a Multi-Item Sale

1. **Go to Sales Entry page**

2. **Enter Customer Name**
   - Type the customer or company name

3. **Add First Item**
   - Select material from dropdown
   - Enter quantity in KG
   - Enter rate per KG (auto-fills with default, or override with custom rate)
   - Subtotal calculates automatically

4. **Add More Items (Optional)**
   - Click "+ Add Item" button
   - Repeat steps above for each material
   - Remove items with the X button if needed

5. **Enter Payment**
   - Enter partial or full payment amount
   - Due amount calculates automatically

6. **Save**
   - Click "Record Sale"
   - System creates separate sale records for each item (one database row per item, all linked to the same customer)
   - Stock is automatically updated for all materials
   - Page refreshes with updated data

### Editing a Sale

Currently, edits are done one item at a time (matching the database structure). To modify a multi-item sale:
1. Click the edit button next to the sale
2. Update the specific item's details
3. Click "Update Sale"

### Deleting a Sale

- Click the delete button next to any item
- Confirm the deletion
- Stock is restored for that item
- Other items in the same customer order remain unaffected

## Key Features

✅ **Easy Item Management**
- Add items with "+ Add Item" button
- Remove items with X button (minimum 1 item required)
- See item count at top of form

✅ **Smart Rate Handling**
- Default rate auto-filled from material settings
- Toggle "Custom" button to override rate per item
- Each item can have different rates

✅ **Real-Time Calculations**
- Subtotal for each item updates instantly
- Grand total across all items
- Due amount calculated automatically

✅ **Invoice Summary**
- Clear breakdown of Grand Total, Paid, and Due Amount
- Color-coded due amount (orange if unpaid, green if fully paid)

✅ **Automatic Stock Management**
- All materials' stock updated instantly when sale recorded
- Stock deductions happen immediately
- Accurate inventory tracking

✅ **Real-Time Sync**
- Page updates automatically after saving
- All connected users see the new sales instantly
- Data consistency across devices

## Database Impact

Behind the scenes:
- Each item creates a separate `sales` record in the database
- All items share the same customer name
- Each item is linked to one material
- Payment can be tracked per item or aggregated

**Example Database Structure:**
```
Sales Table:
ID    | Customer   | Material    | Qty | Rate | Total | Paid | Due
------|------------|-------------|-----|------|-------|------|-----
sale1 | Cust ABC   | Material A  | 100 | 155  | 15500 | 0    | 0
sale2 | Cust ABC   | Material B  | 50  | 200  | 10000 | 0    | 0
```

## Validation Rules

The system validates:
- ✓ Customer name is required
- ✓ Each item must have material, quantity, and rate
- ✓ Quantity must be > 0
- ✓ Available stock is sufficient for each material
- ✓ At least 1 item required

**Example Errors:**
- "All line items must have material, quantity, and rate" - Missing field in an item
- "Insufficient stock for Material A. Need 150 KG, available: 100 KG" - Not enough stock
- "At least one line item is required" - Tried to remove the last item

## Reports & Analytics

All sales show up individually in:
- **Sales History table** - Each item appears as separate row
- **Dashboard charts** - Reflects all items sold
- **Statistics** - Includes all items in calculations

To view consolidated sales by customer, group items with the same customer name in the history table.

## Tips & Tricks

💡 **Quick Sales Entry**
- Default rates speed up entry for regular items
- Use Tab key to move between fields
- Click "Custom" only when price differs from default

💡 **Bulk Orders**
- Add multiple quantities of the same material with different rates
- Useful for tiered pricing (100 KG at 150 Rs, 50 KG at 140 Rs)

💡 **Payment Tracking**
- Track partial payments in the "Paid Amount" field
- Due amount shows balance due automatically
- Works across all items in the order

💡 **Editing**
- Edit individual items without affecting others
- Stock calculations update automatically

## Common Scenarios

### Scenario 1: Complete Order with Multiple Materials
A wholesale customer orders 3 different materials at once.
- Add all 3 items to the form
- Record once
- All 3 sales created instantly
- Stock updated for all materials

### Scenario 2: Partial Payment with Multiple Items
Customer orders Rs. 50,000 worth of goods but pays Rs. 20,000.
- Add multiple items with total Rs. 50,000
- Enter Rs. 20,000 in "Paid Amount"
- Due amount shows Rs. 30,000
- Track the due amount for follow-up

### Scenario 3: Tiered Pricing
Same material, different rates based on quantity.
- Add Material A: 100 KG at Rs. 160/KG = Rs. 16,000
- Add Material A: 50 KG at Rs. 150/KG = Rs. 7,500
- Total = Rs. 23,500 for that material

## Troubleshooting

**Q: Can I combine two items into one?**
A: Not yet - each item is tracked separately. This is intentional for accurate stock tracking.

**Q: What if I need to change the paid amount?**
A: Edit the sale and update the paid amount - the due amount recalculates automatically.

**Q: How do I see sales grouped by customer?**
A: Look for items with the same customer name in the Sales History table.

**Q: Can I delete a single item from a multi-item order?**
A: Yes - click delete on that specific item. Other items remain.

**Q: What happens if I enter a wrong rate?**
A: Edit the sale and correct the rate, or delete and re-record.

## Files Modified

- **[frontend/src/pages/SalesPage.jsx](../../frontend/src/pages/SalesPage.jsx)**
  - Multi-item form with add/remove functionality
  - Line item calculations
  - Invoice-style summary

- **[frontend/src/context/DataContext.jsx](../../frontend/src/context/DataContext.jsx)**
  - `addMultipleSalesHandler` - Processes multiple items
  - Handles stock updates for all materials
  - Real-time syncing after multi-item save

## Next Steps

Potential future enhancements:
- [ ] Print invoice for multi-item orders
- [ ] Email invoice to customer
- [ ] Customer-wise consolidated reports
- [ ] Discount codes for bulk orders
- [ ] Tax calculation per item
- [ ] Item-level payment tracking
- [ ] Customer credit/account system

Your sales system now handles real-world multi-item transactions! 🎉
