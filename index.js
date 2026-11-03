const express = require('express');
const dateET = require('./src/dateTimeET');
const fs = require('fs').promises;
const mysql = require('mysql2/promise');
const sharp = require('sharp');
//moodul POST päringute lahtiharutamiseks, parsimiseks
const bodyparser = require('body-parser');
//moodul andmebaasiga suhtlemiseks (koos async ehk ootamise osaga)
//const mysql = require('mysql2/promise');
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
//määrame vormide sisu parsimiseks, kui false siis ainult tekst
app.use(bodyparser.urlencoded({extended: true}));

//marsruudid
app.get('/', async (req, res)=>{
	let conn; //connection
	try {
		const dateNow = dateET.date(0);
		const timeNow = dateET.time();
		//res.render('index', {dateNow: dateNow, timeNow: timeNow});
		conn = await mysql.createConnection({
			host: process.env.DB_HOST, 
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		let galleryImage = 'SELECT file_name, alt_text FROM gallery_photos WHERE id=(SELECT MAX(id) FROM gallery_photos WHERE privacy>=2 AND deleted IS NULL)';
		const [galleryImages] = await conn.execute(galleryImage);
		//console.log(sqlRes);
		res.render('index', {galleryImage: galleryImages[0].file_name, dateNow: dateNow, timeNow: timeNow, altImage: galleryImages[0].alt_text}/*/, {dateNow: dateNow, timeNow: timeNow}/*/);
	}
	catch (err) {
		console.log('Andmebaaside suhtlemise viga: ' + err);
		res.render('index', {galleryImage: 'Andmebaas ei leidnud pilte'});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
});

//Sisseloginud kasutajate avaleht
app.get('/home', (req, res) => {
	res.render('home')
});

//Väljalogimine
app.get('/logout', (req, res) => {
	res.redirect('/');
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

/*
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
*/

//Eesti filmi marsruudid
const eestiFilmRouter = require('./routes/eestifilmRoutes');
app.use('/eestifilm', eestiFilmRouter);

//Külastuste marsruudid
const regvisitRouter = require('./routes/regvisitRoutes');
app.use('/regvisit', regvisitRouter);

//Galeriipiltide üleslaadimise marsruudid
const galleryPhotoUploadRouter = require('./routes/galleryPhotoUploadRoutes');
app.use('/galleryPhotoUpload', galleryPhotoUploadRouter);

//Kasutajakonto loomine
const signupRouter = require('./routes/signupRoutes');
app.use('/signup', signupRouter);

//Kasutajakontosse sisselogimine
const signinRouter = require('./routes/signinRoutes');
app.use('/signin', signinRouter);


app.listen(5220);