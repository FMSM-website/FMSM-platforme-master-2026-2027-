// بيانات تسجيل الدخول لكل قسم
export const DEPARTMENT_ADMINS = {
  physics: {
    username: 'physics_admin',
    password: 'Physics@2026',
    departmentId: 'physics',
    departmentName: 'قسم الفيزياء',
    email: 'deptphy@gmail.com'
  },
  chemistry: {
    username: 'chemistry_admin',
    password: 'Chemistry@2026',
    departmentId: 'chemistry',
    departmentName: 'قسم الكيمياء',
    email: 'pg.dep.chemie@gmail.com'
  },
  mathematics: {
    username: 'math_admin',
    password: 'Math@2026',
    departmentId: 'math',
    departmentName: 'قسم الرياضيات ',
    email: 'brahimtel@yahoo.fr'
  }
};

export type DepartmentId = keyof typeof DEPARTMENT_ADMINS;

export interface DepartmentAdmin {
  username: string;
  password: string;
  departmentId: DepartmentId;
  departmentName: string;
  email: string;
}

export const authenticateDepartment = (username: string, password: string): DepartmentAdmin | null => {
  for (const [key, admin] of Object.entries(DEPARTMENT_ADMINS)) {
    if (admin.username === username && admin.password === password) {
      return admin;
    }
  }
  return null;
};
