# Student Management Backend (Spring Boot)

Features:
- JWT login (default admin: `admin` / `admin123`)
- Role based security (ROLE_ADMIN, ROLE_USER)
- Student CRUD with pagination, search, sorting
- Profile image upload
- Global exception handling

## How to run

1. Create MySQL database:

```sql
CREATE DATABASE sms_db;
```

2. Update your username/password in `src/main/resources/application.properties`:

```properties
spring.datasource.username=your_mysql_username
spring.datasource.password=your_mysql_password
app.jwt.secret=CHANGE_THIS_TO_A_BASE64_SECRET_KEY
```

3. Build & run:

```bash
mvn clean install
mvn spring-boot:run
```

4. Login:

POST `http://localhost:8080/api/auth/login`

```json
{
  "username": "admin",
  "password": "admin123"
}
```

Use the `token` from response as:

`Authorization: Bearer <token>` in Postman / frontend.

5. Sample student APIs:

- `GET /api/students?page=0&size=10&sortBy=name&sortDir=asc&keyword=rahul`
- `POST /api/students`  (ADMIN only)
- `PUT /api/students/{id}` (ADMIN only)
- `DELETE /api/students/{id}` (ADMIN only)
- `POST /api/students/{id}/photo` (multipart file upload)
