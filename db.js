var mysql = require('mysql');

var connection = mysql.createConnection({
	//properties
	host: 'localhost',
    user: 'root',
    password: '',
    database: 'portaldb'
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