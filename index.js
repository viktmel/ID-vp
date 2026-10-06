const express = require('express');
const dateET = require('./src/dateTimeET');
const fs = require('fs').promises;
//moodul POST päringute lahtiharutamiseks, parsimiseks
const bodyparser = require('body-parser');
//moodul andmebaasiga suhtlemiseks (koos async ehk ootamise osaga)
const mysql = require('mysql2/promise');
//moodul .env keskkonnamuutujute lugemiseks
require('dotenv').config();

const textRef = "public/txt/vanasonad.txt";
const regtextRef = "public/txt/visits.txt";


//käivitan funktsiooni express() ja annan nimeks app
const app = express();
//määrame renderusmootori: EJS
app.set('view engine', 'ejs');
//määrame avalikuna kasutatava kataloogi
app.use(express.static('public'));
//määrame vormide sisu parsimiseks
app.use(bodyparser.urlencoded({extended: false}));

//marsruudid
app.get('/', (req, res)=>{
	//const dayNow = dateET.day();
	const dateNow = dateET.date(0);
	const timeNow = dateET.time();
	//res.send('Express.js veeb läkski tööle!');
	res.render('index', {dateNow: dateNow, timeNow: timeNow});
});

app.get('/vanasona', async (req, res)=>{
	try {
		const data = await fs.readFile(textRef, "utf8");
		let folkWisdom = data.split(";");
		res.render('vanasona', {wisdom: folkWisdom[Math.round(Math.random() * (folkWisdom.length - 1))]});
	}
	catch (err){
		console.log(err);
		res.render('vanasona', {wisdom: 'Kahjuks ei leidnud ühtegi vanasõna'});	
	}
});

app.get('/tlu', (req, res)=>{
	res.render('tlu');
});

app.get('/regvisit', (req, res)=>{
	const dateNow = dateET.date(0);
	const timeNow = dateET.time();
	res.render('regvisit', {dateNow: dateNow, timeNow: timeNow});
});

app.post('/regvisit', async (req, res)=>{
	try {
		await fs.open(regtextRef, 'a');
		await fs.appendFile(regtextRef, req.body.inputName + ', ' + dateET.date(0) + ', ' + dateET.time() + ';');
		res.render('regvisit');
	}
	catch (err) {
		console.log(err);
		res.render('regvisit');
	}
	
});

app.get('/kulastus', async (req, res)=>{
	try {
		res.render('kulastus', {visits: visits[visits.length - 1]});
		const data = await fs.readFile(regtextRef, "utf8");
		let visits = data.split(",");
	}
	catch (err) {
		console.log(err);
		res.render('kulastus', {visits: 'Kahjuks külastused praegult ei tööta'});
	}

});

app.get('/eestifilm', (req, res)=>{
	res.render('eestifilm');
});

app.get('/eestifilm/inimesed', async (req, res)=>{
	let conn; //connection
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST, 
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		//defineerimine sql päringu
		let sqlReq = 'SELECT * FROM person';
		const [sqlRes] = await conn.execute(sqlReq);
		//console.log(sqlRes);
		res.render('eestifilminimesed', {personList: sqlRes});
	}
	catch (err) {
		console.log('Andmebaaside suhtlemise viga: ' + err);
		res.render('eestifilminimesed', {personList: []});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
});

app.get('/eestifilm/inimesed_lisa', (req, res)=>{
	res.render('eestifilminimesed_lisa', {notice: 'Ootan sisestust!'});
});

app.post('/eestifilm/inimesed_lisa', async (req, res)=>{
	console.log(req.body);
	//kontrollime andmeid
	//sisestatud sünnikuupäev (tekst) teisendada kuupäevaks
	const bornDate = new Date(req.body.bornInput);
	const timeNow = new Date();
	if(!req.body.firstNameInput || !req.body.lastNameInput || !req.body.bornInput || isNaN(bornDate.getTime() || bornDate > timeNow)){
		console.log("Andmed pole korrektsed!");
		return res.render('eestifilminimesed_lisa', {notice: 'Ootan sisestust!'});
	}
	let deceasedDate = null;
	if(req.body.deceasedInput != ''){
		deceasedDate = req.body.deceasedInput;
	}
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST, 
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		let sqlReq = 'INSERT INTO person (first_name, last_name, born, deceased) VALUES (?,?,?,?)';
		await conn.execute(sqlReq, [
			req.body.firstNameInput,
			req.body.lastNameInput,
			req.body.bornInput,
			deceasedDate
		]);
		res.render('eestifilminimesed_lisa', {notice: req.body.firstNameInput + ' ' + req.body.lastNameInput + ' andmebaasi lisatud!'});
	}
	catch (err) {
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		res.render('eestifilminimesed_lisa', {notice: 'Tekkis viga, midagi ei salvestanud!'});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
});



app.listen(5220);