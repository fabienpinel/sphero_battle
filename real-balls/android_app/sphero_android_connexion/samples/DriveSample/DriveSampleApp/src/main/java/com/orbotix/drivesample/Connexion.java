package com.orbotix.drivesample;

import android.app.ActionBar;
import android.app.Activity;
import android.app.Dialog;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.Toast;

import com.github.nkzawa.emitter.Emitter;
import com.github.nkzawa.socketio.client.IO;
import com.github.nkzawa.socketio.client.Socket;
import com.orbotix.ConvenienceRobot;
import com.orbotix.Sphero;
import com.orbotix.classic.DiscoveryAgentClassic;
import com.orbotix.common.DiscoveryAgent;
import com.orbotix.common.DiscoveryAgentEventListener;
import com.orbotix.common.DiscoveryException;
import com.orbotix.common.ResponseListener;
import com.orbotix.common.Robot;
import com.orbotix.common.RobotChangedStateListener;
import com.orbotix.common.internal.AsyncMessage;
import com.orbotix.common.internal.DeviceResponse;
import com.orbotix.le.DiscoveryAgentLE;
import com.orbotix.robotpicker.RobotPickerDialog;
import com.thalmic.myo.AbstractDeviceListener;
import com.thalmic.myo.DeviceListener;
import com.thalmic.myo.Hub;
import com.thalmic.myo.Myo;
import com.thalmic.myo.Pose;
import com.thalmic.myo.Quaternion;
import com.thalmic.myo.Vector3;
import com.thalmic.myo.XDirection;

import java.net.URISyntaxException;
import java.util.List;

/**
 * An example full-screen activity that shows and hides the system UI (i.e.
 * status bar and navigation/system bar) with user interaction.
 */
public class Connexion extends Dialog implements DiscoveryAgentEventListener , RobotChangedStateListener{
    public interface RobotPickerListener{
        public void onRobotPicked(ConvenienceRobot robotPicked, Hub myoHUB, Socket socket);
    }

    private static final String TAG = "Connexion View";

    private DiscoveryAgent _currentDiscoveryAgent;

    private ConvenienceRobot _connectedRobot;
    private Socket mSocket;
    RobotPickerListener _pickerListener;

    Button connectSpheroButton;
    Button connectMyoButton;
    Button letsgoButton;

    CheckBox checkBoxSPHERO, checkBoxMYO;
    Hub hub;

    public Connexion(Context context, RobotPickerListener pickerListener) {
        super(context);
        this._pickerListener = pickerListener;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);


        _currentDiscoveryAgent = DiscoveryAgentClassic.getInstance();
        this.requestWindowFeature(Window.FEATURE_NO_TITLE);

        setContentView(R.layout.activity_connexion);

        WindowManager.LayoutParams params = getWindow().getAttributes();
        params.height = WindowManager.LayoutParams.MATCH_PARENT;
        params.width = WindowManager.LayoutParams.MATCH_PARENT;
        getWindow().setAttributes(params);
        getWindow().setBackgroundDrawable(null);



        checkBoxSPHERO = (CheckBox) findViewById(R.id.checkBoxSPHERO);
        checkBoxSPHERO.setChecked(false);

        checkBoxMYO = (CheckBox) findViewById(R.id.checkBoxMYO);
        checkBoxMYO.setChecked(false);


        connectSpheroButton = (Button) findViewById(R.id.connectSpheroButton);
        connectSpheroButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Log.d("DISCO", "starting discovery");
                connectSpheroButton.setText("Connecting...");
                startDiscovery();
            }
        });

        connectMyoButton = (Button) findViewById(R.id.connectMyoButton);
        connectMyoButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                //Intent launchIntent = getContext().getPackageManager().getLaunchIntentForPackage("com.ihm.myoAndSphero");
                //getContext().startActivity(launchIntent);
                Log.d("MYO","connecting to adjascent MYO");
                connectMyoButton.setText("Connecting...");
                Hub.getInstance().attachToAdjacentMyo();
            }
        });

        letsgoButton = (Button) findViewById(R.id.buttonLetsGo);
        letsgoButton.setEnabled(false);
        letsgoButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                hub.removeListener(mListener);
                //dismiss dialog
                //if(_pickerListener != null && _connectedRobot != null && mSocket != null)
                    _pickerListener.onRobotPicked(_connectedRobot, hub, mSocket);
            }
        });

        hub = Hub.getInstance();
        if (!hub.init(this.getContext())) {
            Log.e(TAG, "Could not initialize the Hub.");
            return;
        }else{
            hub.addListener(mListener);
        }
    }

    @Override
    protected void onStart() {
        super.onStart();

    }


    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();
        if (id == android.R.id.home) {
        }
        return super.onOptionsItemSelected(item);
    }

    public void connectSphero(){
        //launch the connection with the sphero
        startDiscovery();
    }

    public void connectMyo(){
        //launch the myo connection (proximity)
    }


    private void startDiscovery() {
        try {
            _currentDiscoveryAgent.addDiscoveryListener(this);
            _currentDiscoveryAgent.addRobotStateListener(this);
            _currentDiscoveryAgent.startDiscovery(this.getContext());
        } catch (DiscoveryException e) {
            Log.e(TAG, "Could not start discovery. Reason: " + e.getMessage());
            e.printStackTrace();
        }
    }
    @Override
    public void handleRobotsAvailable(List<Robot> robots) {
        if (_currentDiscoveryAgent instanceof DiscoveryAgentClassic) {
            _currentDiscoveryAgent.connect(robots.get(0));
        }
    }

    @Override
    public void handleRobotChangedState(Robot robot, RobotChangedStateListener.RobotChangedStateNotificationType type) {
        switch (type) {
            case Online:
                _currentDiscoveryAgent.stopDiscovery();
                _currentDiscoveryAgent.removeDiscoveryListener(this);
                _connectedRobot = new Sphero(robot);
                _connectedRobot.setLed(0f, 1f, 0f);
                    Log.d("SPHERO", "ONLINELINEDFNKBGIROFGBRIEFF");

                    _connectedRobot.enableCollisions(true);

                try {
                    Log.d("SOCKET", "Trying to create socket");

                    mSocket = IO.socket("http://192.168.1.69:3000/");
                    //mSocket.emit("spheroId", spheroId);
                    mSocket.connect();
                    Log.d("SPHERO ID", _connectedRobot.getRobot().getName());
                    mSocket.emit("spheroId", _connectedRobot.getRobot().getName());
                } catch (URISyntaxException e) {
                    e.printStackTrace();
                }
                    connectSpheroButton.setText(_connectedRobot.getRobot().getName() + "\n connected");
                    connectSpheroButton.setEnabled(false);
                    checkBoxSPHERO.setChecked(true);
                    letsgoButton.setEnabled(true);


                break;
            case Disconnected:
                Log.d("DISCONNECT", "event disconnect");
                //startDiscovery();
                break;
            default:
                Log.v(TAG, "Not handling state change notification: " + type);
                break;
        }
    }

    private DeviceListener mListener = new AbstractDeviceListener() {
        @Override
        public void onConnect(Myo myo, long timestamp) {
            Toast.makeText(getContext(), "Myo Connected!", Toast.LENGTH_SHORT).show();
            connectMyoButton.setText(myo.getName() + "\n connected");
            connectMyoButton.setEnabled(false);
            checkBoxMYO.setChecked(true);
            letsgoButton.setEnabled(true);
            Log.d("MYO","co");
        }

        @Override
        public void onDisconnect(Myo myo, long timestamp) {
            Toast.makeText(getContext(), "Myo Disconnected!", Toast.LENGTH_SHORT).show();
            Log.d("MYO", "disco");
            connectMyoButton.setText("Connect MYO");
            checkBoxMYO.setChecked(false);


        }
    };
}
