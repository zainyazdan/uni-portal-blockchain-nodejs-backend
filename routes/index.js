var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {

  res.sendFile(__dirname+'/Home_Page.html');
  return;
  console.log("AAYA");
});


module.exports = router;
