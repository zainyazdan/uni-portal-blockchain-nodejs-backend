const express = require('express');
const bodyParser = require('body-parser');
const passwordHash = require('../passwordHash');

var db = require('../db');
var mysql = require('mysql');
var queryHelper = require('../query');

const studentRouter = express.Router();
studentRouter.use(bodyParser.json());


const { verifyStudent } = require("../authentication/auth")
const { log } = require('debug');

const { sign } = require("jsonwebtoken");
const { secretKey_Student } = require("../config");
const { tokenExpireTime } = require("../config");



// #done
studentRouter.route('/:admin_Id/login')
.get(verifyStudent, (req,res,next) => {

	console.log("Request : ",req );
	res.statusCode = 200;
	res.setHeader('Content-Type', 'application/json');   
	return  res.end(JSON.stringify({status:true, message: "Ho gea student!!" }))
})
.post((req, res, next) => {
	
	var query = "select u.password, s.reg_no, u.name,u.username from user as u join student as s on u.id=s.uid where u.username = ?";
	var params = [req.body.username, req.body.password];
	
	var primise = queryHelper.Execute(query, params);	
	var data = {
		message: "",
		token : "",
		semester: "",
		reg_no : ""
	};
	
	var tokenSigningData = {};
	var SaltResponse;

	primise.then(function(results){

		if(results.length == 0)
		{
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');   
		    res.end(JSON.stringify({status:false, message: "Invalid Usename or Password" }))
		}


		// console.log("Password : " + results[0].password);

		tokenSigningData.user = 'student';
		tokenSigningData.name = results[0].name;
		tokenSigningData.username = results[0].username;


		data.reg_no = results[0].reg_no;
		
		return passwordHash.ComparePasswords(results[0].password, req.body.password);
	})
	.then( (results) =>{

		SaltResponse = results;

		if(results == false)
		{
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');   
		    res.end(JSON.stringify({status:false, message: "Invalid Usename or Password" }))
		}

		var query2 = "select name from semester where status = 'current'";
		return queryHelper.Execute(query2);
	})
	.then(function(results){
		
		if(SaltResponse == true)
		{

			if(results.length == 0)
			{
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');   
				res.end(JSON.stringify({status:false, message: "Current semester not found" }))
			}
			

			const jsontoken = sign(tokenSigningData , secretKey_Student ,{expiresIn: tokenExpireTime});
			data.token = jsontoken;
			

			data.message = "Successfully Logged-in";
			data.semester = results[0].name;

			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');   

			return  res.end(JSON.stringify({status:true, data }));
		}


	})
	.catch(function(result){
		console.log("ERROR : " + result);
	});
});




// // #done
// studentRouter.route('/:admin_Id/login')
// .get(verifyStudent, (req,res,next) => {

// 	console.log("Request : ",req );
// 	res.statusCode = 200;
// 	res.setHeader('Content-Type', 'application/json');   
// 	return  res.end(JSON.stringify({status:true, message: "Ho gea student!!" }))
// })
// .post((req, res, next) => {
	
// 	var query = "select s.reg_no, u.name,u.username from user as u join student as s on u.id=s.uid where u.username = ? and u.password = ?";
// 	var params = [req.body.username, req.body.password];
	
// 	var primise = queryHelper.Execute(query, params);	
// 	var data = {
// 		message: "",
// 		token : "",
// 		semester: "",
// 		reg_no : ""
// 	};


// 	primise.then(function(results){

// 		if(results.length == 0)
// 		{
// 			res.statusCode = 200;
// 			res.setHeader('Content-Type', 'application/json');   
// 		    res.end(JSON.stringify({status:false, message: "Invalid Usename or Password" }))
// 		}

// 		const jsontoken = sign({user: 'student', result :results }, secretKey_Student ,{expiresIn: tokenExpireTime});

// 		data.token = jsontoken;
// 		data.reg_no = results[0].reg_no;

// 		var query2 = "select name from semester where status = 'current'";
// 		return queryHelper.Execute(query2);	
// 	})
// 	.then(function(results){
		
// 		if(results.length == 0)
// 		{
// 			res.statusCode = 200;
// 			res.setHeader('Content-Type', 'application/json');   
// 		    res.end(JSON.stringify({status:false, message: "Current semester not found" }))
// 		}

// 		data.message = "Successfully Logged-in";
// 		data.semester = results[0].name;

// 		res.statusCode = 200;
// 		res.setHeader('Content-Type', 'application/json');   

// 		return  res.end(JSON.stringify({status:true, data }));
		


// 	})
// 	.catch(function(result){
// 		console.log("ERROR : " + result);
// 	});
// });


// #done
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



// #done
studentRouter.route('/:studentId/:semester/:course/:section/announcements')
.get(verifyStudent, (req,res,next) => {
	// {
	// 	"semester": "Fall16",
	// 	"course": "CCN",
	// 	"section": "A"
	// }
	var query = "select a.announcement, a.date, a.time from student as s join user as u on u.id=s.uid join enrolled_in as ei on ei.std_id=s.id join section as sec on sec.id=ei.sec_id join semester as sem on sem.id=sec.sid join course as c on c.id = sec.cid join announcements as a on a.sec_id=sec.id where s.reg_no = ? and sem.name=? and c.name = ? and sec.name = ?";
	var params = [ req.params.studentId ,req.params.semester ,req.params.course ,req.params.section];

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


// #done
studentRouter.route('/:studentId/:semester/:course/:section/course_outline')
.get(verifyStudent, (req,res,next) => {

	var query = "select mt.type_name as Type,co.weightage,co.no_of_selected from student as s join user as u on u.id=s.uid join enrolled_in as ei on ei.std_id=s.id join section as sec on sec.id=ei.sec_id join course_outline as co on co.sec_id=sec.id join marks_type as mt on mt.id=co.mt_id join semester as sem on sem.id=sec.sid join course as c on c.id = sec.cid where s.reg_no = ? and sem.name= ? and c.name = ? and sec.name = ? ";
	var params = [ req.params.studentId ,req.params.semester, req.params.course, req.params.section ];

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




// #done
studentRouter.route('/:studentId/:semester/courses')
.get( (req,res,next) => {

	var query = "select c.name as course,sec.name as section from student as s join user as u on u.id=s.uid join enrolled_in as ei on ei.std_id=s.id join section as sec on sec.id=ei.sec_id join semester as sem on sem.id=sec.sid join course as c on c.id = sec.cid where s.reg_no = ? and sem.name = ? ";
	var params = [ req.params.studentId ,req.params.semester];

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


// #done
studentRouter.route('/:studentId/:semester/:course/:section/gradebook')
.get(verifyStudent, (req,res,next) => {

	var query = "select mt.type_name,a.date,a.time, a.total_marks, ha.obtained_marks from student as std join has_assesments as ha on std.id = ha.std_id join assesments as a on a.id = ha.aid	join section as sec on sec.id = a.sec_id join course as c on c.id = sec.cid	join semester as sem on sem.id = sec.sid join user as u on u.id = std.uid join marks_type as mt on mt.id = a.mt_id join course_outline as co on co.mt_id = mt.id where sem.name = ?	and c.name = ? and sec.name = ? and std.reg_no = ? ORDER BY mt.type_name"; 
	
	var params = [ req.params.semester, req.params.course, req.params.section, req.params.studentId];

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



studentRouter.route('/:admin_Id/test2')
.get( (req,res,next) => {

		req.body.name = "ZAIN";

		console.log("req : ", req.body);
		
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    return  res.end(JSON.stringify({status:true, message: "Ho gea student!!" }))
})
.patch( (req, res, next) => {

	console.log("req : ", req.body);
	
	res.statusCode = 200;
	res.setHeader('Content-Type', 'application/json');   
	return  res.end(JSON.stringify({status:true, message: "Ho gea student!!" }))
})
.post((req, res, next) => {

	console.log("req : ", req.body);


	res.statusCode = 200;
	res.setHeader('Content-Type', 'application/json');   
	return  res.end(JSON.stringify({status:true, Lname: req.body.lastName, Fname :  req.body.firstName}))
});











module.exports = studentRouter;