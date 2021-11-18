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
    startTime : 'string', //113524
    endTime : 'string'
});

var study = new mongoose.Schema({
    startTime : 'string',
    endTime : 'string'
});

var dayStudys = new mongoose.Schema({
    day : 'string', // 20211114 : 8자리 표현
    time : {type: 'number', default : 0}, // 누적시간
    studys : [study], // 공부구간
    focusXs : [focus] // 집중X 구간
},{
    versionKey: false // You should be aware of the outcome after set to false
});

//studys 혹은 focusXs와 같은 JsonArray를 받아 누적 시간을 계산하는 함수
//시간은 시분초의 6자리 string
function calTime(times){
    var studySec = 0;
    for(t in times){
        var sH = parseInt(times[t].startTime.slice(0,2));
        var sM = parseInt(times[t].startTime.slice(2,4)); 
        var sS = parseInt(times[t].startTime.slice(4,6));
        var eH = parseInt(times[t].endTime.slice(0,2));
        var eM = parseInt(times[t].endTime.slice(2,4)); 
        var eS = parseInt(times[t].endTime.slice(4,6));
        
        var sDate = new Date(2021,11,11,sH,sM,sS);
        var eDate = new Date(2021,11,11,eH,eM,eS);  

        studySec += (eDate-sDate)/1000;
    };
   return studySec;
}

//1. 어떠한 사용자에 대한 POST : 타이머 스탑할 때마다 CREATE......URL: /stopTimer 
app.post('/stopTimer/:uid', function(request, response){
    //a. uid로 컬렉션과 연결
    var uid = request.params.uid;
    //console.log(request.body);
    console.log(uid + " 컬렉션에 연결하겠습니다.");
    var User = mongoose.model(uid, dayStudys);
    
    //b. 오늘 날짜 8자리로 변환하기
    const day = new Date();
    var today = day.getFullYear().toString()+(day.getMonth()+1).toString()+day.getDate().toString();
    //console.log(today);

    // c. 오늘 날짜인 데이터 찾기- 있으면 배열 추가하기, 없으면 새로 만들기
    var filterParam = {};
    filterParam['day']=today;

    //c. 안드로이드에서 보낸 공부 구간(study) JSON을 오늘의 dayStudys의 studys에 추가
    //d. 누적 시간 update
    var newStudy = request.body.studys;
    var newFocusX = request.body.focusXs;
    var newTime = calTime(newStudy)-calTime(newFocusX);
    console.log("왜 저ㅇ ㅏㄴㅚㅑㅠ"+newTime);
    //기존 시간에 새시간 어케 더하뉴??

    var updateParam = {
        studys: newStudy,
        focusXs: newFocusX,
    };
    var addParam = {time : newTime};

    User.findOneAndUpdate(filterParam , 
        {$push : updateParam,
        $inc : addParam},
        {new: true,
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
app.get('/statics/:uid/:day',function(request, response){

    //a. uid로 컬렉션과 연결
    var uid = request.params.uid;
    var day = request.params.day;

    var User = mongoose.model(uid, dayStudys);
    var queryParam = {};
    queryParam['day']=day;
    
    User.find(queryParam).exec(function(error, result){
        console.log('--- Read all ---');
        if(error){
            console.log(error);
        }else{
            console.log(result);
            response.send(result);    // echo the result back
        }
    })
});

http.createServer(app).listen(80)