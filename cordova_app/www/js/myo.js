/**
 * Created by fabien on 11/12/15.
 */

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

function initMyo(){
    if(cordova && cordova.plugins && cordova.plugins.MyoApi){
        console.log("Myo plugin found!!");
    }else{
        console.log(cordova.plugins);
        console.log("Myo plugin NOT found!!");
        return;
    }

    var MyoApi = cordova.plugins.MyoApi;
    var lastMac = localStorage["lastUsedMyoMac"];
    if(lastMac){
        MyoApi.attachByMacAddress(lastMac);
    }else{
        window.alert("Place the Myo very close to the mobile device");
        MyoApi.attachToAdjacentMyo();
    }

    MyoApi.init(function(){
        console.log("Myo Hub initialized successfully");
    }, function(err){
        console.log("Error initializing Myo Hub: " + err);
    });
//...
    var myMyo = null;
    MyoApi
        .on("connect", function(ev){
            myMyo = ev.myo;
            window.alert(myMyo.name + " is  connected");
            localStorage["lastUsedMyoMac"] = myMyo.macAddress;
            console.log("Myo MAC address stored for easier future connection: " + localStorage["lastUsedMyoMac"]);
            myMyo.vibrate(MyoApi.VibrationType.MEDIUM); //Make the Myo vibrate
        })
        .on("disconnect", function(ev){
            window.alert(myMyo.name + " has disconnected");
            myMyo = null;
        })
        .on("pose", function(ev){
            window.alert("Pose detected: " + ev.pose);
        });

    MyoApi
        .on("armSync", alertMyoEvent)
        .on("armUnsync", alertMyoEvent)
        .on("unlock", logMyoEvent)
        .on("lock", logMyoEvent)
        .on("pose", alertMyoPose, function(err){
            console.log("ERROR: onPose: " + err);
        })
        .on("rssi", logMyoEvent);
//...

//Alternatively, for testing purposes, we could use MyoApi.openScanDialog()
//to connect to a device manually

}