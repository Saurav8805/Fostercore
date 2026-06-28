# Role-Based Access Control (RBAC) - Foster ERP

## Overview
Foster ERP implements a comprehensive role-based access control system with 4 distinct user roles, each with specific permissions and access levels.

---

## Role Structure

### Role 6: Principal & Vice-Principal (Full Access)
**Designation:** `Principal`, `Vice-Principal`
**Access Level:** Complete administrative control

#### Permissions:
✅ **Student Management**
- Admit/Edit/Delete students
- View all student records
- Manage student attendance
- View student reports

✅ **Staff Management**
- Add/Edit/Delete staff members
- View all staff records
- Manage staff attendance
- Process staff salaries

✅ **Teacher Management**
- Add/Edit/Delete teachers
- Assign classes and subjects
- View teacher performance

✅ **Financial Management**
- Manage student fees
- Process staff salaries
- View financial reports

✅ **Academic Management**
- Manage homework assignments
- Manage syllabus
- View all class activities
- Mark and view all attendance

✅ **Administrative**
- Access system settings
- Manage calendar/events
- Manage gallery
- Generate all reports

---

### Role 7: Teachers (Assignment-Based Access)
**Designation:** `Teacher`, `Senior Teacher`, `Subject Teacher`, `Class Teacher`
**Access Level:** Limited to assigned classes/subjects

#### Permissions:
✅ **Assigned Classes Only**
- View students in their assigned class
- Mark attendance for their class
- Create/edit homework for their subject
- Manage syllabus for their subject
- Rate behavior for their students
- View reports for their class

❌ **Restricted**
- Cannot admit/delete students
- Cannot manage other staff
- Cannot process fees or salaries
- Cannot access system settings
- Cannot view other teachers' classes
- Cannot manage calendar/events

#### Implementation Notes:
- Teachers can only see students assigned to them via `teacher_id` field
- Homework/syllabus filtering by subject/class is required
- Attendance marking limited to their class sections

---

### Role 8: Support Staff (Very Limited Access)
**Designation:** `Admin Staff`, `Support Staff`, `Librarian`, `Lab Assistant`, `Accountant`, `Clerk`
**Access Level:** Minimal, mostly viewing and specific tasks

#### Permissions:
✅ **Limited Functions**
- Upload to gallery (photographers, event coordinators)
- View their own attendance
- Basic profile management

❌ **Restricted**
- Cannot manage students
- Cannot manage other staff
- Cannot mark attendance
- Cannot manage academic content
- Cannot view financial information
- Cannot access administrative settings

---

### Role 19: Students & Parents (Personal Data Only)
**Designation:** `Student`, `Parent`
**Access Level:** View-only for their own data

#### Permissions:
✅ **Own Data Only**
- View their own attendance
- View their own homework
- View their own behavior ratings
- View their own progress reports
- View their own fee status
- View school calendar/events
- View gallery

❌ **Restricted**
- Cannot view other students' data
- Cannot manage anything
- Cannot mark attendance
- Cannot create content
- Read-only access to all information

---

## Database Implementation

### Users Table
```sql
users {
  id: uuid (primary key)
  mobile: string (unique, used as login ID)
  password_hash: string (bcrypt encrypted)
  role: integer (6, 7, 8, or 19)
  full_name: string
  email: string
  created_at: timestamp
  updated_at: timestamp
}
```

### Staff Table
```sql
staff {
  id: uuid (primary key)
  user_id: uuid (foreign key -> users.id)
  designation: string (determines role assignment)
  department: string
  joining_date: date
  salary: decimal
  created_at: timestamp
}
```

**Role Assignment Logic:**
- `designation IN ('Principal', 'Vice-Principal')` → role = 6
- `designation IN ('Teacher', 'Senior Teacher', 'Subject Teacher', 'Class Teacher')` → role = 7
- Other designations → role = 8

### Students Table
```sql
students {
  id: uuid (primary key)
  user_id: uuid (foreign key -> users.id)
  teacher_id: uuid (foreign key -> users.id) -- Important for role 7 filtering
  class: string
  section: string
  ... other fields
}
```

---

## Authentication Flow

### Login Process
1. User enters mobile number and password
2. System queries `users` table
3. Password verified using bcrypt
4. Based on `role`, fetch additional data:
   - Role 19 → Join with `students` table
   - Role 6/7/8 → Join with `staff` table
5. Return user object with:
   ```json
   {
     "user": {
       "id": "uuid",
       "mobile": "1234567890",
       "role": 7,
       "roleName": "Teacher",
       "full_name": "John Doe",
       "email": "john@example.com",
       "additionalData": {
         // Staff or Student data
       }
     }
   }
   ```

### Default Passwords
- **Students/Parents (Role 19):** `default123`
- **All Staff (Role 6/7/8):** `foster@123`

---

## Frontend Access Control

### Dashboard Sidebar Menu

#### Principal/Vice-Principal (Role 6) - Full Menu:
- Dashboard
- Student List
- Admit Student
- Class List
- Student Attendance
- Staff List
- Add Staff
- Staff Attendance
- Fees
- Salary
- Homework
- Syllabus
- Behaviour
- Reports
- Calendar
- Gallery
- Profile

#### Teachers (Role 7) - Limited Menu:
- Dashboard
- Student List (filtered by teacher_id)
- Class List (their classes only)
- Student Attendance (their classes only)
- Homework (their subjects only)
- Syllabus (their subjects only)
- Behaviour (their students only)
- Reports (their classes only)
- Gallery (view only)
- Profile

#### Support Staff (Role 8) - Minimal Menu:
- Dashboard
- Gallery (upload enabled)
- Profile

#### Students/Parents (Role 19) - View Menu:
- Dashboard
- My Attendance
- Homework
- Progress Reports
- Behavior
- Fees
- Calendar
- Gallery

### Page-Level Protection

Add role checks to protected pages:

```typescript
// Example: admit-student/page.tsx
'use client';

export default function AdmitStudentPage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Only Principal/Vice-Principal can access
  if (user.role !== 6) {
    return (
      <div className="alert alert-danger">
        <h3>Access Denied</h3>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }
  
  // Rest of the component...
}
```

---

## Backend API Protection

### Route Middleware (Future Implementation)

```javascript
const { requireRole, requirePermission } = require('../middleware/auth.middleware');

// Only Principal/Vice-Principal can access
router.post('/admit', requireRole(6), async (req, res) => {
  // Admit student logic
});

// Teachers and above can access
router.post('/homework', requireRole(6, 7), async (req, res) => {
  // Create homework logic
});

// Permission-based check
router.get('/students', requirePermission('canManageStudents'), async (req, res) => {
  // Get students logic
});
```

### Data Filtering by Role

```javascript
// Example: Get students based on user role
router.get('/list', async (req, res) => {
  const { userId, userRole } = req.user; // From session/JWT
  
  let query = supabase.from('students').select('*');
  
  // Teachers can only see their assigned students
  if (userRole === 7) {
    query = query.eq('teacher_id', userId);
  }
  
  // Students can only see themselves
  if (userRole === 19) {
    query = query.eq('user_id', userId);
  }
  
  // Role 6 (Principal) sees all students - no filter needed
  
  const { data } = await query;
  res.json(data);
});
```

---

## Permission Helper Functions

Located in: `src/config/auth.js`

```javascript
const { ROLES, hasPermission, getRoleName } = require('../config/auth');

// Check if user has specific permission
if (hasPermission(userRole, 'canManageStudents')) {
  // Allow action
}

// Get human-readable role name
const roleName = getRoleName(6); // Returns "Principal/Vice-Principal"
```

---

## Migration Notes

### Changes from Previous System:
1. ❌ **Removed:** Role "Admin" (merged into Principal/Vice-Principal)
2. ✅ **Added:** Clear distinction between Principal (6), Teacher (7), and Support Staff (8)
3. ✅ **Enhanced:** Teacher role now includes assignment-based filtering
4. ✅ **Added:** Parents use same role as Students (19) but with additional features

### Database Updates Required:
- None! The roles table structure remains the same
- Only designation values and role assignment logic changed
- No migration needed

---

## Testing Checklist

### Role 6 (Principal) Testing:
- [ ] Can access all dashboard pages
- [ ] Can admit/edit/delete students
- [ ] Can add/edit/delete staff
- [ ] Can view and manage all attendance
- [ ] Can process fees and salaries
- [ ] Can access settings and reports

### Role 7 (Teacher) Testing:
- [ ] Can only see their assigned students
- [ ] Can mark attendance for their class
- [ ] Can create homework for their subject
- [ ] Cannot access admit student page
- [ ] Cannot access fees/salary pages
- [ ] Cannot access staff management

### Role 8 (Support Staff) Testing:
- [ ] Can access profile and dashboard
- [ ] Can upload to gallery
- [ ] Cannot access student management
- [ ] Cannot access staff management
- [ ] Cannot mark attendance

### Role 19 (Student/Parent) Testing:
- [ ] Can view their own attendance
- [ ] Can view their homework
- [ ] Can view their reports
- [ ] Cannot access management features
- [ ] Cannot view other students' data

---

## Security Best Practices

1. **Frontend Validation:** Always hide UI elements based on role
2. **Backend Validation:** Always validate permissions on the server
3. **Data Filtering:** Filter queries by user role and assignments
4. **Audit Logging:** Log all sensitive actions with user ID and role
5. **Session Management:** Store user role in secure session/JWT
6. **Regular Reviews:** Periodically audit role assignments and permissions

---

## Support & Maintenance

For questions or issues related to role-based access:
1. Review this documentation
2. Check `src/config/auth.js` for permission definitions
3. Verify role assignment in `src/routes/staff.routes.js`
4. Test with actual user accounts of each role type

Last Updated: June 28, 2026
