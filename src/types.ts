export interface Admin {
  id: number;
  username: string;
  email: string;
}

export interface Department {
  id: number;
  name: string;
  description: string;
}

export interface Employee {
  id: number;
  employee_id: string;
  full_name: string;
  father_name: string;
  cnic: string;
  email: string;
  phone: string;
  gender: string;
  address: string;
  department_id: number;
  department_name?: string;
  designation: string;
  joining_date: string;
  basic_salary: number;
  status: string;
  profile_image: string | null;
}

export interface AttendanceRecord {
  id: number;
  employee_id: number;
  full_name?: string;
  emp_code?: string;
  date: string;
  status: 'Present' | 'Absent' | 'Leave';
}

export interface SalaryRecord {
  id: number;
  employee_id: number;
  month: string;
  bonus: number;
  overtime_hours: number;
  overtime_rate: number;
  tax_deduction: number;
  attendance_deduction: number;
  net_salary: number;
  full_name?: string;
  emp_code?: string;
  basic_salary?: number;
  created_at: string;
}

export interface DashboardStats {
  totalEmployees: number;
  totalDepartments: number;
  monthlyExpense: number;
  recentEmployees: Employee[];
  deptStats: { name: string; count: number }[];
}
