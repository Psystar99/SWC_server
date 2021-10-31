const express = require('express')
const http = require("http")
const https = require("https")
const fs = require("fs")

const app = express()

app.use('/',(req,res,next) => {
  res.send('hi ssl...ㅇㅓ 왔니...?')
})

const options = {
  ca: fs.readFileSync('/etc/letsencrypt/live/bagi22.ml/fullchain.pem'),
  key: fs.readFileSync('/etc/letsencrypt/live/bagi22.ml/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/bagi22.ml/cert.pem'),
};

http.createServer(app).listen(80)
https.createServer(credentials, app).listen(443)