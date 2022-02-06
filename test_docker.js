const express = require("express");
const app = express();
app.use(express.json()); // Update for Express 4.16+
const { stringify } = require('querystring')
const path = require('path')
const fs = require('fs')
let mongoose = require('mongoose');

const connectDb = require("./src/connection");
const UserConnect= require("./src/User.model");

const PORT = 8080;



function calTime(times){
  let studySec = 0;
  for(t in times){
      let sH = parseInt(times[t].startTime.slice(0,2));
      let sM = parseInt(times[t].startTime.slice(2,4)); 
      let sS = parseInt(times[t].startTime.slice(4,6));
      let eH = parseInt(times[t].endTime.slice(0,2));
      let eM = parseInt(times[t].endTime.slice(2,4)); 
      let eS = parseInt(times[t].endTime.slice(4,6));
      
      let sDate = new Date(2021,11,11,sH,sM,sS);// 년도, 월, 일은 상관 없기 때문에 더미 값을 넣기
      let eDate = new Date(2021,11,11,eH,eM,eS);  

      studySec += (eDate-sDate)/1000;
  };
 return studySec;
}

//1. 어떠한 사용자에 대한 POST : 타이머 스탑할 때마다 CREATE......URL: /stopTimer 
app.post('/stopTimer/:uid', function(request, response){
  //a. uid로 컬렉션과 연결
  let uid = request.params.uid;
  let User = UserConnect(uid);

  // c. 오늘 날짜인 데이터 찾기- 있으면 배열 추가하기, 없으면 새로 만들기
  const day = new Date();
  let filterParam = {};
  filterParam['year'] = day.getFullYear().toString();
  filterParam['month'] = (day.getMonth()+1).toString();
  filterParam['day']= day.getDate().toString();

  //c. 안드로이드에서 보낸 공부 구간(study) JSON을 오늘의 dayStudys의 studys에 추가
  //d. 누적 시간 update
  let newStudy = request.body.studys;
  let newDisturbX = request.body.disturbs;
  let newTime = calTime(newStudy)-calTime(newDisturbX);

  let updateParam = {
      studys: newStudy,
      disturbs: newDisturbX,
  };
  let addParam = {time : newTime};

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

// 4. 사용자의 전체 기간 데이터 필요시 - 안드로이드 룸DB로 2, 3 함수 필요 없어짐
app.get('/alldata/:uid',function(request, response){

  let uid = request.params.uid;

  let User = UserConnect(uid);
  
  User.find(function(error, result){
      console.log('--- Read all day ---');
      if(error){
          console.log(error);
      }else{
          console.log(result);
          response.send(result);// echo the result back
      }
  })
});

app.listen(PORT, function() {
  console.log(`Listening on ${PORT}`);

  connectDb().then(() => {
    console.log("MongoDb connected");
  });
});