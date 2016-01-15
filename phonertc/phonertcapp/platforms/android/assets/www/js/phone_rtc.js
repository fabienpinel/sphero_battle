/**
 * Created by fabienpinel on 15/01/16.
 */
function launch_phonertc(){
    var config = {
        isInitiator: true,
        turn: {
            host: 'http://localhost:3000',
            username: 'test',
            password: '123'
        },
        streams: {
            audio: true,
            video: true
        }
    }

    var session = new cordova.plugins.phonertc.Session(config);

    cordova.plugins.phonertc.setVideoView({
        container: document.getElementById('videoContainer'),
        local: {
            position: [0, 0],
            size: [100, 100]
        }
    });

    session.on('sendMessage', function (data) {
        //signaling.send(otherUser, data);
        console.log("signaling.send(otherUser, data);");
    });

    session.on('answer', function () {
        console.log('Other client answered!');
    });

    session.on('disconnect', function () {
        console.log('Other client disconnected!');
    });

    session.call();

}