const express = require("express");
const mysql = require("mysql2");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;


// ============================================================
// Express / EJS Configuration
// ============================================================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));


// ============================================================
// Upload Folders
// ============================================================

const uploadDir = path.join(__dirname, "public", "uploads");
const documentDir = path.join(uploadDir, "documents");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(documentDir)) {
    fs.mkdirSync(documentDir, { recursive: true });
}


// ============================================================
// MySQL Connection
// ============================================================

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "alumni_system"
});


db.connect((err) => {

    if (err) {
        console.error("MySQL connection failed:", err.message);
        return;
    }

    console.log("MySQL Connected.");

});


// ============================================================
// Multer Configuration
// ============================================================

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        if (file.fieldname === "profile_image") {
            cb(null, uploadDir);
        }

        else {
            cb(null, documentDir);
        }

    },


    filename: function (req, file, cb) {

        const ext = path.extname(file.originalname);

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            ext;

        cb(null, uniqueName);

    }

});


const allowedImageTypes = /jpeg|jpg|png|gif/;
const allowedDocumentTypes = /pdf|doc|docx/;


const upload = multer({

    storage: storage,

    limits: {
        fileSize: 2 * 1024 * 1024
    },

    fileFilter: function (req, file, cb) {

        const ext =
            path.extname(file.originalname)
                .toLowerCase()
                .replace(".", "");


        if (file.fieldname === "profile_image") {

            if (allowedImageTypes.test(ext)) {
                cb(null, true);
            }

            else {
                cb(
                    new Error(
                        "Profile image must be JPG, JPEG, PNG, or GIF."
                    )
                );
            }

        }


        else if (file.fieldname === "resume") {

            if (allowedDocumentTypes.test(ext)) {
                cb(null, true);
            }

            else {
                cb(
                    new Error(
                        "Resume must be PDF, DOC, or DOCX."
                    )
                );
            }

        }


        else {

            cb(
                new Error("Unexpected file field.")
            );

        }

    }

});


// ============================================================
// HOME PAGE
// ============================================================

app.get("/", (req, res) => {

    res.render("index");

});


// ============================================================
// LOGIN PAGE
// ============================================================

app.get("/login", (req, res) => {

    res.render("login");

});


// ============================================================
// LOGIN
// ============================================================

app.post("/login", (req, res) => {

    const {
        email,
        password
    } = req.body;


    if (!email || !password) {

        return res.status(400).send(
            "Email and password are required."
        );

    }


    const sql = `
        SELECT *
        FROM alumni
        WHERE email = ?
        AND password = ?
    `;


    db.query(
        sql,
        [email, password],
        (err, results) => {

            if (err) {

                console.error(
                    "Login error:",
                    err
                );

                return res.status(500).send(
                    "Database error during login."
                );

            }


            if (results.length === 0) {

                return res.status(401).send(
                    "Invalid email or password."
                );

            }


            const alumni = results[0];


            res.redirect(
                "/profile/" + alumni.id
            );

        }
    );

});


// ============================================================
// LOGOUT
// ============================================================

app.get("/logout", (req, res) => {

    res.redirect("/");

});


// ============================================================
// REGISTER PAGE
// ============================================================

app.get("/register", (req, res) => {

    res.render("register");

});


// ============================================================
// CREATE ALUMNI
// ============================================================

app.post(
    "/register",

    upload.fields([
        {
            name: "profile_image",
            maxCount: 1
        },
        {
            name: "resume",
            maxCount: 1
        }
    ]),

    (req, res) => {

        try {

            const {

                full_name,
                email,
                password,
                phone,
                dob,
                gender,
                department,
                graduation_year,
                cgpa,
                degree_program,
                employment_status,
                company,
                job_title,
                contact_preference,
                linkedin,
                bio,
                newsletter,
                terms_accepted

            } = req.body;


            let skills =
                req.body.skills || "";


            if (Array.isArray(skills)) {

                skills =
                    skills.join(", ");

            }


            const profileImage =
                req.files?.profile_image?.[0]?.filename ||
                null;


            const resume =
                req.files?.resume?.[0]?.filename ||
                null;


            if (
                !full_name ||
                !email ||
                !password ||
                !terms_accepted
            ) {

                return res.status(400).send(
                    "Full Name, Email, Password and Terms & Conditions are required."
                );

            }


            const sql = `

                INSERT INTO alumni
                (
                    full_name,
                    email,
                    password,
                    phone,
                    dob,
                    gender,
                    department,
                    graduation_year,
                    cgpa,
                    degree_program,
                    employment_status,
                    company,
                    job_title,
                    skills,
                    contact_preference,
                    linkedin,
                    bio,
                    newsletter,
                    terms_accepted,
                    profile_image,
                    resume
                )

                VALUES
                (
                    ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?,
                    ?, ?, ?
                )

            `;


            const values = [

                full_name,
                email,
                password,
                phone || null,
                dob || null,
                gender || null,
                department || null,
                graduation_year || null,
                cgpa || null,
                degree_program || null,
                employment_status || null,
                company || null,
                job_title || null,
                skills,
                contact_preference || null,
                linkedin || null,
                bio || null,
                newsletter ? 1 : 0,
                terms_accepted ? 1 : 0,
                profileImage,
                resume

            ];


            db.query(
                sql,
                values,
                (err, result) => {

                    if (err) {

                        console.error(
                            "INSERT error:",
                            err
                        );

                        return res.status(500).send(
                            "Database error."
                        );

                    }


                    res.render(
                        "success",
                        {
                            name: full_name,
                            id: result.insertId,
                            profileImage: profileImage
                        }
                    );

                }
            );

        }

        catch (error) {

            console.error(error);

            res.status(500).send(
                "Server error."
            );

        }

    }
);


// ============================================================
// READ ALL ALUMNI
// ============================================================

app.get("/alumni", (req, res) => {

    const sql = `
        SELECT *
        FROM alumni
        ORDER BY id DESC
    `;


    db.query(
        sql,
        (err, results) => {

            if (err) {

                console.error(
                    "Error fetching alumni:",
                    err
                );

                return res.status(500).send(
                    "Error fetching alumni records."
                );

            }


            res.render(
                "alumni",
                {
                    alumni: results
                }
            );

        }
    );

});


// ============================================================
// SEARCH ALUMNI
// ============================================================

app.get("/alumni/search", (req, res) => {

    const {

        full_name,
        email,
        department,
        graduation_year

    } = req.query;


    let sql =
        "SELECT * FROM alumni WHERE 1=1";


    const values = [];


    if (full_name) {

        sql +=
            " AND full_name LIKE ?";

        values.push(
            `%${full_name}%`
        );

    }


    if (email) {

        sql +=
            " AND email = ?";

        values.push(email);

    }


    if (department) {

        sql +=
            " AND department = ?";

        values.push(department);

    }


    if (graduation_year) {

        sql +=
            " AND graduation_year = ?";

        values.push(
            graduation_year
        );

    }


    sql +=
        " ORDER BY id DESC";


    db.query(
        sql,
        values,
        (err, results) => {

            if (err) {

                console.error(
                    "Search error:",
                    err
                );

                return res.status(500).send(
                    "Error searching alumni records."
                );

            }


            res.render(
                "alumni",
                {
                    alumni: results
                }
            );

        }
    );

});


// ============================================================
// READ ONE ALUMNI
// ============================================================

app.get("/alumni/:id", (req, res) => {

    const id =
        req.params.id;


    const sql = `
        SELECT *
        FROM alumni
        WHERE id = ?
    `;


    db.query(
        sql,
        [id],
        (err, results) => {

            if (err) {

                console.error(
                    "Error fetching alumni:",
                    err
                );

                return res.status(500).send(
                    "Error fetching alumni record."
                );

            }


            if (results.length === 0) {

                return res.status(404).send(
                    "Alumni record not found."
                );

            }


            res.render(
                "alumni-details",
                {
                    alumni: results[0]
                }
            );

        }
    );

});


// ============================================================
// EDIT PAGE
// ============================================================

app.get(
    "/alumni/edit/:id",
    (req, res) => {

        const id =
            req.params.id;


        const sql = `
            SELECT *
            FROM alumni
            WHERE id = ?
        `;


        db.query(
            sql,
            [id],
            (err, results) => {

                if (err) {

                    console.error(
                        "Error fetching alumni for edit:",
                        err
                    );

                    return res.status(500).send(
                        "Error fetching alumni record."
                    );

                }


                if (results.length === 0) {

                    return res.status(404).send(
                        "Alumni record not found."
                    );

                }


                res.render(
                    "edit-alumni",
                    {
                        alumni: results[0]
                    }
                );

            }
        );

    }
);


// ============================================================
// UPDATE ALUMNI
// ============================================================

app.post(
    "/alumni/edit/:id",

    upload.fields([
        {
            name: "profile_image",
            maxCount: 1
        },
        {
            name: "resume",
            maxCount: 1
        }
    ]),

    (req, res) => {

        const id =
            req.params.id;


        const newProfileImage =
            req.files?.profile_image?.[0]?.filename ||
            null;


        const newResume =
            req.files?.resume?.[0]?.filename ||
            null;


        let {

            full_name,
            email,
            password,
            phone,
            dob,
            gender,
            department,
            graduation_year,
            cgpa,
            degree_program,
            employment_status,
            company,
            job_title,
            skills,
            contact_preference,
            linkedin,
            bio

        } = req.body;


        if (Array.isArray(skills)) {

            skills =
                skills.join(", ");

        }


        const selectSql = `
            SELECT
                password,
                profile_image,
                resume
            FROM alumni
            WHERE id = ?
        `;


        db.query(
            selectSql,
            [id],
            (err, results) => {

                if (err) {

                    console.error(err);

                    return res.status(500).send(
                        "Error fetching alumni record."
                    );

                }


                if (results.length === 0) {

                    return res.status(404).send(
                        "Alumni record not found."
                    );

                }


                const oldPassword =
                    results[0].password;


                const oldProfileImage =
                    results[0].profile_image;


                const oldResume =
                    results[0].resume;


                const newPassword =
                    password ||
                    oldPassword;


                const profileImage =
                    newProfileImage ||
                    oldProfileImage;


                const resume =
                    newResume ||
                    oldResume;


                const sql = `

                    UPDATE alumni

                    SET

                        full_name = ?,
                        email = ?,
                        password = ?,
                        phone = ?,
                        dob = ?,
                        gender = ?,
                        department = ?,
                        graduation_year = ?,
                        cgpa = ?,
                        degree_program = ?,
                        employment_status = ?,
                        company = ?,
                        job_title = ?,
                        skills = ?,
                        contact_preference = ?,
                        linkedin = ?,
                        bio = ?,
                        profile_image = ?,
                        resume = ?

                    WHERE id = ?

                `;


                const values = [

                    full_name,
                    email,
                    newPassword,
                    phone || null,
                    dob || null,
                    gender || null,
                    department || null,
                    graduation_year || null,
                    cgpa || null,
                    degree_program || null,
                    employment_status || null,
                    company || null,
                    job_title || null,
                    skills || "",
                    contact_preference || null,
                    linkedin || null,
                    bio || null,
                    profileImage,
                    resume,
                    id

                ];


                db.query(
                    sql,
                    values,
                    (err, result) => {

                        if (err) {

                            console.error(
                                "UPDATE error:",
                                err
                            );

                            return res.status(500).send(
                                "Database error while updating alumni."
                            );

                        }


                        if (
                            result.affectedRows === 0
                        ) {

                            return res.status(404).send(
                                "Alumni record not found."
                            );

                        }


                        // Delete old image

                        if (
                            newProfileImage &&
                            oldProfileImage
                        ) {

                            const oldImagePath =
                                path.join(
                                    uploadDir,
                                    oldProfileImage
                                );


                            if (
                                fs.existsSync(
                                    oldImagePath
                                )
                            ) {

                                fs.unlinkSync(
                                    oldImagePath
                                );

                            }

                        }


                        // Delete old resume

                        if (
                            newResume &&
                            oldResume
                        ) {

                            const oldResumePath =
                                path.join(
                                    documentDir,
                                    oldResume
                                );


                            if (
                                fs.existsSync(
                                    oldResumePath
                                )
                            ) {

                                fs.unlinkSync(
                                    oldResumePath
                                );

                            }

                        }


                        res.redirect(
                            "/alumni/" + id
                        );

                    }
                );

            }
        );

    }
);


// ============================================================
// DELETE ALUMNI
// ============================================================

app.post(
    "/alumni/delete/:id",
    (req, res) => {

        const id =
            req.params.id;


        const selectSql = `
            SELECT
                profile_image,
                resume
            FROM alumni
            WHERE id = ?
        `;


        db.query(
            selectSql,
            [id],
            (err, results) => {

                if (err) {

                    console.error(err);

                    return res.status(500).send(
                        "Error fetching alumni record."
                    );

                }


                if (results.length === 0) {

                    return res.status(404).send(
                        "Alumni record not found."
                    );

                }


                const profileImage =
                    results[0].profile_image;


                const resume =
                    results[0].resume;


                const deleteSql = `
                    DELETE FROM alumni
                    WHERE id = ?
                `;


                db.query(
                    deleteSql,
                    [id],
                    (err, result) => {

                        if (err) {

                            console.error(
                                "DELETE error:",
                                err
                            );

                            return res.status(500).send(
                                "Database error while deleting alumni."
                            );

                        }


                        if (
                            result.affectedRows === 0
                        ) {

                            return res.status(404).send(
                                "Alumni record not found."
                            );

                        }


                        // Delete profile image

                        if (profileImage) {

                            const imagePath =
                                path.join(
                                    uploadDir,
                                    profileImage
                                );


                            if (
                                fs.existsSync(
                                    imagePath
                                )
                            ) {

                                fs.unlinkSync(
                                    imagePath
                                );

                            }

                        }


                        // Delete resume

                        if (resume) {

                            const resumePath =
                                path.join(
                                    documentDir,
                                    resume
                                );


                            if (
                                fs.existsSync(
                                    resumePath
                                )
                            ) {

                                fs.unlinkSync(
                                    resumePath
                                );

                            }

                        }


                        res.redirect(
                            "/alumni"
                        );

                    }
                );

            }
        );

    }
);


// ============================================================
// PROFILE PAGE
// ============================================================

app.get(
    "/profile/:id",
    (req, res) => {

        const id =
            req.params.id;


        const sql = `
            SELECT *
            FROM alumni
            WHERE id = ?
        `;


        db.query(
            sql,
            [id],
            (err, results) => {

                if (err) {

                    console.error(err);

                    return res.status(500).send(
                        "Error fetching profile."
                    );

                }


                if (results.length === 0) {

                    return res.status(404).send(
                        "Profile not found."
                    );

                }


                res.render(
                    "profile",
                    {
                        alumni: results[0]
                    }
                );

            }
        );

    }
);


// ============================================================
// Multer / General Error Handler
// ============================================================

app.use(
    (err, req, res, next) => {

        console.error(err);


        if (
            err instanceof multer.MulterError
        ) {

            return res.status(400).send(
                "Upload error: " +
                err.message +
                ". Maximum file size is 2 MB per file."
            );

        }


        if (err) {

            return res.status(400).send(
                err.message
            );

        }


        next();

    }
);


// ============================================================
// Start Server
// ============================================================

app.listen(PORT, () => {
        console.log(
            `Server running at http://localhost:${PORT}`
        );
    }
);