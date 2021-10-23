var mongoose = require('mongoose'); //mongoose를 import

mongoose.connect('mongodb://localhost:27017/test',{ useNewUrlParser: true } );

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function callback(){
    console.log("mongo db is connected");
});