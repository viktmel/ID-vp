const express = require('express');
const router = express.Router();

//kasutatavad kontrollerid
const{
	eestifilm,
	inimesed,
	inimesed_lisa,
	inimesedAddPost,
	eestifilmid_lisa,
	filmidAddPost,
	zanrid_lisa,
	zanridAddPost} = require('../controllers/eestifilmControllers');
	//seosed_lisa
	//seosedAddPost} = require('../controllers/eestifilmControllers');


router.route('/').get(eestifilm);

router.route('/inimesed').get(inimesed);

router.route('/inimesed_lisa').get(inimesed_lisa);

router.route('/inimesed_lisa').post(inimesedAddPost);

router.route('/filmid_lisa').get(eestifilmid_lisa);

router.route('/filmid_lisa').post(filmidAddPost);

router.route('/zanrid_lisa').get(zanrid_lisa);

router.route('/zanrid_lisa').post(zanridAddPost);

//router.route('/seosed_lisa').get(seosed_lisa);

//router.route('/seosed_lisa').post(seosedAddPost);

module.exports = router;