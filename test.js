const express = require('express')
const http = require('http')
const path = require('path')
const fs = require('fs')

const app = express()


app.use(express.json()); // Update for Express 4.16+

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
app.post('/stopTimer/:id', function(request, response){
    var userid = request.params.id;
    console.log(request.body); // your JSON
    var newStudent = new Student(request.body);
    newStudent.save(function(error, data){
        if(error){
            console.log(error);
        }else{
          response.send('서버로부터의 메세지: Data Saved!')
          console.log('Data Saved!')
        }
    });
});

//2. 어떠한 사용자에 대한 GET : 통계 페이지를 위한 READ 그리고 클라언트에게 send 데이터....URL: /Statics/day?user_id=
app.get('/statics/:id',function(request, response){
    var userid = request.params.id;
    Student.find(function(error, students){
        console.log('--- Read all ---');
        if(error){
            console.log(error);
        }else{
            console.log(students);
            response.send(students);    // echo the result back
        }
    })
});

app.use('/',(req,res,next) => {
  res.send('hi ssl...ㅇㅓ 왔니...?')
})



http.createServer(app).listen(80)