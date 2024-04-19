var _a, _b, _c, _d;
// @ts-ignore
var socket = io('//localhost:4100', {
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true
});
socket.on('connect', function () {
    var _a, _b, _c, _d;
    console.log('Connected to server');
    // @ts-ignore
    (_a = document.getElementById('socketStatus')) === null || _a === void 0 ? void 0 : _a.innerHTML = "<i class=\"ph ph-link-break\"></i> Connected";
    (_b = document.getElementById('socketStatus')) === null || _b === void 0 ? void 0 : _b.classList.remove('btn-danger');
    (_c = document.getElementById('socketStatus')) === null || _c === void 0 ? void 0 : _c.classList.add('btn-success');
    // @ts-ignore
    (_d = document.getElementById('sendPrompt')) === null || _d === void 0 ? void 0 : _d.disabled = false;
    socket.emit('join', 'speechApi');
});
socket.on('reconnect', function () {
    socket.emit('join', 'speechApi');
});
socket.on('disconnect', function () {
    var _a, _b, _c, _d;
    console.log('Disconnected from server');
    // @ts-ignore
    (_a = document.getElementById('socketStatus')) === null || _a === void 0 ? void 0 : _a.innerHTML = "<i class=\"ph ph-link-break\"></i> Disconnected";
    (_b = document.getElementById('socketStatus')) === null || _b === void 0 ? void 0 : _b.classList.remove('btn-success');
    (_c = document.getElementById('socketStatus')) === null || _c === void 0 ? void 0 : _c.classList.add('btn-danger');
    // @ts-ignore
    (_d = document.getElementById('sendPrompt')) === null || _d === void 0 ? void 0 : _d.disabled = true;
});
socket.on('processedPrompt', function (processed) {
    var _a;
    // @ts-ignore
    (_a = document.getElementById('processed')) === null || _a === void 0 ? void 0 : _a.value = processed;
});
var processedData = [
    {
        "type": "belirteç",
        "word": "şimdi",
        "animationData": {
            "type": "word",
            "animation": "undefined"
        }
    },
    {
        "type": "isim",
        "word": "ece",
        "animationData": {
            "type": "letters",
            "name": "ece",
            "letters": [
                {
                    "type": "letter",
                    "animation": "e"
                },
                {
                    "type": "letter",
                    "animation": "c"
                },
                {
                    "type": "letter",
                    "animation": "e"
                }
            ]
        }
    },
    {
        "type": "isim",
        "word": "yemek",
        "animationData": {
            "type": "word",
            "animation": "yemek"
        }
    },
    {
        "type": "fiil",
        "word": "(F)yemek",
        "animationData": {
            "type": "word",
            "animation": "(F)yemek"
        }
    },
    {
        "type": "fiil",
        "word": "gitmek",
        "animationData": {
            "type": "word",
            "animation": "gitmek"
        }
    }
];
socket.on('processedWords', function (data) {
    // @ts-ignore
    document.getElementById('processedData').innerHTML = JSON.stringify(data, ' ', ' ');
    processedData = data;
});
if (!('webkitSpeechRecognition' in window)) {
    console.error('Web Speech API is not supported on this browser.');
}
else {
    var alternatives_1 = [];
    // @ts-ignore
    var recognition_1 = new webkitSpeechRecognition();
    recognition_1.continuous = true;
    recognition_1.interimResults = true;
    recognition_1.lang = 'tr-TR';
    recognition_1.onresult = function (event) {
        var _a, _b, _c;
        var results = event.results;
        for (var i = 0; i < results.length; i++) {
            var transcript_1 = results[i][0].transcript;
            if (!alternatives_1.includes(transcript_1)) {
                alternatives_1.push(transcript_1);
            }
        }
        // @ts-ignore
        (_a = document.getElementById('alternatives')) === null || _a === void 0 ? void 0 : _a.innerHTML = alternatives_1.map(function (alternative) { return "<li class=\"list-group-item\" onclick=\"document.getElementById('result').value = '".concat(alternative.replace(/'/g, "\\'"), "';\">").concat(alternative, "</li>"); }).join('');
        var result = results[results.length - 1];
        var transcript = result[0].transcript;
        (_b = document.querySelector('#alternatives li:last-child')) === null || _b === void 0 ? void 0 : _b.classList.add('active');
        // @ts-ignore
        (_c = document.getElementById('result')) === null || _c === void 0 ? void 0 : _c.value = transcript;
    };
    (_a = document.getElementById('startListening')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function () {
        var _a, _b;
        alternatives_1 = [];
        recognition_1.start();
        // @ts-ignore
        (_a = document.getElementById('startListening')) === null || _a === void 0 ? void 0 : _a.disabled = true;
        // @ts-ignore
        (_b = document.getElementById('stopListening')) === null || _b === void 0 ? void 0 : _b.disabled = false;
    });
    (_b = document.getElementById('stopListening')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', function () {
        var _a, _b;
        recognition_1.stop();
        // @ts-ignore
        (_a = document.getElementById('stopListening')) === null || _a === void 0 ? void 0 : _a.disabled = true;
        // @ts-ignore
        (_b = document.getElementById('startListening')) === null || _b === void 0 ? void 0 : _b.disabled = false;
    });
    (_c = document.getElementById('sendPrompt')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', function () {
        var _a;
        // @ts-ignore
        socket.emit('prompt', (_a = document.getElementById('result')) === null || _a === void 0 ? void 0 : _a.value);
    });
    (_d = document.getElementById('sendToAnimation')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', function () {
        var _a;
        // @ts-ignore
        socket.emit('sendToAnimation', (_a = document.getElementById('processed')) === null || _a === void 0 ? void 0 : _a.value);
        socket.emit('sendToAnimationData', processedData);
    });
}
