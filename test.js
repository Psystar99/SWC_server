const express = require('express')
const http = require('http')
const path = require('path')
const fs = require('fs')

const app = express()
app.use(express.json()); // Update for Express 4.16+
var mongoose = require('mongoose');
const { stringify } = require('querystring')
mongoose.connect('mongodb://localhost:27017/testDB');
var db = mongoose.connection;

db.on('error', function(){
    console.log('Connection Failed!');
});
db.once('open', function() {
    console.log('Connected!');
});

var focus = new mongoose.Schema({
    type : 'string',
    startTime : 'string',
    endTime : 'string'
})

var study = new mongoose.Schema({
    startTime : 'string',
    endTime : 'string'
});

var dayStudys = new mongoose.Schema({
    day : 'Date',
    time : 'number',
    studys : [study],
    focusXs : [focus]//절대 시간 4자리 스트링인데 숫자. 1854
});


//1. 어떠한 사용자에 대한 POST : 타이머 스탑할 때마다 CREATE......URL: /stopTimer 
app.post('/stopTimer/:uid', function(request, response){
    //a. uid로 컬렉션과 연결
    var uid = request.params.uid;
    console.log(uid + " 컬렉션에 연결하겠습니다.");
    var UserDayStudys = mongoose.model(uid, dayStudys);
    
    // b. 오늘 날짜인 dayStudys 찾기
    UserDayStudys.find({},function(error, userstuys){
        if(error){// 없으므로 date는 오늘이고 study는 request.body인 JSON 새로 만들기

        }else{// date가 오늘인 

        }
    }) 

    
    var newStudent = new Student(request.body);
    newStudent.save(function(error, data){
        if(error){
            console.log(error);
        }else{
          response.send('서버로부터의 메세지: Data Saved!')
          console.log('Data Saved!')
        }
    });

    //c. 안드로이드에서 보낸 공부 구간(study) JSON을 오늘의 dayStudys의 studys에 추가

    //d. 누적 시간 update
});

//2. 어떠한 사용자에 대한 GET : 통계 페이지를 위한 READ 그리고 클라언트에게 send 데이터....URL: /Statics/:uid/:day
app.get('/statics/:uid/:day',function(request, response){

    //a. uid로 컬렉션과 연결
    var uid = request.params.uid;
    var day = request.params.day;
    var UserDayStudys = mongoose.model(uid, dayStudys);

    var queryParam = {};
    queryParam['day']=day;

    UserDayStudys.find(queryParam).exec(function(error, result){
        console.log('----휴----');
        if(error){
            console.log(error);
        }else{
            console.log(result);
           // response.send(userstudys);    // echo the result back
        }
    });
});

var student = mongoose.Schema({
    name : 'string',
    address : 'string',
    age : 'number'
});
var Student = mongoose.model('Schema', student);

app.get('/statics',function(request, response){
var day = 30;
    var queryParam = {};
    queryParam['age']=day;

    Student.find(queryParam).exec(function(error, students){
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