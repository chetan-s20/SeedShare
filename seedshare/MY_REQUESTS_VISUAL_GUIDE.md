# My Requests Pop-up Modal - Visual Guide

## Modal Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Request Details                                        [X] │
│  View your seed request details and status                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Status                            [🟡 PENDING]             │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  📦 Seed Information                                        │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ [IMG]  Heirloom Tomato                              │  │
│  │        Solanum lycopersicum                         │  │
│  │        Variety: Brandywine                          │  │
│  │        Available: 50 units                          │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  💬 Request Details                                         │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 📦 Quantity Requested: 10 units                     │  │
│  │ 📅 Date Requested: Oct 14, 2025, 10:30 AM          │  │
│  │ 👤 Seed Owner: John Gardener                        │  │
│  │                                                      │  │
│  │ Message from you:                                   │  │
│  │ ┌─────────────────────────────────────────────┐    │  │
│  │ │ Hi! I'm interested in growing heirloom      │    │  │
│  │ │ tomatoes this season. Would love to try     │    │  │
│  │ │ Brandywine variety. Thanks!                 │    │  │
│  │ └─────────────────────────────────────────────┘    │  │
│  │                                                      │  │
│  │ Response from owner:                                │  │
│  │ ┌─────────────────────────────────────────────┐    │  │
│  │ │ Your request has been approved! Let's       │    │  │
│  │ │ coordinate pickup. I'm available this week. │    │  │
│  │ └─────────────────────────────────────────────┘    │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                 [Cancel Request]  [Close]                   │
└─────────────────────────────────────────────────────────────┘
```

## Modal States

### 1. Pending Request (Requester View)
```
Actions Available:
- ❌ Cancel Request
- 👁️ View Seed Details
```

### 2. Pending Request (Owner View)
```
Optional Response Message:
┌──────────────────────────────────────────┐
│ Add a message to your response...        │
│                                          │
│                                          │
└──────────────────────────────────────────┘

Actions Available:
- ✅ Approve (Green button)
- ❌ Reject (Outline button)
```

### 3. Approved Request (Owner View)
```
Has the seed exchange been completed? Mark it as 
complete to finalize the transaction.

Completion Message (Optional):
┌──────────────────────────────────────────┐
│ Add any final notes...                   │
└──────────────────────────────────────────┘

Actions Available:
- ✅ Mark as Completed (Blue button)
```

### 4. Completed Request
```
Status: 🔵 COMPLETED

Display only - no actions available
Shows completion message if provided
```

## Status Badge Colors

```
🟡 PENDING    → Yellow background, yellow text
🟢 APPROVED   → Green background, green text
🔴 REJECTED   → Red background, red text
🔵 COMPLETED  → Blue background, blue text
```

## Main Requests Page Layout

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ← Back to Seed Library                                     │
│                                                              │
│  My Seed Requests                                           │
│  Manage your seed exchange requests and respond to          │
│  requests from others                                       │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌────────────────────────────┬────────────────────────────────┐
│                            │                                │
│  📤 Requests I've Made  3  │  📥 Requests I've Received  5  │
│                            │                                │
│  ┌──────────────────────┐  │  ┌──────────────────────────┐  │
│  │ [IMG] Tomato Seeds   │  │  │ [IMG] Pepper Seeds      │  │
│  │ 🟡 PENDING           │  │  │ 🟡 PENDING              │  │
│  │ Qty: 10 units        │  │  │ Qty: 5 units            │  │
│  │ Owner: John          │  │  │ From: Mary              │  │
│  │ Oct 14, 2025         │  │  │ Oct 14, 2025            │  │
│  │                      │  │  │                         │  │
│  │ [View Details] [Seed]│  │  │ [View Details] [Seed]   │  │
│  └──────────────────────┘  │  └──────────────────────────┘  │
│                            │                                │
│  ┌──────────────────────┐  │  ┌──────────────────────────┐  │
│  │ [IMG] Lettuce Seeds  │  │  │ [IMG] Carrot Seeds      │  │
│  │ 🟢 APPROVED          │  │  │ 🟢 APPROVED             │  │
│  │ Qty: 20 units        │  │  │ Qty: 15 units           │  │
│  │ Owner: Sarah         │  │  │ From: Bob               │  │
│  │ Oct 12, 2025         │  │  │ Oct 13, 2025            │  │
│  │                      │  │  │                         │  │
│  │ Response: Approved!  │  │  │ Response: Happy to help │  │
│  │                      │  │  │                         │  │
│  │ [View Details] [Seed]│  │  │ [View Details] [Seed]   │  │
│  └──────────────────────┘  │  └──────────────────────────┘  │
│                            │                                │
│  ┌──────────────────────┐  │  ┌──────────────────────────┐  │
│  │ [IMG] Basil Seeds    │  │  │ [IMG] Cucumber Seeds    │  │
│  │ 🔵 COMPLETED         │  │  │ 🔵 COMPLETED            │  │
│  │ Qty: 5 units         │  │  │ Qty: 10 units           │  │
│  │ Owner: Mike          │  │  │ From: Lisa              │  │
│  │ Oct 10, 2025         │  │  │ Oct 11, 2025            │  │
│  │                      │  │  │                         │  │
│  │ [View Details] [Seed]│  │  │ [View Details] [Seed]   │  │
│  └──────────────────────┘  │  └──────────────────────────┘  │
│                            │                                │
└────────────────────────────┴────────────────────────────────┘
```

## Empty States

### No Sent Requests
```
┌─────────────────────────────────┐
│           📦                    │
│                                 │
│     No Requests Yet             │
│                                 │
│  You haven't made any seed      │
│  requests yet. Browse the seed  │
│  library to find seeds you're   │
│  interested in.                 │
│                                 │
│      [Browse Seeds]             │
│                                 │
└─────────────────────────────────┘
```

### No Received Requests
```
┌─────────────────────────────────┐
│           📥                    │
│                                 │
│   No Requests Received          │
│                                 │
│  You haven't received any seed  │
│  requests yet. Add your seeds   │
│  to the library to start        │
│  receiving requests.            │
│                                 │
│      [Add Your Seeds]           │
│                                 │
└─────────────────────────────────┘
```

## Responsive Behavior

### Desktop (≥1024px)
- Two-column layout (Sent | Received)
- Modal width: max-w-2xl (672px)
- Full modal actions visible

### Tablet (768px - 1023px)
- Two-column maintained
- Adjusted spacing and padding
- Modal adapts to screen size

### Mobile (<768px)
- Single column (stacked layout)
- Sent requests shown first
- Received requests below
- Modal full width with padding
- Action buttons stack vertically

## User Flow Examples

### Example 1: User Requests Seeds
```
1. Browse Library → Find desired seed
2. Click "Request Seed" button
3. Fill form (quantity + message)
4. Submit request
5. Navigate to "My Requests"
6. See request in "Requests I've Made"
7. Click "View Details" to track status
```

### Example 2: Owner Approves Request
```
1. Navigate to "My Requests"
2. See new request in "Requests I've Received"
3. Click "View Details"
4. Review requester info and message
5. Add optional response message
6. Click "Approve" button
7. Earn 10 points
8. Coordinate exchange
9. Click "Mark as Completed"
10. Earn 15 more points
```

## Interaction Details

### Hover States
- Cards: Subtle shadow increase
- Buttons: Background color change
- Status badges: No hover (static)

### Click Actions
- "View Details": Opens modal
- "View Seed": Navigates to seed page
- Action buttons: Execute database update
- Close modal: ESC key or X button

### Loading States
- Buttons show spinner icon
- Text changes to "Processing..."
- Form inputs disabled
- Prevents double-submission

### Success Feedback
- Toast notification appears
- Modal auto-closes
- Page refreshes to show updates
- Points added to profile

---

This pop-up modal system provides a complete, professional seed request management experience!
