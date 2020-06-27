
const { verify } = require("jsonwebtoken")
const config = require("../config");
const { log } = require("debug");


// console.log("aya re");

module.exports = {
	verifyAdmin : (req, res ,next)=>{

		// console.log("auth ayaa !!");		
		//let token = req.body.token;

		let token = req.get("authorization")
		if(token)
		{
			//console.log("token : "+ token);

			if(token.includes("Bearer"))
				token = token.slice(7);

			verify(token, config.secretKey_Admin ,(err, decoded)=>{

				//const payload = verify(token, "mykey123");
				//console.log("payload : "+payload.username)

				if(err)
				{
					res.statusCode = 401;
					res.json({success: false,
					message: "Invalid token !!"})
				}
				else
				{
					next();
				}
				//console.log("payload : "+decoded);

			});
		}
		else{
			res.statusCode = 401;
			res.json({success: false, 
				message: "Access Denied! Un-Authorized user"})
		}
	}

	,
	verifyStudent : (req, res ,next)=>{

		//console.log("rawHeaders : " , req.rawHeaders);
		//console.log("auth ayaa !!");		

		
		//let token = req.body.token;

		let token = req.get("authorization")
		if(token)
		{
			//console.log("token 12 : "+ token);

			if(token.includes("Bearer"))
				token = token.slice(7);


			//console.log("After Slice: "+ token);

			verify(token, config.secretKey_Student ,(err, decoded)=>{

				//const payload = verify(token, "mykey123");
				//console.log("payload : "+payload.username)

				if(err)
				{
					res.statusCode = 401;
					res.json({success: false, 
					message: "Invalid token !!"})
				}
				else
				{
					next();
				}
				//console.log("payload : "+decoded);
			});
		}
		else{
			console.log("Wapis");
			
			res.statusCode = 401;
			res.json({success: false, 
				message: "Access Denied! Un-Authorized user"})
		}
	}	
	,

	verifyTeacher : (req, res ,next)=>{

		// console.log("auth ayaa !!");		
		//let token = req.body.token;

		let token = req.get("authorization")
		if(token)
		{
			//console.log("token : "+ token);

			if(token.includes("Bearer"))
				token = token.slice(7);

			verify(token, config.secretKey_Teacher ,(err, decoded)=>{

				if(err)
				{
					res.statusCode = 401;
					res.json({success: false, 
					message: "Invalid token !!"})
				}
				else
				{
					next();
				}
				//console.log("payload : "+decoded);
			});
		}
		else{
			res.statusCode = 401;
			res.json({success: false, 
				message: "Access Denied! Un-Authorized user"})
		}
	}
	,

	verifyDean : (req, res ,next)=>{

		// console.log("auth ayaa !!");		
		//let token = req.body.token;

		let token = req.get("authorization")
		if(token)
		{
			//console.log("token : "+ token);
			token = token.slice(7);

			verify(token, config.secretKey_dean ,(err, decoded)=>{

				if(err)
				{
					res.statusCode = 401;
					res.json({success: false, 
					message: "Invalid token !!"})
				}
				else
				{
					next();
				}
				//console.log("payload : "+decoded);
			});
		}
		else{
			res.statusCode = 401;
			res.json({success: false, 
				message: "Access Denied! Un-Authorized user"})
		}
	}		
}
