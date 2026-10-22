const express = require("express");
const mysql = require("mysql2");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

const PORT = 3000;


// ============================================================
// EXPRESS / EJS CONFIGURATION
// ============================================================

app.set( "view engine","ejs");

app.set( "views",  path.join(__dirname, "views"));

app.use( express.urlencoded({extended: true}));

app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);


// ============================================================
// UPLOAD DIRECTORIES
// ============================================================

const uploadDir = path.join(
    __dirname,
    "public",
    "uploads"
);

const documentDir = path.join(
    uploadDir,
    "documents"
);


if (!fs.existsSync(uploadDir)) {

    fs.mkdirSync(
        uploadDir,
        {
            recursive: true
        }
    );

}


if (!fs.existsSync(documentDir)) {

    fs.mkdirSync(
        documentDir,
        {
            recursive: true
        }
    );

}


// ============================================================
// MYSQL CONNECTION
// ============================================================

const db = mysql.createConnection({

    host: "localhost",

    user: "root",

    password: "",

    database: "alumni_system"

});


db.connect(
    (err) => {

        if (err) {

            console.error(
                "MySQL connection failed:",
                err.message
            );

            return;

        }

        console.log(
            "MySQL Connected."
        );

    }
);


// ============================================================
// MULTER STORAGE
// ============================================================

const storage =
    multer.diskStorage({

        destination: function (
            req,
            file,
            cb
        ) {

            if (
                file.fieldname ===
                "profile_image"
            ) {

                cb(
                    null,
                    uploadDir
                );

                return;

            }


            if (
                file.fieldname ===
                "resume"
            ) {

                cb(
                    null,
                    documentDir
                );

                return;

            }


            cb(
                new Error(
                    "Unexpected file field."
                )
            );

        },


        filename: function (
            req,
            file,
            cb
        ) {

            const extension =
                path.extname(
                    file.originalname
                ).toLowerCase();


            const uniqueName =
                Date.now() +
                "-" +
                Math.round(
                    Math.random() * 1000000000
                ) +
                extension;


            cb(
                null,
                uniqueName
            );

        }

    });


// ============================================================
// ALLOWED FILE TYPES
// ============================================================

const allowedImageTypes = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif"
];

const allowedDocumentTypes = [
    ".pdf",
    ".doc",
    ".docx"
];


// ============================================================
// MULTER CONFIGURATION
// ============================================================

const upload = multer({

    storage: storage,

    limits: {

        fileSize:
            2 * 1024 * 1024

    },


    fileFilter:
        function (
            req,
            file,
            cb
        ) {

            const extension =
                path.extname(
                    file.originalname
                ).toLowerCase();


            if (
                file.fieldname ===
                "profile_image"
            ) {

                if (
                    allowedImageTypes.includes(
                        extension
                    )
                ) {

                    cb(
                        null,
                        true
                    );

                    return;

                }


                cb(
                    new Error(
                        "Profile image must be JPG, JPEG, PNG, or GIF."
                    )
                );

                return;

            }


            if (
                file.fieldname ===
                "resume"
            ) {

                if (
                    allowedDocumentTypes.includes(
                        extension
                    )
                ) {

                    cb(
                        null,
                        true
                    );

                    return;

                }


                cb(
                    new Error(
                        "Resume must be PDF, DOC, or DOCX."
                    )
                );

                return;

            }


            cb(
                new Error(
                    "Unexpected file field."
                )
            );

        }

});


// ============================================================
// HOME
// ============================================================

app.get(
    "/",
    (req, res) => {

        res.render(
            "index"
        );

    }
);


// ============================================================
// LOGIN PAGE
// ============================================================

app.get(
    "/login",
    (req, res) => {

        res.render(
            "login"
        );

    }
);


// ============================================================
// LOGIN
// ============================================================

app.post(
    "/login",
    (req, res) => {

        const email =
            (req.body.email || "").trim();

        const password =
            req.body.password || "";


        if (
            !email ||
            !password
        ) {

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
            [
                email,
                password
            ],
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


                if (
                    results.length === 0
                ) {

                    return res.status(401).send(
                        "Invalid email or password."
                    );

                }


                const alumni =
                    results[0];


                res.redirect(
                    "/profile/" +
                    alumni.id
                );

            }
        );

    }
);


// ============================================================
// LOGOUT
// ============================================================

app.get(
    "/logout",
    (req, res) => {

        res.redirect(
            "/"
        );

    }
);


// ============================================================
// REGISTER PAGE
// ============================================================

app.get(
    "/register",
    (req, res) => {

        res.render(
            "register"
        );

    }
);


// ============================================================
// CREATE ALUMNI / REGISTER
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

        console.log(
            "========================================"
        );

        console.log(
            "REGISTER DATA:"
        );

        console.log(
            req.body
        );

        console.log(
            "========================================"
        );


        // ====================================================
        // PERSONAL INFORMATION
        // ====================================================

        const full_name =
            (req.body.full_name || "").trim();

        const email =
            (req.body.email || "").trim();

        const password =
            req.body.password || "";

        const phone =
            (req.body.phone || "").trim();

        const gender =
            (req.body.gender || "").trim();

        const dob =
            req.body.dob || null;


        // ====================================================
        // ACADEMIC INFORMATION
        // ====================================================

        const student_id =
            (req.body.student_id || "").trim() || null;

        const degree_program =
            (req.body.degree_program || "").trim() || null;

        const department =
            (req.body.department || "").trim();

        const graduation_year =
            req.body.graduation_year || null;

        const cgpa =
            req.body.cgpa || null;


        // ====================================================
        // EMPLOYMENT INFORMATION
        // ====================================================

        const employment_status =
            (req.body.employment_status || "").trim() || null;

        const company =
            (req.body.company || "").trim();

        const job_title =
            (req.body.job_title || "").trim() || null;


        // ====================================================
        // SKILLS
        // ====================================================

        let skills =
            req.body.skills || "";


        if (
            Array.isArray(skills)
        ) {

            skills =
                skills.join(", ");

        }


        skills =
            skills.toString().trim() ||
            null;


        // ====================================================
        // CONTACT INFORMATION
        // ====================================================

        const contact_preference =
            (req.body.contact_preference || "").trim() || null;

        const linkedin =
            (req.body.linkedin || "").trim() || null;

        const city =
            (req.body.city || "").trim();

        const country =
            (req.body.country || "").trim();

        const address =
            (req.body.address || "").trim() || null;

        const bio =
            (req.body.bio || "").trim() || null;


        // ====================================================
        // CHECKBOXES
        // ====================================================

        const newsletter =
            req.body.newsletter
                ? 1
                : 0;

        const terms_accepted =
            req.body.terms_accepted
                ? 1
                : 0;


        // ====================================================
        // FILES
        // ====================================================

        const profileImage =
            req.files
                ?.profile_image
                ?. [0]
                ?.filename ||
            null;

        const resume =
            req.files
                ?.resume
                ?. [0]
                ?.filename ||
            null;


        // ====================================================
        // REQUIRED FIELD VALIDATION
        // ====================================================

        if (!full_name) {

            return res.status(400).send(
                "Please enter Full Name."
            );

        }


        if (!email) {

            return res.status(400).send(
                "Please enter Email."
            );

        }


        if (!password) {

            return res.status(400).send(
                "Please enter Password."
            );

        }


        if (!phone) {

            return res.status(400).send(
                "Please enter Phone."
            );

        }


        if (!department) {

            return res.status(400).send(
                "Please select Department."
            );

        }


        if (!graduation_year) {

            return res.status(400).send(
                "Please enter Graduation Year."
            );

        }


        if (!company) {

            return res.status(400).send(
                "Please enter Company."
            );

        }


        if (!city) {

            return res.status(400).send(
                "Please enter City."
            );

        }


        if (!country) {

            return res.status(400).send(
                "Please enter Country."
            );

        }


        if (!terms_accepted) {

            return res.status(400).send(
                "You must accept the Terms & Conditions."
            );

        }


        // ====================================================
        // CHECK DUPLICATE EMAIL
        // ====================================================

        const checkEmailSql = `

            SELECT id

            FROM alumni

            WHERE email = ?

        `;


        db.query(
            checkEmailSql,
            [email],
            (emailError, emailResults) => {

                if (emailError) {

                    console.error(
                        "Email check error:",
                        emailError
                    );

                    return res.status(500).send(
                        "Database error while checking email."
                    );

                }


                if (
                    emailResults.length > 0
                ) {

                    return res.status(400).send(
                        "This email is already registered."
                    );

                }


                // ====================================================
                // INSERT QUERY
                // ====================================================

                const sql = `

                    INSERT INTO alumni (

                        full_name,
                        email,
                        phone,
                        gender,
                        dob,
                        student_id,
                        degree_program,
                        department,
                        graduation_year,
                        employment_status,
                        cgpa,
                        job_title,
                        skills,
                        contact_preference,
                        linkedin,
                        company,
                        city,
                        country,
                        address,
                        bio,
                        newsletter,
                        terms_accepted,
                        password,
                        profile_image,
                        resume

                    )

                    VALUES (

                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?

                    )

                `;


                // ====================================================
                // EXACTLY 25 VALUES
                // ====================================================

                const values = [

                    full_name,             // 1
                    email,                 // 2
                    phone,                 // 3
                    gender,                // 4
                    dob,                   // 5
                    student_id,            // 6
                    degree_program,       // 7
                    department,            // 8
                    graduation_year,      // 9
                    employment_status,    // 10
                    cgpa,                  // 11
                    job_title,            // 12
                    skills,               // 13
                    contact_preference,   // 14
                    linkedin,             // 15
                    company,              // 16
                    city,                 // 17
                    country,              // 18
                    address,              // 19
                    bio,                  // 20
                    newsletter,           // 21
                    terms_accepted,       // 22
                    password,             // 23
                    profileImage,         // 24
                    resume                // 25

                ];


                console.log(
                    "Number of values:",
                    values.length
                );


                // ====================================================
                // INSERT INTO MYSQL
                // ====================================================

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
                                "Database error while registering alumni: " +
                                err.message
                            );

                        }


                        console.log(
                            "========================================"
                        );

                        console.log(
                            "ALUMNI REGISTERED SUCCESSFULLY"
                        );

                        console.log(
                            "ID:",
                            result.insertId
                        );

                        console.log(
                            "========================================"
                        );


                        // ====================================================
                        // SUCCESS PAGE
                        // ====================================================

                        res.render(
                            "success",
                            {

                                name:
                                    full_name,

                                id:
                                    result.insertId,

                                profileImage:
                                    profileImage

                            }
                        );

                    }
                );

            }
        );

    }
);


// ============================================================
// READ ALL ALUMNI
// ============================================================

app.get(
    "/alumni",
    (req, res) => {

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

    }
);


// ============================================================
// SEARCH ALUMNI
// ============================================================

app.get(
    "/alumni/search",
    (req, res) => {

        const {
            full_name,
            email,
            department,
            graduation_year,
            city,
            student_id
        } = req.query;


        let sql = `

            SELECT *

            FROM alumni

            WHERE 1 = 1

        `;


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
                " AND email LIKE ?";

            values.push(
                `%${email}%`
            );

        }


        if (department) {

            sql +=
                " AND department = ?";

            values.push(
                department
            );

        }


        if (graduation_year) {

            sql +=
                " AND graduation_year = ?";

            values.push(
                graduation_year
            );

        }


        if (city) {

            sql +=
                " AND city LIKE ?";

            values.push(
                `%${city}%`
            );

        }


        if (student_id) {

            sql +=
                " AND student_id LIKE ?";

            values.push(
                `%${student_id}%`
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

    }
);


// ============================================================
// READ ONE ALUMNI
// ============================================================

app.get(
    "/alumni/:id",
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
                        "Error fetching alumni:",
                        err
                    );

                    return res.status(500).send(
                        "Error fetching alumni record."
                    );

                }


                if (
                    results.length === 0
                ) {

                    return res.status(404).send(
                        "Alumni record not found."
                    );

                }


                res.render(
                    "alumni-details",
                    {
                        alumni:
                            results[0]
                    }
                );

            }
        );

    }
);


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
                        "Edit fetch error:",
                        err
                    );

                    return res.status(500).send(
                        "Error fetching alumni record."
                    );

                }


                if (
                    results.length === 0
                ) {

                    return res.status(404).send(
                        "Alumni record not found."
                    );

                }


                res.render(
                    "edit-alumni",
                    {
                        alumni:
                            results[0]
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
            req.files
                ?.profile_image
                ?. [0]
                ?.filename ||
            null;


        const newResume =
            req.files
                ?.resume
                ?. [0]
                ?.filename ||
            null;


        let {

            full_name,
            email,
            password,
            phone,
            gender,
            dob,
            student_id,
            degree_program,
            department,
            graduation_year,
            employment_status,
            cgpa,
            job_title,
            skills,
            contact_preference,
            linkedin,
            company,
            city,
            country,
            address,
            bio,
            newsletter,
            terms_accepted

        } = req.body;


        if (
            Array.isArray(skills)
        ) {

            skills =
                skills.join(", ");

        }


        // ====================================================
        // GET OLD RECORD
        // ====================================================

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

                    console.error(
                        "Existing record error:",
                        err
                    );

                    return res.status(500).send(
                        "Error fetching existing alumni record."
                    );

                }


                if (
                    results.length === 0
                ) {

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


                // ====================================================
                // UPDATE QUERY
                // ====================================================

                const sql = `

                    UPDATE alumni

                    SET

                        full_name = ?,
                        email = ?,
                        phone = ?,
                        gender = ?,
                        dob = ?,
                        student_id = ?,
                        degree_program = ?,
                        department = ?,
                        graduation_year = ?,
                        employment_status = ?,
                        cgpa = ?,
                        job_title = ?,
                        skills = ?,
                        contact_preference = ?,
                        linkedin = ?,
                        company = ?,
                        city = ?,
                        country = ?,
                        address = ?,
                        bio = ?,
                        newsletter = ?,
                        terms_accepted = ?,
                        password = ?,
                        profile_image = ?,
                        resume = ?

                    WHERE id = ?

                `;


                const values = [

                    full_name,
                    email,
                    phone,
                    gender || "",
                    dob || null,
                    student_id || null,
                    degree_program || null,
                    department,
                    graduation_year,
                    employment_status || null,
                    cgpa || null,
                    job_title || null,
                    skills || null,
                    contact_preference || null,
                    linkedin || null,
                    company,
                    city,
                    country,
                    address || null,
                    bio || null,

                    newsletter
                        ? 1
                        : 0,

                    terms_accepted
                        ? 1
                        : 0,

                    newPassword,
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
                                "Database error while updating alumni: " +
                                err.message
                            );

                        }


                        if (
                            result.affectedRows === 0
                        ) {

                            return res.status(404).send(
                                "Alumni record not found."
                            );

                        }


                        // ====================================================
                        // DELETE OLD PROFILE IMAGE
                        // ====================================================

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


                        // ====================================================
                        // DELETE OLD RESUME
                        // ====================================================

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
                            "/alumni/" +
                            id
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


        // ====================================================
        // GET FILE NAMES
        // ====================================================

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

                    console.error(
                        "Delete fetch error:",
                        err
                    );

                    return res.status(500).send(
                        "Error fetching alumni record."
                    );

                }


                if (
                    results.length === 0
                ) {

                    return res.status(404).send(
                        "Alumni record not found."
                    );

                }


                const profileImage =
                    results[0].profile_image;


                const resume =
                    results[0].resume;


                // ====================================================
                // DELETE DATABASE RECORD
                // ====================================================

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


                        // ====================================================
                        // DELETE PROFILE IMAGE
                        // ====================================================

                        if (
                            profileImage
                        ) {

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


                        // ====================================================
                        // DELETE RESUME
                        // ====================================================

                        if (
                            resume
                        ) {

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
// PROFILE
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

                    console.error(
                        "Profile error:",
                        err
                    );

                    return res.status(500).send(
                        "Error fetching profile."
                    );

                }


                if (
                    results.length === 0
                ) {

                    return res.status(404).send(
                        "Profile not found."
                    );

                }


                res.render(
                    "profile",
                    {
                        alumni:
                            results[0]
                    }
                );

            }
        );

    }
);


// ============================================================
// DASHBOARD
// ============================================================

app.get(
    "/dashboard",
    (req, res) => {

        const sql = `

            SELECT

                COUNT(*) AS totalAlumni,

                COUNT(
                    CASE

                        WHEN employment_status =
                            'Employed'

                        THEN 1

                    END
                ) AS employedAlumni,

                COUNT(
                    CASE

                        WHEN graduation_year >= 2025

                        THEN 1

                    END
                ) AS recentGraduates

            FROM alumni

        `;


        db.query(
            sql,
            (err, results) => {

                if (err) {

                    console.error(
                        "Dashboard error:",
                        err
                    );

                    return res.status(500).send(
                        "Error loading dashboard."
                    );

                }


                res.render(
                    "dashboard",
                    {
                        stats:
                            results[0]
                    }
                );

            }
        );

    }
);


// ============================================================
// MULTER / GENERAL ERROR HANDLER
// ============================================================

app.use(
    (err, req, res, next) => {

        console.error(
            "SERVER ERROR:",
            err
        );


        if (
            err instanceof
            multer.MulterError
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
// START SERVER
// ============================================================

app.listen(
    PORT,
    () => {

        console.log(
            `Server running at http://localhost:${PORT}`
        );

    }
);