/**
 * Created by fabien on 11/12/15.
 */
var myMyo = null;
var MyoApi = null;
var lastMac = null;
var NUM_PREC = 0;
var i = 0;
var IP = "134.59.215.166";
var PORT="3000";

var sphero;
var INTERVAL_REQUESTS_MYO = 180;

var x = 1, y = 0, signe = 0;


function getAverageFromTable(table){
    var average = 0;
    for(var i=0; i<table.length; i++){
        average += table[i];
    }
    return (average / table.length);
}

function sendCommand(x,y){
    if(sphero){
        var http = getAjax();
        http.open('POST', "http://"+IP+":"+PORT+"/spheros/"+sphero.id+"/move/"+x+"/"+y, true);
        xmlhttp.setRequestHeader("Content-type","application/json");
        http.send();
    }
}

function getAjax () {
    if (window.XMLHttpRequest)
    {// code for IE7+, Firefox, Chrome, Opera, Safari
        return xmlhttp=new XMLHttpRequest();
    }
    else
    {// code for IE6, IE5
        return xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
}
function checkBluetooth(btOnCallback){
    MyoApi.isBluetoothEnabled(function(isBtOn){
        console.log("The bluetooth adater is " + (isBtOn ? "ON" : "OFF") );
        if(isBtOn){
            if(btOnCallback){
                btOnCallback();
            }
        }else{
            MyoApi.openBluetoothConfig(function(didEnableBt){
                if(didEnableBt){
                    console.log("Bluetooth enabled by the user");
                    if(btOnCallback){
                        btOnCallback();
                    }
                }else{
                    console.log("You need to enable the Bluetooth adapter in order to use Myo");
                }
            }, function(err){
                console.log("Error opening Bluetooth configuration: " + err);
            });
        }
    }, function(err){
        console.log("Error checking Bluetooth adapter state: " + err);
    });
}
function logMyoEvent(arg){
    console.log("Myo event: " + JSON.stringify(arg));
}
function alertMyoEvent(ev){
    logMyoEvent(ev);
    console.log("Event: " + ev.eventName);
}
function alertMyoPose(ev){
    logMyoEvent(ev);
    if(ev.pose !== MyoApi.Pose.REST){
        console.log("Pose detected: " + ev.pose);
    }
}
function launchDataIntervalSender(){
    //sending command to the server
    /*  console.log("Lauching setinterval");

     setInterval(function(){
     //sendCommand();
     }, INTERVAL_REQUESTS_MYO);

     */

    setInterval(function () {
        var coord = {
            deltaX: x >= 1 ? 0 : 50 * (1 - x) * (signe >= 0 ? 1 : -1),
            deltaY: - y * 50
        };
        sendCommand(coord.deltaX ,coord.deltaY)
    }, 100);


}

function registerPlayer(){
    var http = getAjax();
    http.open('POST', "http://"+IP+":"+PORT+"/players", true);
    xmlhttp.setRequestHeader("Content-type","application/json");
    http.send();

    http.onreadystatechange = function() {
        if (http.readyState == 4 && http.status == 201) {
            sphero = JSON.parse(http.responseText);
            console.log(sphero);
            document.getElementById("infosSphero").innerHTML = ""+sphero.id;
            //SPHERO_NAME = sphero;
        }
    };
}
function getSphero(){
    if(myMyo){
        myMyo.vibrate(MyoApi.VibrationType.MEDIUM, function(){
        }, function(err){
        });
        //ask for a sphero to the server
        registerPlayer();
    }else{
        console.log("There are no Myos connected at the moment");
    }
}
function initMyo(){
    if(cordova && cordova.plugins && cordova.plugins.MyoApi){
        console.log("Myo plugin found!!");
    }else{
        console.log(cordova.plugins);
        console.log("Myo plugin NOT found!!");
        return;
    }

    MyoApi = cordova.plugins.MyoApi;
    lastMac = localStorage["lastUsedMyoMac"];
    if(lastMac){
        MyoApi.attachByMacAddress(lastMac);
    }else{
        //window.alert("Place the Myo very close to the mobile device");

    }

    MyoApi.init(function(){
        console.log("Myo Hub API initialized successfully");
    }, function(err){
        console.log("Error initializing Myo Hub: " + err);
    });
//...

    MyoApi
        .on("connect", function(ev){
            console.log("CONNECT EVENT");
            myMyo = ev.myo;
            document.getElementById('infos').innerHTML = (myMyo.name + " is  connected");
            localStorage["lastUsedMyoMac"] = myMyo.macAddress;
            console.log("Myo MAC address stored for easier future connection: " + localStorage["lastUsedMyoMac"]);
            myMyo.vibrate(MyoApi.VibrationType.MEDIUM); //Make the Myo vibrate
            launchDataIntervalSender();
            registerPlayer();
        })
        .on("disconnect", function(ev){
            window.alert(myMyo.name + " has disconnected");
            myMyo = null;
        })
        .on("pose", function(ev){
            window.alert("Pose detected: " + ev.pose);
        })
        .on("attach", function(ev){
            logMyoEvent(ev);
            console.log("ev.myo", ev.myo);
            myMyo = ev.myo;
            localStorage["lastUsedMyoMac"] = ev.myo.macAddress;
            console.log("Myo MAC address stored for easier future connection: " + localStorage["lastUsedMyoMac"]);

        })
        .on("detach", function(ev) {
            if (myMyo) {
                window.alert(myMyo.name + " has detached");
            } else {
                window.alert("Received detach event from unknown Myo");
            }
            myMyo = null;
            logMyoEvent(ev);
            showUiState("initial");
        })
        .on("orientationData",orientationDataHandler)
        .on("accelerometerData", accelerometerDataHandler)
        .on("gyroscopeData", gyroscopeDataHandler);

    MyoApi
        .on("armSync", alertMyoEvent)
        .on("armUnsync", alertMyoEvent)
        .on("unlock", logMyoEvent)
        .on("lock", logMyoEvent)
        .on("pose", alertMyoPose, function(err){
            console.log("ERROR: onPose: " + err);
        })
        .on("rssi", logMyoEvent);
}

function connect_myo(){

    console.log("Searching...");
    MyoApi.attachToAdjacentMyo(function(s){
        console.log("Connecting with adjacent Myo", s);
    }, function(err){
        console.log("connecting with adjacent Myo", err);
    });
}

function showMyo(){
    console.log("Current connected Myo: " + JSON.stringify(myMyo));
}



function orientationDataHandler(ev){
    //quaternion
    var d = ev["rotation"];

    txt = " W: " + d.w.toFixed(NUM_PREC)
        + "<br>&nbsp;&nbsp;\\\\\\ Roll: " + d.roll.toFixed(NUM_PREC)
        + " Pitch: " + d.pitch.toFixed(NUM_PREC)
        + " Yaw: " + d.yaw.toFixed(NUM_PREC)
        + " Angle: " + d.angle.toFixed(NUM_PREC)
        + " NORME: " + d.norme.toFixed(NUM_PREC);

    //var x = -((( d.yaw > 0 ? d.yaw - 0.5 : d.yaw + 0.5) * 100));
    //var y = (d.pitch * 2 * 100);
    signe = d.x;
    // data.x -> négatif à gauche, positif à droite
    //sendCommand(x, y);
    //console.log("XY",x,y);

}
function accelerometerDataHandler(ev){
    //NOT quaternion
    var d = ev["accel"];
    x = d.z;
    y = d.x;
    //console.log(x);
    // data.x = notre y
    // data.z = notre x en tournant autour du bras
    // if data.z > 1 alors on est stable, else -> commencer à bouger
}
function gyroscopeDataHandler(ev){
    d = ev["gyro"];
}
function detachMyo(){
    //myMyo.detach(myMyo.macAddress);
    document.getElementById("infos").innerHTML = "MYO NOT CONNECTED";
}
function detachSphero(){
    document.getElementById("infosSphero").innerHTML = "SPHERO NOT CONNECTED";
    //call to destroy player
    var http = getAjax();
    http.open('DELETE', "http://"+IP+":"+PORT+"/players/"+sphero.playerId, true);
    xmlhttp.setRequestHeader("Content-type","application/json");
    http.send();

}
function disconnect(){
    console.log("disconnecting");
    detachMyo();
    detachSphero();
}