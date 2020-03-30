const express = require('express');
const bodyParser = require('body-parser');
var db = require('../db');
var queryHelper = require('../query');
var mysql = require('mysql');
const adminRouter = express.Router();
adminRouter.use(bodyParser.json());


const { sign } = require("jsonwebtoken");
const { verifyAdmin } = require("../authentication/auth");
const { secretKey_Admin } = require("../config");
const { tokenExpireTime } = require("../config");



adminRouter.route('/:admin_Id/login')
.get(verifyAdmin, (req,res,next) => {


		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    return  res.end(JSON.stringify({status:true, message: "Ho gea !!" }))
})
.post( (req, res, next) => {

	
	var query = "select u.name,u.username from user as u join admin as a on u.id=a.uid where u.username = ? and u.password=?";
	var params = [req.body.username, req.body.password];
	
	var primise = queryHelper.Execute(query, params);	

	primise.then(function(results){

		if(results.length == 0)
		{
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');   
		    res.end(JSON.stringify({status:false, message: "Invalid Usename or Password" }))
		}

		const jsontoken = sign({user: 'admin', result :results }, secretKey_Admin ,{expiresIn: tokenExpireTime});

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    return  res.end(JSON.stringify({status:true, message: "Successfully Logged-in",token : jsontoken }))

	}).catch(function(result){
		console.log("ERROR : " + result);
	});
});






//adminRouter.use(bodyParser.urlencoded({ extended: true }));
/*var params = 2;
	var primise = query.Execute("select * from student as s join user as u on u.id=s.uid",params);	
	primise.then(function(result){
		//res.send(result);
		console.log("First Result : "+result[0].Name);
		return query.Execute("select * from student as s",params);	
	}).then(function(result){
		
		console.log("\n\n\nSecond Result : "+result[0].reg_no);
		res.send(result);
		//return query.Execute("select * from student",params);
	}).
	catch(function(result){
		console.log("ERROR : "+result);
	});*/



// 3.	admin / {admin_Id} / students

adminRouter.route('/:admin_Id/students')
.get(verifyAdmin, (req,res,next) => {

	var query = "select * from student as s join user as u on u.id=s.uid";
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
.post(verifyAdmin, (req, res, next) => {
	var query1 = "insert into user(name, cnic, dob, phone_no, address, father_name, email) values(?,?,?,?,?,?,?)";
	var params1 = [req.body.name, req.body.cnic, req.body.dob, req.body.phone_no, req.body.address, req.body.father_name, req.body.email];

	var primise = queryHelper.Execute(query1,params1);	
	primise.then(function(result){
		var query2 = "insert into student(reg_no,uid) values(?,?)";
		var param2 = [req.body.reg_no,result.insertId];

		return queryHelper.Execute(query2,param2);	
	}).then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
	    res.end(JSON.stringify({ status: "Successfully Inserted" }));
	}).catch(function(result){
		console.log("ERROR : " + result);
		res.send(result);		
	});

})
.put(verifyAdmin,  (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on admin/admin_id/students');
})
.delete(verifyAdmin, (req, res, next) => {
    
	var query1 = "DELETE user,student FROM user INNER JOIN student ON student.uid = user.id";
	var primise = queryHelper.Execute(query1);	
	primise.then(function(result){
		var query2 = "ALTER TABLE student AUTO_INCREMENT = 1";
		return queryHelper.Execute(query2);	
	}).then(function(result){
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
	    res.end(JSON.stringify({ status: "Successfully Deleted" }));

	}).catch(function(result){
		console.log("ERROR : " + result);
		res.send(result);		
	});
});

// 4.	admin / {admin_Id} / students / {student_Id}

adminRouter.route('/:admin_Id/students/:student_Id')
.get(verifyAdmin, (req,res,next) => {

	var query = "select * from user as u join student as s on s.uid=u.id where s.reg_no = ? ";                 

	var primise = queryHelper.Execute(query,req.params.student_Id);	
	primise.then(function(result){


		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
	    res.end(JSON.stringify(result));

	}).catch(function(result){
		console.log("ERROR : " + result);
	});
})
.post(verifyAdmin, (req, res, next) => {
	res.statusCode = 403;
	res.end('post operation not supported on /courses');
})
.put(verifyAdmin,  (req, res, next) => { 
// update student set reg_no='l1f16bscs0157'where uid=6;

	var query1 = "update student set reg_no = ? where reg_no = ?"; 
	var params1 = [req.body.reg_no,req.params.student_Id];

	var primise = queryHelper.Execute(query1,params1);	
	primise.then(function(result){

		var queryToGetid = "select s.uid from user as u join student as s on u.id=s.uid where s.reg_no=?"; 
		
		return queryHelper.Execute(queryToGetid,req.body.reg_no);	
	}).then(function(result){
		var uid = result[0].uid;
		//console.log("user id : "+result[0].uid);
	
		var query2 = "update user set name =?,cnic =?,dob =?,phone_no=?,address=?,father_name=?,email=? where id = ?"; 
		var params2= [req.body.name,req.body.cnic,req.body.dob,req.body.phone_no,req.body.address,req.body.father_name,req.body.email,uid];
		//console.log("params2 : "+params2);
	
		return queryHelper.Execute(query2,params2);
	}).then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
	    res.end(JSON.stringify({ status: "Successfully Updated" }));

	}).catch(function(result){
		console.log("ERROR : " + result);
		res.send(result);		
	});
})
.delete(verifyAdmin, (req, res, next) => {
    
	var query1 = "DELETE user,student FROM user INNER JOIN student ON student.uid = user.id where student.reg_no=?";

	var primise = queryHelper.Execute(query1,req.params.student_Id);	
	primise.then(function(result){

	var query2 = "ALTER TABLE student AUTO_INCREMENT = 1";
		return queryHelper.Execute(query2);	
	}).then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
	    res.end(JSON.stringify({ status: "Successfully Deleted" }));

	}).catch(function(result){
		console.log("ERROR : " + result);
		res.send(result);		
	});
});

// 	 5.	admin / {admin_Id} / courses

adminRouter.route('/:admin_Id/courses')
.get(verifyAdmin, (req,res,next) => {

	var query = "select * from course";                 

	var primise = queryHelper.Execute(query);	
	primise.then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    res.end(JSON.stringify(result));

	}).catch(function(result){
		console.log("ERROR : " + result);
	});	
})
/*
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    res.end(JSON.stringify(result));
	    res.end(JSON.stringify({ status: "Successfully Deleted" }));
*/

.post(verifyAdmin, (req, res, next) => {

	var query = "insert into course(name, credithours,code) values (?,?,?)";                 
	var params = [req.body.name,req.body.credithours,req.body.code];
	//console.log(req.body.name);
	//console.log(params);

	var primise = queryHelper.Execute(query,params);	
	primise.then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    res.end(JSON.stringify({ status: "Successfully Inserted" }));

	}).catch(function(result){
		console.log("ERROR : " + result);
		res.send(result);		
	});
})
.put(verifyAdmin,  (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /courses');
})
.delete(verifyAdmin, (req, res, next) => {
    
	var query = "delete from course where id>0";                 

	var primise = queryHelper.Execute(query);	
	primise.then(function(result){

		var query2 = "ALTER TABLE course AUTO_INCREMENT = 1";
		return queryHelper.Execute(query2);	

	}).then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
	    res.end(JSON.stringify({ status: "Successfully Deleted" }));

	}).catch(function(result){
		console.log("ERROR : " + result);
		res.send(result);		
	});
});


// 	 5.	admin / {admin_Id} / courses

adminRouter.route('/:admin_Id/courses/:courseId')
.get(verifyAdmin, (req,res,next) => {

	var query = "select * from course where name = ?"; 
	var primise = queryHelper.Execute(query,req.params.courseId);	
	primise.then(function(result){

		if(result.length == 0)
		{
			res.statusCode = 404;
			res.setHeader('Content-Type', 'application/json');   
	   		res.end(JSON.stringify({ status: "No Record Found" }));	
		}
		else{
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');   
		    res.end(JSON.stringify(result));	
		}

	}).catch(function(result){
		console.log("ERROR : " + result);
	});
})
.post(verifyAdmin, (req, res, next) => {
  	res.statusCode = 403;
    res.end('PUT operation not supported on /courses');
})
.put(verifyAdmin,  (req, res, next) => {

    var query1 = "update course set name = ?,credithours = ?,code = ? where name = ?"; 
	var params1 = [req.body.name, req.body.credithours, req.body.code, req.params.courseId];  

	var primise = queryHelper.Execute(query1,params1);	
	primise.then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
	    res.end(JSON.stringify({ status: "Successfully Updated" }));

	}).catch(function(result){
		console.log("ERROR : " + result);
		res.send(result);	
	});
    
})
.delete(verifyAdmin, (req, res, next) => {
    
	var query = "delete from course where name = ?";                 

	var primise = queryHelper.Execute(query,req.params.courseId);	
	primise.then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
	    res.end(JSON.stringify({ status: "Successfully Deleted" }));

	}).catch(function(result){
		console.log("ERROR : " + result);
		res.send(result);		
	});

});


adminRouter.route('/:admin_Id/teachers')
.get(verifyAdmin, (req,res,next) => {

	var query = "select * from teacher as t join user as u on u.id=t.uid";                 
	var primise = queryHelper.Execute(query);	
	primise.then(function(result){

		res.statusCode = 200;
		res.send(result);

	}).catch(function(result){
		console.log("ERROR : " + result);
	});
})
.post(verifyAdmin, (req, res, next) => {

	var query1 = "insert into user(name, cnic, dob, phone_no, address, father_name, email) values(?,?,?,?,?,?,?)";
	var params1 = [req.body.name, req.body.cnic, req.body.dob, req.body.phone_no, req.body.address, req.body.father_name, req.body.email];

	var primise = queryHelper.Execute(query1,params1);	
	primise.then(function(result){
		var query2 = "insert into teacher(reg_no,qualification,uid) values(?,?,?)";
		var param2 = [req.body.reg_no,req.body.qualification,result.insertId];

		return queryHelper.Execute(query2,param2);	
	}).then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
	    res.end(JSON.stringify({ status: "Successfully Inserted" }));
	}).catch(function(result){
		console.log("ERROR : " + result);
		res.send(result);		
	});
 
})
.put(verifyAdmin,  (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /teachers');
})
.delete(verifyAdmin, (req, res, next) => {
    
	var query1 = "DELETE user,teacher FROM user INNER JOIN teacher ON teacher.uid = user.id";

	var primise = queryHelper.Execute(query1);	
	primise.then(function(result){

		var query2 = "ALTER TABLE teacher AUTO_INCREMENT = 1";
		return queryHelper.Execute(query2);

	}).then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
	    //res.end(JSON.stringify({ status: "Successfully Deleted" }));
	    res.end(JSON.stringify(result));

	}).catch(function(result){
		console.log("ERROR : " + result);
		res.send(result);		
	});
});

/*
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    res.end(JSON.stringify(result));
	    res.end(JSON.stringify({ status: "Successfully Deleted" }));
*/

adminRouter.route('/:admin_Id/teachers/:teacher_Id')
.get(verifyAdmin, (req,res,next) => {

	var query = "select * from teacher as t join user as u on u.id=t.uid where t.reg_no=?";                 

	var primise = queryHelper.Execute(query,req.params.teacher_Id);	
	primise.then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    res.end(JSON.stringify(result));

	}).catch(function(result){
		console.log("ERROR : " + result);
	});
})
.post(verifyAdmin, (req, res, next) => {

	res.statusCode = 403;
	res.end('post operation not supported on /teachers');
})
.put(verifyAdmin,  (req, res, next) => {

    var query1 = "update teacher set reg_no = ?,qualification = ? where reg_no = ?"; 
	var params1 = [req.body.reg_no, req.body.qualification, req.params.teacher_Id];

	var primise = queryHelper.Execute(query1,params1);	
	primise.then(function(result){

		var queryToGetid = "select t.uid from user as u join teacher as t on u.id=t.uid where t.reg_no=?"; 
		
		return queryHelper.Execute(queryToGetid,req.body.reg_no);	
	}).then(function(result){
		var uid = result[0].uid;
		//console.log("user id : "+result[0].uid);
	
		var query2 = "update user set name =?,cnic =?,dob =?,phone_no=?,address=?,father_name=?,email=? where id = ?"; 
		var params2= [req.body.name, req.body.cnic, req.body.dob, req.body.phone_no, req.body.address, req.body.father_name, req.body.email, uid];
		//console.log("params2 : "+params2);
		return queryHelper.Execute(query2,params2);
	}).then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
	    res.end(JSON.stringify({ status: "Successfully Updated" }));

	}).catch(function(result){
		console.log("ERROR : " + result);
		res.send(result);		
	});
})
.delete(verifyAdmin, (req, res, next) => {
    
	var query1 = "DELETE user,teacher FROM user INNER JOIN teacher ON teacher.uid = user.id where teacher.reg_no=?";

	var primise = queryHelper.Execute(query1,req.params.teacher_Id);	
	primise.then(function(result){

	var query2 = "ALTER TABLE student AUTO_INCREMENT = 1";
		return queryHelper.Execute(query2);	
	}).then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
	    res.end(JSON.stringify({ status: "Successfully Deleted" }));

	}).catch(function(result){
		console.log("ERROR : " + result);
		res.send(result);		
	});

});


adminRouter.route('/:admin_Id/assessment_type')
.get(verifyAdmin, (req,res,next) => {

	var query = "select * from marks_type";                 

	var primise = queryHelper.Execute(query);	
	primise.then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    res.end(JSON.stringify(result));

	}).catch(function(result){
		console.log("ERROR : " + result);
	});

})
.post(verifyAdmin, (req, res, next) => {

	var query = "insert into marks_type(type_name) values(?)";                 

	var primise = queryHelper.Execute(query,req.body.type_name);	
	primise.then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    res.end(JSON.stringify({ status: "Successfully Inserted" }))

	}).catch(function(result){
		console.log("ERROR : " + result);
	});
})
.put(verifyAdmin,  (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /sections');
})
.delete(verifyAdmin, (req, res, next) => {
    
	var query1 = "delete from marks_type where id > 0";                 

	var primise = queryHelper.Execute(query1);	
	primise.then(function(result){

	var query2 = "ALTER TABLE marks_type AUTO_INCREMENT = 1";
		return queryHelper.Execute(query2);	
	}).then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
	    res.end(JSON.stringify({ status: "Successfully Deleted" }));

	}).catch(function(result){
		console.log("ERROR : " + result);
		res.send(result);		
	});

});


adminRouter.route('/:admin_Id/assessment_type/:type_name')
.get(verifyAdmin, (req,res,next) => {

	var query = "select * from marks_type where type_name = ?";                 

	var primise = queryHelper.Execute(query,req.params.type_name);	
	primise.then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    res.end(JSON.stringify(result));

	}).catch(function(result){
		console.log("ERROR : " + result);
	});

})
.post(verifyAdmin, (req, res, next) => {

	res.statusCode = 403;
    res.end('PUT operation not supported on /sections');

})
.put(verifyAdmin,  (req, res, next) => {

    var query = "update marks_type set type_name = ? where type_name = ?"; 
	var params = [req.body.type_name, req.params.type_name];


	var primise = queryHelper.Execute(query,params);	
	primise.then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
	    res.end(JSON.stringify({ status: "Successfully Updated" }));

	}).catch(function(result){
		console.log("ERROR : " + result);
		res.send(result);		
	});

})
.delete(verifyAdmin, (req, res, next) => {
    
	var query = "delete from marks_type where type_name = ?";                 

	var primise = queryHelper.Execute(query,req.params.type_name);	
	primise.then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
	    res.end(JSON.stringify({ status: "Successfully Deleted" }));

	}).catch(function(result){
		console.log("ERROR : " + result);
		res.send(result);		
	});
});


adminRouter.route('/:admin_Id/semester')
.get(verifyAdmin, (req,res,next) => {

	var query = "select * from semester";                 

	var primise = queryHelper.Execute(query);	
	primise.then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    res.end(JSON.stringify(result));

	}).catch(function(result){
		console.log("ERROR : " + result);
	});

})
.post(verifyAdmin, (req, res, next) => {

	var query = "insert into semester(name) values(?)";                 

	var primise = queryHelper.Execute(query,req.body.name);	
	primise.then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    res.end(JSON.stringify({ status: "Successfully Inserted" }))

	}).catch(function(result){
		console.log("ERROR : " + result);
	});
})
.put(verifyAdmin,  (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /sections');
})
.delete(verifyAdmin, (req, res, next) => {
    
	var query1 = "delete from semester where id > 0";                 

	var primise = queryHelper.Execute(query1);	
	primise.then(function(result){

	var query2 = "ALTER TABLE semester AUTO_INCREMENT = 1";
		return queryHelper.Execute(query2);	
	}).then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
	    res.end(JSON.stringify({ status: "Successfully Deleted" }));

	}).catch(function(result){
		console.log("ERROR : " + result);
		res.send(result);		
	});

});



adminRouter.route('/:admin_Id/semester/:semesterId')
.get(verifyAdmin, (req,res,next) => {

	var query = "select * from semester where name = ?";                 

	var primise = queryHelper.Execute(query,req.params.semesterId);	
	primise.then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    res.end(JSON.stringify(result));

	}).catch(function(result){
		console.log("ERROR : " + result);
	});

})
.post(verifyAdmin, (req, res, next) => {

	res.statusCode = 403;
    res.end('PUT operation not supported on /sections');

})
.put(verifyAdmin,  (req, res, next) => {

    var query = "update semester set name = ? where name = ?"; 
	var params = [req.body.name, req.params.semesterId];


	var primise = queryHelper.Execute(query,params);	
	primise.then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
	    res.end(JSON.stringify({ status: "Successfully Updated" }));

	}).catch(function(result){
		console.log("ERROR : " + result);
		res.send(result);		
	});

})
.delete(verifyAdmin, (req, res, next) => {
    
	var query = "delete from semester where name = ?";                 

	var primise = queryHelper.Execute(query,req.params.semesterId);	
	primise.then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
	    res.end(JSON.stringify({ status: "Successfully Deleted" }));

	}).catch(function(result){
		console.log("ERROR : " + result);
		res.send(result);		
	});
});



adminRouter.route('/:admin_Id/sections')
.get(verifyAdmin, (req,res,next) => {

	var query = "select sec.name as section, sem.name as semester, c.name as course, c.credithours, c.code as courseCode from section as sec join semester as sem on sec.sid=sem.id join course as c on c.id = sec.cid";                 

	var primise = queryHelper.Execute(query);	
	primise.then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    res.end(JSON.stringify(result));

	}).catch(function(result){
		console.log("ERROR : " + result);
	});

})
.post(verifyAdmin, (req, res, next) => {
	var sid;
	var cid;

	var query1 = "select id from semester where name = ?";                 

	var primise = queryHelper.Execute(query1,req.body.semester);	
	primise.then(function(result){
		if(result.length == 0)
		{
	    	res.end(JSON.stringify({ error: "Semester name not found" }))
		}
		var query2 = "select id from course where name = ?";                 
	    //console.log("semester id   : "+result[0].id);
	    //console.log("semester id.. : "+result.id);
	    sid = result[0].id;
	   // console.log("semester id.. : "+sid);

	    return queryHelper.Execute(query2,req.body.course);	
	}).then(function(result){

		if(result.length == 0)
		{
	    	res.end(JSON.stringify({ error: "Course name not found" }))
		}
	    //console.log("course id   : "+result[0].id);
	    //console.log("course id.. : "+result.id);
	    cid = result[0].id;
	    //console.log("course id.. : "+cid);

		var query3 = "insert into section(name, sid, cid)values(?,?,?);";                 
		var params3 = [req.body.section, sid, cid];

	    return queryHelper.Execute(query3,params3);	
	}).then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    res.end(JSON.stringify({ status: "Successfully Inserted" }))

	}).catch(function(result){
		console.log("ERROR : " + result);
	});
})
.put(verifyAdmin,  (req, res, next) => {

    res.statusCode = 403;
    res.end('PUT operation not supported on /sections');

})
.delete(verifyAdmin, (req, res, next) => {
    
	var query1 = "delete from section where id>0";                 

	var primise = queryHelper.Execute(query1);	
	primise.then(function(result){

	var query2 = "ALTER TABLE section AUTO_INCREMENT = 1";
		return queryHelper.Execute(query2);	
	}).then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
	    res.end(JSON.stringify({ status: "Successfully Deleted" }));

	}).catch(function(result){
		console.log("ERROR : " + result);
		res.send(result);		
	});
});


adminRouter.route('/:admin_Id/sections/:sectionId')
.get(verifyAdmin, (req,res,next) => {

	var query = "select sec.name as section, sem.name as semester, c.name as course, c.credithours, c.code as courseCode from section as sec join semester as sem on sec.sid=sem.id join course as c on c.id = sec.cid where sec.name = ?";                 

	var primise = queryHelper.Execute(query,req.params.sectionId);	
	primise.then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    res.end(JSON.stringify(result));

	}).catch(function(result){
		console.log("ERROR : " + result);
	});
})
.post(verifyAdmin, (req, res, next) => {

	res.statusCode = 403;
    res.end('POST operation not supported on /sections/{sectionId}');
})
.put(verifyAdmin,  (req, res, next) => {

	var sid;
	var cid;
	var query1 = "select id from semester where name = ?";                 

	var primise = queryHelper.Execute(query1,req.body.semester);	
	primise.then(function(result){
		if(result.length == 0)
		{
	    	res.end(JSON.stringify({ error: "Semester name not found" }))
		}
		var query2 = "select id from course where name = ?";                 
	    //console.log("semester id   : "+result[0].id);
	    //console.log("semester id.. : "+result.id);
	    sid = result[0].id;
	    console.log("semester id.. : "+sid);

	    return queryHelper.Execute(query2, req.body.course);	
	}).then(function(result){

		if(result.length == 0)
		{
	    	res.end(JSON.stringify({ error: "Course name not found" }))
		}
	    //console.log("course id   : "+result[0].id);
	    //console.log("course id.. : "+result.id);
	    cid = result[0].id;
	    //console.log("course id.. : "+cid);

	    console.log("course id   : " + cid);
	    console.log("semester id : " + sid);
	    console.log("name        : " + req.params.sectionId);



	    var query3 = "update section set name = ? where sid = ? and cid = ? and name = ? " ;                 
		var params3 = [req.body.newSec, sid, cid, req.params.sectionId];

	    return queryHelper.Execute(query3,params3);	
	}).then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    res.end(JSON.stringify({ status: "Successfully Updated" }))

	}).catch(function(result){
		console.log("ERROR : " + result);
	});
})
.delete(verifyAdmin, (req, res, next) => {
    
	//var query = "DELETE section,course FROM section INNER JOIN course ON course.id = section.cid where course.name = ? and section.name = ?";                 
	var query = "DELETE FROM section where name = ?";                 
	//var params = [req.body.course, req.params.sectionId];

	var primise = queryHelper.Execute(query,req.params.sectionId);	
	primise.then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
	    res.end(JSON.stringify({ status: "Successfully Deleted" }));

	}).catch(function(result){
		console.log("ERROR : " + result);
		res.send(result);		
	});
});



adminRouter.route('/:admin_Id/assign_section/teachers')
.get(verifyAdmin, (req,res,next) => {

	var query = "select sem.name as semester,c.name as course,sec.name as section,u.name as Teachername,t.reg_no as reg_no from section as sec join course as c on sec.cid=c.id join semester as sem on sem.id=sec.sid join teaches as ts on ts.sid=sec.id join teacher as t on t.id=ts.tid join user as u on u.id = t.uid";
	var primise = queryHelper.Execute(query);	

	primise.then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    //res.end(JSON.stringify({ status: "Successfully Updated" }));
	    res.end(JSON.stringify(result));

	}).catch(function(result){
		console.log("ERROR : " + result);
	});
})
.post(verifyAdmin, (req, res, next) => {


	var sec_id;
	var tid;
	
	var query1 = "select sec.id from section as sec join course as c on sec.cid=c.id join semester as sem on sec.sid=sem.id where sem.name = ? and c.name = ?";
	var params1= [req.body.semester, req.body.course];
 
	var primise = queryHelper.Execute(query1,params1);	
	primise.then(function(result){
		if(result.length == 0)
		{
	    	res.end(JSON.stringify({ error: "Semester and course's section not found" }))
		}
		var query2 = "select t.id from teacher as t join user as u on t.uid=u.id where t.reg_no = ?";                 
	    //console.log("semester id   : "+result[0].id);
	    //console.log("semester id.. : "+result.id);

	    sec_id = result[0].id;

	    //res.end(JSON.stringify({ status: "Successfully Inserted 1" }))

	    //console.log("semester id.. : "+sid);

	    return queryHelper.Execute(query2, req.body.reg_no);	
	}).then(function(result){

		if(result.length == 0)
		{
	    	res.end(JSON.stringify({ error: "Teacher Reg_no not found" }))
		}
	    //console.log("course id   : "+result[0].id);
	    //console.log("course id.. : "+result.id);
	    tid = result[0].id;
	    //console.log("course id.. : "+cid);

	    console.log("section  id   : " + sec_id);
	    console.log("teacher  id : " + tid);

	    //res.end(JSON.stringify({ status: "Successfully Inserted 2" }))

	    var query3 = "insert into teaches(sid, tid)values(?,?)";
		var params3 = [sec_id, tid];

	    return queryHelper.Execute(query3,params3);	
	}).then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    res.end(JSON.stringify({ status: "Successfully Inserted" }))

	}).catch(function(result){
		console.log("ERROR : " + result);
	});
})
.put(verifyAdmin,  (req, res, next) => {

	res.statusCode = 403;
    res.end('PUT operation not supported on admin/{admin_Id}/AssignTeacherSection');
})
.delete(verifyAdmin, (req, res, next) => {
    var sec_id;
	var tid;
	
	var query1 = "select sec.id from section as sec join course as c on sec.cid=c.id join semester as sem on sec.sid=sem.id where sem.name = ? and c.name = ?";
	var params1= [req.body.semester, req.body.course];

	var primise = queryHelper.Execute(query1,params1);	
	primise.then(function(result){
		if(result.length == 0)
		{
	    	res.end(JSON.stringify({ error: "Semester and course's section not found" }))
		}
		var query2 = "select t.id from teacher as t join user as u on t.uid=u.id where t.reg_no = ?";                 
	    sec_id = result[0].id;

	    return queryHelper.Execute(query2, req.body.reg_no);	
	}).then(function(result){

		if(result.length == 0)
		{
	    	res.end(JSON.stringify({ error: "Teacher Reg_no not found" }))
		}
	    tid = result[0].id;

	    console.log("section  id   : " + sec_id);
	    console.log("teacher  id : " + tid);

	    var query3 = "delete from teaches where sid = ? and tid = ?";
		var params3 = [sec_id, tid];

	    return queryHelper.Execute(query3,params3);	
	}).then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    res.end(JSON.stringify({ status: "Successfully Deleted" }))

	}).catch(function(result){
		console.log("ERROR : " + result);
	});
});



adminRouter.route('/:admin_Id/assign_section/teachers/:teacher_Id')
.get(verifyAdmin, (req,res,next) => {

	var query = "select sem.name as semester,c.name as course,sec.name as section,u.name as Teachername,t.reg_no as reg_no from section as sec join course as c on sec.cid=c.id join semester as sem on sem.id=sec.sid join teaches as ts on ts.sid=sec.id join teacher as t on t.id=ts.tid join user as u on u.id = t.uid where t.reg_no=?";
	var primise = queryHelper.Execute(query, req.params.teacher_Id);	

	primise.then(function(result){
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    //res.end(JSON.stringify({ status: "Successfully Updated" }));
	    res.end(JSON.stringify(result));

	}).catch(function(result){
		console.log("ERROR : " + result);
	});

})
.post(verifyAdmin, (req, res, next) => {

	res.statusCode = 403;
    res.end('POST operation not supported on /assign_section/teacher/{teacher_Id}');

})
.put(verifyAdmin,  (req, res, next) => {

	res.statusCode = 403;
    res.end('PUT operation not supported on admin/{admin_Id}/AssignTeacherSection');
})
.delete(verifyAdmin, (req, res, next) => {

	var query1 = "select t.id from teacher as t join user as u on t.uid=u.id where t.reg_no = ?";                                
	var primise = queryHelper.Execute(query1,req.params.teacher_Id);	
	primise.then(function(result){
		if(result.length == 0)
		{
	    	res.end(JSON.stringify({ error: "Teacher record not found" }))
		}

		var tid = result[0].id;;
	    console.log("Teacher id : " + tid);

	    var query2 = "delete from teaches where tid = ?";

	    return queryHelper.Execute(query2,tid);	
	}).then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    res.end(JSON.stringify({ status: "Successfully Deleted" }))

	}).catch(function(result){
		console.log("ERROR : " + result);
	});

});



adminRouter.route('/:admin_Id/assign_section/students')
.get(verifyAdmin, (req,res,next) => {

	var query = "select s.reg_no, u.name as name,sem.name as semester,c.name as course,sec.name as section from section as sec join course as c on sec.cid=c.id join semester as sem on sem.id=sec.sid join enrolled_in as e on e.sec_id=sec.id join student as s on s.id=e.std_id join user as u on u.id=s.uid";
	var primise = queryHelper.Execute(query);	

	primise.then(function(result){
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    //res.end(JSON.stringify({ status: "Successfully Updated" }));
	    res.end(JSON.stringify(result));

	}).catch(function(result){
		console.log("ERROR : " + result);
	});
})
.post(verifyAdmin, (req, res, next) => {

	var sec_id;
	var std_id;
	
	var query1 = "select sec.id from section as sec join course as c on sec.cid=c.id join semester as sem on sec.sid=sem.id where sem.name = ? and c.name = ?";
	var params1= [req.body.semester, req.body.course];
 
	var primise = queryHelper.Execute(query1,params1);	
	primise.then(function(result){
		if(result.length == 0)
		{
	    	res.end(JSON.stringify({ error: "Semester and course's section not found" }))
		}
		var query2 = "select s.id from student as s join user as u on s.uid=u.id where s.reg_no = ?";                 
	    //console.log("semester id   : "+result[0].id);
	    //console.log("semester id.. : "+result.id);

	    sec_id = result[0].id;

	    //res.end(JSON.stringify({ status: "Successfully Inserted 1" }))

	    //console.log("semester id.. : "+sid);

	    return queryHelper.Execute(query2, req.body.reg_no);	
	}).then(function(result){

		if(result.length == 0)
		{
	    	res.end(JSON.stringify({ error: "Teacher Reg_no not found" }))
		}
	    //console.log("course id   : "+result[0].id);
	    //console.log("course id.. : "+result.id);
	    std_id = result[0].id;
	    //console.log("course id.. : "+cid);

	    console.log("section  id   : " + sec_id);
	    console.log("teacher  id : " + std_id);

	    //res.end(JSON.stringify({ status: "Successfully Inserted 2" }))

	    var query3 = "insert into enrolled_in(std_id,sec_id)values(?,?)";
		var params3 = [std_id, sec_id];

	    return queryHelper.Execute(query3,params3);	
	}).then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    res.end(JSON.stringify({ status: "Successfully Inserted" }))

	}).catch(function(result){
		console.log("ERROR : " + result);
	});
})
.put(verifyAdmin,  (req, res, next) => {

	res.statusCode = 403;
    res.end('PUT operation not supported on admin/{admin_Id}/assign_section/students');
})
.delete(verifyAdmin, (req, res, next) => {
    var sec_id;
	var std_id;
	
	var query1 = "select sec.id from section as sec join course as c on sec.cid=c.id join semester as sem on sec.sid=sem.id where sem.name = ? and c.name = ?";
	var params1= [req.body.semester, req.body.course];

	var primise = queryHelper.Execute(query1,params1);	
	primise.then(function(result){
		if(result.length == 0)
		{
	    	res.end(JSON.stringify({ error: "Semester and course's section not found" }))
		}
		var query2 = "select s.id from student as s join user as u on s.uid=u.id where s.reg_no = ?";                 
	    sec_id = result[0].id;

	    return queryHelper.Execute(query2, req.body.reg_no);	
	}).then(function(result){

		if(result.length == 0)
		{
	    	res.end(JSON.stringify({ error: "Student Reg_no not found" }))
		}
	    std_id = result[0].id;

	    console.log("section  id   : " + sec_id);
	    console.log("student  id : " + std_id);

	    var query3 = "delete from enrolled_in where std_id = ? and sec_id = ?";
		var params3 = [std_id, sec_id];

	    return queryHelper.Execute(query3,params3);	
	}).then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    res.end(JSON.stringify({ status: "Successfully Deleted" }))

	}).catch(function(result){
		console.log("ERROR : " + result);
	});
});




adminRouter.route('/:admin_Id/assign_section/students/:student_Id')
.get(verifyAdmin, (req,res,next) => {

	
	var query = "select s.reg_no, u.name as name,sem.name as semester,c.name as course,sec.name as section from section as sec join course as c on sec.cid=c.id join semester as sem on sem.id=sec.sid join enrolled_in as e on e.sec_id=sec.id join student as s on s.id=e.std_id join user as u on u.id=s.uid where s.reg_no=?";
	var primise = queryHelper.Execute(query, req.params.student_Id);	

	primise.then(function(result){
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    //res.end(JSON.stringify({ status: "Successfully Updated" }));
	    res.end(JSON.stringify(result));

	}).catch(function(result){
		console.log("ERROR : " + result);
	});

})
.post(verifyAdmin, (req, res, next) => {

	res.statusCode = 403;
    res.end('POST operation not supported on /assign_section/students/{student_Id}');

})
.put(verifyAdmin,  (req, res, next) => {

	res.statusCode = 403;
    res.end('PUT operation not supported on admin/{admin_Id}/AssignTeacherSection');
})
.delete(verifyAdmin, (req, res, next) => {

 
	var query1 = "select s.id from student as s join user as u on s.uid=u.id where s.reg_no = ?";                 
	var primise = queryHelper.Execute(query1,req.params.student_Id);	
	primise.then(function(result){
		if(result.length == 0)
		{
	    	res.end(JSON.stringify({ error: "Student record not found" }))
		}

	    if(result.length == 0)
		{
	    	res.end(JSON.stringify({ error: "Teacher Reg_no not found" }))
		}

		var std_id = result[0].id;;
	    console.log("Student id : " + std_id);

	    var query2 = "delete from enrolled_in where std_id = ?";

	    return queryHelper.Execute(query2,std_id);	
	}).then(function(result){

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');   
	    res.end(JSON.stringify({ status: "Successfully Deleted" }))

	}).catch(function(result){
		console.log("ERROR : " + result);
	});

});




module.exports = adminRouter;



////////////////////////////////////////////////////////////////////////////////////