const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const sharp = require('sharp');

//@desc page for uploading photos to gallery
//@route GET /galleryPhotoUpload
//@access public

const galleryPhotoUpload = (req, res) => {
	res.render('galleryPhotoUpload');
};

//@desc page for uploading photos to gallery
//@route Post /galleryPhotoUpload
//@access public

const galleryPhotoUploadPost = async (req, res) => {
	//console.log(req.file);
	//console.log(req.body);
	let conn;
	try {
		//genereerida oma failinime
		const fileName = 'vp_' + Date.now() + '.jpg';
		await fs.rename(req.file.path, req.file.destination + fileName);
		//pildi väiksemaks muutmine
		await sharp(req.file.destination + fileName).resize(800, 600).jpeg({quality: 90}).toFile('./public/gallery/normal/' + fileName);
		await sharp(req.file.destination + fileName).resize(100, 100).jpeg({quality: 90}).toFile('./public/gallery/thumbs/' + fileName);
		let sqlReq = 'INSERT INTO gallery_photos (file_name, orig_name, alt_text, privacy, user_id) VALUES (?, ?, ?, ?, ?)';
		const user_id = 1; //see on ajutine, kuni teeme kasutajakontod ja sisselogimise
		conn = await mysql.createConnection({
			host: process.env.DB_HOST, 
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		const [result] = await conn.execute(sqlReq, [fileName, req.file.originalname, req.body.altInput, req.body.privacyInput, user_id]);
		console.log('Salvestati pildi kirje id: ' + result.insertId);
		res.render('galleryPhotoUpload');
	}
	catch (err) {
		console.log('Viga ' + err);
		res.render('galleryPhotoUpload');
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

const galleryPhotos = async (req, res) => {
	let conn; //connection
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST, 
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		let galleryImage = 'SELECT file_name, alt_text FROM gallery_photos WHERE privacy >= 2 AND deleted IS NULL';
		const [galleryImages] = await conn.execute(galleryImage, [2]);
		//console.log(sqlRes);
		res.render('galleryPhotos', {galleryList: galleryImages});
	}
	catch (err) {
		console.log('Andmebaaside suhtlemise viga: ' + err);
		res.render('galleryPhotos', {galleryList: 'Andmebaas ei leidnud pilte'});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};


	

module.exports = {
	galleryPhotoUpload,
	galleryPhotoUploadPost,
	galleryPhotos
	
}