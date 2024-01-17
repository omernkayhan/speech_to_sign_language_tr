"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var http = require("http");
var cors = require("cors");
var socket_io_1 = require("socket.io");
function startSocketServer() {
    var app = express();
    var server = http.createServer(app);
    var io = new socket_io_1.Server(server);
    require('../parser/utils');
    var Prompt = require('../parser/prompt');
    var animationSocket = null;
    app.use(cors());
    io.on('connection', function (socket) {
        socket.on('disconnect', function () {
            console.log(' [SOCKET] Client disconnected with id: ' + socket.id);
        });
        socket.on('join', function (type) {
            if (type === 'speechApi') {
                console.log(' [SOCKET] Speech API connected with id: ' + socket.id);
            }
            else if (type === 'animation') {
                console.log(' [SOCKET] Animation API connected with id: ' + socket.id);
                animationSocket = socket;
            }
        });
        socket.on('prompt', function (data) {
            var prompt = new Prompt(data);
            socket.emit('processedPrompt', prompt.sentence.processed);
        });
        socket.on('sendToAnimation', function (data) {
            console.log(" [SOCKET] Send prompt to Animation API: " + data);
            animationSocket.emit('prompt', data);
        });
    });
    var PORT = 4100;
    server.listen(PORT, function () {
        console.log(" | Socket Server is listening on port ".concat(PORT, "                                       |"));
        console.log(" *-------------------------------------------------------------------------------*");
    });
}
exports.default = startSocketServer;
