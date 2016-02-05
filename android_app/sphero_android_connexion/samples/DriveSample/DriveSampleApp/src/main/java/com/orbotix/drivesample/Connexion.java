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
import android.view.WindowManager;
import android.widget.Button;

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

import java.net.URISyntaxException;
import java.util.List;

/**
 * An example full-screen activity that shows and hides the system UI (i.e.
 * status bar and navigation/system bar) with user interaction.
 */
public class Connexion extends Dialog implements DiscoveryAgentEventListener , RobotChangedStateListener{
    public interface RobotPickerListener{
        public void onRobotPicked(ConvenienceRobot robotPicked, Socket socket);
    }

    private static final String TAG = "Connexion View";

    private DiscoveryAgent _currentDiscoveryAgent;

    private ConvenienceRobot _connectedRobot;
    private Socket mSocket;
    RobotPickerListener _pickerListener;

    public Connexion(Context context, RobotPickerListener pickerListener) {
        super(context);
        this._pickerListener = pickerListener;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        _currentDiscoveryAgent = DiscoveryAgentClassic.getInstance();

        setContentView(R.layout.activity_connexion);
        WindowManager.LayoutParams params = getWindow().getAttributes();
        params.height = WindowManager.LayoutParams.FILL_PARENT;
        params.width = WindowManager.LayoutParams.FILL_PARENT;
        getWindow().setAttributes(params);


        final Button connectSpheroButton = (Button) findViewById(R.id.connectSpheroButton);
        connectSpheroButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Log.d("DISCO", "starting discovery");
                startDiscovery();
            }
        });

        final Button connectMyoButton = (Button) findViewById(R.id.connectMyoButton);
        connectMyoButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                //Intent intent = new Intent(Connexion.this, Connexion.class);
               // startActivity(intent);
            }
        });

        final Button letsgoButton = (Button) findViewById(R.id.buttonLetsGo);
        letsgoButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                //dismiss dialog
                if(_pickerListener != null) _pickerListener.onRobotPicked(_connectedRobot, mSocket);
            }
        });
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
                try {
                    Log.d("SPHERO", "ONLINELINEDFNKBGIROFGBRIEFF");

                    _connectedRobot.enableCollisions(true);
                    _connectedRobot.addResponseListener(new ResponseListener() {
                        @Override
                        public void handleResponse(DeviceResponse deviceResponse, Robot robot) {

                        }

                        @Override
                        public void handleStringResponse(String s, Robot robot) {

                        }

                        @Override
                        public void handleAsyncMessage(AsyncMessage asyncMessage, Robot robot) {
                            _connectedRobot.setLed(1, 0, 0);
                            Log.d("collision", "collision");
                            mSocket.emit("collision");
                            _connectedRobot.setLed(0, 1, 0);

                        }
                    });
                    Log.d("SOCKET", "Trying to create socket");

                    mSocket = IO.socket("http://134.59.215.166:3000/");
                    //mSocket.emit("spheroId", spheroId);
                    mSocket.connect();
                    //mSocket.on('connection')
                    Log.d("SPHERO ID", _connectedRobot.getRobot().getName());
                    mSocket.emit("spheroId", _connectedRobot.getRobot().getName());


                } catch (URISyntaxException e) {
                    Log.d("ERROR SOCKET", e.getMessage());
                }

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

}
