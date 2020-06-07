var mysql = require('mysql');





var connection = mysql.createConnection({
	//properties
	host: 'localhost',
    user: 'root',
    password: '',
    database: 'portaldb'
});




// var connection = mysql.createConnection({
// 	//properties
// 	host: 'u3r5w4ayhxzdrw87.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
//     user: 'n4pavnb3gzarryri',
//     password: 'cykg7qt9izbu50ob',
//     database: 'gvqo6gf79qtvgv62'
// });


// var connection = mysql.createConnection({
// 	host     : 'us-cdbr-east-06.cleardb.net',
// 	user     : 'b77bf3d69101eb',
// 	password : 'ce0375b8',
// 	database : 'heroku_bce77c5f82e9275',
// 	ConnectionLimit: 10
//   });

 

connection.connect(function(error){
	if(error){
		console.log("ERROR in connection to the database");
		console.log(error);
	}
	else{
		console.log("Connected To The Database\n");
	}
});

module.exports = connection;