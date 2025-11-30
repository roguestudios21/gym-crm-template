# 🏋️ Gym CRM - Complete Management System

A comprehensive **Gym Customer Relationship Management** system built with the MERN stack (MongoDB, Express.js, React, Node.js). This modern web application helps gym owners manage members, staff, sales, invoices, payments, and more with an intuitive and beautiful user interface.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.x-61dafb)
![Node](https://img.shields.io/badge/Node-18.x-green)
![MongoDB](https://img.shields.io/badge/MongoDB-6.x-brightgreen)

---

## ✨ Features

### 👥 Member Management
- **Complete Member Profiles** - Name, contact, email, DOB, gender, emergency contacts
- **Profile Pictures** - Upload and display member photos (5MB max, JPEG/PNG)
- **Membership Plans** - Track active plans, start/end dates, session credits
- **Status Tracking** - Active, Inactive, Frozen member statuses
- **Advanced Search** - Filter members by name, email, or status
- **Member ID Generation** - Auto-generated unique member IDs

### 💼 Staff Management
- **Staff Profiles** - Name, role, contact information, email
- **Role-based Organization** - Trainers, Receptionists, Managers
- **Availability Tracking** - Schedule and availability management
- **Delete Protection** - Confirm before removing staff members

### 💰 Sales & Finance
- **Point of Sale (POS)** - Quick sale recording with auto-invoice generation
- **Real-time Dashboard** - Today's sales, monthly sales, total revenue
- **Product/Service Sales** - Link sales to membership plans or products
- **Payment Modes** - Cash, Card, UPI, Bank Transfer
- **Transaction Atomicity** - Mongoose transactions ensure data integrity

### 📄 Invoice Management
- **Auto-generated Invoice Numbers** - Sequential numbering (INV-YYYY-NNNN)
- **Detailed Line Items** - Description, quantity, unit price, amount
- **Tax & Discount Support** - Flexible pricing calculations
- **Payment Tracking** - Paid amount, balance, payment history
- **Status Management** - Paid, Pending, Partial, Overdue, Draft
- **PDF Generation** - Download invoices as PDF with jsPDF
- **Real-time Search** - Filter by invoice number or member

### 💳 Payment Processing
- **Payment Recording** - Link payments to invoices
- **Receipt Generation** - Auto-generated receipt numbers (PAY-YYYY-NNNN)
- **PDF Receipts** - Download payment receipts
- **Payment History** - Track all transactions per invoice
- **Multiple Payment Modes** - Support for various payment methods

### 📦 Product/Membership Plans
- **Product Catalog** - Manage memberships, session packs, supplements
- **Pricing Management** - Set prices and durations
- **Category Organization** - Organize products by type
- **Grid View Display** - Beautiful card-based product display

### 📞 Enquiry Management
- **Lead Tracking** - Capture potential member enquiries
- **Status Workflow** - Open, Converted, Closed
- **Quick Conversion** - Convert enquiries to members with one click
- **Contact Information** - Name, contact, type, remarks

### 📊 Dashboard & Analytics
- **Key Metrics** - Active members, revenue, appointments, attendance
- **Sales Chart** - Weekly sales visualization with Chart.js
- **Today's Appointments** - Quick view of upcoming sessions
- **Expiring Memberships** - Alert for members with expiring plans

---

## 🎨 UI/UX Highlights

### Modern Component Library
- **Toast Notifications** - Success, error, warning, info messages
- **Loading States** - Consistent spinners with contextual messages
- **Empty States** - Beautiful illustrations with call-to-action buttons
- **Confirmation Dialogs** - Prevent accidental deletions
- **Responsive Design** - Mobile-friendly layout with DaisyUI

### Professional Features
- **Null-safe Rendering** - No crashes from missing data
- **Error Boundaries** - Graceful error handling
- **Search & Filters** - Real-time filtering on all list pages
- **Profile Picture Fallbacks** - Initials-based avatars
- **Status Badges** - Color-coded visual indicators

---

## 🏗️ Tech Stack

### Frontend
- **React 18** - Modern hooks-based architecture
- **React Router** - Client-side routing
- **DaisyUI** - Beautiful Tailwind CSS components
- **Lucide React** - Icon library
- **jsPDF & jsPDF-AutoTable** - PDF generation
- **Recharts** - Data visualization
- **Axios** - HTTP client

### Backend
- **Node.js 18+** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM with schema validation
- **Multer** - File upload handling
- **Express Validator** - Input validation middleware
- **CORS** - Cross-origin resource sharing

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- MongoDB 6.x or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/gym-crm.git
cd gym-crm
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

4. **Configure Environment Variables**

Create `.env` file in the backend directory:
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/gym_crm
FRONTEND_URL=http://localhost:5173
```

5. **Start MongoDB**
```bash
mongod
```

6. **Start Backend Server**
```bash
cd backend
npm run dev
```

7. **Start Frontend Development Server**
```bash
cd frontend
npm run dev
```

8. **Access the Application**
Open your browser and navigate to `http://localhost:5173`

---

## 📁 Project Structure

```
gym-crm/
├── backend/
│   ├── src/
│   │   ├── models/          # Mongoose schemas
│   │   │   ├── Member.js
│   │   │   ├── Staff.js
│   │   │   ├── Invoice.js
│   │   │   ├── Payment.js
│   │   │   ├── Sales.js
│   │   │   └── Product.js
│   │   ├── routes/          # Express routes
│   │   │   ├── members.js
│   │   │   ├── staff.js
│   │   │   ├── invoices.js
│   │   │   ├── payments.js
│   │   │   ├── sales.js
│   │   │   └── products.js
│   │   ├── middleware/      # Custom middleware
│   │   │   └── validation.js
│   │   ├── config/          # Configuration
│   │   │   └── db.js
│   │   └── server.js        # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── Toast.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── hooks/           # Custom hooks
│   │   │   └── useToast.js
│   │   ├── pages/           # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Members.jsx
│   │   │   ├── MemberForm.jsx
│   │   │   ├── Staff.jsx
│   │   │   ├── Sales.jsx
│   │   │   ├── Invoices.jsx
│   │   │   ├── InvoiceView.jsx
│   │   │   ├── Payments.jsx
│   │   │   ├── Products.jsx
│   │   │   └── Enquiries.jsx
│   │   ├── api.js           # Axios configuration
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   └── package.json
└── README.md
```

---

## 🔧 Recent Improvements & Bug Fixes

### Critical Fixes (Priority 1)
✅ **Invoice Field Standardization** - Fixed `issueDate` → `invoiceDate` mismatch  
✅ **Payment Number Generation** - Eliminated race condition with robust "find last" strategy  
✅ **Search Filter Null Safety** - All filters handle missing data gracefully  
✅ **Real Dashboard Data** - Replaced mock data with actual sales history API  
✅ **Transaction Support** - Wrapped sales in Mongoose transactions for atomicity  

### High Priority Fixes
✅ **Toast Notifications** - Added user-friendly error/success feedback  
✅ **File Upload Validation** - JPEG/PNG only, 5MB max with client & server validation  
✅ **Orphaned Reference Protection** - Prevent deletion of members with existing records  

### UI/UX Enhancements
✅ **Component Library** - Created 5 reusable components (Toast, LoadingSpinner, EmptyState, ConfirmDialog, useToast)  
✅ **Consistent Loading States** - Applied LoadingSpinner across all pages  
✅ **Beautiful Empty States** - Context-aware empty states with CTAs  
✅ **Delete Confirmations** - Modal confirmations for all destructive actions  
✅ **Profile Picture Handling** - Fallback to initials on image load error  

### Backend Security
✅ **CORS Configuration** - Restricted to frontend URL only  
✅ **Input Validation** - Express-validator middleware for data sanitization  
✅ **File Upload Security** - Server-side type and size validation  

---

## 🎯 API Endpoints

### Members
- `GET /api/members` - List all members
- `GET /api/members/:id` - Get member details
- `POST /api/members` - Create new member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member (with validation)
- `GET /api/members/expiring/list` - Get expiring memberships

### Staff
- `GET /api/staff` - List all staff
- `POST /api/staff/create` - Create new staff
- `PUT /api/staff/update/:id` - Update staff
- `DELETE /api/staff/:id` - Delete staff

### Sales
- `GET /api/sales` - List all sales
- `POST /api/sales/add` - Record new sale (creates invoice & payment)
- `GET /api/sales/history` - Get sales history for charts
- `GET /api/sales/report` - Get sales report

### Invoices
- `GET /api/invoices` - List all invoices
- `GET /api/invoices/:id` - Get invoice details
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/:id` - Update invoice
- `POST /api/invoices/:id/payment` - Record payment

### Payments
- `GET /api/payments` - List all payments
- `POST /api/payments` - Create payment
- `GET /api/payments/member/:memberID` - Get member payments

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Record a sale and verify invoice/payment creation
- [ ] Upload member profile picture (valid and invalid formats)
- [ ] Search members with partial names
- [ ] Delete member with existing invoices (should fail)
- [ ] View Dashboard sales chart with real data
- [ ] Generate PDF invoice and receipt
- [ ] Convert enquiry to member

### Browser Compatibility
- ✅ Chrome 100+
- ✅ Firefox 100+
- ✅ Safari 15+
- ✅ Edge 100+

---

## 📝 Common Tasks

### Reset Database
```bash
cd backend
node scripts/resetDb.js
```

### Add Sample Data
Create sample members, products, and sales through the UI or directly via MongoDB.

### Backup Database
```bash
mongodump --db gym_crm --out ./backup
```

### Restore Database
```bash
mongorestore --db gym_crm ./backup/gym_crm
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **DaisyUI** - Beautiful Tailwind CSS components
- **Lucide** - Open-source icon library
- **jsPDF** - Client-side PDF generation
- **Recharts** - Composable charting library

---

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

## 🗺️ Roadmap

### Upcoming Features
- [ ] SMS/Email notifications for expiring memberships
- [ ] Attendance tracking with QR codes
- [ ] Class schedule management
- [ ] Trainer assignment and session booking
- [ ] Mobile app (React Native)
- [ ] Advanced reporting with data export
- [ ] Payment gateway integration (Stripe/Razorpay)
- [ ] Multi-branch support
- [ ] Role-based access control (RBAC)

---

**Made with ❤️ for Gym Owners**
