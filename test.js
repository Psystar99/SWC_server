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
    type : 'string', //졺, 초점x
    startTime : 'string', //1135
    endTime : 'string'
})

var study = new mongoose.Schema({
    startTime : 'string',
    endTime : 'string'
});

var dayStudys = new mongoose.Schema({
    day : 'string', //211114
    time : 'number',
    studys : [study],
    focusXs : [focus]//절대 시간 4자리 스트링인데 숫자. 1854
});

var student = mongoose.Schema({
    studys : [study],
    day : 'string'
});

//1. 어떠한 사용자에 대한 POST : 타이머 스탑할 때마다 CREATE......URL: /stopTimer 
app.post('/stopTimer/:uid', function(request, response){
    //a. uid로 컬렉션과 연결
    var uid = request.params.uid;
    console.log(request.body);
    console.log(uid + " 컬렉션에 연결하겠습니다.");
    var Student = mongoose.model(uid, student);
    
    //b. 오늘 날짜 8자리로 변환하기
    const day = new Date();
    var today = day.getFullYear().toString()+(day.getMonth()+1).toString()+day.getDate().toString();
    console.log(today);

    // c. 오늘 날짜인 데이터 찾기- 있으면 배열 추가하기, 없으면 새로 만들기
    var filterParam = {};
    filterParam['day']=today;

    //c. 안드로이드에서 보낸 공부 구간(study) JSON을 오늘의 dayStudys의 studys에 추가
    //d. 누적 시간 update
    var newStudy = request.body;
    var updateParam = {studys: newStudy};

    Student.findOneAndUpdate(filterParam, {$push: updateParam}, {
        new: true,
        upsert: true // Make this update into an upsert
    }, function(err){
        if(err){
                console.log(err);
        }else{
                console.log("Successfully added");
                response.send("잘 저장됨");
        }
    });
});

//2. 어떠한 사용자에 대한 GET : 통계 페이지를 위한 READ 그리고 클라언트에게 send 데이터....URL: /Statics/:uid/:day
app.get('/test/:uid/:day',function(request, response){

    //a. uid로 컬렉션과 연결
    var uid = request.params.uid;
    var day = request.params.day;

    var Student = mongoose.model(uid, student);
    var queryParam = {};
    queryParam['day']=day;
    
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

http.createServer(app).listen(80)