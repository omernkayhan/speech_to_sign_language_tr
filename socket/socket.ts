import express = require('express');
import http = require('http');
import cors = require('cors');
import { Server, Socket } from 'socket.io';

export default function startSocketServer(){

    const app = express();
    const server = http.createServer(app);
    const io = new Server(server);

    require('../parser/utils');
    const Prompt = require('../parser/prompt');
    const Sentence = require('../parser/Sentence');

    let animationSocket: Socket = null;

    app.use(cors());

    io.on('connection', (socket: Socket) => {
        socket.on('disconnect', () => {
            console.log(' [SOCKET] Client disconnected with id: ' + socket.id);
        });
        socket.on('join', (type) => {
            if(type === 'speechApi') {
                console.log(' [SOCKET] Speech API connected with id: ' + socket.id);
            }else if(type === 'animation') {
                console.log(' [SOCKET] Animation API connected with id: ' + socket.id);
                animationSocket = socket;
            }
        });

        socket.on('prompt', (data) => {
            const prompt = new Prompt(data.trim());
            socket.emit('processedPrompt', prompt.sentence.processed);
            socket.emit('processedWords', prompt.sentence.words.map((word) => {
                return {
                    type: word.type,
                    word: word.root,
                    animationData: word.animationData
                }
            }));
        });

        socket.on('sendToAnimation', (data) => {
            console.log(" [SOCKET] Send prompt to Animation API: " + data);
            animationSocket.emit('prompt', data);
        });

        socket.on('sendToAnimationData', (data) => {
            console.log(" [SOCKET] Send prompt to Animation API: ", data);
            animationSocket.emit('promptData', data);
        });
    });

    const PORT = 4100;
    server.listen(PORT, () => {
        console.log(` | Socket Server is listening on port ${PORT}                                       |`);
        console.log(` *-------------------------------------------------------------------------------*`);
        console.log(` [INFO] ${Sentence.animationData.words.length} words has animation data.`);
        console.log(` [INFO] ${Sentence.animationData.letters.length} letters has animation data.`);
        console.log(` [INFO] ${Sentence.animationData.words.length + Sentence.animationData.letters.length} total animation data.`);
    });

}