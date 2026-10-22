# Alumni System (Lab-08 Structure)

This project keeps the Alumni System features while organizing the app using the Lab-08 Node.js/Express layout.

## Folder structure

- `app.js` — Express server and application routes
- `.env` / `.env.example` — database and server configuration
- `database.sql` — MySQL database and table schema
- `public/` — CSS and uploaded files
- `views/` — EJS templates
- `package.json` — scripts and dependencies

## Setup

1. Install Node.js and MySQL.
2. Open MySQL Workbench/phpMyAdmin and run `database.sql`.
3. Check `.env` and set `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` for your local MySQL setup.
4. In this project folder, run:

   ```bash
   npm install
   npm start
   ```

5. Open `http://localhost:3000`.

Uploads are stored in `public/uploads/` and `public/uploads/documents/`; these folders are created automatically.

Note: this project retains the original Alumni System routes and EJS pages. Password handling is unchanged from the original project, so this is a structural conversion rather than a security redesign.
