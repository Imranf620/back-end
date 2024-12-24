# Backend README

## Project Overview
This backend application is built using **Node.js** and **Prisma ORM**. It supports functionality for managing files, user authentication, and file storage using AWS S3. It uses PostgreSQL as the database and includes robust error handling and logging mechanisms. This backend is optimized for scalability and maintainability, with well-structured code and the use of modern JavaScript/TypeScript practices.

## Features
- User authentication and authorization.
- File management (upload, delete, and trash functionalities).
- AWS S3 integration for file storage.
- RESTful APIs for front-end communication.
- Prisma ORM for database operations.
- CI/CD with GitHub Actions.

## Prerequisites
- Node.js v18.x
- PostgreSQL database
- AWS account with S3 setup
- NVM for managing Node.js versions

## Setup Instructions

1. **Clone the Repository:**
   ```bash
   git clone <repository_url>
   cd backend
   ```

2. **Install Node.js:**
   Use NVM to install and use Node.js 18.x:
   ```bash
   nvm install 18
   nvm use 18
   ```

3. **Install Dependencies:**
   ```bash
   npm install
   ```

4. **Setup Environment Variables:**
   Create a `.env` file in the root directory and add the following secrets:
   ```env
   DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<database>
   AWS_ACCESS_KEY_ID=<your_aws_access_key>
   AWS_SECRET_ACCESS_KEY=<your_aws_secret_key>
   S3_BUCKET_NAME=<your_s3_bucket_name>
   JWT_SECRET=<your_jwt_secret>
   PORT=4000
   ```

5. **Run Database Migrations:**
   ```bash
   npx prisma migrate dev
   ```

6. **Start the Server:**
   ```bash
   npm start
   ```
   The server will start on the port specified in `.env` (default is `4000`).

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login endpoint
- `POST /api/auth/register` - User registration endpoint

### File Management
- `POST /api/files/upload` - Upload a new file
- `DELETE /api/files/trash` - Delete files from trash
- `GET /api/files` - Retrieve user files

## Running Tests
Run the test suite using:
```bash
npm test
```

## CI/CD
The project includes a GitHub Actions workflow for continuous integration. It tests the application on Node.js versions `18.x`, `20.x`, and `22.x`.

## Contributions
Feel free to contribute by creating issues or submitting pull requests. Ensure to follow the project's coding standards and include appropriate test cases.

---

## License
This project is licensed under the MIT License.
