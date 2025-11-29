# 🏋️ Gym CRM System

A comprehensive Customer Relationship Management (CRM) system designed specifically for gym and fitness centers. This full-stack application helps manage members, staff, appointments, sales, and enquiries with a modern, user-friendly interface.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Member Management
- Add, edit, and delete gym members
- Store comprehensive member profiles including personal details, emergency contacts, and photos
- Track membership status, plans, and payment information
- View member history and activity

### Staff Management
- Manage gym staff with detailed profiles
- Track staff roles, specializations, and schedules
- Store contact information and employment details
- Upload and manage staff photos

### Appointment Scheduling
- Book and manage appointments with trainers
- View appointment calendar and history
- Track appointment status (scheduled, completed, cancelled)
- Gender-specific trainer assignment support

### Sales Tracking
- Record and monitor gym sales transactions
- Track membership sales, renewals, and packages
- Generate sales reports and analytics
- Export sales data

### Enquiry Management
- Capture and manage prospective member enquiries
- Track follow-ups and conversion status
- Store enquiry source and preferences
- Maintain communication history

### Dashboard & Analytics
- Overview of daily appointments
- Member profile alerts and notifications
- Total sales tracking
- Quick access to key metrics

## 🛠️ Tech Stack

### Frontend
- **React** 19.2.0 - UI framework
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **Recharts** - Data visualization and charts
- **Lucide React** - Modern icon library
- **date-fns** - Date utility library

### Backend
- **Node.js** - Runtime environment
- **Express.js** 5.1.0 - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** 9.0.0 - MongoDB ODM
- **Multer** - File upload handling
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing
- **json2csv** - CSV export functionality

## 📁 Project Structure

```
gym-crm/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # Database connection
│   │   ├── models/
│   │   │   ├── Member.js          # Member schema
│   │   │   ├── Staff.js           # Staff schema
│   │   │   ├── Appointment.js     # Appointment schema
│   │   │   ├── Sales.js           # Sales schema
│   │   │   ├── Enquiry.js         # Enquiry schema
│   │   │   └── Reports.js         # Reports schema
│   │   ├── routes/
│   │   │   ├── members.js         # Member routes
│   │   │   ├── staff.js           # Staff routes
│   │   │   ├── appointments.js    # Appointment routes
│   │   │   ├── sales.js           # Sales routes
│   │   │   ├── enquiry.js         # Enquiry routes
│   │   │   └── reports.js         # Reports routes
│   │   ├── utils/                 # Utility functions
│   │   └── server.js              # Express server setup
│   ├── uploads/                   # File upload directory
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Sidebar.jsx        # Navigation sidebar
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx      # Main dashboard
│   │   │   ├── Members.jsx        # Members list
│   │   │   ├── MemberForm.jsx     # Add/Edit member
│   │   │   ├── Staff.jsx          # Staff list
│   │   │   ├── StaffForm.jsx      # Add/Edit staff
│   │   │   ├── Appointments.jsx   # Appointments list
│   │   │   ├── AppointmentForm.jsx # Add/Edit appointment
│   │   │   ├── Sales.jsx          # Sales overview
│   │   │   ├── SalesForm.jsx      # Add/Edit sale
│   │   │   ├── Enquiries.jsx      # Enquiries list
│   │   │   ├── EnquiryForm.jsx    # Add/Edit enquiry
│   │   │   └── Reports.jsx        # Analytics & reports
│   │   ├── App.jsx                # Main app component
│   │   ├── api.js                 # API configuration
│   │   ├── index.css              # Global styles
│   │   └── main.jsx               # App entry point
│   ├── public/                    # Static assets
│   └── package.json
│
├── uploads/                       # Shared upload directory
└── README.md
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (v5.0 or higher)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd gym-crm
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure MongoDB

Ensure MongoDB is running on your system. The application connects to `mongodb://127.0.0.1:27017/gym_crm` by default.

To start MongoDB:

```bash
# macOS (using Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

## 🏃 Running the Application

### Development Mode

You'll need two terminal windows to run both the backend and frontend simultaneously.

#### Terminal 1 - Backend Server

```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:4000`

#### Terminal 2 - Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173` (or another port if 5173 is busy)

### Production Build

#### Build Frontend

```bash
cd frontend
npm run build
```

#### Start Backend in Production

```bash
cd backend
npm start
```

## 🔌 API Endpoints

### Members
- `GET /api/members` - Get all members
- `GET /api/members/:id` - Get member by ID
- `POST /api/members` - Create new member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

### Staff
- `GET /api/staff` - Get all staff
- `GET /api/staff/:id` - Get staff by ID
- `POST /api/staff` - Create new staff
- `PUT /api/staff/:id` - Update staff
- `DELETE /api/staff/:id` - Delete staff

### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Sales
- `GET /api/sales` - Get all sales
- `GET /api/sales/:id` - Get sale by ID
- `POST /api/sales` - Create new sale
- `PUT /api/sales/:id` - Update sale
- `DELETE /api/sales/:id` - Delete sale

### Enquiries
- `GET /api/enquiries` - Get all enquiries
- `GET /api/enquiries/:id` - Get enquiry by ID
- `POST /api/enquiries` - Create new enquiry
- `PUT /api/enquiries/:id` - Update enquiry
- `DELETE /api/enquiries/:id` - Delete enquiry

### Reports
- `GET /api/reports` - Get analytics and reports data

## 🎨 Features in Detail

### Modern, Minimalistic UI
- Clean and intuitive interface
- Responsive design for all screen sizes
- Smooth navigation with React Router
- Professional color scheme and typography

### Data Visualization
- Interactive charts using Recharts
- Sales analytics and trends
- Member growth tracking
- Appointment statistics

### File Management
- Photo upload for members and staff
- Secure file storage
- Image preview and management

### Export Functionality
- Export data to CSV format
- Generate custom reports
- Download member and sales data

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Development

### Code Structure

- **Models**: Mongoose schemas defining the data structure
- **Routes**: Express route handlers for API endpoints
- **Components**: Reusable React components
- **Pages**: Main application pages and views

### Best Practices

- Follow RESTful API conventions
- Use async/await for asynchronous operations
- Implement proper error handling
- Validate data on both frontend and backend
- Keep components modular and reusable

## 🐛 Troubleshooting

### MongoDB Connection Issues

If you encounter MongoDB connection errors:

1. Ensure MongoDB is running
2. Check the connection string in `backend/src/config/db.js`
3. Verify MongoDB is listening on port 27017

### Port Conflicts

If the default ports are already in use:

- Backend: Change `PORT` in `backend/src/server.js`
- Frontend: Vite will automatically use the next available port

### File Upload Issues

Ensure the `uploads` directory exists and has proper write permissions:

```bash
mkdir -p uploads
chmod 755 uploads
```

## 📞 Support

For issues, questions, or suggestions, please open an issue in the repository.

---

**Built with ❤️ for gym and fitness center management**
