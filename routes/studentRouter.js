const express = require('express');
const bodyParser = require('body-parser');
var db = require('../db');
var mysql = require('mysql');
var queryHelper = require('../query');

const studentRouter = express.Router();
studentRouter.use(bodyParser.json());



studentRouter.route('/:studentId/personal_info')
.get((req,res,next) => {

	var query = "select * from student as s join user as u on s.uid = u.id where s.reg_no = ? ";
	var primise = queryHelper.Execute(query,req.params.studentId);	
	primise.then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
	    res.end(JSON.stringify(result));
	}).catch(function(result){
		console.log("ERROR : " + result);
		res.send(result);	
	});
})
.post((req, res, next) => {
   res.statusCode = 403;
    res.end('POST operation not supported on /:studentId/personal_info');
})
.put( (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /:studentId/personal_info');
})
.delete((req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /:studentId/personal_info');
});


studentRouter.route('/:studentId/announcements')
.get((req,res,next) => {

	var query = "select a.announcement, a.date, a.time from student as s join user as u on u.id=s.uid join enrolled_in as ei on ei.std_id=s.id join section as sec on sec.id=ei.sec_id join semester as sem on sem.id=sec.sid join course as c on c.id = sec.cid join announcements as a on a.sec_id=sec.id where s.reg_no = ? and sem.name=? and c.name = ? and sec.name = ?";
	var params = [ req.params.studentId ,req.body.semester ,req.body.course ,req.body.section];

	var primise = queryHelper.Execute(query,params);	
	primise.then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    res.end(JSON.stringify(result));

	}).catch(function(result){
		console.log("ERROR : " + result);
	});
})
.post((req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /announcements');
})
.put( (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /announcements');
})
.delete((req, res, next) => {
     res.statusCode = 403;
    res.end('DELETE operation not supported on /announcements');
});



studentRouter.route('/:studentId/course_outline')
.get((req,res,next) => {

	var query = "select mt.type_name as Type,co.weightage,co.no_of_selected from student as s join user as u on u.id=s.uid join enrolled_in as ei on ei.std_id=s.id join section as sec on sec.id=ei.sec_id join course_outline as co on co.sec_id=sec.id join marks_type as mt on mt.id=co.mt_id join semester as sem on sem.id=sec.sid join course as c on c.id = sec.cid where s.reg_no = ? and sem.name= ? and c.name = ? and sec.name = ? ";
	var params = [ req.params.studentId ,req.body.semester, req.body.course, req.body.section ];

	var primise = queryHelper.Execute(query,params);	
	primise.then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    res.end(JSON.stringify(result));

	}).catch(function(result){
		console.log("ERROR : " + result);
	});
})
.post((req,res,next) => {

	res.statusCode = 403;
    res.end('post operation not supported on /course_outline');

})
.put((req,res,next) => {

	res.statusCode = 403;
    res.end('put operation not supported on /course_outline');
	
})
.delete((req,res,next) => {

	res.statusCode = 403;
    res.end('Delete operation not supported on /course_outline');
});





studentRouter.route('/:studentId/courses')
.get((req,res,next) => {

	var query = "select c.name as course,sec.name as section from student as s join user as u on u.id=s.uid join enrolled_in as ei on ei.std_id=s.id join section as sec on sec.id=ei.sec_id join semester as sem on sem.id=sec.sid join course as c on c.id = sec.cid where s.reg_no = ? and sem.name = ? ";
	var params = [ req.params.studentId ,req.body.semester];

	var primise = queryHelper.Execute(query,params);	
	primise.then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    res.end(JSON.stringify(result));

	}).catch(function(result){
		console.log("ERROR : " + result);
	});
})
.post((req,res,next) => {

	res.statusCode = 403;
    res.end('POST operation not supported on /courses');

})
.put((req,res,next) => {

	res.statusCode = 403;
    res.end('PUT operation not supported on /courses');
})
.delete((req,res,next) => {

	res.statusCode = 403;
    res.end('Delete operation not supported on /courses');
});







module.exports = studentRouter;