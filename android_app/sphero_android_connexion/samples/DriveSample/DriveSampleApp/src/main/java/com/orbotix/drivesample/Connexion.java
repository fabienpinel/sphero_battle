package com.orbotix.drivesample;

import android.app.ActionBar;
import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;

import com.github.nkzawa.socketio.client.IO;
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
public class Connexion extends Activity implements RobotPickerDialog.RobotPickerListener, DiscoveryAgentEventListener, RobotChangedStateListener {

    private static final String TAG = "Connexion View";

    private DiscoveryAgent _currentDiscoveryAgent;
    private RobotPickerDialog _robotPickerDialog;

    private Robby robby;
    private ConvenienceRobot _connectedRobot;
    private CustomSocket mSocket;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        robby = new Robby();
        _connectedRobot = robby.robot;
        //hide the actionbar
        ActionBar actionBar = getActionBar();
        actionBar.hide();

        _currentDiscoveryAgent = DiscoveryAgentClassic.getInstance();

        setContentView(R.layout.activity_connexion);

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
                Intent intent = new Intent(Connexion.this, Connexion.class);
                startActivity(intent);
            }
        });

        final Button letsgoButton = (Button) findViewById(R.id.buttonLetsGo);
        letsgoButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(Connexion.this, MainActivity.class);
                intent.putExtra("theConnectedRobot", robby);
                intent.putExtra("theSocketConnection", mSocket);
                startActivity(intent);
            }
        });
    }

    @Override
    protected void onStart() {
        super.onStart();

    }

    @Override
    protected void onPause() { super.onPause();}

    @Override
    public void onResume() {
        super.onResume();  // Always call the superclass method first
    }

    @Override
    protected void onPostCreate(Bundle savedInstanceState) {
        super.onPostCreate(savedInstanceState);
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

    @Override
    public void handleRobotsAvailable(List<Robot> robots) {
        if (_currentDiscoveryAgent instanceof DiscoveryAgentClassic) {
            _currentDiscoveryAgent.connect(robots.get(0));
        }
        else if (_currentDiscoveryAgent instanceof DiscoveryAgentLE) {
        }
    }

    @Override
    public void handleRobotChangedState(Robot robot, RobotChangedStateNotificationType type) {
        switch (type) {
            case Online:
                _currentDiscoveryAgent.stopDiscovery();
                _currentDiscoveryAgent.removeDiscoveryListener(this);
                _connectedRobot = new Sphero(robot);
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

                    mSocket = (CustomSocket)IO.socket("http://134.59.215.166:3000/");
                    //mSocket.emit("spheroId", spheroId);
                    mSocket.connect();
                    //mSocket.on('connection')
                    Log.d("SPHERO ID", _connectedRobot.getRobot().getName());
                    mSocket.emit("spheroId", _connectedRobot.getRobot().getName());

                } catch (URISyntaxException e) {
                    Log.d("ERROR SOCKET", e.getMessage());
                }
                _connectedRobot.setLed(0f, 1f, 0f);
                break;
            case Disconnected:
                startDiscovery();
                break;
            default:
                Log.v(TAG, "Not handling state change notification: " + type);
                break;
        }
    }

    @Override
    public void onRobotPicked(RobotPickerDialog.RobotPicked robotPicked) {
        _robotPickerDialog.dismiss();
        switch (robotPicked) {
            case Sphero:
                _currentDiscoveryAgent = DiscoveryAgentClassic.getInstance();
                Log.d("SPHERO", "We have a sphero");
                break;
            case Ollie:
                _currentDiscoveryAgent = DiscoveryAgentLE.getInstance();
                break;
        }
        startDiscovery();
    }

    private void startDiscovery() {
        try {
            _currentDiscoveryAgent.addDiscoveryListener(this);
            _currentDiscoveryAgent.addRobotStateListener(this);
            _currentDiscoveryAgent.startDiscovery(this);
        } catch (DiscoveryException e) {
            Log.e(TAG, "Could not start discovery. Reason: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
