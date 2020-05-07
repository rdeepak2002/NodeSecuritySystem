const cv = require('opencv4nodejs')
const path = require('path')
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const FPS = 15
const bodyClassifier = new cv.CascadeClassifier(cv.HAAR_FULLBODY)
let webcamCapture = new cv.VideoCapture(0)

const purpleColor = new cv.Vec3(255, 0, 255)
const rectThickness2 = 2

app.get('/', (req, res) =>  {
    res.sendFile(path.join(__dirname, 'index.html'))
})

function processVideo() {
    const begin = Date.now();

    try {
        const frame = webcamCapture.read().resize(360, 640)
        const greyImg = frame.bgrToGray()
        const bodyRects = bodyClassifier.detectMultiScale(greyImg).objects

        if(bodyRects.length) {
            let rect = bodyRects[0]
            let point1 = new cv.Point2(rect.x, rect.y)
            let point2 = new cv.Point2(rect.x+rect.width, rect.y+rect.width)
            frame.drawRectangle(point1, point2, purpleColor, rectThickness2)
        }

        const image = cv.imencode('.jpg', frame).toString('base64')

        io.emit('image', image)
    } catch (error) {
        console.error(error)
        webcamCapture.release()
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