const express = require("express");
const PORT = 9000;
const app = express();
const mysql = require("mysql2");
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: 'data123',
    database: 'formdb'
});

connection.connect(err => {
    if (err) {
        console.log(err);
    }
    else {
        console.log('Connected to database');
    }
});


app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json);
app.use(express.static(__dirname + "/public"));


app.get('/', (req, res) => {
    res.render('index');
});

app.post("/", (req, res) => {
    const name = req.body.user_name;
    const email = req.body.user_email;
    const message = req.body.user_message;
    var sql = `INSERT INTO entry VALUES ("${name}","${email}", "${message}");`;

    connection.query(sql, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log("1 record inserted");
        }
    });
    return res.redirect("/");
});

app.get("/messages", (req, res) => {
  var sql = `select * from entry;`;
  connection.query(sql, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
      return res.render("messages", { data: result });
    }
  });
});


app.listen(PORT, () => {
    console.log(`Server started ${PORT}`);
})