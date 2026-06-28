# API Testing Guide - Role System

Test these endpoints to verify the new role system is working correctly.

---

## Prerequisites
- Backend server running on `http://localhost:5000`
- Use Postman, Thunder Client, or curl
- Have test users created for each role

---

## 1. Test Config Constants Endpoint

### Request
```http
GET http://localhost:5000/api/config/constants
```

### Expected Response
```json
{
  "success": true,
  "message": "Constants fetched successfully",
  "data": {
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
    },
    "bloodGroups": ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    "attendanceStatus": ["Present", "Absent", "Leave", "Half Day"],
    "behaviourRatings": [1, 2, 3, 4, 5],
    "feeStatus": ["Pending", "Paid", "Overdue", "Partial"]
  }
}
```

### ✅ Pass Criteria
- Response status: 200
- Roles object contains all 5 role constants
- Designations object has 3 categories
- "Admin" designation is NOT present

---

## 2. Test Login - Principal

### Request
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "mobile": "9876543210",
  "password": "foster@123"
}
```

### Expected Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "mobile": "9876543210",
      "role": 6,
      "roleName": "Principal/Vice-Principal",
      "full_name": "Principal Name",
      "email": "principal@school.com",
      "additionalData": {
        "id": "uuid",
        "user_id": "uuid",
        "designation": "Principal",
        "department": "Administration",
        "joining_date": "2024-01-01",
        "salary": 50000
      }
    }
  }
}
```

### ✅ Pass Criteria
- Response status: 200
- role = 6
- roleName = "Principal/Vice-Principal"
- additionalData contains staff information

---

## 3. Test Login - Teacher

### Request
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "mobile": "9876543211",
  "password": "foster@123"
}
```

### Expected Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "mobile": "9876543211",
      "role": 7,
      "roleName": "Teacher",
      "full_name": "Teacher Name",
      "email": "teacher@school.com",
      "additionalData": {
        "designation": "Teacher",
        "department": "Mathematics"
      }
    }
  }
}
```

### ✅ Pass Criteria
- Response status: 200
- role = 7
- roleName = "Teacher"
- additionalData contains staff information

---

## 4. Test Login - Support Staff

### Request
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "mobile": "9876543212",
  "password": "foster@123"
}
```

### Expected Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "mobile": "9876543212",
      "role": 8,
      "roleName": "Support Staff",
      "full_name": "Staff Name",
      "email": "staff@school.com",
      "additionalData": {
        "designation": "Librarian",
        "department": "Library"
      }
    }
  }
}
```

### ✅ Pass Criteria
- Response status: 200
- role = 8
- roleName = "Support Staff"
- additionalData contains staff information

---

## 5. Test Login - Student

### Request
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "mobile": "9876543213",
  "password": "default123"
}
```

### Expected Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "mobile": "9876543213",
      "role": 19,
      "roleName": "Student/Parent",
      "full_name": "Student Name",
      "email": "student@school.com",
      "additionalData": {
        "student_name": "Student Name",
        "class": "Nursery",
        "section": "A",
        "roll_no": 1
      }
    }
  }
}
```

### ✅ Pass Criteria
- Response status: 200
- role = 19
- roleName = "Student/Parent"
- additionalData contains student information

---

## 6. Test Add Staff - Principal Designation

### Request
```http
POST http://localhost:5000/api/staff/add
Content-Type: application/json

{
  "fullName": "New Principal",
  "mobile": "9999999999",
  "email": "newprincipal@school.com",
  "role": 6,
  "designation": "Principal",
  "department": "Administration",
  "dateOfJoining": "2026-06-28",
  "salary": 60000
}
```

### Expected Response
```json
{
  "success": true,
  "message": "Staff added successfully",
  "data": {
    "user": {
      "id": "uuid",
      "mobile": "9999999999",
      "role": 6,
      "full_name": "New Principal"
    },
    "staff": {
      "id": "uuid",
      "user_id": "uuid",
      "designation": "Principal"
    },
    "credentials": {
      "mobile": "9999999999",
      "password": "foster@123"
    }
  }
}
```

### ✅ Pass Criteria
- Response status: 201
- user.role = 6 (automatically assigned based on designation)
- Returns default password

---

## 7. Test Add Staff - Teacher Designation

### Request
```http
POST http://localhost:5000/api/staff/add
Content-Type: application/json

{
  "fullName": "New Teacher",
  "mobile": "8888888888",
  "email": "newteacher@school.com",
  "role": 7,
  "designation": "Teacher",
  "department": "Science"
}
```

### Expected Response
```json
{
  "success": true,
  "message": "Staff added successfully",
  "data": {
    "user": {
      "role": 7,
      "full_name": "New Teacher"
    },
    "staff": {
      "designation": "Teacher"
    },
    "credentials": {
      "mobile": "8888888888",
      "password": "foster@123"
    }
  }
}
```

### ✅ Pass Criteria
- Response status: 201
- user.role = 7
- Returns default password

---

## 8. Test Update Staff - Change Designation

### Request
```http
PUT http://localhost:5000/api/staff/update/{staff_id}
Content-Type: application/json

{
  "userId": "user_uuid",
  "designation": "Vice-Principal",
  "department": "Administration"
}
```

### Expected Response
```json
{
  "success": true,
  "message": "Staff updated successfully",
  "data": {
    "id": "staff_id",
    "designation": "Vice-Principal"
  }
}
```

### ✅ Pass Criteria
- Response status: 200
- Staff designation updated
- User role automatically updated to 6 (verify by logging in)

---

## 9. Test Staff List

### Request
```http
GET http://localhost:5000/api/staff/list
```

### Expected Response
```json
{
  "success": true,
  "message": "Staff fetched successfully",
  "data": [
    {
      "id": "uuid",
      "designation": "Principal",
      "department": "Administration",
      "user": {
        "id": "uuid",
        "role": 6,
        "full_name": "Principal Name"
      }
    },
    {
      "id": "uuid",
      "designation": "Teacher",
      "department": "Mathematics",
      "user": {
        "id": "uuid",
        "role": 7,
        "full_name": "Teacher Name"
      }
    }
  ]
}
```

### ✅ Pass Criteria
- Response status: 200
- All staff members returned
- Each has correct role based on designation
- No "Admin" designations present

---

## Test Scenarios Summary

| # | Test | Expected Role | Status |
|---|------|--------------|--------|
| 1 | Get Constants | N/A | ⏳ |
| 2 | Login Principal | 6 | ⏳ |
| 3 | Login Teacher | 7 | ⏳ |
| 4 | Login Support Staff | 8 | ⏳ |
| 5 | Login Student | 19 | ⏳ |
| 6 | Add Principal | 6 | ⏳ |
| 7 | Add Teacher | 7 | ⏳ |
| 8 | Update Designation | 6 | ⏳ |
| 9 | List Staff | Mixed | ⏳ |

---

## Permission Testing (Frontend Required)

These tests require frontend implementation:

### Test 1: Principal Access
- [ ] Can access all dashboard pages
- [ ] Can admit students
- [ ] Can add staff
- [ ] Can manage fees
- [ ] Can process salaries

### Test 2: Teacher Access
- [ ] Can access dashboard
- [ ] Can view assigned students only
- [ ] Can mark attendance for their class
- [ ] Cannot access admit student page
- [ ] Cannot access fees page
- [ ] Cannot access salary page
- [ ] Cannot access add staff page

### Test 3: Support Staff Access
- [ ] Can access dashboard
- [ ] Can upload to gallery
- [ ] Cannot access student management
- [ ] Cannot access staff management
- [ ] Cannot mark attendance

### Test 4: Student Access
- [ ] Can view own attendance
- [ ] Can view homework
- [ ] Can view reports
- [ ] Cannot access management features

---

## Automated Testing Script

Save as `test-roles.sh` (Mac/Linux) or `test-roles.ps1` (Windows):

### Bash Script
```bash
#!/bin/bash

BASE_URL="http://localhost:5000/api"

echo "Testing Role System..."
echo "====================="

# Test 1: Constants
echo -e "\n1. Testing Constants Endpoint..."
curl -X GET "$BASE_URL/config/constants" | jq '.data.roles'

# Test 2: Login Principal
echo -e "\n2. Testing Principal Login..."
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9876543210","password":"foster@123"}' \
  | jq '.data.user | {role, roleName}'

# Test 3: Login Teacher
echo -e "\n3. Testing Teacher Login..."
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9876543211","password":"foster@123"}' \
  | jq '.data.user | {role, roleName}'

echo -e "\nTesting Complete!"
```

### PowerShell Script
```powershell
$BASE_URL = "http://localhost:5000/api"

Write-Host "Testing Role System..." -ForegroundColor Green
Write-Host "=====================" -ForegroundColor Green

# Test 1: Constants
Write-Host "`n1. Testing Constants Endpoint..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "$BASE_URL/config/constants" -Method Get
$response.data.roles | ConvertTo-Json

# Test 2: Login Principal
Write-Host "`n2. Testing Principal Login..." -ForegroundColor Yellow
$body = @{
    mobile = "9876543210"
    password = "foster@123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method Post -Body $body -ContentType "application/json"
$response.data.user | Select-Object role, roleName | ConvertTo-Json

Write-Host "`nTesting Complete!" -ForegroundColor Green
```

---

## Troubleshooting

### Issue: Constants endpoint returns old roles
**Fix:** Restart the backend server

### Issue: Login doesn't return roleName
**Fix:** Check `src/routes/auth.routes.js` - ensure latest version deployed

### Issue: Staff created with wrong role
**Fix:** Check designation spelling matches exactly (case-sensitive)

### Issue: Server error on login
**Check:**
1. Database connection
2. Users table has the user
3. Password is hashed correctly
4. Staff/Students table has corresponding record

---

**Ready to Test?**
1. Start backend: `cd Fostercore && npm start`
2. Run the tests above
3. Mark each test as ✅ or ❌
4. Report any failures

Good luck! 🚀
