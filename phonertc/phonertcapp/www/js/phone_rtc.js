function launch_phonertc() {

    var config = {
        isInitiator: true,
        turn: {
            host: 'turn:turn.example.com:3478',
            username: 'test',
            password: 'test'
        },
        streams: {
            audio: true,
            video: false
        }
    };

    var session = new cordova.plugins.phonertc.Session(config);

// all config options are accessible from the session object
// (implemented with JS getters and setters)
    console.log(session.isInitiator);

// event handling
    session.on('sendMessage', function (data) {
        //signaling.emit(data);
        console.log("signaling.emit(data);");
    });


    session.on('answer', function () {
        console.log('answer!');
    });

    session.on('disconnect', function () {
        console.log('Other client disconnected!');
    });

    session.call();
    cordova.plugins.phonertc.setVideoView({
        container: document.getElementById('videoContainer'),
        local: {
            position: [0, 0],
            size: [150, 150]
        }
    });


// TODO:
// session.streams.audio = false;
// session.renegotiate();

}