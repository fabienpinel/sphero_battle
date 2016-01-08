/**
 * Created by fabien on 11/12/15.
 */
var myMyo = null;
var MyoApi = null;
var lastMac = null;
var NUM_PREC = 3;
var i = 0;
var IP = "134.59.215.166";
var PORT="3000";

var d, x, y,z;

var GYRO_Y_MAX_RANGE = 400;
var GYRO_X_MAX_RANGE = 100;

var angle=0, norme=0;

function sendCommand(angle, distance){
    console.log("Angle: "+angle+" Distance: "+norme);
    var dataMyo = {"angle":angle,"distance":distance};
    var http = getAjax();
    http.open('POST', "http://"+IP+":"+PORT+"/spheros/RPP/move/"+dataMyo.angle+"/"+dataMyo.distance, true);
    xmlhttp.setRequestHeader("Content-type","application/json");
    http.send();
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
                    window.alert("You need to enable the Bluetooth adapter in order to use Myo");
                }
            }, function(err){
                window.alert("Error opening Bluetooth configuration: " + err);
            });
        }
    }, function(err){
        window.alert("Error checking Bluetooth adapter state: " + err);
    });
}
function logMyoEvent(arg){
    console.log("Myo event: " + JSON.stringify(arg));
}
function alertMyoEvent(ev){
    logMyoEvent(ev);
    window.alert("Event: " + ev.eventName);
}
function alertMyoPose(ev){
    logMyoEvent(ev);
    if(ev.pose !== MyoApi.Pose.REST){
        window.alert("Pose detected: " + ev.pose);
    }
}
function launchDataIntervalSender(){
    //sending command to the server
    console.log("Lauching setinterval");
    setInterval(function(){
        sendCommand(angle, norme);
    }, 250);
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
            window.alert(myMyo.name + " is  connected");
            localStorage["lastUsedMyoMac"] = myMyo.macAddress;
            console.log("Myo MAC address stored for easier future connection: " + localStorage["lastUsedMyoMac"]);
            myMyo.vibrate(MyoApi.VibrationType.MEDIUM); //Make the Myo vibrate
            launchDataIntervalSender();
        })
        .on("disconnect", function(ev){
            window.alert(myMyo.name + " has disconnected");
            myMyo = null;
        })
        .on("pose", function(ev){
            window.alert("Pose detected: " + ev.pose);
        })
        .on("attach", function(ev){
            console.log("ATTACH EVENT");
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



//Alternatively, for testing purposes, we could use MyoApi.openScanDialog()
//to connect to a device manually
}

function connect_myo(){
   console.log("adjacent search");
    MyoApi.attachToAdjacentMyo(function(s){
        console.log("Connecting with adjacent Myo success", s);
    }, function(err){
        console.log("connecting with adjacent Myo error", err);
    });
}

function vibrateMyo(){
    console.log("Clicked on vibrate myo button");
    if(myMyo){
        myMyo.vibrate(MyoApi.VibrationType.MEDIUM, function(){
            console.log("Vibration sent successfully");
        }, function(err){
            console.log("ERROR: couldn't send vibration: " + err);
        });
    }else{
        window.alert("There are no Myos connected at the moment");
    }
}

function showMyo(){
    console.log("Clicked on show myo button");
    window.alert("Current connected Myo: " + JSON.stringify(myMyo));
}



function orientationDataHandler(ev){
//quaternion
        /*
        var d = ev["rotation"];

        var txt = "X: " + d.x.toFixed(NUM_PREC)
            + " Y: " + d.y.toFixed(NUM_PREC)
            + " Z: " + d.z.toFixed(NUM_PREC);

        txt += " W: " + d.w.toFixed(NUM_PREC)
        + "<br>&nbsp;&nbsp;\\\\\\ Roll: " + d.roll.toFixed(NUM_PREC)
        + " Pitch: " + d.pitch.toFixed(NUM_PREC)
        + " Yaw: " + d.yaw.toFixed(NUM_PREC)
        + " Angle: " + d.angle.toFixed(NUM_PREC)
        + " NORME: " + d.norme.toFixed(NUM_PREC);
    setTimeout(sendCommand(d.angle.toFixed(NUM_PREC), d.norme.toFixed(NUM_PREC)*1000), 50);
    if(i==0){
        console.log(txt);
        sendCommand(d.angle.toFixed(NUM_PREC), d.norme.toFixed(NUM_PREC)*1000);
        i++;
    }
         */
}
function accelerometerDataHandler(ev){
//NOT quaternion
   var d = ev["accel"];
    var txt = "X: " + d.x.toFixed(NUM_PREC)
        + " Y: " + d.y.toFixed(NUM_PREC)
        + " Z: " + d.z.toFixed(NUM_PREC);
   // console.log("accelerometerDataHandler",txt);
}
function gyroscopeDataHandler(ev){

    d = ev["gyro"];

    x = d.x.toFixed(NUM_PREC);
    y = d.y.toFixed(NUM_PREC);
    z = d.z.toFixed(NUM_PREC);
    var temp = 0;
    var txt = "X: " + x
        + " Y: " + y
        + " Z: " + z;

    //console.log("gyroscopeDataHandler",txt);

    //Majoration des valeurs suivant le RANGE
    x = (x>GYRO_X_MAX_RANGE)? GYRO_X_MAX_RANGE : x;
    x = (x<-GYRO_X_MAX_RANGE)? -GYRO_X_MAX_RANGE : x;

    y = (y>GYRO_Y_MAX_RANGE)? GYRO_Y_MAX_RANGE : y;
    y = (y<-GYRO_Y_MAX_RANGE)? -GYRO_Y_MAX_RANGE : y;


    norme = Math.sqrt((x*x)+(y* y));
    norme *= 10;
    norme = (norme > 1000) ? 1000 : norme;

    if(x==0){
        if(y>0){
            temp = (Math.PI / 2);
        }
        else if(y<0){
            temp = (3*Math.PI)/2;
        }
    }else{
        if(x>0 && y>=0){
            temp = Math.atan(y/x);
        }
        if(x>0 && y<0){
            temp += 2* Math.PI;
        }
        if(x<0){
            temp += Math.PI;
        }
    }
    angle = temp*(180/Math.PI);

    //console.log("gyroscopeDataHandler", txt);
    //console.log("Angle: "+angle+" Distance: "+norme);
}
function detachMyo(){
    myMyo.detach(myMyo.macAddress);
}
function displayData(){
    i=0;
}
