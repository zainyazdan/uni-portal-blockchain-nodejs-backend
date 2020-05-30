const express = require('express');
const bodyParser = require('body-parser');
var db = require('../db');
var mysql = require('mysql');
var queryHelper = require('../query');

var sha256 = require('js-sha256');


const teacherRouter = express.Router();
teacherRouter.use(bodyParser.json());


const { sign } = require("jsonwebtoken")
const { verifyTeacher } = require("../authentication/auth")
const { secretKey_Teacher } = require("../config")
const { tokenExpireTime } = require("../config")




teacherRouter.route('/:teacher_Id/login')
.get(verifyTeacher, (req,res,next) => {		// For testing pupposes

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    return  res.end(JSON.stringify({status:true, message: "Ho gea teacher!!" }))
})
.post((req, res, next) => {

	var query = "select u.name,u.username from user as u join teacher as t on u.id=t.uid where u.username = ?and u.password=?";
	var params = [req.body.username, req.body.password];
	

	var primise = queryHelper.Execute(query, params);	

	primise.then(function(results){

		if(results.length == 0)
		{
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');   
		    res.end(JSON.stringify({status:false, message: "Invalid Usename or Password" }))
		}

		const jsontoken = sign({user: 'teacher', result :results }, secretKey_Teacher ,{expiresIn: tokenExpireTime});

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    return  res.end(JSON.stringify({status:true, meassage: "Successfully Logged-in",token : jsontoken }))

	}).catch(function(result){
		console.log("ERROR : " + result);
	});
});












teacherRouter.route('/:teacherId/personal_info')
.get(verifyTeacher, (req,res,next) => {

	var query = "select * from teacher as t join user as u on t.uid = u.id where t.reg_no = ? ";
	var primise = queryHelper.Execute(query,req.params.teacherId);	
	primise.then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
	    res.end(JSON.stringify(result));
	}).catch(function(result){
		console.log("ERROR : " + result);
		res.send(result);	
	});

});




teacherRouter.route('/:teacherId/announcements')
.get(verifyTeacher, (req,res,next) => {

	var query = "select a.announcement, a.date, a.time from teacher as t join user as u on u.id=t.uid join teaches as ts on ts.tid=t.id join section as sec on sec.id=ts.sid join semester as sem on sem.id=sec.sid join course as c on c.id = sec.cid join announcements as a on a.sec_id=sec.id where t.reg_no = ? and sem.name=? and c.name = ? and sec.name = ?";
	var params = [ req.params.teacherId ,req.body.semester ,req.body.course ,req.body.section];
	var sec_id;

	var primise = queryHelper.Execute(query,params);	
	primise.then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    res.end(JSON.stringify(result));

	}).catch(function(result){
		console.log("ERROR : " + result);
	});

})
.post(verifyTeacher, (req,res,next) => {

	var query1 = "select sec.id from teacher as t join user as u on u.id=t.uid join teaches as ts on ts.tid=t.id join section as sec on sec.id=ts.sid join semester as sem on sem.id=sec.sid join course as c on c.id = sec.cid where t.reg_no = ? and sem.name=? and c.name = ? and sec.name = ?";
	var params1 = [ req.params.teacherId ,req.body.semester ,req.body.course ,req.body.section ];
	var sec_id;

	var primise = queryHelper.Execute(query1,params1);	
	primise.then(function(result){

		if(result.length == 0)
		{
	    	res.end(JSON.stringify({ error: "Section's record not found" }));
		}
	    //res.end(JSON.stringify(result));

	    var sec_id = result[0].id;

		var query2 = "insert into announcements(announcement, date, time,sec_id)values(?,?,?,?) ";       
		var params2 = [ req.body.announcement ,req.body.date ,req.body.time , sec_id];

	    return queryHelper.Execute(query2, params2);	
	}).then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    res.end(JSON.stringify({ status: "Successfully Inserted" }));

	}).catch(function(result){
		console.log("ERROR : " + result);
	});

})
.put(verifyTeacher, (req,res,next) => {

	res.statusCode = 403;
    res.end('PUT operation not supported on /announcements');
})
.delete(verifyTeacher, (req,res,next) => {

	res.statusCode = 403;
    res.end('Delete operation not supported on /announcements');
});


teacherRouter.route('/:teacherId/courses')
.get(verifyTeacher, (req,res,next) => {

	var query = "select c.name as course,sec.name as section from teacher as t join user as u on u.id=t.uid join teaches as ts on ts.tid=t.id join section as sec on sec.id=ts.sid join semester as sem on sem.id=sec.sid join course as c on c.id = sec.cid where t.reg_no = ? and sem.name= ?;";
	var params = [ req.params.teacherId ,req.body.semester];

	var primise = queryHelper.Execute(query,params);	
	primise.then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    res.end(JSON.stringify(result));

	}).catch(function(result){
		console.log("ERROR : " + result);
	});
})
.post(verifyTeacher, (req,res,next) => {

	res.statusCode = 403;
    res.end('POST operation not supported on /courses');

})
.put(verifyTeacher, (req,res,next) => {

	res.statusCode = 403;
    res.end('PUT operation not supported on /courses');
})
.delete(verifyTeacher, (req,res,next) => {

	res.statusCode = 403;
    res.end('Delete operation not supported on /courses');
});



teacherRouter.route('/:teacherId/course_outline')
.get(verifyTeacher, (req,res,next) => {

	var query = "select mt.type_name as Type,co.weightage,co.no_of_selected from teacher as t join user as u on u.id=t.uid join teaches as ts on ts.tid=t.id join section as sec on sec.id=ts.sid join course_outline as co on co.sec_id=sec.id join marks_type as mt on mt.id=co.mt_id join semester as sem on sem.id=sec.sid join course as c on c.id = sec.cid where t.reg_no = ? and sem.name = ? and c.name = ? and sec.name = ?";
	var params = [ req.params.teacherId ,req.body.semester, req.body.course, req.body.section ];


	var primise = queryHelper.Execute(query,params);	
	primise.then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    res.end(JSON.stringify(result));

	}).catch(function(result){
		console.log("ERROR : " + result);
	});
})
.post(verifyTeacher, (req,res,next) => {

	var sec_id;
	var mt_id;
	
	var query1 = "select id from marks_type where type_name=?";
	var params1= [req.body.marks_type];
 
	var primise = queryHelper.Execute(query1,params1);	
	primise.then(function(result){
		if(result.length == 0)
		{
	    	res.end(JSON.stringify({ error: "marks_type not found" }))
		}
	    mt_id = result[0].id;

		var query2 = "select sec.id from teacher as t join user as u on u.id=t.uid join teaches as ts on ts.tid=t.id join section as sec on sec.id=ts.sid join semester as sem on sem.id=sec.sid join course as c on c.id = sec.cid where t.reg_no = ? and sem.name=? and c.name = ? and sec.name = ?";                 
		var params2 = [ req.params.teacherId ,req.body.semester, req.body.course, req.body.section ];

	    //res.end(JSON.stringify(result));

	    return queryHelper.Execute(query2, params2);	
	}).then(function(result){

		if(result.length == 0)
		{
	    	res.end(JSON.stringify({ error: "sec_id not found" }))
		}
	    console.log("sec_id : "+result[0].id);

	    sec_id = result[0].id;
	
	    //res.end(JSON.stringify(result));

	    var query3 = "insert into course_outline(weightage,no_of_selected, mt_id, sec_id) values(?,?,?,?)";
	    
	
	    if(req.body.no_of_selected)   	
		{
			var params3 = [req.body.weightage, req.body.no_of_selected, mt_id, sec_id ];
	   	 	return queryHelper.Execute(query3,params3);	
		}
		else{
			var params3 = [req.body.weightage, 0, mt_id, sec_id ];
	   	 	return queryHelper.Execute(query3,params3);	
		}

	}).then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    res.end(JSON.stringify({ status: "Successfully Inserted" }))

	}).catch(function(result){
		console.log("ERROR : " + result);
	});

})
.put(verifyTeacher, (req,res,next) => {

	var sec_id;
	var mt_id;
	
	var query1 = "select id from marks_type where type_name=?";
	var params1= [req.body.marks_type];
 
	var primise = queryHelper.Execute(query1,params1);	
	primise.then(function(result){
		if(result.length == 0)
		{
	    	res.end(JSON.stringify({ error: "marks_type not found" }))
		}
	    mt_id = result[0].id;

		var query2 = "select sec.id from teacher as t join user as u on u.id=t.uid join teaches as ts on ts.tid=t.id join section as sec on sec.id=ts.sid join semester as sem on sem.id=sec.sid join course as c on c.id = sec.cid where t.reg_no = ? and sem.name=? and c.name = ? and sec.name = ?";                 
		var params2 = [ req.params.teacherId ,req.body.semester, req.body.course, req.body.section ];

	    //res.end(JSON.stringify(result));

	    return queryHelper.Execute(query2, params2);	
	}).then(function(result){

		if(result.length == 0)
		{
	    	res.end(JSON.stringify({ error: "sec_id not found" }))
		}
	    console.log("sec_id : "+result[0].id);

	    sec_id = result[0].id;
	
	    //res.end(JSON.stringify(result));

	    var query3 = "update course_outline set weightage = ? ,no_of_selected = ? where mt_id = ? and sec_id = ? ";
		var params3 = [req.body.weightage, req.body.no_of_selected, mt_id, sec_id];
	    
	    return queryHelper.Execute(query3,params3);	

	}).then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    res.end(JSON.stringify({ status: "Successfully Updated" }))

	}).catch(function(result){
		console.log("ERROR : " + result);
	});
	
})
.delete(verifyTeacher, (req,res,next) => {

	res.statusCode = 403;
    res.end('Delete operation not supported on /course_outline');
});








// teacherRouter.route('/:teacherId/marks/studentssad ')
// .get(verifyTeacher, (req,res,next) => {

// 	var query = "";
// 	var params = [ req.params.teacherId ,req.body.semester, req.body.course, req.body.section ];


// 	var primise = queryHelper.Execute(query,params);	
// 	primise.then(function(result){

// 		res.statusCode = 200;
// 		res.setHeader('Content-Type', 'application/json');   
// 	    res.end(JSON.stringify(result));

// 	}).catch(function(result){
// 		console.log("ERROR : " + result);
// 	});
// })
// .post(verifyTeacher, (req,res,next) => {

// 	var std_id;
// 	var sec_id;
// 	var mt_id;
	
// 	var query1 = "select id from marks_type where type_name = ? ";
// 	var params1= [req.body.marks_type];
 
// 	var primise = queryHelper.Execute(query1,params1);	
// 	primise.then(function(result){
// 		if(result.length == 0)
// 		{
// 	    	res.end(JSON.stringify({ error: "marks_type not found" }))
// 		}
// 	    mt_id = result[0].id;

// 		var query2 = "select s.id as std_id,sec.id as sec_id from student as s join user as u on u.id=s.uid join enrolled_in as ei on ei.std_id=s.id join section as sec on sec.id=ei.sec_id join semester as sem on sem.id=sec.sid join course as c on c.id = sec.cid where s.reg_no = ? and sem.name= ? and c.name = ? and sec.name = ?";
// 		var params2 = [ req.body.reg_no ,req.body.semester, req.body.course, req.body.section ];

// 	    //res.end(JSON.stringify(result));

// 	    return queryHelper.Execute(query2, params2);	
// 	}).then(function(result){

// 		if(result.length == 0)
// 		{
// 	    	res.end(JSON.stringify({ error: "sec_id/std_id not found" }))
// 		}
// 	    console.log("sec_id : "+result[0].sec_id);

// 	    std_id = result[0].std_id;
// 	    sec_id = result[0].sec_id;

// 	    //res.end(JSON.stringify(result));

// 	    var query3 = "INSERT INTO marks(total_marks,obtained_marks,date, time, mt_id) VALUES (?,?,?,?,?)";
// 		var params3 = [req.body.total_marks, req.body.obtained_marks, req.body.date, req.body.time, mt_id];
	    
// 	   	return queryHelper.Execute(query3, params3);	
// 	}).then(function(result){

// 	    var mid = result.insertId;
// 	    //res.end(JSON.stringify(result));
	    

// 	    var query4 = "INSERT INTO has_marks(std_id, sec_id, mid) VALUES (?,?,?)";
// 		var params4 = [std_id, sec_id, mid];
	    
// 	   	return queryHelper.Execute(query4, params4);	
// 	}).then(function(result){

// 		res.statusCode = 200;
// 		res.setHeader('Content-Type', 'application/json');   
// 	    res.end(JSON.stringify({ status: "Successfully Inserted" }))

// 	}).catch(function(result){
// 		console.log("ERROR : " + result);
// 	});

// })
// .put(verifyTeacher, (req,res,next) => {	
	
// })
// .delete(verifyTeacher, (req,res,next) => {

// 	res.statusCode = 403;
//     res.end('Delete operation not supported on /course_outline');
// });



// upload marks of a specific student  (completed)

teacherRouter.route('/:teacherId/upload_marks/students/:student_id')
.get(verifyTeacher, (req,res,next) => {

	var query = "select a.status, std.reg_no, u.name, a.date, a.time, a.total_marks, ha.obtained_marks from student as std join has_assesments as ha on std.id = ha.std_id join assesments as a on a.id = ha.aid	join section as sec on sec.id = a.sec_id join course as c on c.id = sec.cid	join semester as sem on sem.id = sec.sid join user as u on u.id = std.uid join marks_type as mt on mt.id = a.mt_id	where sec.name = ? and c.name = ? and sem.name = ? and assesment_no = ? and mt.type_name = ? and std.reg_no = ?";
	var params = [ req.body.section, req.body.course, req.body.semester, req.body.assesment_no, req.body.marks_type , req.params.student_id];

	var primise = queryHelper.Execute(query,params);	
	primise.then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    res.end(JSON.stringify(result));

	}).catch(function(result){
		console.log("ERROR : " + result);
	});
})
.post(verifyTeacher, (req,res,next) => {
	res.statusCode = 403;
    res.end('POST operation not supported on /upload_marks/:student_id');
})
.put(verifyTeacher,  (req,res,next) => {	
	
	
	var d = new Date();
	var date = d.getDate()+"-"+(d.getMonth()+1)+"-"+d.getFullYear();
	var time = d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();

	var query1 = "select a.status, a.id from assesments as a join section as sec on sec.id = a.sec_id join course as c on c.id = sec.cid join semester as sem on sem.id = sec.sid join marks_type as mt on mt.id = a.mt_id	where sec.name = ? and c.name = ?  and sem.name = ?  and assesment_no = ? and mt.type_name = ? ";
	var params1 = [ req.body.section, req.body.course, req.body.semester, req.body.assesment_no,   req.body.marks_type ];

	var asses_id;

	var primise = queryHelper.Execute(query1, params1);	
	primise.then(function(result){

		if(result.length == 0)
		{
			res.send("section/courser/semester/assesment_no/marks_type records not found");
			return;
		}
		if(result[0].status == "Approved")
		{
			res.setHeader('Content-Type', 'application/json');   
			res.end(JSON.stringify({ status: false, message: "This assesment is already approved. you are not allowed to modefy it" }));
			return;
		}
		
		asses_id = result[0].id;

		var query2 = "update has_assesments	set obtained_marks = ?	where std_id = (select id from student where reg_no = ?) and aid = ?"; 
		var params2 = [ req.body.new_marks, req.params.student_id, asses_id ];

		return queryHelper.Execute(query2, params2);	

	}).then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
		res.end(JSON.stringify({ status: true, message: "Successfully Updated" }));
	})
	.catch(function(result){
		console.log("ERROR : " + result);
	});

})
.delete(verifyTeacher, (req,res,next) => {

	res.statusCode = 403;
    res.end('Delete operation not supported on /marks/:student_id');
});



// upload marks of all students  (completed)

teacherRouter.route('/:teacherId/upload_marks/students')
.get(verifyTeacher, (req, res, next) => 
{
	var query = "select a.status, std.reg_no, u.name, a.date, a.time, a.total_marks, ha.obtained_marks from student as std join has_assesments as ha on std.id = ha.std_id join assesments as a on a.id = ha.aid	join section as sec on sec.id = a.sec_id join course as c on c.id = sec.cid	join semester as sem on sem.id = sec.sid join user as u on u.id = std.uid join marks_type as mt on mt.id = a.mt_id where sec.name = ? and c.name = ? and sem.name = ? and assesment_no = ? and mt.type_name = ? "; 
	var params = [ req.body.section, req.body.course, req.body.semester, req.body.assesment_no,   req.body.marks_type ];

	var primise = queryHelper.Execute(query,params);	
	primise.then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    res.end(JSON.stringify(result));

	}).catch(function(result){
		console.log("ERROR : " + result);
	});
})
//.post(verifyTeacher, (req,res,next) => {
.post(verifyTeacher, (req, res, next) => {

	var d = new Date();
	var date = d.getDate()+"-"+(d.getMonth()+1)+"-"+d.getFullYear();
	var time = d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();

	//console.log("Date : " + date);
	//console.log("Time : " + time);

	if( (req.body.reg_no.length) != (req.body.obtained_marks.length) )
	{
		res.end("error : length of obtained marks and reg_no is not same !!");
		return;
	}

	var query1 = "insert into assesments (assesment_no,total_marks,date,time,mt_id,sec_id)	VALUES (?, ?, ? ,?, (select id from marks_type where type_name = ?) ,(select sec.id	from section as sec join course as c on c.id = sec.cid	join semester as sem on sem.id = sec.sid	where sec.name = ? and c.name = ? and sem.name = ?))";
	var params1 = [req.body.assesment_no, req.body.total_marks, date, time, req.body.marks_type, req.body.section, req.body.course, req.body.semester];
	var sec_id;
	var asses_id;
	
	var marks_type_id;

	var primise = queryHelper.Execute(query1, params1);	
	primise.then(function(result){

		//console.log("result length: "+result.length);
		if(result.length == 0)
		{
			res.send("wrong parameters. Result not found in database");
			return;
		}
		

		asses_id = result.insertId;
		//console.log("assesment id : " , asses_id );
		

		// to get Ids of reg_nos
		
		var query2 = "select s.id from student as s join user as u on u.id=s.uid where reg_no in (";
	
		//console.log("display query :\n\n");
		//console.log("reg_no : "+req.body.reg_no);

		var temp = "";
		for (let i = 0; i < req.body.reg_no.length; i++) 
		{
			if(i == req.body.reg_no.length-1)		// 
			{
				temp += "'"+req.body.reg_no[i]+"'";
				break;
			}
			temp += "'"+req.body.reg_no[i]+"',";
			//console.log("["+i+"]" + temp+"\n");
		}

		//console.log("Final temp = " + temp);

		query2 += temp;
		query2 += ")order by field(reg_no ," + temp+")";

		//console.log("Final query : " + query2);

		//res.end("Chal gea");
		//return;

		return queryHelper.Execute(query2);	
	})
	.then((reg_no)=>{
		
		//console.log("result:", result[0].id);
		if(reg_no.length == 0)
		{
			res.send("Student reg_no records not found");
			return;
		}

		var query3 = "INSERT INTO has_assesments (std_id, aid, obtained_marks) VALUES (? ,? ,?)";
		var promiseArray = [];

		for (let i = 0; i < req.body.obtained_marks.length ; i++) 
		{	
			//console.log("Chala : "+ i);
			var params3 = [ reg_no[i].id, asses_id, req.body.obtained_marks[i] ];			
			promiseArray[i] = queryHelper.Execute(query3, params3);
		}

		Promise.all(promiseArray).then((result)=>{
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');   
			res.end(JSON.stringify({ status: true, message: "Successfully Inserted" }));
		})
		.catch((err)=>{
			console.log("ERROR: " + err);
		});// promise.all catch()
	})
	.catch(function(err){
		console.log("ERROR marks type : " + err);
	});
})
// .put(verifyTeacher, (req,res,next) => {	
.put(verifyTeacher, (req, res, next ) => {	

	var d = new Date();
	var date = d.getDate()+"-"+(d.getMonth()+1)+"-"+d.getFullYear();
	var time = d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();

	var query1 = "select a.status, a.id from assesments as a join section as sec on sec.id = a.sec_id join course as c on c.id = sec.cid join semester as sem on sem.id = sec.sid join marks_type as mt on mt.id = a.mt_id	where sec.name = ? and c.name = ?  and sem.name = ?  and assesment_no = ? and mt.type_name = ? ";
	var params1 = [ req.body.section, req.body.course, req.body.semester, req.body.assesment_no,   req.body.marks_type ];

	var asses_id;

	var primise = queryHelper.Execute(query1, params1);	
	primise.then(function(result){

		if(result.length == 0)
		{
			res.send("section/courser/semester/assesment_no/marks_type records not found");
			return;
		}
		if(result[0].status != "Not Approved")
		{
			res.setHeader('Content-Type', 'application/json');   
			res.end(JSON.stringify({ status: false, message: "This assesment is already approved. you are not allowed to modefy it" }));
			return;
		}


		asses_id = result[0].id;

		var query2 = "update assesments	set total_marks = ?, date = ?, time = ? where id = ? "; 
		var params2 = [ req.body.total_marks, date, time, asses_id ];

		return queryHelper.Execute(query2, params2);	

	}).then(function(result){

		var query3 = "update has_assesments	set obtained_marks = ?	where std_id = (select id from student where reg_no = ?) and aid = ?"; 

		var promises = [];
		for (let i = 0; i < req.body.reg_no.length; i++) 
		{
			// console.log("i = " + i );
			var params3 = [req.body.new_marks[i], req.body.reg_no[i], asses_id ];

			promises[i] = queryHelper.Execute(query3, params3);		
		}

		Promise.all(promises).then((result)=>{
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');   
			res.end(JSON.stringify({ status: true, message: "Successfully Updated" }));
		})
		.catch(()=>{
			console.log("Error : " + err);
		});
	})
	.catch(function(result){
		console.log("ERROR : " + result);
	});
	
})
.delete(verifyTeacher, (req,res,next) => {
	res.statusCode = 403;
    res.end('Delete operation not supported');
});


// approve assesment (completed) and compute hash

teacherRouter.route('/:teacherId/approve_assesment')
.get( (req, res, next) => {


	var query1 = "select a.status from assesments as a join section as sec on sec.id = a.sec_id join course as c on c.id = sec.cid join semester as sem on sem.id = sec.sid join marks_type as mt on mt.id = a.mt_id	where sec.name = ? and c.name = ?  and sem.name = ?  and assesment_no = ? and mt.type_name = ? ";
	var params1 = [ req.body.section, req.body.course, req.body.semester, req.body.assesment_no,   req.body.marks_type ];

	var primise = queryHelper.Execute(query1, params1);	
	primise.then(function(result){

		if(result.length == 0)
		{
			res.setHeader('Content-Type', 'application/json');   
			res.end(JSON.stringify({ status: false, message: "section/courser/semester/assesment_no/marks_type records not found" }));
			return;
		}
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
		res.end(JSON.stringify({ status: true, message: "This assesment is "+ result[0].status}));

	})
	.catch(function(result){
		console.log("ERROR : " + result);
	});
})
.post(verifyTeacher, (req, res, next) => {
	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/json');   
	res.end(JSON.stringify({ status: false, message: "POST operation not supported on /:teacherId/approve_assesment" }));
})
.put(  (req, res, next) => {	
	
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

		if(result[0].status == "Approved")
		{
			res.setHeader('Content-Type', 'application/json');   
			res.end(JSON.stringify({ status: false, message: "This assesment is already approved" }));
			return;
		}

		asses_id = result[0].id;

		var query2 = "update assesments set status = 'Approved' where id = ?"; 
		var params2 = [ asses_id ];

		return queryHelper.Execute(query2, params2);
	})
	.then(function(result){

		var query3 = "select u.name, std.reg_no, ha.obtained_marks  from student as std join has_assesments as ha on std.id = ha.std_id join assesments as a on a.id = ha.aid	join section as sec on sec.id = a.sec_id join course as c on c.id = sec.cid	join semester as sem on sem.id = sec.sid join user as u on u.id = std.uid join marks_type as mt on mt.id = a.mt_id where sec.name = ? and c.name = ? and sem.name = ? and assesment_no = ? and mt.type_name = ? "; 
		var params3 = [ req.body.section, req.body.course, req.body.semester, req.body.assesment_no,   req.body.marks_type ];

		return queryHelper.Execute(query3, params3);
	})
	.then(function(result){

		var hash = sha256(JSON.stringify(result));
		
		var query4 = "update assesments set hash = ? where id = ?"; 
		var params4 = [ hash, asses_id ];

		return queryHelper.Execute(query4, params4);
	})

	.then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
		res.end(JSON.stringify({ status: true, message: "Successfully Approved and Hash stored" }));
	})
	.catch(function(result){
		console.log("ERROR : " + result);
	});

})
.delete(verifyTeacher, (req,res,next) => {
	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/json');   
	res.end(JSON.stringify({ status: false, message: "GET operation not supported on /:teacherId/approve_assesment" }));
});












// disapprove assesment (completed)

teacherRouter.route('/:teacherId/disapprove_assesment')
.get(verifyTeacher, (req, res, next) => {
	
	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/json');   
	res.end(JSON.stringify({ status: false, message: "GET operation not supported on /:teacherId/disapprove_assesment" }));
    
})
.post(verifyTeacher, (req,res,next) => {
	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/json');   
	res.end(JSON.stringify({ status: false, message: "POST operation not supported on /:teacherId/disapprove_assesment" }));
})
.put(  (req,res,next) => {	
	
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
			res.end(JSON.stringify({ status: false, message: "This assesment is already 'Not Approved'" }));
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
.delete(verifyTeacher, (req,res,next) => {
	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/json');   
	res.end(JSON.stringify({ status: false, message: "DELETE operation not supported on /:teacherId/disapprove_assesment" }));
    
});










module.exports = teacherRouter;