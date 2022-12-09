const express = require('express');
const app = express();
const mysql = require('mysql');
const fs = require('fs');
const multer = require('multer');

const storage = multer.diskStorage({
	destination: function (req, file, callback) {
		callback(null, 'public/');
	},
	filename: function (req, file, callback) {
		callback(null, file.originalname);
	},
});
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'root',
	database: 'joongonawa',
});

app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Origin', req.header('Origin'));
	res.header('Access-Control-Allow-Credentials', true);
	res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization'
	);
	next();
});

app.get('/user', function (req, res) {
	connection.query('select * from user', (err, results, fields) => {
		if (err) res.json({ error: err });
		else res.json({ data: results });
	});
});

app.get('/login', function (req, res) {
	connection.query(
		`select nickname from user where id like '${req.query.id}' and password like '${req.query.password}'`,
		(err, results, fields) => {
			if (err) res.json({ error: err });
			else res.status(results.length == 1 ? 200 : 201).json({ data: results });
		}
	);
});

app.post('/signup', function (req, res) {
	connection.query(
		`insert into user values('${req.body.id}', '${req.body.nickname}', '${req.body.password}')`,
		(err, results, fields) => {
			if (err) res.status(201).json({ error: err });
			else res.status(200).json({ data: results });
		}
	);
});

app.get('/category', function (req, res) {
	connection.query(`select * from category`, (err, results, fields) => {
		if (err) res.json({ error: err });
		else res.json({ data: results });
	});
});

app.post('/category', function (req, res) {
	connection.query(
		`insert into category(pic, name) values('${req.body.pic}', '${req.body.name}')`,
		(err, results, fields) => {
			if (err) res.json({ error: err });
			else res.json({ data: results });
		}
	);
});

app.post('/productType', function (req, res) {
	connection.query(
		`insert into productType(pic, name, category) values('${req.body.pic}', '${req.body.name}', ${req.body.category})`,
		(err, results, fields) => {
			if (err) res.json({ error: err });
			else res.json({ data: results });
		}
	);
});

app.get('/productType', function (req, res) {
	connection.query(
		`select * from productType where category = ${req.query.category}`,
		(err, results, fields) => {
			if (err) res.json({ error: err });
			else res.json({ data: results });
		}
	);
});

app.get('/productList', function (req, res) {
	connection.query(
		`select * from product where type like '${req.query.type}' order by price asc`,
		(err, results, fields) => {
			if (err) res.json({ error: err });
			else res.json({ data: results });
		}
	);
});

app.get('/product', function (req, res) {
	connection.query(`select * from product where id = ${req.query.id}`, (err, results, fields) => {
		if (err) res.status(201).json({ error: err });
		else res.status(results.length > 0 ? 200 : 201).json({ data: results });
	});
});

app.post('/product', function (req, res) {
	connection.query(
		`select * from productType where name like '${req.body.type}'`,
		(err, results, fields) => {
			if (err) res.status(201).json({ error: err });
			else if (results.length == 1) {
				connection.query(
					`insert into product(pic, name, descr, price, category, type, condi) values('${req.body.pic}', '${req.body.name}', '${req.body.descr}', ${req.body.price}, ${req.body.category}, ${results[0].id}, '${req.body.condi}')`,
					(err1, results1, fields1) => {
						if (err1) res.status(201).json({ error: err1 });
						else res.status(200).json({ data: results1 });
					}
				);
			} else if (results.length == 0) {
				connection.query(
					`insert into productType(pic, name, category) values('${req.body.pic}', '${req.body.type}', ${req.body.category})`,
					(err1, results1, fields1) => {
						if (err1) res.json({ error: err1 });
						else {
							connection.query(
								`select * from productType where name like '${req.body.type}'`,
								(err2, results2, fields2) => {
									if (err2) res.status(201).json({ error: err2 });
									else {
										connection.query(
											`insert into product(pic, name, descr, price, category, type, condi) values('${req.body.pic}', '${req.body.name}', '${req.body.descr}', ${req.body.price}, ${req.body.category}, ${results2[0].id}, '${req.body.condi}')`,
											(err3, results3, fields3) => {
												if (err3) res.status(201).json({ error: err3 });
												else res.status(200).json({ data: results3 });
											}
										);
									}
								}
							);
						}
					}
				);
			} else {
				res.status(201).json({ error: err });
			}
		}
	);
});

app.get('/tradeHistory', function (req, res) {
	connection.query(`select * from tradeHistory`, (err, results, fields) => {
		if (err) res.json({ error: err });
		else res.json({ data: results });
	});
});

app.get('/public/:filename', function (req, res) {
	const file = `${__dirname}/public/${req.params.filename}`;
	res.download(file);
});

app.post('/upload', upload.single('image'), function (req, res) {
	res.json({ filename: req.file.filename }).status(200).send();
});

app.post('/api/users/login', function (req, res) {
	connection.query(
		`select nickname from user where id like '${req.body.email}' and password like '${req.body.password}'`,
		(err, results, fields) => {
			if (err) res.status(201).json({ error: err });
			else res.status(results.length == 1 ? 200 : 201).json({ data: results });
		}
	);
});

app.post('/api/users/signup', function (req, res) {
	connection.query(
		`insert into user values('${req.body.email}', '${req.body.name}', '${req.body.password}')`,
		(err, results, fields) => {
			if (err) res.status(201).json({ error: err });
			else res.status(200).json({ data: results });
		}
	);
});

app.listen(3000);