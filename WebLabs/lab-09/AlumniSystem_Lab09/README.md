# Alumni Management System — Lab 09

This project combines the Lab 09 functionality with the original Lab 08 interface styling.

## Preserved Lab 08 design

`public/style.css` is copied byte-for-byte from `AlumniSystem_lab_08.zip`. The Lab 09 EJS pages use the original stylesheet and its existing selectors (header, nav, main, container, search-box, tables, alumni-details, buttons and forms). No new CSS theme or replacement stylesheet is included.

## Lab 09 features

- User signup and login
- Password hashing with bcryptjs
- Session-based authentication and logout
- Protected alumni dashboard and CRUD operations
- Alumni search
- Profile image and resume uploads
- PDF export for an individual alumni and the complete directory

## Requirements

- Node.js 18 or newer
- MySQL / MariaDB (XAMPP is suitable)

## Setup

1. Extract the ZIP and open the `AlumniSystem_Lab09` folder in VS Code.
2. Start Apache (optional) and MySQL in XAMPP.
3. Open phpMyAdmin and import `database.sql`. It creates and selects the `alumni_db` database and creates the `users` and `alumni` tables.
4. Check `.env`. The defaults are for a local XAMPP installation with MySQL user `root`, no password, and database `alumni_db`. Change `DB_USER` / `DB_PASSWORD` if your MySQL setup differs.
5. In the project terminal, run:

   ```bash
   npm install
   npm start
   ```

6. Open `http://localhost:3000/signup`, create your account, and then use the dashboard.

## Important

- The provided `.env` uses local MySQL settings. Do not use remote database credentials from the lab reference archive.
- Change `SESSION_SECRET` to a long random value before deployment.
- The default Express MemoryStore is suitable only for local lab work, not production deployment.
- Uploaded profile images are stored in `public/uploads/`; resumes are stored in `public/uploads/documents/`.
