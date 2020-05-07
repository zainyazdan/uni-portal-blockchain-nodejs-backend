const express = require('express');
const bodyParser = require('body-parser');
var db = require('../db');
var mysql = require('mysql');
var queryHelper = require('../query');
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








teacherRouter.route('/:teacherId/marks/studentssad ')
.get(verifyTeacher, (req,res,next) => {

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
.post(verifyTeacher, (req,res,next) => {

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
.put(verifyTeacher, (req,res,next) => {	
	
})
.delete(verifyTeacher, (req,res,next) => {

	res.statusCode = 403;
    res.end('Delete operation not supported on /course_outline');
});



// of a specific student  (completed)

teacherRouter.route('/:teacherId/marks/students/:student_id')
.get(verifyTeacher, (req,res,next) => {

	var query = "select std.reg_no,m.assesment_no, m.total_marks, m.obtained_marks,m.date, m.time from section as sec join semester as sem on sem.id=sec.sid join course as c on c.id = sec.cid join has_marks as hm on sec.id = hm.sec_id join student as std on std.id = hm.std_id join marks as m on m.id = hm.mid join marks_type as mt on mt.Id=m.mt_id where sem.name= ? and c.name = ? and sec.name = ? and reg_no = ? and assesment_no = ? and mt.type_name = ?";
	var params = [ req.body.semester, req.body.course, req.body.section, req.params.student_id, req.body.assesment_no, req.body.marks_type ];


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
	var query = "select sec.id from section as sec join semester as sem on sem.id=sec.sid join course as c on c.id = sec.cid where sem.name= ? and c.name = ? and sec.name = ?";
	var params = [req.body.semester, req.body.course, req.body.section];
	var sec_id;

	var primise = queryHelper.Execute(query, params);	
	primise.then(function(result){

		if(result.length == 0)
		{
			res.send("semester or course or section record not found");
			return;
		}

		sec_id = result[0].id;

		var query2 = "insert into marks(assesment_no, total_marks, obtained_marks, date, time, mt_id)values(?,?,?,?,?,(select id from marks_type where type_name = ?))";
		var params2 = [req.body.assesment_no, req.body.total_marks, req.body.obtained_marks, req.body.date, req.body.time, req.body.marks_type];			

		var primise = queryHelper.Execute(query2, params2);	

		primise.then(function(result){

			var marks_id = result.insertId;
			console.log("marks_id: "+marks_id);

			var query3 = "INSERT INTO has_marks(std_id, sec_id, mid) VALUES ((select id from student where reg_no  =?),?,?)";

			//console.log("req.body.reg_no [" + 0 + "] : " + req.body.reg_no[0])

			var params3 = [ req.params.student_id , sec_id, marks_id];

		    return queryHelper.Execute(query3, params3);

		}).then(function(result){
			
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');   
		    res.end(JSON.stringify({ status: "Successfully Inserted" }));
		})
		.catch(function(result){
			console.log("ERROR 1: " + result);
		});
	})
	.catch(function(result){
		console.log("ERROR 2: " + result);
	});

})
.put( verifyTeacher, (req,res,next) => {	
	
	var query = "select m.id from section as sec join semester as sem on sem.id=sec.sid join course as c on c.id = sec.cid join has_marks as hm on sec.id = hm.sec_id join student as std on std.id = hm.std_id join marks as m on m.id = hm.mid join marks_type as mt on mt.Id=m.mt_id where sem.name= ? and c.name = ? and sec.name = ? and reg_no = ? and assesment_no = ? and mt.type_name = ?";
	var params = [ req.body.semester, req.body.course, req.body.section, req.params.student_id, req.body.assesment_no, req.body.marks_type ];


	var primise = queryHelper.Execute(query,params);	
	primise.then(function(result){

		// console.log("result[0].id : " + result[0].id);
		var marks_id = result[0].id;

		var query2 = "update marks set obtained_marks = ?, date = ?, time = ? where id = ?";

		var params2 = [req.body.new_marks,req.body.new_date, req.body.new_time, marks_id];			
		return queryHelper.Execute(query2,params2);

	})
	.then(function(result){
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    res.end(JSON.stringify({ status:true, message:  "Successfully Updated" }));
	})
	.catch(function(result){
		console.log("ERROR : " + result);
	});

})
.delete(verifyTeacher, (req,res,next) => {

	res.statusCode = 403;
    res.end('Delete operation not supported on /marks/:student_id');
});



teacherRouter.route('/:teacherId/upload_marks/students')
.get(verifyTeacher, (req,res,next) => 
{
	var query = "select  s.reg_no, u.name, m.date, m.time, m.total_marks, m.obtained_marks	from student as s join has_marks as hm on s.id = hm.std_id	join section as sec on sec.id=hm.sec_id join user as u on s.uid=u.id	join course as c on c.id = sec.cid	join semester as sem on sem.id = sec.sid	join marks as m on m.id=hm.mid	join marks_type as mt on mt.id = m.mt_id	where sec.name = ? and c.name = ?	and sem.name = ? and assesment_no = ? 	and mt.type_name = ? "; 
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
.post(verifyTeacher, (req,res,next) => {

	if( (req.body.reg_no.length) != (req.body.obtained_marks.length) )
	{
		res.end("error : length of obtained marks and reg_no is not same !!");
		return;
	}

	var query1 = "select sec.id from section as sec join semester as sem on sem.id=sec.sid join course as c on c.id = sec.cid where sem.name= ? and c.name = ? and sec.name = ?";
	var params1 = [req.body.semester, req.body.course, req.body.section];
	var sec_id;
	var marks_type_id;

	var primise = queryHelper.Execute(query1, params1);	
	primise.then(function(result){

		//console.log("result length: "+result.length);
		if(result.length == 0)
		{
			res.send("semester or course or section record not found");
			return;
		}

		sec_id = result[0].id;
		console.log("section id : " + sec_id );
		

		var query2 = "select id from marks_type where type_name = ?";
		var params2 = [ req.body.marks_type ];


		return queryHelper.Execute(query2 ,params2);	
	})
	.then((result)=>{
		
		if(result.length == 0)
		{
			res.send("Marks Type record not found");
			return;
		}

		marks_type_id = result[0].id;

		console.log("Marks Type id : " + marks_type_id );

		//return;

		var query3 = "insert into marks(assesment_no, total_marks, obtained_marks, date, time, mt_id)values (?,?,?,?,?,?)";


		// example
		//var query3 = 'insert into test(sid, marks) values (?,?)';
		//var params = [ [1,2],[3,4],[5,6] ];
		//console.log("req.body.obtained_marks : " + req.body.obtained_marks.length );


		var promiseArray = [];

		for (let i = 0; i < req.body.obtained_marks.length ; i++) 
		{	
			//console.log("Chala : "+ i);
			var params3 = [req.body.assesment_no, req.body.total_marks, req.body.obtained_marks[i], req.body.date, req.body.time, marks_type_id];			

			promiseArray[i] = queryHelper.Execute(query3, params3);
		}



		var marks_id = [];
		Promise.all(promiseArray).then((result)=>{

			for (let i = 0; i < result.length; i++) {

				console.log("Promise.all 1 [ "+i+" ] : "+result[i].insertId);
				marks_id[i] = result[i].insertId;	
			}
			
			console.log("Array :\n");
			for (let i = 0; i < marks_id.length; i++) {
				console.log("marks_id: [ "+i+" ] = "+ marks_id[i]);
			}
			//res.end(JSON(result));


				var query4 = "insert into has_marks(std_id, sec_id, mid) values((select id from student where reg_no = ?) , ? ,? )";
				for (let i = 0; i < req.body. reg_no.length; i++) {
					
					var params4 = [req.body.reg_no[i], sec_id, marks_id[i]];			
					
					promiseArray[i] = queryHelper.Execute(query4, params4);		
				}

				Promise.all(promiseArray).then((result)=>{
	
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');   
					res.end(JSON.stringify({ status: true, message: "Successfully Inserted" }));
				})
				.catch((err)=>{
					console.log("ERROR: " + err);

				});
				

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
.put( (req,res,next) => {	

	var query = "select m.id from student as s join has_marks as hm on s.id = hm.std_id 	join section as sec on sec.id=hm.sec_id 	join user as u on s.uid=u.id 	join course as c on c.id = sec.cid 	join semester as sem on sem.id = sec.sid 	join marks as m on m.id=hm.mid 	join marks_type as mt on mt.id = m.mt_id where sec.name = ? and s.reg_no = ? and c.name = ? and sem.name = ? and assesment_no = ? and total_marks = ? and mt.type_name = ?";

	var promises = [];

	for (let i = 0; i < req.body.reg_no.length; i++) {
		// console.log("i = " + i );
		var params = [req.body.section, req.body.reg_no[i], req.body.course, req.body.semester, req.body.assesment_no, req.body.total_marks, req.body.marks_type ];

		promises[i] = queryHelper.Execute(query, params);		
	}

	var marks_id = [];

	Promise.all(promises).then((result)=>{

		for (let i = 0; i < result.length; i++) 
		{
			//console.log("id[ " + i + " ] : "+ result[i][0].id);
			marks_id[i] = result[i][0].id;
		}

		var query2 = "update marks set obtained_marks = ?, date = ?, time = ? where id = ?";
		var promises2 = [];

		for (let i = 0; i < marks_id.length; i++) {

			var params2 = [ req.body.new_marks[i], req.body.new_date, req.body.new_time ,marks_id[i]];
			
			promises2[i] = queryHelper.Execute(query2, params2);	
		}
		
		Promise.all(promises2).then(()=>{
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');   
			res.end(JSON.stringify({ status: true, message: "Successfully Updated" }));
		})
		.catch(()=>{
			console.log("Error : " + err);
		});
	})
	.catch((err)=>{
		console.log("Error 11 : " + err);
	})
	
})
.delete(verifyTeacher, (req,res,next) => {
	res.statusCode = 403;
    res.end('Delete operation not supported');
});






module.exports = teacherRouter;