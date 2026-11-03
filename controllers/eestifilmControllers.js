const mysql = require('mysql2/promise');
//@desc home page for Estonian film section
//@route GET /eestifilm
//@access public

const eestifilm = (req, res) => {
	res.render('eestifilm');
};

//@desc home page for people involved in Estonian film industry
//@route GET /eestifilm/inimesed
//@access public

const inimesed = async (req, res) =>{
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
};

//@desc page for adding people involved in Estonian film industry
//@route GET /eestifilm/inimesed_lisa
//@access public

const inimesed_lisa = (req, res) =>{
	res.render('eestifilminimesed_lisa', {notice: 'Ootan sisestust!'});
};

//@desc page for adding people involved in Estonian film industry
//@route POST /eestifilm/inimesed_lisa
//@access public

const inimesedAddPost = async (req, res)=>{
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
};

//@desc page for adding Estonian movies
//@route GET /eestifilm/eestifilmid_lisa
//@access public

const eestifilmid_lisa = (req, res) =>{
	res.render('filmid_lisa', {notice: 'Ootan sisestust!'});
};

//@desc page for adding Estonian movies
//@route POST /eestifilm/eestifilmid_lisa
//@access public

const filmidAddPost = async (req, res) =>{
	console.log(req.body);
	if(!req.body.releaseDateInput || !req.body.movieLengthInput || !req.body.titleInput){
		return res.render('filmid_lisa', {notice: 'Ootan sisestust!'});
	}
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST, 
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		let sqlReq = 'INSERT INTO movie (title, release_year, duration_minutes) VALUES (?,?,?)';
		await conn.execute(sqlReq, [
			req.body.titleInput,
			req.body.releaseDateInput,
			req.body.movieLengthInput
		]);
		res.render('filmid_lisa', {notice: req.body.titleInput + ' (' + req.body.releaseDateInput + ') andmebaasi lisatud!'});
	}
	catch (err) {
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		res.render('filmid_lisa', {notice: 'Tekkis viga, midagi ei salvestanud!'});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

//@desc page for adding Estonian movie genres
//@route GET /eestifilm/zanrid_lisa
//@access public

const zanrid_lisa = (req, res) =>{
	res.render('zanrid_lisa', {notice: 'Ootan sisestust!'});
};

//@desc page for adding Estonian movie genres
//@route POST /eestifilm/zanrid_lisa
//@access public

const zanridAddPost = async (req, res) =>{
	console.log(req.body);
	if(!req.body.genreTitleInput || !req.body.genreDescriptionInput){
		//console.log("Andmed pole korrektsed!");
		return res.render('zanrid_lisa', {notice: 'Ootan sisestust!'});
	}
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST, 
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		let sqlReq = 'INSERT INTO genre (name, description) VALUES (?,?)';
		await conn.execute(sqlReq, [
			req.body.genreTitleInput,
			req.body.genreDescriptionInput
		]);
		res.render('zanrid_lisa', {notice: req.body.genreTitleInput + ' (' + req.body.genreDescriptionInput + ') andmebaasi lisatud!'});
	}
	catch (err) {
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		res.render('zanrid_lisa', {notice: 'Tekkis viga, midagi ei salvestanud!'});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

//@desc page for adding connections between people and films
//@route GET /eestifilm/seosed_lisa
//@access public

const seosed_lisa = (req, res) =>{
	res.render('seosed_lisa', {notice: 'Ootan sisestust!'});
};

const seosedAddPost = async (req,res) => {
	console.log(req.body);
	if(!req.body.personChoice || !req.body.professionChoice || !req.body.movieChoice || !req.body.actingRoleInput){
		//console.log("Andmed pole korrektsed!");
		return res.render('seosed_lisa', {notice: 'Ootan sisestust!'});
	}
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST, 
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		//let sqlReq = 'INSERT INTO person_in_movie (name, description) VALUES (?,?)';
		await conn.execute(sqlReq, [
			//req.body.genreTitleInput,
			//req.body.genreDescriptionInput
		]);
		//res.render('zanrid_lisa', {notice: req.body.genreTitleInput + ' (' + req.body.genreDescriptionInput + ') andmebaasi lisatud!'});
	}
	catch (err) {
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		res.render('seosed_lisa', {notice: 'Tekkis viga. Sisestatud informatsioon ei saanud salvestatud!'});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};
	

module.exports = {
	eestifilm,
	inimesed,
	inimesed_lisa,
	inimesedAddPost,
	eestifilmid_lisa,
	filmidAddPost,
	zanrid_lisa,
	zanridAddPost,
	seosed_lisa,
	seosedAddPost
}