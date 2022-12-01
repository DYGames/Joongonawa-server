const express = require("express");
const app = express();
const mysql = require("mysql");
const fs = require("fs");
const multer = require("multer")

const storage = multer.diskStorage({
   destination: function (req, file, callback) {
      callback(null, 'public/');
   },
   filename: function (req, file, callback) {
      callback(null, file.originalname);
   }
})
const upload = multer({ storage: storage });

app.use(express.json())
app.use(express.urlencoded({ extended: false }));

const connection = mysql.createConnection({
   host: "localhost",
   user: "root",
   password: "root",
   database: "joongonawa"
});

app.use(function (req, res, next) {
   res.header("Access-Control-Allow-Origin", req.header("Origin"));
   res.header("Access-Control-Allow-Credentials", true);
   res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
   next();
});

app.get("/", function (req, res) {
   connection.query("select * from user", (err, results, fields) => {
      if (err) res.json({ error: err });
      else res.json({ data: results });
   });
});

app.get("/login", function (req, res) {
   connection.query(`select nickname from user where id like '${req.query.id}' and password like '${req.query.password}'`, (err, results, fields) => {
      if (err) res.json({ error: err });
      else res.status(results.length == 1 ? 200 : 201).json({ data: results });
   });
});

app.post("/signup", function (req, res) {
   connection.query(`insert into user values('${req.body.id}', '${req.body.nickname}', '${req.body.password}')`, (err, results, fields) => {
      if (err) res.status(201).json({ error: err })
      else res.status(200).json({ data: results })
   });
});

app.get("/category", function (req, res) {
   connection.query(`select * from category`, (err, results, fields) => {
      if (err) res.json({ error: err })
      else res.json({ data: results })
   });
});

app.post("/category", function (req, res) {
	connection.query(`insert into category(pic, name) values('${req.body.pic}', '${req.body.name}')`, (err, results, fields) => {
		if (err) res.json({ error : err })
		else res.json({ data: results })
	});
});

app.get("/productTypeList", function (req, res) {
   connection.query(`select * from productType where category = ${req.query.category}`, (err, results, fields) => {
      if (err) res.json({ error: err })
      else res.json({ data: results })
   });
});

app.get("/productList", function (req, res) {
   connection.query(`select * from product where type like '${req.query.type}' order by price asc`, (err, results, fields) => {
      if (err) res.json({ error: err });
      else res.json({ data: results });
   });
});

app.get("/product", function (req, res) {
   connection.query(`select * from product where id = ${req.query.id}`, (err, results, fields) => {
      if (err) res.json({ error: err });
      else res.json({ data: results });
   });
});

app.post("/product", function (req, res) {
   connection.query(`insert into product(pic, name, descr, price, category, type, condi) values('${req.body.pic}', '${req.body.name}', '${req.body.descr}', ${req.body.price}, ${req.body.category}, ${req.body.type}, '${req.body.condi}')`, (err, results, fields) => {
      if (err) res.json({ error: err });
      else res.json({ data: results });
   });
});

app.get("/tradeHistory", function (req, res) {
   connection.query(`select * from tradeHistory`, (err, results, fields) => {
      if (err) res.json({ error: err });
      else res.json({ data: results });
   })
});

app.get("/public/:filename", function (req, res) {
   const file = `${__dirname}/public/${req.params.filename}`;
   res.download(file);
});

app.post("/upload", upload.single('image'), function (req, res) {
   res.json({ filename: req.file.filename }).status(200).send();
});

app.listen(3000)
