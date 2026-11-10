const express = require('express');
const multer = require('multer');
const checkLogin = require('../src/checkLogin')

const router = express.Router();
//seadistame multer vahevara (middleware) failide üleslaadimiseks

//kontrollime sisselogimist
router.use(checkLogin.isLogin);
//määran üleslaadimise kataloogi
const upload = multer({dest: './public/gallery/orig/'});

//kasutatavad kontrollerid
const{
	galleryPhotoUpload,
	galleryPhotoUploadPost,
	galleryPhotos} = require('../controllers/galleryPhotoUploadControllers');


router.route('/').get(galleryPhotoUpload);

router.route('/galleryPhotos').get(galleryPhotos);
//post osa suunatakse läbi vahevara - upload
router.route('/').post(upload.single('photoInput'), galleryPhotoUploadPost);

module.exports = router;