const express = require('express')
const https = require('https')
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
    type : 'string', // ex. 졺, 초점x
    startTime : 'string', //1135 - 4자리의 시,분 
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
    versionKey: false 
});

function calTime(postJson){
   // for(var i )
  // var start = postJson.startTime;

   return 0;

}

//1. 어떠한 사용자에 대한 POST : 타이머 스탑할 때마다 CREATE......URL: /stopTimer 
app.post('/stopTimer/:uid', function(request, response){
    //a. uid로 컬렉션과 연결
    var uid = request.params.uid;
    console.log(request.body);
    console.log(uid + " 컬렉션에 연결하겠습니다.");
    var User = mongoose.model(uid, dayStudys);
    
    //b. 오늘 날짜 8자리로 변환하기
    const day = new Date();
    var today = day.getFullYear().toString()+(day.getMonth()+1).toString()+day.getDate().toString();
    console.log(today);

    // c. 오늘 날짜인 데이터 찾기- 있으면 배열 추가하기, 없으면 새로 만들기
    var filterParam = {};
    filterParam['day']=today;

    //c. 안드로이드에서 보낸 공부 구간(study) JSON을 오늘의 dayStudys의 studys에 추가
    //d. 누적 시간 update
    var newStudy = request.body.studys;
    var newFocusX = request.body.focusXs;
    var newTime = calTime(newStudy);

    var updateParam = {
        studys: newStudy,
        focusXs: newFocusX,
        time : newTime
    };

    User.findOneAndUpdate(filterParam, {$push: updateParam}, {
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


//3. 어떠한 사용자에 대한 GET : 통계 페이지를 위한 READ
//URL: /Statics/month?user_id

const sslServer=https.createServer(
    {
        ca: fs.readFileSync('/etc/letsencrypt/live/bagi22.ml/fullchain.pem'),
        key: fs.readFileSync('/etc/letsencrypt/live/bagi22.ml/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/bagi22.ml/cert.pem'),
    },
    app
  )
  
  sslServer.listen(2443,() => console.log('sibalsibal on port 2443'))
