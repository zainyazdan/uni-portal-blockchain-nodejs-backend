const express = require('express');
const bodyParser = require('body-parser');
var db = require('../db');
var mysql = require('mysql');
var queryHelper = require('../query');

const studentRouter = express.Router();
studentRouter.use(bodyParser.json());



const { sign } = require("jsonwebtoken")
const { verifyStudent } = require("../authentication/auth")
const { secretKey_Student } = require("../config")
const { tokenExpireTime } = require("../config")



studentRouter.route('/:admin_Id/login')
.get(verifyStudent, (req,res,next) => {

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    return  res.end(JSON.stringify({status:true, message: "Ho gea student!!" }))
})
.post((req, res, next) => {

	
	var query = "select u.name,u.username from user as u join student as s on u.id=s.uid where u.username = ? and u.password = ?";
	var params = [req.body.username, req.body.password];
	
	var primise = queryHelper.Execute(query, params);	

	primise.then(function(results){

		if(results.length == 0)
		{
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');   
		    res.end(JSON.stringify({status:false, message: "Invalid Usename or Password" }))
		}

		const jsontoken = sign({user: 'student', result :results }, secretKey_Student ,{expiresIn: tokenExpireTime});

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    return  res.end(JSON.stringify({status:true, meassage: "Successfully Logged-in",token : jsontoken }))

	}).catch(function(result){
		console.log("ERROR : " + result);
	});
});



studentRouter.route('/:studentId/personal_info')
.get(verifyStudent, (req,res,next) => {

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
.post(verifyStudent, (req, res, next) => {
   res.statusCode = 403;
    res.end('POST operation not supported on /:studentId/personal_info');
})
.put(verifyStudent,  (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /:studentId/personal_info');
})
.delete(verifyStudent, (req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /:studentId/personal_info');
});


studentRouter.route('/:studentId/announcements')
.get(verifyStudent, (req,res,next) => {

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
.post(verifyStudent, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /announcements');
})
.put(verifyStudent,  (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /announcements');
})
.delete(verifyStudent, (req, res, next) => {
     res.statusCode = 403;
    res.end('DELETE operation not supported on /announcements');
});



studentRouter.route('/:studentId/course_outline')
.get(verifyStudent, (req,res,next) => {

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
.post(verifyStudent, (req,res,next) => {

	res.statusCode = 403;
    res.end('post operation not supported on /course_outline');

})
.put(verifyStudent, (req,res,next) => {

	res.statusCode = 403;
    res.end('put operation not supported on /course_outline');
	
})
.delete(verifyStudent, (req,res,next) => {

	res.statusCode = 403;
    res.end('Delete operation not supported on /course_outline');
});





studentRouter.route('/:studentId/courses')
.get(verifyStudent, (req,res,next) => {

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
.post(verifyStudent, (req,res,next) => {

	res.statusCode = 403;
    res.end('POST operation not supported on /courses');

})
.put(verifyStudent, (req,res,next) => {

	res.statusCode = 403;
    res.end('PUT operation not supported on /courses');
})
.delete(verifyStudent, (req,res,next) => {

	res.statusCode = 403;
    res.end('Delete operation not supported on /courses');
});


studentRouter.route('/:studentId/gradebook')
.get(verifyStudent, (req,res,next) => {

	var query = "select mt.type_name,m.assesment_no, m.date, m.time, m.total_marks, m.obtained_marks from section as sec join semester as sem on sem.id=sec.sid join course as c on c.id = sec.cid join has_marks as hm on sec.id = hm.sec_id join student as std on std.id = hm.std_id join marks as m on m.id = hm.mid join marks_type as mt on mt.Id=m.mt_id where sem.name= ? and c.name = ? and sec.name = ? and reg_no  = ? order by mt.type_name asc, m.assesment_no asc";
	var params = [ req.body.semester, req.body.course, req.body.section, req.params.studentId];

	var primise = queryHelper.Execute(query,params);	
	primise.then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    res.end(JSON.stringify(result));

	}).catch(function(result){
		console.log("ERROR : " + result);
	});
})
.post(verifyStudent, (req,res,next) => {

	res.statusCode = 403;
    res.end('post operation not supported on /:studentId/gradebook');

})
.put(verifyStudent, (req,res,next) => {

	res.statusCode = 403;
    res.end('put operation not supported on /:studentId/gradebook');
	
})
.delete(verifyStudent, (req,res,next) => {

	res.statusCode = 403;
    res.end('Delete operation not supported on /:studentId/gradebook');
});



studentRouter.route('/:studentId/test')
.get( (req,res,next) => {

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
.post( (req, res, next) => {
    res.statusCode = 200;
	//res.send(result);	
	console.log("username: " + req.body.username);
	console.log("password : " + JSON.stringify(req.body));


    res.end('POST operation not supported on /:studentId/personal_info');
})
.put(verifyStudent,  (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /:studentId/personal_info');
})
.delete(verifyStudent, (req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /:studentId/personal_info');
});


studentRouter.route('/:test')
.get((req,res,next) => {

	var query = "select * from student as s join user as u on s.uid = u.id";
	var primise = queryHelper.Execute(query);	
	primise.then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
	    res.end(JSON.stringify(result));
	}).catch(function(result){
		console.log("ERROR : " + result);
		res.send(result);	
	});
})
.post(verifyStudent, (req, res, next) => {
   res.statusCode = 403;
    res.end('POST operation not supported on /:studentId/personal_info');
})
.put(verifyStudent,  (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /:studentId/personal_info');
})
.delete(verifyStudent, (req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /:studentId/personal_info');
});


module.exports = studentRouter;