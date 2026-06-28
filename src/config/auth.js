// Authentication configuration

const getDefaultPassword = (role) => {
  if (role === 19) {
    // Student
    return process.env.DEFAULT_STUDENT_PASSWORD || 'default123';
  } else {
    // Staff/Admin
    return process.env.DEFAULT_STAFF_PASSWORD || 'foster@123';
  }
};

const ROLES = {
  PRINCIPAL: 6,        // Principal & Vice-Principal (Full Access)
  TEACHER: 7,          // Teachers (Access based on assignments)
  STAFF: 8,            // Support Staff (Limited Access)
  STUDENT: 19,         // Students/Parents (Limited Access)
  PARENT: 19           // Parents (Same as Student - Limited Access)
};

// Role-based permissions
const PERMISSIONS = {
  [ROLES.PRINCIPAL]: {
    // Full access to everything
    canManageStudents: true,
    canManageStaff: true,
    canManageTeachers: true,
    canManageFees: true,
    canManageSalary: true,
    canViewAllAttendance: true,
    canMarkAttendance: true,
    canManageHomework: true,
    canManageBehaviour: true,
    canViewReports: true,
    canManageCalendar: true,
    canManageGallery: true,
    canManageSyllabus: true,
    canAccessSettings: true
  },
  [ROLES.TEACHER]: {
    // Limited access based on assigned classes/subjects
    canManageStudents: false,
    canManageStaff: false,
    canManageTeachers: false,
    canManageFees: false,
    canManageSalary: false,
    canViewAllAttendance: false, // Only their class
    canMarkAttendance: true,      // Only their class
    canManageHomework: true,      // Only their subject
    canManageBehaviour: true,     // Only their students
    canViewReports: true,         // Only their class
    canManageCalendar: false,
    canManageGallery: false,
    canManageSyllabus: true,      // Only their subject
    canAccessSettings: false
  },
  [ROLES.STAFF]: {
    // Very limited access - mostly viewing
    canManageStudents: false,
    canManageStaff: false,
    canManageTeachers: false,
    canManageFees: false,
    canManageSalary: false,
    canViewAllAttendance: false,
    canMarkAttendance: false,
    canManageHomework: false,
    canManageBehaviour: false,
    canViewReports: false,
    canManageCalendar: false,
    canManageGallery: true,       // Can upload photos
    canManageSyllabus: false,
    canAccessSettings: false
  },
  [ROLES.STUDENT]: {
    // Very limited - view only their own data
    canManageStudents: false,
    canManageStaff: false,
    canManageTeachers: false,
    canManageFees: false,
    canManageSalary: false,
    canViewAllAttendance: false,
    canMarkAttendance: false,
    canManageHomework: false,
    canManageBehaviour: false,
    canViewReports: true,         // Only their own
    canManageCalendar: false,
    canManageGallery: false,
    canManageSyllabus: false,
    canAccessSettings: false
  }
};

// Helper function to check permissions
const hasPermission = (role, permission) => {
  const rolePermissions = PERMISSIONS[role];
  if (!rolePermissions) return false;
  return rolePermissions[permission] === true;
};

// Helper function to get role name
const getRoleName = (roleId) => {
  switch(roleId) {
    case 6: return 'Principal/Vice-Principal';
    case 7: return 'Teacher';
    case 8: return 'Support Staff';
    case 19: return 'Student/Parent';
    default: return 'Unknown';
  }
};

module.exports = {
  getDefaultPassword,
  ROLES,
  PERMISSIONS,
  hasPermission,
  getRoleName
};
