// @ts-ignore
const socket = io('//localhost:4100', {
    transports : ['websocket'],
    autoConnect: true,
    reconnection: true
});

socket.on('connect', () => {
    console.log('Connected to server');
    // @ts-ignore
    document.getElementById('socketStatus')?.innerHTML = `<i class="ph ph-link-break"></i> Connected`;
    document.getElementById('socketStatus')?.classList.remove('btn-danger');
    document.getElementById('socketStatus')?.classList.add('btn-success');
    // @ts-ignore
    document.getElementById('sendPrompt')?.disabled = false;
    socket.emit('join', 'speechApi');
});

socket.on('reconnect', () => {
    socket.emit('join', 'speechApi');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
    // @ts-ignore
    document.getElementById('socketStatus')?.innerHTML = `<i class="ph ph-link-break"></i> Disconnected`;
    document.getElementById('socketStatus')?.classList.remove('btn-success');
    document.getElementById('socketStatus')?.classList.add('btn-danger');
    // @ts-ignore
    document.getElementById('sendPrompt')?.disabled = true;
});

socket.on('processedPrompt', (processed) => {
    // @ts-ignore
    document.getElementById('processed')?.value = processed;
});

if (!('webkitSpeechRecognition' in window)) {
    console.error('Web Speech API is not supported on this browser.');
} else {
    let alternatives = [];
    // @ts-ignore
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'tr-TR';
    recognition.onresult = (event) => {
        const results = event.results;
        for (let i = 0; i < results.length; i++) {
            const transcript = results[i][0].transcript;
            if (!alternatives.includes(transcript)) {
                alternatives.push(transcript);
            }
        }
        // @ts-ignore
        document.getElementById('alternatives')?.innerHTML = alternatives.map((alternative) => `<li class="list-group-item" onclick="document.getElementById('result').value = '${alternative.replace(/'/g, "\\'")}';">${alternative}</li>`).join('');
        const result = results[results.length - 1];
        const transcript = result[0].transcript;
        document.querySelector('#alternatives li:last-child')?.classList.add('active');
        // @ts-ignore
        document.getElementById('result')?.value = transcript;
    };

    document.getElementById('startListening')?.addEventListener('click', () => {
        alternatives = [];
        recognition.start();
        // @ts-ignore
        document.getElementById('startListening')?.disabled = true;
        // @ts-ignore
        document.getElementById('stopListening')?.disabled = false;
    });

    document.getElementById('stopListening')?.addEventListener('click', () => {
        recognition.stop();
        // @ts-ignore
        document.getElementById('stopListening')?.disabled = true;
        // @ts-ignore
        document.getElementById('startListening')?.disabled = false;
    });

    document.getElementById('sendPrompt')?.addEventListener('click', () => {
       // @ts-ignore
        socket.emit('prompt', document.getElementById('result')?.value);
    });

    document.getElementById('sendToAnimation')?.addEventListener('click', () => {
       // @ts-ignore
        socket.emit('sendToAnimation', document.getElementById('processed')?.value);
    });
}