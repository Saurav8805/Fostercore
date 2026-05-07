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
  ADMIN: 6,        // Principal/Vice-Principal
  TEACHER: 7,      // Teacher
  FACULTY: 8,      // Faculty
  STUDENT: 19      // Student
};

module.exports = {
  getDefaultPassword,
  ROLES
};
