# Foster ERP - Role System Quick Reference

## 🎯 Role IDs
```
6  = Principal & Vice-Principal (Full Access)
7  = Teachers (Assignment-Based)
8  = Support Staff (Limited)
19 = Students & Parents (View Only)
```

## 🔐 Default Passwords
```
Students/Parents: default123
All Staff:        foster@123
```

## 📋 Staff Designations → Role Mapping

### Automatically Assigned to Role 6:
- Principal
- Vice-Principal

### Automatically Assigned to Role 7:
- Teacher
- Senior Teacher
- Subject Teacher
- Class Teacher

### Automatically Assigned to Role 8:
- Admin Staff
- Support Staff
- Librarian
- Lab Assistant
- Accountant
- Clerk
- Any other designation

## ✅ Permission Quick Check

### Can Manage Students?
- ✅ Role 6 (Principal)
- ❌ Role 7 (Teacher)
- ❌ Role 8 (Staff)
- ❌ Role 19 (Student)

### Can Mark Attendance?
- ✅ Role 6 (All classes)
- ✅ Role 7 (Own class only)
- ❌ Role 8
- ❌ Role 19

### Can Manage Homework?
- ✅ Role 6 (All subjects)
- ✅ Role 7 (Own subject only)
- ❌ Role 8
- ❌ Role 19

### Can Access Fees/Salary?
- ✅ Role 6
- ❌ Role 7
- ❌ Role 8
- ❌ Role 19

## 🔧 Code Snippets

### Check Permission
```javascript
const { hasPermission } = require('./config/auth');

if (hasPermission(userRole, 'canManageStudents')) {
  // Allow action
}
```

### Get Role Name
```javascript
const { getRoleName } = require('./config/auth');

const roleName = getRoleName(6); // "Principal/Vice-Principal"
```

### Filter Students by Teacher
```javascript
let query = supabase.from('students').select('*');

if (userRole === 7) {
  query = query.eq('teacher_id', userId);
}
```

## 📡 API Endpoints

### Get Role Constants
```http
GET /api/config/constants
```
Returns:
```json
{
  "roles": {
    "PRINCIPAL": 6,
    "TEACHER": 7,
    "STAFF": 8,
    "STUDENT": 19,
    "PARENT": 19
  },
  "designations": {
    "principals": ["Principal", "Vice-Principal"],
    "teachers": ["Teacher", "Senior Teacher", "Subject Teacher", "Class Teacher"],
    "staff": ["Admin Staff", "Support Staff", "Librarian", "Lab Assistant", "Accountant", "Clerk"]
  }
}
```

### Login Response
```http
POST /api/auth/login
```
Returns:
```json
{
  "user": {
    "id": "uuid",
    "role": 7,
    "roleName": "Teacher",
    "full_name": "John Doe",
    "additionalData": { /* staff or student data */ }
  }
}
```

## 🎨 Frontend Menu Visibility

### Principal/Vice-Principal (Role 6):
```
✅ All menu items visible
```

### Teachers (Role 7):
```
✅ Dashboard, Student List, Class List
✅ Student Attendance, Homework, Syllabus
✅ Behaviour, Reports, Gallery, Profile
❌ Admit Student, Add Staff, Staff List
❌ Staff Attendance, Fees, Salary
```

### Support Staff (Role 8):
```
✅ Dashboard, Gallery, Profile
❌ Everything else
```

### Students/Parents (Role 19):
```
✅ Dashboard, My Attendance, Homework
✅ Progress Reports, Behavior, Fees
✅ Calendar, Gallery
❌ Management features
```

## 🚨 Common Issues

### Issue: Teacher seeing all students
**Solution:** Filter by `teacher_id` in queries
```javascript
.eq('teacher_id', userId)
```

### Issue: Staff member can't access their features
**Solution:** Check designation spelling matches exactly
```
'Principal' not 'principal'
'Vice-Principal' not 'Vice Principal'
```

### Issue: Login returns wrong role
**Solution:** Verify staff record has correct designation

## 📞 Quick Help

| File | Purpose |
|------|---------|
| `src/config/auth.js` | Role definitions & permissions |
| `src/routes/auth.routes.js` | Login & authentication |
| `src/routes/staff.routes.js` | Staff management & role assignment |
| `src/routes/config.routes.js` | System constants & configs |
| `ROLE_BASED_ACCESS.md` | Full documentation |

---

**Last Updated:** June 28, 2026
