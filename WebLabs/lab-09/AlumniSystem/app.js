require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const uploadDir = path.join(__dirname, 'public', 'uploads');
const privateUploadDir = path.join(__dirname, 'private_uploads');
fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(privateUploadDir, { recursive: true });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  name: 'alumni.sid',
  secret: process.env.SESSION_SECRET || 'change-this-local-session-secret-before-deployment',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 2 * 60 * 60 * 1000 }
}));
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.notice = req.session.notice || null;
  delete req.session.notice;
  next();
});

const storage = multer.diskStorage({
  destination: (_req, file, cb) => cb(null, file.fieldname === 'resume' ? privateUploadDir : uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.fieldname === 'profile_image' && !['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) return cb(new Error('Profile image must be JPG, PNG, GIF, or WEBP.'));
    if (file.fieldname === 'resume' && !['.pdf', '.doc', '.docx'].includes(ext)) return cb(new Error('Resume must be PDF, DOC, or DOCX.'));
    cb(null, true);
  }
});
const profileUploads = upload.fields([{ name: 'profile_image', maxCount: 1 }, { name: 'resume', maxCount: 1 }]);
let db;

function setNotice(req, message) { req.session.notice = message; }
function requireLogin(req, res, next) {
  if (req.session.user) return next();
  setNotice(req, 'Please log in to continue.');
  return res.redirect('/login');
}
function requireAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') return next();
  return res.status(403).render('error', { title: 'Access denied', message: 'Only an administrator can perform this action.' });
}
function removeUpload(filename, isPrivate = false) {
  if (!filename) return;
  const filePath = path.join(isPrivate ? privateUploadDir : uploadDir, path.basename(filename));
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}
function getProfileData(body) {
  return {
    phone: (body.phone || '').trim() || null,
    gender: body.gender || null,
    department: (body.department || '').trim() || null,
    graduation_year: body.graduation_year ? Number(body.graduation_year) : null,
    cgpa: body.cgpa ? Number(body.cgpa) : null,
    degree_program: body.degree_program || null,
    employment_status: body.employment_status || null,
    company: (body.company || '').trim() || null,
    job_title: (body.job_title || '').trim() || null,
    skills: Array.isArray(body.skills) ? body.skills.join(', ') : (body.skills || '').trim(),
    linkedin: (body.linkedin || '').trim() || null,
    bio: (body.bio || '').trim() || null,
    contact_visible: body.contact_visible === '1' ? 1 : 0
  };
}

async function start() {
  db = await mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'alumniconnect_db',
    waitForConnections: true,
    connectionLimit: 10,
    dateStrings: true
  });
  await db.query('SELECT 1');

  // Create the initial administrator from .env on first run.
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing.length === 0) {
      const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
      await db.execute('INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)', [process.env.ADMIN_NAME || 'System Administrator', email, hash, 'admin']);
      console.log(`Initial admin account created: ${email}`);
    }
  }

  app.get('/', requireLogin, (req, res) => res.redirect(req.session.user.role === 'admin' ? '/admin' : '/directory'));

  app.get('/login', (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('login', { error: null, email: '' });
  });
  app.post('/login', async (req, res, next) => {
    try {
      const email = (req.body.email || '').trim().toLowerCase();
      const password = req.body.password || '';
      if (!email || !password) return res.status(400).render('login', { error: 'Email and password are required.', email });
      const [rows] = await db.execute('SELECT id, full_name, email, password_hash, role FROM users WHERE email = ? LIMIT 1', [email]);
      if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash))) {
        return res.status(401).render('login', { error: 'The email or password is incorrect.', email });
      }
      const user = rows[0];
      req.session.regenerate((err) => {
        if (err) return next(err);
        req.session.user = { id: user.id, name: user.full_name, email: user.email, role: user.role };
        req.session.save((saveErr) => saveErr ? next(saveErr) : res.redirect('/'));
      });
    } catch (err) { next(err); }
  });
  app.post('/logout', requireLogin, (req, res, next) => {
    req.session.destroy((err) => {
      if (err) return next(err);
      res.clearCookie('alumni.sid');
      res.redirect('/login');
    });
  });

  // Administrator dashboard and account creation.
  app.get('/admin', requireLogin, requireAdmin, async (req, res, next) => {
    try {
      const [rows] = await db.query(`SELECT u.id, u.full_name, u.email, u.created_at,
        p.department, p.graduation_year, p.employment_status, p.profile_image
        FROM users u LEFT JOIN alumni_profiles p ON p.user_id = u.id
        WHERE u.role = 'alumni' ORDER BY u.id DESC`);
      const [[stats]] = await db.query(`SELECT COUNT(*) AS total,
        SUM(CASE WHEN p.user_id IS NOT NULL THEN 1 ELSE 0 END) AS completed
        FROM users u LEFT JOIN alumni_profiles p ON p.user_id = u.id WHERE u.role='alumni'`);
      res.render('admin', { alumni: rows, stats, q: req.query.q || '' });
    } catch (err) { next(err); }
  });
  app.get('/admin/users/new', requireLogin, requireAdmin, (_req, res) => res.render('create-user', { error: null, full_name: '', email: '' }));
  app.post('/admin/users', requireLogin, requireAdmin, async (req, res, next) => {
    try {
      const fullName = (req.body.full_name || '').trim();
      const email = (req.body.email || '').trim().toLowerCase();
      const password = req.body.password || '';
      if (!fullName || !email || !password) return res.status(400).render('create-user', { error: 'Full name, email, and initial password are required.', full_name: fullName, email });
      if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).render('create-user', { error: 'Please enter a valid email address.', full_name: fullName, email });
      if (password.length < 8) return res.status(400).render('create-user', { error: 'The initial password must contain at least 8 characters.', full_name: fullName, email });
      const passwordHash = await bcrypt.hash(password, 12);
      await db.execute('INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, \'alumni\')', [fullName, email, passwordHash]);
      setNotice(req, `Account created for ${fullName}. Share the login details with them securely.`);
      res.redirect('/admin');
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).render('create-user', { error: 'An account with this email already exists.', full_name: req.body.full_name || '', email: req.body.email || '' });
      next(err);
    }
  });
  app.post('/admin/users/:id/delete', requireLogin, requireAdmin, async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) return res.status(400).send('Invalid user ID.');
      const [[user]] = await db.execute('SELECT id, role FROM users WHERE id = ?', [id]);
      if (!user || user.role !== 'alumni') return res.status(404).send('Alumni account not found.');
      const [[profile]] = await db.execute('SELECT profile_image, resume FROM alumni_profiles WHERE user_id = ?', [id]);
      await db.execute('DELETE FROM users WHERE id = ?', [id]);
      if (profile) { removeUpload(profile.profile_image); removeUpload(profile.resume, true); }
      setNotice(req, 'Alumni account deleted.');
      res.redirect('/admin');
    } catch (err) { next(err); }
  });

  // Alumni directory: only selected public fields are returned.
  app.get('/directory', requireLogin, async (req, res, next) => {
    try {
      const q = (req.query.q || '').trim();
      let sql = `SELECT u.id, u.full_name, p.department, p.graduation_year, p.employment_status,
        p.company, p.job_title, p.skills, p.bio, p.profile_image
        FROM users u LEFT JOIN alumni_profiles p ON p.user_id = u.id WHERE u.role='alumni'`;
      const params = [];
      if (q) {
        sql += ' AND (u.full_name LIKE ? OR p.department LIKE ? OR p.company LIKE ? OR p.skills LIKE ?)';
        params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
      }
      sql += ' ORDER BY u.full_name ASC';
      const [alumni] = await db.execute(sql, params);
      res.render('directory', { alumni, q });
    } catch (err) { next(err); }
  });

  app.get('/profile/edit', requireLogin, async (req, res, next) => {
    if (req.session.user.role !== 'alumni') return res.redirect('/admin');
    try {
      const [[profile]] = await db.execute('SELECT * FROM alumni_profiles WHERE user_id = ?', [req.session.user.id]);
      res.render('profile-form', { profile: profile || {}, error: null });
    } catch (err) { next(err); }
  });
  app.post('/profile/edit', requireLogin, profileUploads, async (req, res, next) => {
    if (req.session.user.role !== 'alumni') return res.redirect('/admin');
    try {
      const userId = req.session.user.id;
      const [[oldProfile]] = await db.execute('SELECT * FROM alumni_profiles WHERE user_id = ?', [userId]);
      const d = getProfileData(req.body);
      if (d.cgpa !== null && (d.cgpa < 0 || d.cgpa > 4)) return res.status(400).render('profile-form', { profile: { ...oldProfile, ...d }, error: 'CGPA must be between 0 and 4.' });
      d.profile_image = req.files?.profile_image?.[0]?.filename || oldProfile?.profile_image || null;
      d.resume = req.files?.resume?.[0]?.filename || oldProfile?.resume || null;
      const fields = ['phone','gender','department','graduation_year','cgpa','degree_program','employment_status','company','job_title','skills','linkedin','bio','contact_visible','profile_image','resume'];
      if (oldProfile) {
        const assignments = fields.map((f) => `${f} = ?`).join(', ');
        await db.execute(`UPDATE alumni_profiles SET ${assignments}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`, [...fields.map((f) => d[f]), userId]);
        if (req.files?.profile_image?.[0] && oldProfile.profile_image) removeUpload(oldProfile.profile_image);
        if (req.files?.resume?.[0] && oldProfile.resume) removeUpload(oldProfile.resume, true);
      } else {
        await db.execute(`INSERT INTO alumni_profiles (user_id, ${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`, [userId, ...fields.map((f) => d[f])]);
      }
      setNotice(req, 'Your profile has been saved.');
      res.redirect('/my-profile');
    } catch (err) { next(err); }
  });
  app.get('/my-profile', requireLogin, async (req, res, next) => {
    if (req.session.user.role !== 'alumni') return res.redirect('/admin');
    try {
      const [[profile]] = await db.execute('SELECT * FROM alumni_profiles WHERE user_id = ?', [req.session.user.id]);
      res.render('my-profile', { profile: profile || null });
    } catch (err) { next(err); }
  });
  app.get('/directory/:id', requireLogin, async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const [rows] = await db.execute(`SELECT u.id, u.full_name, p.department, p.graduation_year,
        p.degree_program, p.employment_status, p.company, p.job_title, p.skills, p.bio,
        p.profile_image, p.linkedin, p.phone, p.contact_visible
        FROM users u LEFT JOIN alumni_profiles p ON p.user_id=u.id WHERE u.id=? AND u.role='alumni'`, [id]);
      if (!rows.length) return res.status(404).render('error', { title: 'Profile not found', message: 'This alumni profile does not exist.' });
      const a = rows[0];
      // Contact details are visible only to the profile owner or admin, or when the owner opts in.
      const canSeeContact = req.session.user.role === 'admin' || req.session.user.id === a.id || a.contact_visible;
      res.render('public-profile', { alumni: a, canSeeContact });
    } catch (err) { next(err); }
  });

  app.get('/resume/:id', requireLogin, async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const [rows] = await db.execute('SELECT user_id, resume FROM alumni_profiles WHERE user_id = ?', [id]);
      if (!rows.length || !rows[0].resume) return res.status(404).send('Resume not found.');
      if (req.session.user.role !== 'admin' && req.session.user.id !== id) {
        // Resume files are private regardless of the public contact preference.
        return res.status(403).send('This resume is private.');
      }
      const filePath = path.join(privateUploadDir, path.basename(rows[0].resume));
      if (!fs.existsSync(filePath)) return res.status(404).send('Resume file is missing.');
      res.download(filePath, path.basename(filePath));
    } catch (err) { next(err); }
  });

  app.get('/admin/pdf', requireLogin, requireAdmin, async (_req, res, next) => {
    try {
      const [rows] = await db.query(`SELECT u.full_name,u.email,p.department,p.graduation_year,p.employment_status
        FROM users u LEFT JOIN alumni_profiles p ON p.user_id=u.id WHERE u.role='alumni' ORDER BY u.full_name`);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="alumni-directory.pdf"');
      const doc = new PDFDocument({ margin: 45, size: 'A4' });
      doc.pipe(res);
      doc.fontSize(20).text('ALUMNI DIRECTORY', { align: 'center' });
      doc.moveDown();
      rows.forEach((a, i) => {
        if (doc.y > 720) doc.addPage();
        doc.fontSize(11).font('Helvetica-Bold').text(`${i + 1}. ${a.full_name}`);
        doc.font('Helvetica').fontSize(9).text(`Email: ${a.email} | Department: ${a.department || 'Not provided'} | Graduation: ${a.graduation_year || 'Not provided'} | Status: ${a.employment_status || 'Not provided'}`);
        doc.moveDown(0.6);
      });
      doc.end();
    } catch (err) { next(err); }
  });

  app.use((req, res) => res.status(404).render('error', { title: 'Page not found', message: 'The page you requested could not be found.' }));
  app.use((err, req, res, _next) => {
    console.error(err);
    if (res.headersSent) return;
    const status = err.code === 'LIMIT_FILE_SIZE' ? 400 : 500;
    res.status(status).render('error', { title: status === 400 ? 'Upload error' : 'Something went wrong', message: status === 400 ? 'Each uploaded file must be 2 MB or smaller. Check file type and try again.' : (process.env.NODE_ENV === 'development' ? err.message : 'The server could not complete your request. Check your database setup and try again.') });
  });

  app.listen(PORT, () => console.log(`Alumni Management System running at http://localhost:${PORT}`));
}

start().catch((err) => {
  console.error('Could not start application. Check MySQL and .env settings.');
  console.error(err.message);
  process.exit(1);
});
