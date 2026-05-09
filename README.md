
# Sovereign HR | Enterprise Personnel & Payroll Management
Sovereign HR is a high-performance, full-stack human resources platform designed for the modern enterprise. It offers a sophisticated, dark-themed interface built for precision payroll management, attendance tracking, and organizational unit auditing.

---

## 🛠 Tech Stack

### Frontend (Client-Side)
- **Framework:** [React 19](https://react.dev/) (Functional Components, Hooks)
- **Build Tool:** [Vite 6](https://vitejs.dev/) (Ultra-fast HMR and bundling)
- **Styling:** [Tailwind CSS 4.0](https://tailwindcss.com/) (Utility-first CSS with a custom Zinc/Gold aesthetic)
- **Icons:** [Lucide React](https://lucide.dev/) (Consistent, performant vector icons)
- **Animations:** [Motion](https://motion.dev/) (Declarative animations for smooth transitions)
- **Charts:** [Recharts 3](https://recharts.org/) (Composable charting library for data visualization)
- **Routing:** [React Router 7](https://reactrouter.com/) (Client-side navigation)
- **PDF Generation:** [jsPDF](https://github.com/parallax/jsPDF) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)

### Backend (Server-Side)
- **Runtime:** [Node.js](https://nodejs.org/) with [tsx](https://github.com/privatenumber/tsx) (Modern TypeScript execution)
- **Framework:** [Express.js](https://expressjs.com/) (Restful API architecture)
- **Database:** [Better-SQLite3](https://github.com/WiseLibs/better-sqlite3) (High-performance, synchronous SQLite driver)
- **File Handling:** [Multer](https://github.com/expressjs/multer) (Multipart/form-data for profile image uploads)
- **Session Management:** [Express-Session](https://github.com/expressjs/session) (Secure authentication persistence)

---

## 🌟 Key Features

- **Executive Dashboard:** Visualized metrics for total headcounts, departmental distribution, and fiscal spending.
- **Registry Management:** Comprehensive CRUD operations for personnel records including digital portrait uploads.
- **Presence Audit:** Daily attendance logging (Present/Absent/Leave) with historical persistence.
- **Automated Payroll:** Intelligent calculation engine for net payouts based on base salary, overtime, bonuses, and attendance-based deductions.
- **Enterprise Reporting:** One-click generation of professional PDF reports for workforce, attendance, and payroll audits.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18.0 or higher
- **NPM** or **Yarn**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/sovereign-hr.git
   cd sovereign-hr
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   The application uses a managed `database.sqlite` file which initializes schema automatically. Ensure the `uploads/` directory exists (it will be created if missing).

4. **Run in Development Mode:**
   ```bash
   npm run dev
   ```

5. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 🔐 Administrative Access
For the initial evaluation environment, the internal registry access is secured via:

- **Username:** `admin`
- **Password:** `admin`

---

## 📁 Project Structure
```text
├── src/                # Frontend source code
│   ├── components/     # Atomic UI components
│   ├── pages/          # View-level components & business logic
│   ├── lib/            # Utility functions & axios instance
│   └── index.css       # Global styles & Tailwind layers
├── server.ts           # Express server entry point & API routes
├── database.sqlite     # Persistent SQLite storage
├── uploads/            # Encrypted employee portrait storage
└── vite.config.ts      # Client-side build configuration
```

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

*Developed by [Your Name/Organization]*
