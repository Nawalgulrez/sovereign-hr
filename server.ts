import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Database from 'better-sqlite3';
import cors from 'cors';
import session from 'express-session';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const db = new Database('database.sqlite');

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    email TEXT
  );

  CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id TEXT UNIQUE,
    full_name TEXT,
    father_name TEXT,
    cnic TEXT,
    email TEXT,
    phone TEXT,
    gender TEXT,
    address TEXT,
    department_id INTEGER,
    designation TEXT,
    joining_date TEXT,
    basic_salary REAL,
    status TEXT DEFAULT 'Active',
    profile_image TEXT,
    FOREIGN KEY(department_id) REFERENCES departments(id)
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER,
    date TEXT,
    status TEXT, -- Present, Absent, Leave
    FOREIGN KEY(employee_id) REFERENCES employees(id)
  );

  CREATE TABLE IF NOT EXISTS salaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER,
    month TEXT, -- YYYY-MM
    bonus REAL DEFAULT 0,
    overtime_hours REAL DEFAULT 0,
    overtime_rate REAL DEFAULT 0,
    tax_deduction REAL DEFAULT 0,
    attendance_deduction REAL DEFAULT 0,
    net_salary REAL,
    created_at TEXT,
    FOREIGN KEY(employee_id) REFERENCES employees(id)
  );

  -- Seed default admin if not exists
  INSERT OR IGNORE INTO admins (username, password, email) VALUES ('admin', 'admin', 'admin@example.com');

  -- Seed sample departments
  INSERT OR IGNORE INTO departments (name, description) VALUES ('Engineering', 'Software development and infrastructure');
  INSERT OR IGNORE INTO departments (name, description) VALUES ('Human Resources', 'Talent acquisition and employee relations');
  INSERT OR IGNORE INTO departments (name, description) VALUES ('Marketing', 'Brand management and digital growth');

  -- Seed sample employee if none exist
  INSERT OR IGNORE INTO employees (employee_id, full_name, father_name, cnic, email, phone, gender, address, department_id, designation, joining_date, basic_salary, status)
  SELECT 'EMP-001', 'Jane Doe', 'Richard Doe', '12345-1234567-1', 'jane@example.com', '555-0199', 'Female', '456 Tech Lane', 1, 'Senior Engineer', '2023-01-15', 7500, 'Active'
  WHERE NOT EXISTS (SELECT 1 FROM employees);
`);

const app = express();
app.use(cors());
app.use(express.json());
app.use(session({
  secret: 'employee-management-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using https
}));

app.use('/uploads', express.static(uploadsDir));

// Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Routes
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const admin = db.prepare('SELECT * FROM admins WHERE username = ? AND password = ?').get(username, password) as any;
  if (admin) {
    (req.session as any).user = admin;
    res.json({ success: true, user: { id: admin.id, username: admin.username } });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// Departments
app.get('/api/departments', (req, res) => {
  const departments = db.prepare('SELECT * FROM departments').all();
  res.json(departments);
});

app.post('/api/departments', (req, res) => {
  const { name, description } = req.body;
  try {
    const result = db.prepare('INSERT INTO departments (name, description) VALUES (?, ?)').run(name, description);
    res.json({ id: result.lastInsertRowid });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/departments/:id', (req, res) => {
  db.prepare('DELETE FROM departments WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Employees
app.get('/api/employees', (req, res) => {
  const employees = db.prepare(`
    SELECT e.*, d.name as department_name 
    FROM employees e 
    LEFT JOIN departments d ON e.department_id = d.id
  `).all();
  res.json(employees);
});

app.get('/api/employees/:id', (req, res) => {
  const employee = db.prepare(`
    SELECT e.*, d.name as department_name 
    FROM employees e 
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE e.id = ?
  `).get(req.params.id);
  res.json(employee);
});

app.post('/api/employees', upload.single('profile_image'), (req, res) => {
  const data = req.body;
  const profile_image = req.file ? `/uploads/${req.file.filename}` : null;
  
  try {
    const result = db.prepare(`
      INSERT INTO employees (
        employee_id, full_name, father_name, cnic, email, phone, gender, 
        address, department_id, designation, joining_date, basic_salary, status, profile_image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.employee_id, data.full_name, data.father_name, data.cnic, data.email, data.phone, 
      data.gender, data.address, data.department_id, data.designation, data.joining_date, 
      data.basic_salary, data.status || 'Active', profile_image
    );
    res.json({ id: result.lastInsertRowid });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/employees/:id', upload.single('profile_image'), (req, res) => {
  const data = req.body;
  const profile_image = req.file ? `/uploads/${req.file.filename}` : undefined;
  
  try {
    let query = `
      UPDATE employees SET 
        full_name = ?, father_name = ?, cnic = ?, email = ?, phone = ?, 
        gender = ?, address = ?, department_id = ?, designation = ?, 
        joining_date = ?, basic_salary = ?, status = ?
    `;
    const params = [
      data.full_name, data.father_name, data.cnic, data.email, data.phone,
      data.gender, data.address, data.department_id, data.designation,
      data.joining_date, data.basic_salary, data.status
    ];

    if (profile_image !== undefined) {
      query += `, profile_image = ?`;
      params.push(profile_image);
    }

    query += ` WHERE id = ?`;
    params.push(req.params.id);

    db.prepare(query).run(...params);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/employees/:id', (req, res) => {
  db.prepare('DELETE FROM employees WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Attendance
app.get('/api/attendance', (req, res) => {
  const { date } = req.query;
  const attendance = db.prepare(`
    SELECT a.*, e.full_name, e.employee_id as emp_code
    FROM attendance a
    JOIN employees e ON a.employee_id = e.id
    WHERE a.date = ?
  `).all(date);
  res.json(attendance);
});

app.post('/api/attendance', (req, res) => {
  const { date, records } = req.body; // records: { employee_id, status }[]
  
  const insert = db.prepare('INSERT OR REPLACE INTO attendance (employee_id, date, status) VALUES (?, ?, ?)');
  
  const transaction = db.transaction((data) => {
    for (const record of data) {
      insert.run(record.employee_id, date, record.status);
    }
  });

  transaction(records);
  res.json({ success: true });
});

// Salaries
app.get('/api/salaries', (req, res) => {
  const { month } = req.query;
  const salaries = db.prepare(`
    SELECT s.*, e.full_name, e.employee_id as emp_code, e.basic_salary
    FROM salaries s
    JOIN employees e ON s.employee_id = e.id
    WHERE s.month = ?
  `).all(month);
  res.json(salaries);
});

app.post('/api/salaries/calculate', (req, res) => {
  const { employee_id, month, bonus, overtime_hours, overtime_rate, tax_deduction } = req.body;
  
  const employee = db.prepare('SELECT basic_salary FROM employees WHERE id = ?').get(employee_id) as any;
  if (!employee) return res.status(404).json({ error: 'Employee not found' });

  // Calculate attendance deduction (simplified: count days absent in month)
  const daysInMonth = 30; // simplified
  const absentCount = db.prepare('SELECT COUNT(*) as count FROM attendance WHERE employee_id = ? AND date LIKE ? AND status = "Absent"').get(employee_id, `${month}%`) as any;
  const attendance_deduction = (employee.basic_salary / daysInMonth) * absentCount.count;

  const overtime_total = overtime_hours * overtime_rate;
  const net_salary = employee.basic_salary + Number(bonus) + overtime_total - Number(tax_deduction) - attendance_deduction;

  const result = db.prepare(`
    INSERT OR REPLACE INTO salaries (
      employee_id, month, bonus, overtime_hours, overtime_rate, 
      tax_deduction, attendance_deduction, net_salary, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    employee_id, month, bonus, overtime_hours, overtime_rate, 
    tax_deduction, attendance_deduction, net_salary, new Date().toISOString()
  );

  res.json({ id: result.lastInsertRowid, net_salary });
});

// Dashboard Stats
app.get('/api/dashboard/stats', (req, res) => {
  const totalEmployees = db.prepare('SELECT COUNT(*) as count FROM employees').get() as any;
  const totalDepartments = db.prepare('SELECT COUNT(*) as count FROM departments').get() as any;
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyExpense = db.prepare('SELECT SUM(net_salary) as total FROM salaries WHERE month = ?').get(currentMonth) as any;
  
  const recentEmployees = db.prepare(`
    SELECT e.*, d.name as department_name 
    FROM employees e 
    LEFT JOIN departments d ON e.department_id = d.id 
    ORDER BY e.id DESC LIMIT 5
  `).all();

  const deptStats = db.prepare(`
    SELECT d.name, COUNT(e.id) as count
    FROM departments d
    LEFT JOIN employees e ON d.id = e.department_id
    GROUP BY d.id
  `).all();

  res.json({
    totalEmployees: totalEmployees.count,
    totalDepartments: totalDepartments.count,
    monthlyExpense: monthlyExpense.total || 0,
    recentEmployees,
    deptStats
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const port = process.env.PORT || 3000;

  if (process.argv.includes('--build-only')) {
    process.exit(0);
  }

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer();
