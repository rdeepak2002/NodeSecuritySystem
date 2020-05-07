const cv = require('opencv4nodejs')
const path = require('path')
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const FPS = 15
const webcamCapture = new cv.VideoCapture(0)

app.get('/', (req, res) =>  {
    res.sendFile(path.join(__dirname, 'index.html'))
})

setInterval(() => {
    try {
        let frame = webcamCapture.read()
        frame = frame.resize(360, 640)
        const image = cv.imencode('.jpg', frame).toString('base64')
        io.emit('image', image)
    }
    catch(error) {
        console.error(error)
        webcamCapture.release()
        io.emit('error', error)
    }

}, 1000/FPS)

server.listen(3000)