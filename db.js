var mysql = require('mysql');


/*
var connection = mysql.createConnection({
	//properties
	host: 'localhost',
    user: 'root',
    password: '',
    database: 'portaldb'
});
*/


var connection = mysql.createConnection({
	//properties
	host: 'us-cdbr-east-06.cleardb.net',
    user: 'b77bf3d69101eb',
    password: 'ce0375b8',
    database: 'heroku_bce77c5f82e9275'
});




connection.connect(function(error){
	if(error){
		console.log("ERROR in connection to the database");
		console.log(error);
	}
	else{
		console.log("Connected To The Database");
	}
});

module.exports = connection;