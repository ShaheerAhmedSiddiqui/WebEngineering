# AlumniConnect — Alumni Management System (Lab 09)

A Node.js + Express + EJS + MySQL application using the original CSS styling from your project. The workflow is based on an administrator creating alumni login accounts, then each alumnus completing their own profile and viewing a directory of other alumni.

## Workflow

1. The administrator logs in.
2. The administrator creates an alumni account with full name, email, and an initial password.
3. The alumnus logs in using those credentials.
4. The alumnus completes or updates their own academic and professional profile.
5. Signed-in alumni can browse selected public profile fields in the directory.
6. Phone numbers are hidden unless the profile owner opts in. Email addresses and resumes are not shown in the public directory.
7. The administrator can view the alumni directory, monitor profile completion, export a PDF, and delete alumni accounts.

## Technology

- Node.js and Express
- EJS templates
- MySQL with `mysql2`
- `express-session` for login sessions
- `bcryptjs` for password hashing
- Multer for profile image and resume uploads
- PDFKit for administrator directory export

## Requirements

- Node.js 18 or newer
- MySQL 8+ or a compatible MariaDB version
- npm

## Setup on Windows

### 1. Create the database

1. Start MySQL (for example, through XAMPP or MySQL Workbench).
2. Open phpMyAdmin or MySQL Workbench.
3. Import/run `database.sql`. It creates a separate database named `alumniconnect_db` and the required tables.

The project uses a new database name so it does not collide with the older `alumni_db` schema from the previous version. Do not delete your old database unless you have backed it up and are sure you no longer need it.

### 2. Configure environment variables

1. Copy `.env.example` and name the copy `.env`.
2. Update `DB_USER` and `DB_PASSWORD` for your MySQL setup.
3. Change `SESSION_SECRET` to a long random value.
4. Set your own `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and optionally `ADMIN_NAME`. Use a strong password of at least 8 characters.

Example local settings (adjust to your machine):

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=alumniconnect_db
SESSION_SECRET=replace-with-a-long-random-secret
ADMIN_NAME=System Administrator
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeThisAdminPassword123!
NODE_ENV=development
```

**Important:** The values above are examples. Do not publish your real `.env` file or commit it to GitHub.

### 3. Install packages and start the app

Open PowerShell in this project folder and run:

```powershell
npm install
npm start
```

Then open `http://localhost:3000` in your browser.

On first startup, the app creates the initial admin account if `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set and that email is not already in the database. After changing the admin password in `.env`, the existing account password is not automatically changed; update it through a future password-management feature or recreate the local database only if safe to do so.

## SMTP: Email credentials when an admin creates an account

When the administrator creates an alumni account, the app stores a bcrypt password hash and then emails the alumnus their login URL, email address, and initial password using SMTP. The app does not store the plain-text password in the database. If SMTP delivery fails, the account remains created and the admin dashboard shows a warning; check the terminal and SMTP configuration before retrying.

### Gmail setup

1. Enable 2-Step Verification on the Google account used to send mail.
2. Create a Google App Password in your Google Account security settings. Use that App Password as `SMTP_PASS`; do not use your normal Gmail password. If App Passwords are unavailable for your account, use another SMTP provider.
3. Copy the SMTP values from `.env.example` into your local `.env` and replace the example values:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-google-app-password
SMTP_FROM=your-email@gmail.com
APP_URL=http://localhost:3000
```

For port `465`, set `SMTP_SECURE=true`. For port `587`, normally use `SMTP_SECURE=false` (STARTTLS). `SMTP_FROM` should be an address authorized by your SMTP provider. `APP_URL` should be the deployed website URL when the app is hosted; alumni cannot access your `localhost` from their own computers.

Install/update dependencies after extracting the project:

```powershell
npm install
npm start
```

**Security note for coursework:** emailing a plain initial password is convenient for this lab but is not ideal for production. A stronger production workflow sends a one-time password setup link and requires the alumnus to set their own password. Never commit `.env` or share SMTP credentials.

## Main routes

| Route | Purpose | Access |
|---|---|---|
| `/login` | Sign in | Public |
| `/admin` | Admin dashboard | Admin only |
| `/admin/users/new` | Create an alumni account | Admin only |
| `/directory` | Browse/search alumni | Signed-in users |
| `/directory/:id` | View selected profile details | Signed-in users |
| `/my-profile` | View your own profile | Alumni only |
| `/profile/edit` | Complete/update your own profile | Alumni only |
| `/resume/:id` | Download a resume | Owner or admin only |
| `/admin/pdf` | Export directory PDF | Admin only |
| `/logout` | Log out | Signed-in users (POST) |

## Privacy and implementation notes

- There is no public signup page. Only an administrator can create accounts.
- Passwords are hashed with bcryptjs.
- Alumni can edit only their own profile; they cannot edit other alumni or create accounts.
- The directory does not expose email addresses, birth dates, passwords, or resumes.
- Resume files are stored outside the public static directory and require authentication plus owner/admin authorization to download.
- Profile images are stored in `public/uploads/` and are visible in the directory.
- Uploaded files have a 2 MB size limit and extension checks. For a production deployment, also validate file contents, add CSRF protection, rate limiting, HTTPS, and a persistent session store.
- Express's default in-memory session store is intended for local coursework, not production.

## Project structure

```text
AlumniSystem_Lab09/
├── app.js
├── database.sql
├── package.json
├── .env.example
├── README.md
├── public/
│   ├── style.css
│   └── uploads/
├── private_uploads/       # private resumes; created automatically
└── views/
    ├── admin.ejs
    ├── create-user.ejs
    ├── directory.ejs
    ├── error.ejs
    ├── login.ejs
    ├── my-profile.ejs
    ├── profile-form.ejs
    └── public-profile.ejs
```


## Lab 11: Private real-time alumni chat

The application now uses Socket.IO for live one-to-one messaging between authenticated alumni.

1. Install the new dependency with `npm install` (or `npm install socket.io`).
2. Start MySQL and ensure the database settings in `.env` are correct.
3. Run `npm start`.
4. Sign in with two different alumni accounts in separate browsers/incognito windows.
5. Open **Directory**, choose an alumni profile, and select **Message**.
6. Send messages from either account. Messages are stored in MySQL and appear live in the open conversation.

The `messages` table is created automatically when the application starts. Messages are restricted to the two alumni in a conversation; the app does not broadcast chat messages to all connected users. The existing Lab 10 `public/style.css` palette is retained, with chat-specific styles appended at the end.
