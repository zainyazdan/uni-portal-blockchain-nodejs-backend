var bcrypt = require('bcrypt');
const { sign } = require("jsonwebtoken");

const { secretKey_Admin } = require("./config");
const { tokenExpireTime } = require("./config");

module.exports.ComparePasswords = async function(_dbPasswordHash, _reqPassword)
{
// 	console.log("_dbPassword : " + _dbPasswordHash);
	console.log("_reqPassword : " + _reqPassword);

	var compare = await bcrypt.compare(_reqPassword, _dbPasswordHash);
	console.log("compare : ", compare);
	
	return compare;
}


module.exports.ComputeSaltHash = async function(_password)
{
	console.log("orignalPassword : " + _password);

	var SaltHash = await bcrypt.hash(_password , 10);

	console.log("SaltHash : " + SaltHash);

	return SaltHash;
}

