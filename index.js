let cv = require('opencv4nodejs');
let path = require('path');
let express = require('express');
let app = express();
let server = require('http').createServer(app);
let io = require('socket.io')(server);

let FPS = 15;
let webcamCapture = new cv.VideoCapture(0);


// webcamCapture.set(cv.CAP_PROP_FRAME_WIDTH, 480)
// webcamCapture.set(cv.CAP_PROP_FRAME_HEIGHT, 270)

app.get('/', (req, res) =>  {
    res.sendFile(path.join(__dirname, 'index.html'));
});

setInterval(() => {
    try {
        let frame = webcamCapture.read();
        let image = cv.imencode('.jpg', frame).toString('base64');
        io.emit('image', image);
    }
    catch(error) {
        console.error(error);
        webcamCapture.release();
        webcamCapture = new cv.VideoCapture(0);
    }

}, 1000/FPS);

server.listen(3000);