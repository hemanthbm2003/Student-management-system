# Student Management System

A full-stack CRUD application using:
- Java Spring Boot (Backend)
- MySQL
- HTML, CSS, JavaScript (Frontend)
- JWT Authentication + Role-based Security

---

## ✨ Features
- Admin Login (default admin: `admin` / `admin123`)
- Manage Students (Add, Edit, Delete)
- Search + Sorting + Pagination
- Profile image upload
- Validations + Global exception handling

---

## 🚀 How to Run Backend

### 1️⃣ Create Database
```sql
CREATE DATABASE sms_db;

2️⃣ Configure MySQL & JWT Secret

Set your credentials in:
src/main/resources/application.properties

spring.datasource.username=root
spring.datasource.password=root
app.jwt.secret=CHANGE_THIS_TO_A_BASE64_SECRET_KEY

3️⃣ Run Project
mvn clean install
mvn spring-boot:run

🔐 Login API

POST
http://localhost:8080/api/auth/login

{
  "username": "admin",
  "password": "admin123"
}

Use the received token for authorized requests:

Authorization: Bearer <token>



| Method | Endpoint                 | Description          |
| ------ | ------------------------ | -------------------- |
| GET    | /api/students            | Get all students     |
| GET    | /api/students/{id}       | Get student by ID    |
| POST   | /api/students            | Add new student      |
| PUT    | /api/students/{id}       | Update student       |
| DELETE | /api/students/{id}       | Delete student       |
| POST   | /api/students/{id}/photo | Upload profile image |
