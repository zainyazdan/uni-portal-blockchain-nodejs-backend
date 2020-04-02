var db = require('./db');


module.exports.Execute = async (query,params) => 
{
	 return await new Promise((resolve, reject) => 
	 {
		 db.query(query,params, (err, result, fields) => 
		 {
		      if (err) 
		      	reject(err); 
		      else
		      	resolve(result);
		  })
	  });
};


module.exports.Execute2 = async (promise ,query,params, i) => 
{
	//console.log("promise resolved aya");
	promise = await new Promise((resolve, reject) => 
	 {
		 db.query(query,params, (err, result, fields) => 
		 {
		      if (err) 
		      	reject(err); 
		      else
				  {
					  console.log("promise resolved: "+i );
					  resolve(result);
				  }

		  })
	  });
};

