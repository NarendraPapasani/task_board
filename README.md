# 📝 Task Board Application

A modern, full-stack task management application built with the MERN stack (MySQL, Express, React, Node.js). This application features robust authentication with email verification, a responsive dashboard, and comprehensive task management capabilities.

## 🚀 Live Demo

- **Frontend:** [https://taskspane.netlify.app](https://taskspane.netlify.app)
- **Backend API:** [https://task-board-backend.onrender.com](https://task-board-backend.onrender.com) _(Replace with your actual Render URL)_

---

## ✨ Features

### 🔐 Authentication & Security

- **User Registration:** Secure sign-up with email validation.
- **Email Verification:** OTP-based email verification using Nodemailer.
- **Login System:** JWT-based authentication with secure session management.
- **Forgot Password:** Secure password reset flow via email OTP.
- **Password Hashing:** Bcrypt encryption for user passwords.

### 📋 Task Management

- **CRUD Operations:** Create, Read, Update, and Delete tasks.
- **Status Tracking:** Mark tasks as `TODO`, `IN_PROGRESS`, or `DONE`.
- **Priority Levels:** Categorize tasks by `LOW`, `MEDIUM`, or `HIGH` priority.
- **Quick Actions:** Toggle task completion status directly from the card.

### 🎨 User Interface

- **Responsive Dashboard:** Built with React and Tailwind CSS.
- **Modern Components:** Utilizes **Shadcn UI** for polished, accessible components.
- **Real-time Feedback:** Toast notifications (Sonner) for all user actions.
- **Statistics:** Visual overview of task counts and status distribution.

---

## 🛠️ Tech Stack

### Frontend

- **Framework:** React (Vite)
- **Styling:** Tailwind CSS
- **UI Library:** Shadcn UI (Radix Primitives)
- **State Management:** React Hooks
- **HTTP Client:** Axios
- **Form Handling:** React Hook Form + Zod Validation

### Backend

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL (Hosted on Railway)
- **ORM:** Prisma
- **Authentication:** JSON Web Tokens (JWT)
- **Email Service:** Nodemailer (Gmail SMTP)

---

## 📂 Folder Structure

```bash
task_board/
├── backend/                # Node.js & Express Backend
│   ├── controllers/        # Request handlers (Auth, Tasks)
│   ├── middleware/         # Auth protection middleware
│   ├── prisma/            # Database schema & migrations
│   ├── routes/            # API route definitions
│   ├── utils/             # Helper functions (Email, Prisma)
│   ├── app.js             # Entry point
│   └── .env               # Backend environment variables
│
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/ui/ # Shadcn UI components
│   │   ├── Pages/         # Application pages (Login, Dashboard)
│   │   ├── lib/           # Utilities
│   │   └── App.jsx        # Main component
│   └── .env               # Frontend environment variables
│
└── README.md              # Project documentation
```

---

## ⚙️ Installation & Setup

### Prerequisites

- Node.js (v18+)
- MySQL Database (Local or Cloud)

### 1. Clone the Repository

```bash
git clone https://github.com/NarendraPapasani/task_board.git
cd task_board
```

### 2. Backend Setup

```bash
cd backend
npm install

# Set up Environment Variables (see below)
# Run Database Migrations
npx prisma migrate dev

# Start Server
node app.js
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# Set up Environment Variables (see below)
# Start Development Server
npm run dev
```

---

## 🔑 Environment Variables

Create a `.env` file in both `backend` and `frontend` directories.

### Backend (`backend/.env`)

```env
PORT=7000
DATABASE_URL="mysql://user:password@host:port/database"
JWT_SECRET="your_super_secret_key"
EMAIL_SERVICE="Gmail"
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_app_password"
EMAIL_FROM="your_email@gmail.com"
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL="http://localhost:7000/api"
# For production, use your deployed backend URL
```

---

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/forgot-password` - Request password reset OTP
- `POST /api/auth/reset-password` - Reset password

### Tasks

- `GET /api/tasks` - Get all tasks for logged-in user
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

---

## 👤 Author

**Narendra Papasani**

- GitHub: [@NarendraPapasani](https://github.com/NarendraPapasani)

---

## 📄 License

This project is licensed under the MIT License.
