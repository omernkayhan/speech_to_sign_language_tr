"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var socket_1 = require("./socket/socket");
var app = express();
var port = 4101;
app.use('/speechRecognition', express.static('speechRecognition'));
app.use('/animation', express.static('animation'));
app.use('/main', express.static('main'));
app.listen(port, function () {
    console.log(" *-------------------------------------------------------------------------------*");
    console.log(" | Server is listening on port ".concat(port, "                                              |"));
    console.log(" | Speech Recognition is available at http://localhost:".concat(port, "/speechRecognition    |"));
    console.log(" | Animation is available at http://localhost:".concat(port, "/animation                     |"));
    console.log(" | Main Screenn is available at http://localhost:".concat(port, "/main                       |"));
});
(0, socket_1.default)();
