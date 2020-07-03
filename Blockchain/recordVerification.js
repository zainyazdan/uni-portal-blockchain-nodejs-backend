

var queryHelper = require('../query');
var sha256 = require('js-sha256');
var blockchain = require("./Blockchain");
const { log } = require('debug');




// function to verify All assessments of specific ids (from database)

async function VerifyAllAssessments(req, _result, _type)
{
	var CourseKeysArray = [];
	var SectionKeysArray = [];
	var IdsArray = [];
	console.log("req.params : ",req );

	console.log("Query result : ", _result );
	
    if(_type == "section")
    {
        for (let i = 0; i < _result.length; i++) 
        {
            // console.log("Result[" + i + "] : ",_result[i]);
            // var key = req.body.semester+":"+req.body.course+":"+req.body.section+":"+_result[i].type_name+"#"+_result[i].assesment_no; 
			// KeysArray[i] = key;

			CourseKeysArray[i] = req.semester+":"+req.course+":"+req.section;
			SectionKeysArray[i] = _result[i].type_name+":"+_result[i].assesment_no; 

            IdsArray[i] = _result[i].id;
			console.log("Coursekey ["+i+"] : " + CourseKeysArray[i]);
			console.log("Sectionkey ["+i+"] : " + SectionKeysArray[i]);
	
        }
    }
    else if(_type == "semester")
    {
        for (let i = 0; i < _result.length; i++) 
        {
            // console.log("Result[" + i + "] : ",_result[i]);
            // var key = req.body.semester+":"+_result[i].course+":"+_result[i].section+":"+_result[i].type_name+"#"+_result[i].assesment_no; 
			// KeysArray[i] = key;

			CourseKeysArray[i] = req.semester+":"+_result[i].course+":"+_result[i].section;
			SectionKeysArray[i] = _result[i].type_name+":"+_result[i].assesment_no; 

            IdsArray[i] = _result[i].id;
            // console.log("\nkey "+i+" : "+KeysArray[i] + " , id : " + IdsArray[i]);    
        }  
    }
    else if(_type == "course")
    {
        for (let i = 0; i < _result.length; i++) 
        {
            // console.log("Result[" + i + "] : ",_result[i]);
            // var key = req.body.semester+":"+req.body.course+":"+_result[i].section+":"+_result[i].type_name+"#"+_result[i].assesment_no; 
			// KeysArray[i] = key;
			
			CourseKeysArray[i] = req.semester+":"+req.course+":"+_result[i].section;
			SectionKeysArray[i] = _result[i].type_name+":"+_result[i].assesment_no;

            IdsArray[i] = _result[i].id;
            // console.log("\nkey "+i+" : "+KeysArray[i] + " , id : " + IdsArray[i]);    
        }  
    }
	
	// console.log("IdsArray[0] : "+ IdsArray[0]);
	// console.log("KeysArray[0] : "+ KeysArray[0]);

	// console.log("id : " + _id);
	// console.log("\n\n_keys : " + _keys);

	// return "ok ok";
	// VerifyAssesment([result[0].id], key)
	// console.log("asdasd : ", _result[0].type_name);
	// console.log("asdasd : ", _result[2].type_name);
	

	//
	var Results = [];
	for (let i = 0; i < IdsArray.length; i++) {
		//console.log("result1 "+i +" : "+_id[i] + " | " + _keys[i]);
		var tempResult = await VerifyAssesment( [IdsArray[i]] , CourseKeysArray[i], SectionKeysArray[i]);

		if(tempResult != "ok")
		{
			console.log("tempResult : ", tempResult);
			
			tempResult[0].marks_type = _result[i].type_name;
			tempResult[0].assessment_no = _result[i].assesment_no;;

            if(_result[i].course)
                tempResult[0].course = _result[i].course;
            if(_result[i].section)
                tempResult[0].section = _result[i].section;

			Results.push(tempResult);
		}
		// console.log("result  " + i + " : " , tempResult);	
	}


	//var res = VerifyAssesment()
	if(Results.length == 0)
		return "ok";
	else
		return Results;
}

exports.VerifyAllAssessments = VerifyAllAssessments;


// function to verify assessment of specific id (from database)
async function VerifyAssesment(_id, _Coursekey, _Sectionkey)
{
	// console.log("id: " +_ids + "   , key : "+key );

	var fincalResult = [];

	//for (let i = 0; i < _ids.length; i++) {
	
	
	var query = "select std.reg_no, ha.obtained_marks, a.total_marks from student as std join has_assesments as ha on std.id = ha.std_id join assesments as a on a.id = ha.aid where a.id = ? order by std.reg_no"; 
	var db_result = await queryHelper.Execute(query, _id);

	// console.log("Database result : ", JSON.stringify(db_result));
	
	let local_data = {
		reg_no:[],
		marks:[], 
		total_marks : 0
	};

	local_data.reg_no = db_result.map(x => x.reg_no);
	local_data.marks = db_result.map(x => x.obtained_marks);
	local_data.total_marks = db_result[0].total_marks;

	var local_hash = await sha256(JSON.stringify(db_result));
	

	var blockchain_Hash = await blockchain.getHash(_Coursekey, _Sectionkey);

	// console.log("(VerifyAssesment) local_Hash: ", local_hash);
	// console.log("(VerifyAssesment) blockchain_Hash : ", blockchain_Hash);
	

	if(local_hash == blockchain_Hash)
	{
		return "ok";
	}
	
	var blockchain_MarksRecords = await blockchain.getMarksRecords(_Coursekey, _Sectionkey);
	var chech_data = await compareRecords(local_data, blockchain_MarksRecords);
	fincalResult.push(chech_data);

	
	// console.log("(VerifyAssesment) local_data : ", local_data);
	// console.log("(VerifyAssesment) blockchain_data : ", blockchain_MarksRecords);

	// console.log("fincalResult.length:  "+ fincalResult.length);
	// console.log("fincalResult:  ", fincalResult);
	
	if(fincalResult.length == 0)
	{
		return "ok";
	}
	else
	{
		return fincalResult;
	}
}
exports.VerifyAssesment = VerifyAssesment;



// function to compare blockchain and MYSQl database records
async function compareRecords(_local, _blockchain)
{
	// console.log("_local : ", _local);
	// console.log("_blockchain : ", _blockchain);
	

	let result = {
		reg_no:[],
		marks_before:[],
		marks_now:[]
	};
	// _blockchain :  {
	// 	hash: '1f4cd34284006392e0de6e2b7ee199597be0086e9dc45283ce8b319b6c0f18db',
	// 	records: {
	// 	  reg_no: [ 'L1F16BSCS0157', 'L1F16BSCS0145', 'L1F16BSCS0151' ],
	// 	  marks: [ 15, 10, 11 ]
	// 	}
	//   }


	// _local :  {
	// 	reg_no: [ 'L1F16BSCS0157', 'L1F16BSCS0145', 'L1F16BSCS0151' ],
	// 	marks: [ 5, 10, 11 ]
	//   }

	if(_local.total_marks != _blockchain.total_marks)
	{
		result.total_marks_before = _blockchain.total_marks;
		result.total_marks_after = _local.total_marks;
	}
	

	for (let i = 0; i < _local.reg_no.length; i++) 
	{
		// console.log("old = " + _blockchain.records.marks[i] + " , new : "+_local.marks[i]);
		
		if(_local.marks[i] != _blockchain.marks[i])
		{
			// console.log("Store (push)");
			
			result.reg_no.push(_local.reg_no[i]);
			result.marks_before.push(_blockchain.marks[i]);
			result.marks_now.push(_local.marks[i]);
		}	
	}
	
	return result;
}



// #########################################






// function to verify All assessments of specific ids (from database)

async function VerifyAllGrades(req, _result, _type)
{
	var CourseKeysArray = [];
	var SectionKeysArray = [];
	var IdsArray = [];

	console.log("req.params : ",req );

	console.log("Query result : ", _result );
	
	if(_type == "course")
    {
        for (let i = 0; i < _result.length; i++) 
        {
            // console.log("Result[" + i + "] : ",_result[i]);
            // var key = req.body.semester+":"+_result[i].course+":"+_result[i].section+":"+_result[i].type_name+"#"+_result[i].assesment_no; 
			// KeysArray[i] = key;

			CourseKeysArray[i] = req.semester+":"+_result[i].course+":"+_result[i].section;
			SectionKeysArray[i] = "Grades"; 
			// console.log("CourseKeysArray : " + CourseKeysArray);
			

            IdsArray[i] = _result[i].id;
            // console.log("\nkey "+i+" : "+KeysArray[i] + " , id : " + IdsArray[i]);    
        }  
    }
    else if(_type == "semester")
    {
        for (let i = 0; i < _result.length; i++) 
        {
            // console.log("Result[" + i + "] : ",_result[i]);
            // var key = req.body.semester+":"+req.body.course+":"+_result[i].section+":"+_result[i].type_name+"#"+_result[i].assesment_no; 
			// KeysArray[i] = key;
			
			CourseKeysArray[i] = req.semester+":"+_result[i].course+":"+_result[i].section;
			SectionKeysArray[i] = "Grades"; 
			// console.log("CourseKeysArray : " + CourseKeysArray);


            IdsArray[i] = _result[i].id;
            // console.log("\nkey "+i+" : "+KeysArray[i] + " , id : " + IdsArray[i]);    
        }  
	}
	
	


	//
	var Results = [];
	for (let i = 0; i < IdsArray.length; i++) {
		//console.log("result1 "+i +" : "+_id[i] + " | " + _keys[i]);
		var tempResult = await VerifyGrades( IdsArray[i] , CourseKeysArray[i], SectionKeysArray[i]);

		if(tempResult != "ok")
		{
			// console.log("tempResult : ", tempResult);
			
			tempResult[0].marks_type = _result[i].type_name;
			tempResult[0].assessment_no = _result[i].assesment_no;;


			if(_type == "course")
			{
                tempResult[0].section = _result[i].section;
			}
			else if(_type == "semester")
			{
				tempResult[0].section = _result[i].section;
                tempResult[0].course = _result[i].course;
			}		  
				
			Results.push(tempResult);
		}
		// console.log("result  " + i + " : " , tempResult);	
	}


	//var res = VerifyAssesment()
	if(Results.length == 0)
		return "ok";
	else
		return Results;
}

exports.VerifyAllGrades = VerifyAllGrades;




// function to verify grades of specific section id (from database)
async function VerifyGrades(_id , _Coursekey, _Sectionkey)
{
	// console.log("id : " +_id);
	// console.log("_Coursekey : " +_Coursekey);
	// console.log("_Sectionkey : " +_Sectionkey);


	var fincalResult = [];

	//for (let i = 0; i < _ids.length; i++) {

	var query = "select std.reg_no , ei.grade from student as std join enrolled_in as ei on std.id = ei . std_id join section as sec on sec.id = ei.sec_id join course as c on c.id = sec.cid join semester as sem on sem.id = sec.sid where ei.grade is not NULL and sec.status = 'closed' and sec.id = ? order by std.reg_no";
	var db_result = await queryHelper.Execute(query, _id);

	// console.log("Database result : ", JSON.stringify(db_result));


	var local_hash = await sha256(JSON.stringify(db_result)) ;
	
	var blockchain_Hash = await blockchain.getGradesHash(_Coursekey, _Sectionkey);

	// console.log("(VerifyGrades) local_Hash: ", local_hash);
	// console.log("(VerifyGrades) blockchain_Hash : ", blockchain_Hash);
	
	if(local_hash == blockchain_Hash)
	{
		return "ok";
	}

	let local_data = {
		reg_no:[],
		grade:[]
	};

	local_data.reg_no = db_result.map(x => x.reg_no);
	local_data.grade = db_result.map(x => x.grade);
	
	// console.log("local_data : ", local_data);
		
	var blockchain_GradesRecords = await blockchain.getGradesRecords(_Coursekey, _Sectionkey);

	// console.log("blockchain_GradesRecords : ", blockchain_GradesRecords);


	var chech_data = await compareGradesRecords(local_data, blockchain_GradesRecords);
	
	fincalResult.push(chech_data);

	
	// console.log("(VerifyAssesment) local_data : ", local_data);
	// console.log("(VerifyAssesment) blockchain_data : ", blockchain_MarksRecords);

	// console.log("fincalResult.length:  "+ fincalResult.length);
	// console.log("fincalResult:  ", fincalResult);
	
	if(fincalResult.length == 0)
	{
		return "ok";
	}
	else
	{
		return fincalResult;
	}
}
exports.VerifyGrades = VerifyGrades;




// function to compare blockchain and MYSQl database records
async function compareGradesRecords(_local, _blockchain)
{
	// console.log("_local : ", _local);
	// console.log("_blockchain : ", _blockchain);
	

	let result = {
		reg_no:[],
		grade_before:[],
		grade_now:[]
	};
	
	for (let i = 0; i < _local.reg_no.length; i++) 
	{
		// console.log("old = " + _blockchain.records.marks[i] + " , new : "+_local.marks[i]);
		
		if(_local.grade[i] != _blockchain.grade[i])
		{
			// console.log("Store (push)");
			result.reg_no.push(_local.reg_no[i]);
			result.grade_before.push(_blockchain.grade[i]);
			result.grade_now.push(_local.grade[i]);
		}	
	}
	
	return result;
}
