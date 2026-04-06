# FinancePro — Enterprise-Grade Financial Intelligence & RBAC

## 🚀 Project Overview
FinancePro is a high-performance, full-stack financial management system built for high-precision data processing. Developed as a professional-grade solution, this project goes beyond basic CRUD functionality by implementing advanced security protocols, real-time data aggregation, and a modern SaaS-inspired UI/UX.

### **The "Outstanding" Edge**
This implementation focuses on **System Stability** and **Security**, featuring custom "Self-Protection" logic to prevent administrative lockouts and a robust validation layer that ensures data integrity at scale.

---

## 🛠 Tech Stack

### **Backend (Architecture & Security)**
* **Node.js & Express 5**: Utilizing the cutting-edge Express 5 for native asynchronous error handling—keeping the codebase clean and resilient.
* **MongoDB & Mongoose**: Leveraging complex aggregation pipelines and strict schema-level validations.
* **Joi Validation**: Industry-standard request-body enforcement with automatic type-casting (ensuring "7000" is treated as `7000`).
* **JWT & Bcrypt.js**: Secure, stateless authentication with high-entropy salt hashing.
* **HTTP-Only Cookies**: Defense against XSS attacks by storing session tokens in non-accessible browser cookies.

### **Frontend (UX & Visualization)**
* **React & Vite**: Ultra-fast development and optimized production bundles.
* **TanStack Query (v5)**: Professional server-state management featuring background synchronization and "Placeholder Data" to prevent UI flickering.
* **Tailwind CSS**: Custom utility-first styling for a compact, balanced interface.
* **Recharts**: Interactive Area Charts with linear gradients for sleek financial trend visualization.

---

## 🔑 Core Logic & Security Features

### **1. Advanced Access Control (RBAC)**
| Role | Permissions |
| :--- | :--- |
| **Admin** | Full system control: User management, all CRUD operations, and Analytics. |
| **Analyst** | Decision support: Read-only access to all records + full Dashboard analytics. |
| **Viewer** | Restricted: Access only to high-level Dashboard summaries. |

### **2. Admin Self-Protection (Preventing Deadlock)**
To ensure the system remains manageable, the backend includes custom logic that:
* Prevents an Admin from deactivating their own account.
* Blocks an Admin from deleting themselves while active.
* Restricts an Admin from demoting their own administrative role.

### **3. Financial Data Engine**
* **Aggregation Pipelines**: Calculates monthly growth and category allocation on-the-fly using MongoDB `$group` and `$sort` operators.
* **Dynamic Filtering**: Support for filtering by `Income`, `Expense`, or `Date Range` at the database level.
* **Regex Search**: Case-insensitive keyword search across categories and notes.
* **Focus-Safe Search**: Implemented background fetching to ensure the UI never loses focus while you type.

---

## 🛣 API Architecture

### **Authentication**
* `POST /api/v1/users/login` — Secure login via HTTP-Only Cookies.
* `GET /api/v1/users/me` — Persistence check for session state.

### **Ledger Operations**
* `GET /api/v1/transactions` — Fetch records. Supports `?search=`, `?type=`, `?startDate=`, `?page=`.
* `POST /api/v1/transactions` — Validated record creation (**Admin only**).
* `PUT /api/v1/transactions/:id` — Validated record update (**Admin only**).
* `DELETE /api/v1/transactions/:id` — Record removal (**Admin only**).

---

## 📝 Design Assumptions
* **Data Integrity**: Every transaction is validated by **Joi** before reaching the controller to ensure strict type safety.
* **UI Polish**: Large border radii (`rounded-[32px]`) and subtle shadows are used to provide a modern, premium "Dashboard" feel.
* **Error Handling**: A centralized middleware returns clean, actionable messages to the frontend while logging traces in the terminal for debugging.
* **Scalability**: The backend is structured to handle increased traffic through efficient indexing and server-side pagination.

---

## ⚙️ Setup & Installation

### 1. Prerequisites
* **Node.js**: (v20+)
* **MongoDB**: Instance (Local or Atlas)

### 2. Environment Configuration
Create a file named `.env` in the `/backend` folder and populate it with the following:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_complex_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
3. Backend Installation
Open your terminal and run the following commands to get the server running:

Bash
cd backend
npm install
node seed.js  # Primes the database with professional test data
npm start
4. Frontend Installation
Open a new terminal window/tab and run the following commands:

Bash
cd frontend
npm install
npm run dev
Developed by Kashish Yadav. Computer Science & Information Technology | KIET Group of Institutions