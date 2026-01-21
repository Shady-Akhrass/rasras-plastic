# API Endpoints Documentation

Base URL: `http://localhost:80/api` (via Nginx) or `http://localhost:8080/api` (Direct)

## Authentication Module

### Login
**POST** `/auth/login`

Authenticate a user and retrieve JWT tokens.

**Request Body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "expiresIn": 86400000,
    "userId": 1,
    "username": "admin",
    "roleName": "Administrator"
  },
  "timestamp": "2026-01-13T19:30:00"
}
```

### Refresh Token
**POST** `/auth/refresh`

Get a new access token using a valid refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "expiresIn": 86400000,
    "userId": 1,
    "username": "admin",
    "roleName": "Administrator"
  },
  "timestamp": "2026-01-13T19:35:00"
}
```

### Change Password
**POST** `/auth/change-password`

Change the password for the currently logged-in user.

**Headers:**
`Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "timestamp": "2026-01-13T19:40:00"
}
```

---

## User Module

### Get All Users
**GET** `/users`

Retrieve a paginated list of users.

**Headers:**
`Authorization: Bearer <access_token>`

**Query Parameters:**
- `page` (optional): Page number (default 0)
- `size` (optional): Page size (default 20)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "content": [
      {
        "userId": 1,
        "username": "admin",
        "employeeId": 101,
        "roleId": 1,
        "roleName": "Administrator",
        "isActive": true,
        "isLocked": false,
        "lastLoginAt": "2026-01-13T10:00:00"
      },
      {
        "userId": 2,
        "username": "sales_user",
        "employeeId": 102,
        "roleId": 2,
        "roleName": "Sales Agent",
        "isActive": true,
        "isLocked": false,
        "lastLoginAt": null
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 2,
    "totalPages": 1,
    "first": true,
    "last": true
  },
  "timestamp": "2026-01-13T19:45:00"
}
```

### Create User
**POST** `/users`

Create a new user account.

**Headers:**
`Authorization: Bearer <access_token>` (Admin only)

**Request Body:**
```json
{
  "username": "new_user",
  "password": "TempPassword123!",
  "employeeId": 103,
  "roleId": 2
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "userId": 3,
    "username": "new_user",
    "employeeId": 103,
    "roleId": 2,
    "roleName": "Sales Agent",
    "isActive": true,
    "isLocked": false,
    "lastLoginAt": null
  },
  "timestamp": "2026-01-13T19:50:00"
}
```

### Get User by ID
**GET** `/users/{id}`

Retrieve details of a specific user.

**Headers:**
`Authorization: Bearer <access_token>` (Admin only)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "userId": 1,
    "username": "admin",
    "employeeId": 101,
    "roleId": 1,
    "roleName": "Administrator",
    "isActive": true,
    "isLocked": false,
    "lastLoginAt": "2026-01-13T10:00:00"
  },
  "timestamp": "2026-01-13T19:55:00"
}
```

### Update User
**PUT** `/users/{id}`

Update user details.

**Headers:**
`Authorization: Bearer <access_token>` (Admin only)

**Request Body:**
```json
{
  "roleId": 2,
  "isActive": true,
  "isLocked": false
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "userId": 2,
    "username": "sales_user",
    "employeeId": 102,
    "roleId": 2,
    "roleName": "Sales Agent",
    "isActive": true,
    "isLocked": false,
    "lastLoginAt": null
  },
  "timestamp": "2026-01-13T20:00:00"
}
```

### Reset Password
**POST** `/users/{id}/reset-password`

Reset a user's password by an admin.

**Headers:**
`Authorization: Bearer <access_token>` (Admin only)

**Request Body:**
"NewSafePassword123!"

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successfully",
  "timestamp": "2026-01-13T20:05:00"
}
```

### Delete User
**DELETE** `/users/{id}`

Permanently delete a user account from the system.

**Headers:**
`Authorization: Bearer <access_token>` (Admin only)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "timestamp": "2026-01-14T20:10:00"
}
```

### Get Roles
**GET** `/users/roles`

List all available roles.

**Headers:**
`Authorization: Bearer <access_token>` (Admin only)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "roleId": 1,
      "roleCode": "ADMIN",
      "roleNameAr": "مسؤول النظام",
      "roleNameEn": "Administrator",
      "description": "Full access to all modules",
      "isActive": true
    },
    {
      "roleId": 2,
      "roleCode": "SALES",
      "roleNameAr": "مندوب مبيعات",
      "roleNameEn": "Sales Representative",
      "description": "Access to sales module",
      "isActive": true
    }
  ],
  "timestamp": "2026-01-13T20:15:00"
}

---

## Employee Module

### Get All Employees
**GET** `/employees`

Retrieve a paginated list of employees.

**Headers:**
`Authorization: Bearer <access_token>`

**Query Parameters:**
- `page` (optional): Page number (default 0)
- `size` (optional): Page size (default 20)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "content": [
      {
        "employeeId": 1,
        "employeeCode": "EMP001",
        "fullNameAr": "أحمد محمد علي",
        "fullNameEn": "Ahmed Mohamed Ali",
        "email": "ahmed.m@example.com",
        "phone": "021234567",
        "mobile": "0590123456",
        "address": "Gaza, Al-Nasr St.",
        "departmentId": 1,
        "departmentNameAr": "إدارة تكنولوجيا المعلومات",
        "jobTitle": "Sr. Backend Developer",
        "hireDate": "2024-01-01",
        "basicSalary": 1500.0,
        "isActive": true
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1,
    "first": true,
    "last": true
  },
  "timestamp": "2026-01-14T20:15:00"
}
```

### Get Employee by ID
**GET** `/employees/{id}`

Retrieve details of a specific employee.

**Headers:**
`Authorization: Bearer <access_token>`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "employeeId": 1,
    "employeeCode": "EMP001",
    "fullNameAr": "أحمد محمد علي",
    "fullNameEn": "Ahmed Mohamed Ali",
    "email": "ahmed.m@example.com",
    "phone": "021234567",
    "mobile": "0590123456",
    "address": "Gaza, Al-Nasr St.",
    "departmentId": 1,
    "departmentNameAr": "إدارة تكنولوجيا المعلومات",
    "jobTitle": "Sr. Backend Developer",
    "hireDate": "2024-01-01",
    "basicSalary": 1500.0,
    "isActive": true
  },
  "timestamp": "2026-01-14T20:20:00"
}
```

### Create Employee
**POST** `/employees`

Create a new employee record.

**Headers:**
`Authorization: Bearer <access_token>` (Admin only)

**Request Body:**
```json
{
  "employeeCode": "EMP002",
  "firstNameAr": "سارة",
  "lastNameAr": "أحمد",
  "firstNameEn": "Sarah",
  "lastNameEn": "Ahmed",
  "email": "sarah.a@example.com",
  "mobile": "0590001122",
  "departmentId": 2,
  "jobTitle": "Sales Manager",
  "hireDate": "2025-05-15",
  "basicSalary": 1200.0,
  "isActive": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "employeeId": 2,
    "employeeCode": "EMP002",
    "fullNameAr": "سارة أحمد",
    "fullNameEn": "Sarah Ahmed",
    "email": "sarah.a@example.com",
    "departmentId": 2,
    "departmentNameAr": "قسم المبيعات",
    "jobTitle": "Sales Manager",
    "isActive": true
  },
  "timestamp": "2026-01-14T20:25:00"
}
```

### Update Employee
**PUT** `/employees/{id}`

Update an existing employee record.

**Headers:**
`Authorization: Bearer <access_token>` (Admin only)

**Request Body:**
```json
{
  "firstNameAr": "سارة",
  "lastNameAr": "محمود",
  "email": "sarah.m@example.com",
  "departmentId": 2,
  "basicSalary": 1300.0,
  "isActive": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Employee updated successfully",
  "data": {
    "employeeId": 2,
    "employeeCode": "EMP002",
    "fullNameAr": "سارة محمود",
    "jobTitle": "Sales Manager",
    "isActive": true
  },
  "timestamp": "2026-01-14T20:30:00"
}
```

### Delete Employee
**DELETE** `/employees/{id}`

Permanently delete an employee record from the system.

**Headers:**
`Authorization: Bearer <access_token>` (Admin only)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Employee deleted successfully",
  "timestamp": "2026-01-14T20:35:00"
}
```

### Get Departments
**GET** `/employees/departments`

List all available departments.

**Headers:**
`Authorization: Bearer <access_token>`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "departmentId": 1,
      "departmentCode": "ITD",
      "departmentNameAr": "إدارة تكنولوجيا المعلومات",
      "departmentNameEn": "IT Department",
      "isActive": true
    },
    {
      "departmentId": 2,
      "departmentCode": "SAL",
      "departmentNameAr": "قسم المبيعات",
      "departmentNameEn": "Sales Department",
      "isActive": true
    }
  ],
  "timestamp": "2026-01-14T20:40:00"
}
```
```
