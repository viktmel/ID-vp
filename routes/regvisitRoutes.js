const express = require('express');
const router = express.Router();

//kasutatavad kontrollerid
const{
	regvisit,
	regvisitPost,
	kulastus} = require('../controllers/regvisitControllers');



router.route('/').get(regvisit);

router.route('/').post(regvisitPost);

router.route('/kulastus').get(kulastus);


module.exports = router;