const mongoose = require("mongoose");

var disturb = new mongoose.Schema({
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
  disturbs : [disturb] // 집중X 구간
},{
  versionKey: false // You should be aware of the outcome after set to false
});


function UserConnect(uid){
  console.log(uid + " 컬렉션에 연결하겠습니다.");
  return mongoose.model(uid, dayStudys);
}

module.exports = UserConnect;