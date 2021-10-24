// Update for Express 4.16+
// Starting with release 4.16.0, a new express.json() middleware is available.
var express = require('express');
var app = express();

app.use(express.json());

app.post('/', function(request, response){
  console.log(request.body);      // your JSON
   response.send(request.body);    // echo the result back
});

app.listen(3000);