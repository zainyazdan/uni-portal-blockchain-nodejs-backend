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


