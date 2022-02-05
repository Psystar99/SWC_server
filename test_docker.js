const express = require("express");
const app = express();
const connectDb = require("./src/connection");
const User = require("./src/User.model");

const PORT = 8080;

app.get("/users", async (req, res) => {
  User.find(function(error, students){
    console.log('--- Read all ---');
    if(error){
        console.log(error);
    }else{
        console.log(students);
    }
})
  res.send("success \n");
});

app.get("/user-create", async (req, res) => {
  const user = new User({ username: "userTest" });
  await user.save().then(() => console.log("User created"));
  res.send("User created \n");
});

app.listen(PORT, function() {
  console.log(`Listening on ${PORT}`);

  connectDb().then(() => {
    console.log("MongoDb connected");
  });
});