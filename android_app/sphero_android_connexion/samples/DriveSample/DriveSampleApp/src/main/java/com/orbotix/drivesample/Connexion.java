package com.orbotix.drivesample;

import android.annotation.SuppressLint;
import android.app.ActionBar;
import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;
import android.view.MenuItem;
import android.support.v4.app.NavUtils;
import android.widget.Button;

import com.github.nkzawa.socketio.client.IO;
import com.github.nkzawa.socketio.client.Socket;
import com.orbotix.ConvenienceRobot;
import com.orbotix.Ollie;
import com.orbotix.Sphero;
import com.orbotix.classic.DiscoveryAgentClassic;
import com.orbotix.classic.RobotClassic;
import com.orbotix.common.DiscoveryAgent;
import com.orbotix.common.DiscoveryAgentEventListener;
import com.orbotix.common.DiscoveryException;
import com.orbotix.common.ResponseListener;
import com.orbotix.common.Robot;
import com.orbotix.common.RobotChangedStateListener;
import com.orbotix.common.internal.AsyncMessage;
import com.orbotix.common.internal.DeviceResponse;
import com.orbotix.le.DiscoveryAgentLE;
import com.orbotix.le.RobotLE;
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

    private ConvenienceRobot _connectedRobot;
    private Socket mSocket;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        //hide the actionbar
        ActionBar actionBar = getActionBar();
        actionBar.hide();

        setContentView(R.layout.activity_connexion);

        final Button connectSpheroButton = (Button) findViewById(R.id.connectSpheroButton);
        connectSpheroButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(Connexion.this, Connexion.class);
                startActivity(intent);
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

    }

    @Override
    protected void onStart() {
        super.onStart();
        // Create a robot picker dialog, this allows the user to select which robot they would like to connect to.
        // We don't need to do this step if we know which robot we want to talk to, and don't need the user to
        // decide that.
        if (_robotPickerDialog == null) {
            _robotPickerDialog = new RobotPickerDialog(this, this);
        }
        // Show the picker only if it's not showing. This kmade by Lorc under CC BY 3.0

        if (!_robotPickerDialog.isShowing()) {
            _robotPickerDialog.show();
        }
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

    }

    public void connectMyo(){
        //launch the myo connection (proximity)
    }

    @Override
    public void handleRobotsAvailable(List<Robot> robots) {
        // Here we need to know which version of the discovery agent we are using, if we are to use Sphero, we need to
        // treat Spheros a little bit differently.
        if (_currentDiscoveryAgent instanceof DiscoveryAgentClassic) {
            // If we are using the classic discovery agent, and therefore using Sphero, we'll just connect to the first
            // one available that we get. Note that "available" in classic means paired to the phone and turned on.
            _currentDiscoveryAgent.connect(robots.get(0));
        }
        else if (_currentDiscoveryAgent instanceof DiscoveryAgentLE) {
            // If we are using the LE discovery agent, and therefore using Ollie, there's not much we need to do here.
            // The SDK will automatically connect to the robot that you touch the phone to, and you will get a message
            // saying that the robot has connected.
            // Note that this method is called very frequently and will cause your app to slow down if you log.
        }
    }

    @Override
    public void handleRobotChangedState(Robot robot, RobotChangedStateNotificationType type) {
        // For the purpose of this sample, we'll only handle the connected and disconnected notifications
        switch (type) {
            // A robot was connected, and is ready for you to send commands to it.
            case Online:
                // When a robot is connected, this is a good time to stop discovery. Discovery takes a lot of system
                // resources, and if left running, will cause your app to eat the user's battery up, and may cause
                // your application to run slowly. To do this, use DiscoveryAgent#stopDiscovery().
                _currentDiscoveryAgent.stopDiscovery();
                // It is also proper form to not allow yourself to re-register for the discovery listeners, so let's
                // unregister for the available notifications here using DiscoveryAgent#removeDiscoveryListener().
                _currentDiscoveryAgent.removeDiscoveryListener(this);
                // Depending on what was connected, you might want to create a wrapper that allows you to do some
                // common functionality related to the individual robots. You can always of course use the
                // Robot#sendCommand() method, but Ollie#drive() reads a bit better.
                if (robot instanceof RobotLE) {
                    _connectedRobot = new Ollie(robot);
                }
                else if (robot instanceof RobotClassic) {
                    _connectedRobot = new Sphero(robot);
                    try {
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
                                _connectedRobot.setLed(0,1,0);

                            }
                        });
                        mSocket = IO.socket("http://134.59.215.166:3000/");
                        //mSocket.emit("spheroId", spheroId);
                        mSocket.connect();
                        //mSocket.on('connection')
                        Log.d("SPHERO ID", _connectedRobot.getRobot().getName());
                        mSocket.emit("spheroId", _connectedRobot.getRobot().getName());

                    } catch (URISyntaxException e) {
                        Log.d("ERROR SOCKET", e.getMessage());
                    }


                }

                // Finally for visual feedback let's turn the robot green saying that it's been connected
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
        // Dismiss the robot picker so that the user doesn't keep clicking it and trying to start
        // discovery multiple times
        _robotPickerDialog.dismiss();
        switch (robotPicked) {
            // If the user picked a Sphero, you want to start the Bluetooth Classic discovery agent, as that is the
            // protocol that Sphero talks over. This will allow us to find a Sphero and connect to it.
            case Sphero:
                // To get to the classic discovery agent, you use DiscoveryAgentClassic.getInstance()
                _currentDiscoveryAgent = DiscoveryAgentClassic.getInstance();
                break;
            // If the user picked an Ollie, you want to start the Bluetooth LE discovery agent, as that is the protocol
            // that Ollie talks over. This will allow you to find an Ollie and connect to it.
            case Ollie:
                // To get to the LE discovery agent, you use DiscoveryAgentLE.getInstance()
                _currentDiscoveryAgent = DiscoveryAgentLE.getInstance();
                break;
        }

        // Now that we have a discovery agent, we will start discovery on it using the method defined below
        startDiscovery();
    }

    /*
    *
        To pass:
                intent.putExtra("MyClass", obj);
        // To retrieve object in second Activity
        getIntent().getSerializableExtra("MyClass");
    *
    * */
    private void startDiscovery() {
        try {
            // You first need to set up so that the discovery agent will notify you when it finds robots.
            // To do this, you need to implement the DiscoveryAgentEventListener interface (or declare
            // it anonymously) and then register it on the discovery agent with DiscoveryAgent#addDiscoveryListener()
            _currentDiscoveryAgent.addDiscoveryListener(this);
            // Second, you need to make sure that you are notified when a robot changes state. To do this,
            // implement RobotChangedStateListener (or declare it anonymously) and use
            // DiscoveryAgent#addRobotStateListener()
            _currentDiscoveryAgent.addRobotStateListener(this);
            // Then to start looking for a Sphero, you use DiscoveryAgent#startDiscovery()
            // You do need to handle the discovery exception. This can occur in cases where the user has
            // Bluetooth off, or when the discovery cannot be started for some other reason.
            _currentDiscoveryAgent.startDiscovery(this);
        } catch (DiscoveryException e) {
            Log.e(TAG, "Could not start discovery. Reason: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
