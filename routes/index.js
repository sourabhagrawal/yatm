var http = require('http');
var request = require('request');
var jsdom = require("jsdom");

exports.index = function(req, res){
   res.render('index');
};