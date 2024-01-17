import express = require('express');
import startSocketServer from "./socket/socket";

const app = express();
const port = 4101;

app.use('/speechRecognition', express.static('speechRecognition'));
app.use('/animation', express.static('animation'));
app.use('/main', express.static('main'));

app.listen(port, () => {
    console.log(` *-------------------------------------------------------------------------------*`);
    console.log(` | Server is listening on port ${port}                                              |`);
    console.log(` | Speech Recognition is available at http://localhost:${port}/speechRecognition    |`);
    console.log(` | Animation is available at http://localhost:${port}/animation                     |`);
    console.log(` | Main Screenn is available at http://localhost:${port}/main                       |`);
});

startSocketServer();