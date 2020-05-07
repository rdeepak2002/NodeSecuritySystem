const cv = require('opencv4nodejs')
const path = require('path')
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const FPS = 15
const faceClassifier = new cv.CascadeClassifier(path.join(__dirname, 'haarcascade_frontalface_default.xml'));
let webcamCapture = new cv.VideoCapture(0)

app.get('/', (req, res) =>  {
    res.sendFile(path.join(__dirname, 'index.html'))
})

function processVideo() {
    const begin = Date.now();

    try {
        let frame = webcamCapture.read().resize(360, 640)
        const image = cv.imencode('.jpg', frame).toString('base64')
        io.emit('image', image)
        let delay = 1000 / FPS - (Date.now() - begin);
    } catch (error) {
        console.error(error)
        webcamCapture.release()
        webcamCapture.delete()
        webcamCapture = new cv.VideoCapture(0)
        io.emit('error', error)
    }

    let latency = (Date.now() - begin)
    let delay = 1000 / FPS - latency

    io.emit('latency', latency)

    setTimeout(processVideo, delay)
}

setTimeout(processVideo, 0)

server.listen(3000)