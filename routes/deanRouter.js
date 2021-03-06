const express = require('express');
const bodyParser = require('body-parser');
var db = require('../db');
var mysql = require('mysql');
var queryHelper = require('../query');
const passwordHash = require('../passwordHash');

var blockchain = require("../Blockchain/blockchain");
var recordVerification = require("../Blockchain/recordVerification");


var sha256 = require('js-sha256');

const deanRouter = express.Router();
deanRouter.use(bodyParser.json());

const { sign } = require("jsonwebtoken")
const { verifyDean } = require("../authentication/auth")
const { secretKey_dean } = require("../config")
const { tokenExpireTime } = require("../config");
const { log } = require('debug');
const { json } = require('body-parser');



deanRouter.route('/:admin_Id/login')
.get(verifyDean, (req, res, next) => {

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    return  res.end(JSON.stringify({status:true, message: "Ho gea !!" }))
})
.post( (req, res, next) => {

	var query = "select u.password ,u.name,u.username from user as u join admin as a on u.id=a.uid where u.username = ? and designition = 'Dean'";
	var params = [req.body.username, req.body.password];
	
	var tokenSigningData = {};

	var primise = queryHelper.Execute(query, params);

	primise.then(function(results){

		// console.log("results : ", results);

		if(results.length == 0)
		{
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');   
			res.end(JSON.stringify({status:false, message: "Invalid Usename or Password" }));
			return;
		}
		// console.log("asd2");

		tokenSigningData.user = 'Dean';
		tokenSigningData.name = results[0].name;
		tokenSigningData.username = results[0].username;


		// console.log("asd3");
		
		return passwordHash.ComparePasswords(results[0].password, req.body.password);
	})
	.then((result)=>{

		console.log("result : ", result);
		
		if(result == false)
		{
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');   
		    res.end(JSON.stringify({status:false, message: "Current semester not found" }))
		}

		const jsontoken = sign(tokenSigningData , secretKey_dean ,{expiresIn: tokenExpireTime});


		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    return  res.end(JSON.stringify({status:true, message: "Successfully Logged-in",token : jsontoken }))
	})
	.catch(function(result){
		console.log("ERROR : " + result);
	});

});



// Disapprove assesment (completed)

deanRouter.route('/disapprove_assessment')
.get(verifyDean, (req, res, next) => {
	
	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/json');   
	res.end(JSON.stringify({ status: false, message: "GET operation not supported on ./dean/disapprove_assesment" }));
})
.post(verifyDean, (req, res, next) => {

	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/json');   
	res.end(JSON.stringify({ status: false, message: "GET operation not supported on ./dean/disapprove_assesment" }));

})
.put(verifyDean, (req, res, next) => {	
	
	var query1 = "select a.status, a.id from assesments as a join section as sec on sec.id = a.sec_id join course as c on c.id = sec.cid join semester as sem on sem.id = sec.sid join marks_type as mt on mt.id = a.mt_id	where sec.name = ? and c.name = ?  and sem.name = ?  and assesment_no = ? and mt.type_name = ? ";
	var params1 = [ req.body.section, req.body.course, req.body.semester, req.body.assesment_no,   req.body.marks_type ];
	var asses_id;

	var primise = queryHelper.Execute(query1, params1);	
	primise.then(function(result){

		if(result.length == 0)
		{
			res.setHeader('Content-Type', 'application/json');   
			res.end(JSON.stringify({ status: false, message: "Tsection/courser/semester/assesment_no/marks_type records not found" }));
			return;
		}

		if(result[0].status == "Not Approved")
		{
			res.setHeader('Content-Type', 'application/json');   
			res.end(JSON.stringify({ status: false, message: "This assessment's status is already 'Not Approved'" }));
			return;
		}

		asses_id = result[0].id;

		var query2 = "update assesments set status = 'Not Approved' where id = ?"; 
		var params2 = [ asses_id ];

		return queryHelper.Execute(query2, params2);
	})
	.then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
		res.end(JSON.stringify({ status: true, message: "Successfully Disapproved" }));
	})
	.catch(function(result){
		console.log("ERROR : " + result);
	});
})
.delete(verifyDean, (req, res, next) => {
	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/json');   
	res.end(JSON.stringify({ status: false, message: "DELETE operation not supported on ./dean/disapprove_assesment" }));
    
});


// to verify all assesments of a specific section

// # done integrated with new smart contracts
deanRouter.route('/:semester/:course_code/:section/verify_all_assessments/specific_section')
.get(verifyDean, (req, res, next) => 
{
	var query = "select a.id, mt.type_name, a.assesment_no, c.name as course from assesments as a join section as sec on sec.id = a.sec_id join course as c on c.id = sec.cid join semester as sem on sem.id = sec.sid join marks_type as mt on mt.id = a.mt_id	where sem.name = ? and c.code = ? and sec.name = ? and a.status = 'Approved'"; 
	var params = [ req.params.semester, req.params.course_code, req.params.section];

	var primise = queryHelper.Execute(query, params);
	primise.then(function(result){

		if(result.length == 0)
		{
			res.setHeader('Content-Type', 'application/json');   
			res.end(JSON.stringify({ status: false, message: "section/courser/semester/assesment_no/marks_type records not found" }));
			return;
		}
		
		return recordVerification.VerifyAllAssessments(req.params , result, "section");
	})
	.then((result)=>{
		if(result == "ok")
		{
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');   
			res.end(JSON.stringify({ status: true, message: "Data is not tampered"}));
		}
		else
		{	
			// console.log("Result : ", result);
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');   
			res.end(JSON.stringify({ status: false, message: "Data is tampered", data : result}));
		}
	})
	.catch(function(result){
		console.log("ERROR 22: " + result);
	});
})
.post(verifyDean, (req,res,next) => {
	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/json');   
	res.end(JSON.stringify({ status: false, message: "POST operation not supported on /:teacherId/verify_assesment" }));
})
.put(verifyDean,  (req,res,next) => {	
	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/json');   
	res.end(JSON.stringify({ status: false, message: "PUT operation not supported on /:teacherId/verify_assesment" }));
})
.delete(verifyDean, (req,res,next) => {
	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/json');   
	res.end(JSON.stringify({ status: false, message: "DELETE operation not supported on /:teacherId/verify_assesment" }));
    
});


// to verify all assesments of a specific semester


// # done integrated with new smart contracts

deanRouter.route('/:semester/verify_all_assessments/specific_semester')
.get(verifyDean, (req, res, next) => 
{
	var query = "select c.name as course, sec.name as section, a.id, mt.type_name, a.assesment_no from assesments as a join marks_type as mt on mt.id = a.mt_id join section as sec on sec.id = a.sec_id join semester as sem on sem.id = sec.sid	join course as c on c.id = sec.cid where a.status = 'Approved' and sem.name = ? "; 
	var params = [ req.params.semester];

	var primise = queryHelper.Execute(query, params);
	primise.then(function(result){

		if(result.length == 0)
		{
			res.setHeader('Content-Type', 'application/json');   
			res.end(JSON.stringify({ status: false, message: "section/courser/semester/assesment_no/marks_type records not found" }));
			return;
		}
		// console.log("result 112 : " , result);
		
		return recordVerification.VerifyAllAssessments(req.params, result, "semester");
	})
	.then((result)=>
	{
		if(result == "ok")
		{
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');   
			res.end(JSON.stringify({ status: true, message: "Data is not tampered"}));
		}
		else
		{	
			// console.log("Result : ", result);
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');   
			res.end(JSON.stringify({ status: false, message: "Data is tampered", data : result}));
		}
	})
	.catch(function(result){
		console.log("ERROR 22: " + result);
	});
})
.post(verifyDean, (req,res,next) => {
	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/json');   
	res.end(JSON.stringify({ status: false, message: "POST operation not supported on /:teacherId/verify_assesment" }));
})
.put(verifyDean,  (req,res,next) => {	
	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/json');   
	res.end(JSON.stringify({ status: false, message: "PUT operation not supported on /:teacherId/verify_assesment" }));
})
.delete(verifyDean, (req,res,next) => {
	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/json');   
	res.end(JSON.stringify({ status: false, message: "DELETE operation not supported on /:teacherId/verify_assesment" }));
});



// to verify all assesments of a specific course

// # done integrated with new smart contracts
deanRouter.route('/:semester/:course_code/verify_all_assessments/specific_course')
.get(verifyDean, (req, res, next) => 
{
	var query = "select c.name as course, sec.name as section, a.id, mt.type_name, a.assesment_no from assesments as a join marks_type as mt on mt.id = a.mt_id join section as sec on sec.id = a.sec_id join semester as sem on sem.id = sec.sid	join course as c on c.id = sec.cid where a.status = 'Approved' and sem.name = ? and c.code = ? "; 
	var params = [ req.params.semester, req.params.course_code ];

	var primise = queryHelper.Execute(query, params);
	primise.then(function(result){

		if(result.length == 0)
		{
			res.setHeader('Content-Type', 'application/json');   
			res.end(JSON.stringify({ status: false, message: "section/courser/semester/assesment_no/marks_type records not found" }));
			return;
		}
		// console.log("result 112 : " , result);
		
		return recordVerification.VerifyAllAssessments(req.params, result, "course");
	})
	.then((result)=>
	{
		if(result == "ok")
		{
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');   
			res.end(JSON.stringify({ status: true, message: "Data is not tampered"}));
		}
		else
		{	
			// console.log("Result : ", result);
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');   
			res.end(JSON.stringify({ status: false, message: "Data is tampered", data : result}));
		}
	})
	.catch(function(result){
		console.log("ERROR 22: " + result);
	});
})
.post(verifyDean, (req,res,next) => {
	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/json');   
	res.end(JSON.stringify({ status: false, message: "POST operation not supported on /:teacherId/verify_assesment" }));
})
.put(verifyDean,  (req,res,next) => {	
	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/json');   
	res.end(JSON.stringify({ status: false, message: "PUT operation not supported on /:teacherId/verify_assesment" }));
})
.delete(verifyDean, (req,res,next) => {
	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/json');   
	res.end(JSON.stringify({ status: false, message: "DELETE operation not supported on /:teacherId/verify_assesment" }));
});



deanRouter.route('/revert_assessment_marks')
.get(verifyDean, (req, res, next) => {
	// console.log("Req.params : ", req.params);
	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify({ status: false, message: "GET operation not supported on /revert_assessment_marks" }));	
})
.post(verifyDean, (req,res,next) => {

	// console.log("Req.params : ", req.params);
	
	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify({ status: false, message: "POST operation not supported on /revert_assessment_marks" }));	


})
.put(verifyDean, (req,res,next) => {	

	var query = "select a.id from assesments as a join section as sec on sec.id = a.sec_id join course as c on c.id = sec.cid join semester as sem on sem.id = sec.sid join marks_type as mt on mt.id = a.mt_id	where sem.name = ? and c.name = ? and sec.name = ? and assesment_no = ? and mt.type_name = ?  and a.status = 'Approved' "; 
	var params = [ req.body.semester, req.body.course, req.body.section, req.body.assesment_no,   req.body.marks_type ];
	var assessment_id;

	var primise = queryHelper.Execute(query, params);
	primise.then(function(result){

		if(result.length == 0)
		{
			res.setHeader('Content-Type', 'application/json');   
			res.end(JSON.stringify({ status: false, message: "section/courser/semester/assesment_no/marks_type records not found" }));
			return;
		}
		assessment_id = result[0].id;

		var Coursekey = req.body.semester+":"+req.body.course+":"+req.body.section;
		var Sectionkey = req.body.marks_type+":"+req.body.assesment_no;

		// console.log("Coursekey : " + Coursekey);
		// console.log("Sectionkey : " + Sectionkey);

		return recordVerification.VerifyAssesment(assessment_id, Coursekey, Sectionkey)
	})
	.then((result)=>{
		
		// console.log("Result AYA : " , result[0]);

		if(result == "ok")
		{
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');   
			res.end(JSON.stringify({ status: true, message: "Data is not tampered"}));
		}
		
		RevertMarks(assessment_id, result[0], res);
		
	})
	.catch(function(err){
		console.log("ERROR : " + err);
	});

})
.delete(verifyDean, (req,res,next) => {

	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/json');   
	res.end(JSON.stringify({ status: false, message: "DELETE operation not supported on /revert_assessment_marks" }));
    
});


async function RevertMarks(_asses_id, _data, res)
{
	// console.log("_asses_id : ", _asses_id);
	// console.log("_data : ", _data);
	// console.log("_data reg_no: ", _data.reg_no);

	var query = "update has_assesments set obtained_marks = ? where std_id = (select id from student where reg_no = ?) and aid = ? ";
	var promiseArray = [];

	for (let i = 0; i < _data.reg_no.length ; i++) 
	{	
		// console.log("Iteration: " + i);;
		
		var params = [_data.marks_before[i], _data.reg_no[i], _asses_id];
		promiseArray[i] = queryHelper.Execute(query, params);
	}

	Promise.all(promiseArray).then((result)=>{

		console.log("All Promises Completed");

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
		res.end(JSON.stringify({ status: true, message: "All marks reverted successfully"}));

	})
	.catch((err)=>{

		console.log("All Promises Error !!");

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
		res.end(JSON.stringify({ status: false, message: err}));
		
	});
}

//    ##################################################     //

deanRouter.route('/:semester/:course_code/:section/verify_grades/specific_section')
.get(verifyDean, (req, res, next) => 
{
	
	var query = "select sec.id, c.name as course from section as sec join course as c on c.id = sec.cid join semester as sem on sem.id = sec.sid where sec.status = 'closed' and sem.name = ? and c.code = ?	and sec.name = ? "; 
	var params = [ req.params.semester, req.params.course_code, req.params.section ];
	
	var primise = queryHelper.Execute(query, params);
	primise.then(function(result){

		if(result.length == 0)
		{
			res.setHeader('Content-Type', 'application/json');   
			res.end(JSON.stringify({ status: false, message: "section/courser/semester records not found" }));
			return;
		}
		// console.log("result 112 : " , result);
		
		var Coursekey = req.params.semester+":"+result[0].course+":"+req.params.section;
		
		return recordVerification.VerifyGrades(result[0].id, Coursekey, 'Grades');
		
	})
	.then((result) =>
	{
		if(result == "ok")
		{
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');   
			res.end(JSON.stringify({ status: true, message: "Grades data is not tampered"}));
		}
		else
		{	
			// console.log("Result : ", result);
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');   
			res.end(JSON.stringify({ status: false, message: "Grades data is tampered", data : result}));
		}
	})
	.catch(function(result){
		console.log("ERROR 22: " + result);
	});
})
.post(verifyDean, (req,res,next) => {
	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/json');   
	res.end(JSON.stringify({ status: false, message: "POST operation not supported on /:teacherId/verify_assesment" }));
})
.put(verifyDean,  (req,res,next) => {	
	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/json');   
	res.end(JSON.stringify({ status: false, message: "PUT operation not supported on /:teacherId/verify_assesment" }));
})
.delete(verifyDean, (req,res,next) => {
	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/json');   
	res.end(JSON.stringify({ status: false, message: "DELETE operation not supported on /:teacherId/verify_assesment" }));
});

// for a specific course

deanRouter.route('/:semester/:course_code/verify_grades/specific_course')
.get(verifyDean, (req, res, next) => 
{
	
	var query = "select sec.id, c.name as course, sec.name as section from section as sec join course as c on c.id = sec.cid join semester as sem on sem.id = sec.sid where sec.status = 'closed' and sem.name = ? and c.code = ?"; 
	var params = [ req.params.semester, req.params.course_code ];
	
	var primise = queryHelper.Execute(query, params);
	primise.then(function(result){

		if(result.length == 0)
		{
			res.setHeader('Content-Type', 'application/json');   
			res.end(JSON.stringify({ status: false, message: "section/courser/semester records not found" }));
			return;
		}
		// console.log("result 112 : " , result);
		
		// ades(req, _result, _type)

		return recordVerification.VerifyAllGrades(req.params, result, 'course');
		
	})
	.then((result) =>
	{
		if(result == "ok")
		{
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');   
			res.end(JSON.stringify({ status: true, message: "Grades data is not tampered"}));
		}
		else
		{	
			// console.log("Result : ", result);
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');   
			res.end(JSON.stringify({ status: false, message: "Grades data is tampered", data : result}));
		}
	})
	.catch(function(result){
		console.log("ERROR 22: " + result);
	});
})
.post(verifyDean, (req,res,next) => {
	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/json');   
	res.end(JSON.stringify({ status: false, message: "POST operation not supported on /:teacherId/verify_assesment" }));
})
.put(verifyDean,  (req,res,next) => {	
	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/json');   
	res.end(JSON.stringify({ status: false, message: "PUT operation not supported on /:teacherId/verify_assesment" }));
})
.delete(verifyDean, (req,res,next) => {
	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/json');   
	res.end(JSON.stringify({ status: false, message: "DELETE operation not supported on /:teacherId/verify_assesment" }));
});



// for a specific semester

deanRouter.route('/:semester/verify_grades/specific_semester')
.get(verifyDean, (req, res, next) => 
{
	
	var query = "select sec.id, c.name as course, sec.name as section from section as sec join course as c on c.id = sec.cid join semester as sem on sem.id = sec.sid where sec.status = 'closed' and sem.name = ?"; 
	var params = [ req.params.semester];
	
	var primise = queryHelper.Execute(query, params);
	primise.then(function(result){

		if(result.length == 0)
		{
			res.setHeader('Content-Type', 'application/json');   
			res.end(JSON.stringify({ status: false, message: "section/courser/semester records not found" }));
			return;
		}
		// console.log("result 112 : " , result);
		
		// ades(req, _result, _type)

		return recordVerification.VerifyAllGrades(req.params, result, 'semester');
		
	})
	.then((result) =>
	{
		if(result == "ok")
		{
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');   
			res.end(JSON.stringify({ status: true, message: "Grades data is not tampered"}));
		}
		else
		{	
			// console.log("Result : ", result);
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');   
			res.end(JSON.stringify({ status: false, message: "Grades data is tampered", data : result}));
		}
	})
	.catch(function(result){
		console.log("ERROR 22: " + result);
	});
})
.post(verifyDean, (req,res,next) => {
	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/json');   
	res.end(JSON.stringify({ status: false, message: "POST operation not supported on /:teacherId/verify_assesment" }));
})
.put(verifyDean,  (req,res,next) => {	
	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/json');   
	res.end(JSON.stringify({ status: false, message: "PUT operation not supported on /:teacherId/verify_assesment" }));
})
.delete(verifyDean, (req,res,next) => {
	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/json');   
	res.end(JSON.stringify({ status: false, message: "DELETE operation not supported on /:teacherId/verify_assesment" }));
});




// revert grades of a specific section

deanRouter.route('/revert_grades')
.get(verifyDean, (req, res, next) => 
{
	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/json');   
	res.end(JSON.stringify({ status: false, message: "GET operation not supported on /revert_grades" }));
})
.post(verifyDean, (req,res,next) => {

	var query = "select sec.id from section as sec join course as c on c.id = sec.cid join semester as sem on sem.id = sec.sid where sec.status = 'closed'	and sem.name = ? and c.name = ? and sec.name= ? "; 
	var params = [ req.body.semester, req.body.course, req.body.section ];
	
	var sec_id;


	var primise = queryHelper.Execute(query, params);
	primise.then(function(result){

		if(result.length == 0)
		{
			res.setHeader('Content-Type', 'application/json');   
			res.end(JSON.stringify({ status: false, message: "Grades record not found" }));
			return;
		}
		sec_id = result[0].id
		console.log("sec_id : " + sec_id);
		
		var Coursekey = req.body.semester+":"+req.body.course+":"+req.body.section;  // "Grades"
		console.log("Coursekey : " + Coursekey);

		return blockchain.getGradesRecords(Coursekey, "Grades");
	})
	.then((result) =>
	{
		console.log("result : ", result);

		var query = "update enrolled_in set grade = ? where std_id = (select id from student where reg_no = ? ) and sec_id = ? ";
		var promiseArray = [];

		console.log("result[1].grade : " + result.grade[1] );
		console.log("result[1].reg : " + result.reg_no[1] );
		


		for (let i = 0; i < result.reg_no.length ; i++) 
		{	
			//console.log("Chala : "+ i);
			var params = [ result.grade[i], result.reg_no[i] ,  sec_id ];	
			promiseArray[i] = queryHelper.Execute(query, params);
		}

		Promise.all(promiseArray).then((result)=>{
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');   
			res.end(JSON.stringify({ status: true, message: "Grades Successfully Reverted" }));
		})
		.catch((err)=>{
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');   
			res.end(JSON.stringify({ status: false, error: err }));
		});

	})
	.catch(function(result){
		console.log("ERROR 22: " + result);
	});

})
.put(verifyDean,  (req,res,next) => {	
	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/json');   
	res.end(JSON.stringify({ status: false, message: "PUT operation not supported on /revert_grades" }));
})
.delete(verifyDean, (req,res,next) => {
	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/json');   
	res.end(JSON.stringify({ status: false, message: "DELETE operation not supported on /revert_grades" }));
});














module.exports = deanRouter;