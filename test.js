const express = require('express')
const https = require('https')
const path = require('path')
const fs = require('fs')

const app = express()

app.use('/',(req,res,next) => {
  res.send('hi ssl...ㅇㅓ 왔니...?')
})

const sslServer=https.createServer(
  {
    ca: fs.readFileSync('/etc/letsencrypt/live/bagi22.ml/fullchain.pem'),
    key: fs.readFileSync('/etc/letsencrypt/live/bagi22.ml/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/bagi22.ml/cert.pem'),
  },
  app
)

sslServer.listen(3443,() => console.log('sibalsibal on port 3443'))