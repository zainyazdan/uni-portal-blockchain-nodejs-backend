const express = require('express');
const bodyParser = require('body-parser');
var db = require('../db');
var mysql = require('mysql');
var queryHelper = require('../query');

const teacherRouter = express.Router();
teacherRouter.use(bodyParser.json());


teacherRouter.route('/:teacherId/personal_info')
.get((req,res,next) => {

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
.get((req,res,next) => {

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
.post((req,res,next) => {

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
.put((req,res,next) => {

	res.statusCode = 403;
    res.end('PUT operation not supported on /announcements');
})
.delete((req,res,next) => {

	res.statusCode = 403;
    res.end('Delete operation not supported on /announcements');
});


teacherRouter.route('/:teacherId/courses')
.get((req,res,next) => {

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



teacherRouter.route('/:teacherId/course_outline')
.get((req,res,next) => {

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
.post((req,res,next) => {

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
.put((req,res,next) => {

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
.delete((req,res,next) => {

	res.statusCode = 403;
    res.end('Delete operation not supported on /course_outline');
});








teacherRouter.route('/:teacherId/upload_marks')
.get((req,res,next) => {

	var query = "";
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
.post((req,res,next) => {

	var std_id;
	var sec_id;
	var mt_id;
	
	var query1 = "select id from marks_type where type_name = ? ";
	var params1= [req.body.marks_type];
 
	var primise = queryHelper.Execute(query1,params1);	
	primise.then(function(result){
		if(result.length == 0)
		{
	    	res.end(JSON.stringify({ error: "marks_type not found" }))
		}
	    mt_id = result[0].id;

		var query2 = "select s.id as std_id,sec.id as sec_id from student as s join user as u on u.id=s.uid join enrolled_in as ei on ei.std_id=s.id join section as sec on sec.id=ei.sec_id join semester as sem on sem.id=sec.sid join course as c on c.id = sec.cid where s.reg_no = ? and sem.name= ? and c.name = ? and sec.name = ?";
		var params2 = [ req.body.reg_no ,req.body.semester, req.body.course, req.body.section ];

	    //res.end(JSON.stringify(result));

	    return queryHelper.Execute(query2, params2);	
	}).then(function(result){

		if(result.length == 0)
		{
	    	res.end(JSON.stringify({ error: "sec_id/std_id not found" }))
		}
	    console.log("sec_id : "+result[0].sec_id);

	    std_id = result[0].std_id;
	    sec_id = result[0].sec_id;

	    //res.end(JSON.stringify(result));

	    var query3 = "INSERT INTO marks(total_marks,obtained_marks,date, time, mt_id) VALUES (?,?,?,?,?)";
		var params3 = [req.body.total_marks, req.body.obtained_marks, req.body.date, req.body.time, mt_id];
	    
	   	return queryHelper.Execute(query3, params3);	
	}).then(function(result){

	    var mid = result.insertId;
	    //res.end(JSON.stringify(result));
	    

	    var query4 = "INSERT INTO has_marks(std_id, sec_id, mid) VALUES (?,?,?)";
		var params4 = [std_id, sec_id, mid];
	    
	   	return queryHelper.Execute(query4, params4);	
	}).then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    res.end(JSON.stringify({ status: "Successfully Inserted" }))

	}).catch(function(result){
		console.log("ERROR : " + result);
	});

})
.put((req,res,next) => {

	
	
})
.delete((req,res,next) => {

	res.statusCode = 403;
    res.end('Delete operation not supported on /course_outline');
});








module.exports = teacherRouter;