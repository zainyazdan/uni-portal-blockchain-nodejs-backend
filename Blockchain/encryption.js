var crypto = require('crypto');
var algorithm = 'aes256';
var key = 'password';

module.exports.EncryptData = function(text)
{
    var cipher = crypto.createCipher(algorithm, key);  
    var encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');

    // console.log("orignal : " + text);
    // console.log("encrypted : " + encrypted);
    // console.log("decrypted : " + decrypted);
    return encrypted;
}


module.exports.DecryptData = function (encrypted)
{
    var decipher = crypto.createDecipher(algorithm, key);
    var decrypted = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
    
    return decrypted;
}