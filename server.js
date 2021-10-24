var express = require('express');
var app = express();

app.use(express.json()); // Update for Express 4.16+
app.listen(8080,function(){
    console.log('listening on 8080')
});

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/testDB');
var db = mongoose.connection;
db.on('error', function(){
    console.log('Connection Failed!');
});
db.once('open', function() {
    console.log('Connected!');
});
var student = mongoose.Schema({
    name : 'string',
    address : 'string',
    age : 'number'
});
var Student = mongoose.model('Schema', student);
//1. 어떠한 사용자에 대한 POST : 타이머 스탑할 때마다 CREATE......URL: /stopTimer 

app.post('/stopTimer', function(request, response){
    console.log(request.body);      // your JSON
    var newStudent = new Student(request.body);
    newStudent.save(function(error, data){
        if(error){
            console.log(error);
        }else{
            console.log('Data Saved!')
        }
    });
    response.send(request.body);    // echo the result back

  });

//2. 어떠한 사용자에 대한 GET : 통계 페이지를 위한 READ....URL: /Statics/day?user_id=
app.get('/',function(req,res){
    res.sendFile(__dirname + '/index.html');
});

//3. 어떠한 사용자에 대한 GET : 통계 페이지를 위한 READ
//URL: /Statics/month?user_id=
