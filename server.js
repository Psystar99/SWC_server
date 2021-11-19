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
    type : 'string', //ex. 졺, 초점x
    startTime : 'string', // 시분초의 6자리 문자열
    endTime : 'string'
});

var study = new mongoose.Schema({
    startTime : 'string',
    endTime : 'string'
});

var dayStudys = new mongoose.Schema({
    year :'string', // 4자리 ex) 2021년
    month : 'string', //  1 - 12 월
    day : 'string', // 1 - 31
    time : {type: 'number', default : 0}, // 누적시간 - 초단위로 저장
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
        
        var sDate = new Date(2021,11,11,sH,sM,sS);// 년도, 월, 일은 상관 없기 때문에 더미 값을 넣기
        var eDate = new Date(2021,11,11,eH,eM,eS);  

        studySec += (eDate-sDate)/1000;
    };
   return studySec;
}

//1. 어떠한 사용자에 대한 POST : 타이머 스탑할 때마다 CREATE......URL: /stopTimer 
app.post('/stopTimer/:uid', function(request, response){
    //a. uid로 컬렉션과 연결
    var uid = request.params.uid;
    console.log(uid + " 컬렉션에 연결하겠습니다.");
    var User = mongoose.model(uid, dayStudys);

    // c. 오늘 날짜인 데이터 찾기- 있으면 배열 추가하기, 없으면 새로 만들기
    const day = new Date();
    var filterParam = {};
    filterParam['year'] = day.getFullYear().toString();
    filterParam['month'] = (day.getMonth()+1).toString();
    filterParam['day']= day.getDate().toString();

    //c. 안드로이드에서 보낸 공부 구간(study) JSON을 오늘의 dayStudys의 studys에 추가
    //d. 누적 시간 update
    var newStudy = request.body.studys;
    var newFocusX = request.body.focusXs;
    var newTime = calTime(newStudy)-calTime(newFocusX);

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
// day 형식은 2021-9-8 과 같이 -로 구분하기
app.get('/statics/:uid/:day',function(request, response){

    //a. uid로 컬렉션과 연결
    var uid = request.params.uid;
    var day = request.params.day.split("-");

    var User = mongoose.model(uid, dayStudys);
    var queryParam = {};
    queryParam['year']=day[0];
    queryParam['month']=day[1];
    queryParam['day']=day[2];
    
    User.find(queryParam).exec(function(error, result){
        console.log('--- Read all ---');
        if(error){
            console.log(error);
        }else{
            console.log(result);
            response.send(result);// echo the result back
        }
    })
});

// 3. 깃과 같은 달력을 위해
app.get('/calendar/:uid/:month', function(request, response){
    var uid = request.params.uid;
    var month = request.params.month;

    var User = mongoose.model(uid, dayStudys);
    var queryParam = {};
    queryParam['month']=month;
    
    User.find(queryParam).exec(function(error, result){
        console.log('--- calculate time of the month ---');
        if(error){
            console.log(error);
        }else{
            var calTimes=new Array();
            for(d in result){
                var calTime = new Object();
                calTime.day = result[d].day;
                var time = result[d].time/60/60;

                // [0,3) : 1단계, [3,6) : 2단계, [6,9) : 3단계, [9,12) : 4단계, 12 이상 : 5단계,
                if(time>=0 && time<3){
                    time = 1;
                }
                else if(time>=3 && time<6){
                    time = 2;
                }
                else if(time>=3 && time<6){
                    time = 3;
                }
                else if(time>=3 && time<6){
                    time = 4;
                }
                else if(time>=3 && time<6){
                    time = 5;
                }
                else{
                    console.log("time should not be minus");
                }
                console.log(time);
                calTime.level = time; 
                calTime = JSON.stringify(calTime);
                calTimes.push(JSON.parse(calTime));
            }
            response.send(calTimes);// echo the result back
        }
    })
});

const sslServer=https.createServer(
    {
        ca: fs.readFileSync('/etc/letsencrypt/live/bagi22.ml/fullchain.pem'),
        key: fs.readFileSync('/etc/letsencrypt/live/bagi22.ml/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/bagi22.ml/cert.pem'),
    },
    app
  )
  
  sslServer.listen(2443,() => console.log('sibalsibal on port 2443'))
