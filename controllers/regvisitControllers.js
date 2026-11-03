const mysql = require('mysql2/promise');
const dateET = require('../src/dateTimeET');
const regtextRef = "../public/txt/visits.txt";

//@desc home page for visit registration section
//@route GET /regvisit
//@access public

const regvisit = (req, res) => {
	const dateNow = dateET.date(0);
	const timeNow = dateET.time();
	res.render('regvisit', {dateNow: dateNow, timeNow: timeNow});
};

//@desc page for registering your visit
//@route GET /regvisit
//@access public

const regvisitPost = async (req, res) => {
	try {
		await fs.open(regtextRef, 'a');
		await fs.appendFile(regtextRef, req.body.inputName + ', ' + dateET.date(0) + ', ' + dateET.time() + ';');
		res.render('regvisit', {dateNow: dateNow, timeNow: timeNow});
	}
	catch (err) {
		console.log(err);
		res.render('regvisit', {dateNow: dateNow, timeNow: timeNow});
	}
	
};

//@desc page that shows the last registered visit
//@route GET /regvisit/kulastus
//@access public

const kulastus = async (req, res) => {
	try {
		res.render('kulastus', {visits: visits[visits.length - 1]});
		const data = await fs.readFile(regtextRef, "utf8");
		let visits = data.split(",");
	}
	catch (err) {
		console.log(err);
		res.render('kulastus', {visits: 'Kahjuks külastused praegult ei tööta'});
	}

};

module.exports = {
	regvisit,
    regvisitPost,
    kulastus
}