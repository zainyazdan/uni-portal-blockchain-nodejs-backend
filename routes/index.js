var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {

  res.sendFile(__dirname+'/Home_Page.html');

});


module.exports = router;
