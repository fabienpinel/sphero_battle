package com.orbotix.drivesample;

import android.app.Activity;
import android.app.FragmentTransaction;
import android.os.Bundle;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;
import android.widget.Button;
import android.widget.CompoundButton;
import android.widget.LinearLayout;
import android.widget.Switch;
import com.orbotix.ConvenienceRobot;
import com.orbotix.Ollie;
import com.orbotix.Sphero;
import com.orbotix.calibration.api.CalibrationEventListener;
import com.orbotix.calibration.api.CalibrationImageButtonView;
import com.orbotix.calibration.api.CalibrationView;
import com.orbotix.classic.DiscoveryAgentClassic;
import com.orbotix.classic.RobotClassic;
import com.orbotix.colorpicker.api.ColorPickerEventListener;
import com.orbotix.colorpicker.api.ColorPickerFragment;
import com.orbotix.common.*;
import com.orbotix.common.internal.AsyncMessage;
import com.orbotix.common.internal.DeviceResponse;
import com.orbotix.joystick.api.JoystickEventListener;
import com.orbotix.joystick.api.JoystickView;
import com.orbotix.le.DiscoveryAgentLE;
import com.orbotix.le.RobotLE;
import com.orbotix.robotpicker.RobotPickerDialog;
import com.github.nkzawa.emitter.Emitter;
import java.net.URISyntaxException;
import java.util.List;
import com.github.nkzawa.socketio.client.IO;
import com.github.nkzawa.socketio.client.Socket;

import org.json.JSONException;
import org.json.JSONObject;

public class MainActivity extends Activity implements RobotPickerDialog.RobotPickerListener,
                                                      DiscoveryAgentEventListener,
                                                      RobotChangedStateListener {

    private static final String TAG = "MainActivity";

    /**
     * Our current discovery agent that we will use to find robots of a certain protocol
     */
    private DiscoveryAgent _currentDiscoveryAgent;

    /**
     * The dialog that will allow the user to chose which type of robot to connect to
     */
    private RobotPickerDialog _robotPickerDialog;

    /**
     * The joystick that we will use to send roll commands to the robot
     */
    private JoystickView _joystick;

    /**
     * The connected robot
     */
    private ConvenienceRobot _connectedRobot;

    /**
     * The calibration view, used for setting the default heading of the robot
     */
    private CalibrationView _calibrationView;

    /**
     * A button used for one finger calibration
     */
    private CalibrationImageButtonView _calibrationButtonView;

    /**
     * The fragment to show that contains the color picker
     */
    private ColorPickerFragment _colorPicker;

    /**
     * The button used to bring up the color picker
     */
    private Button _colorPickerButton;

    /**
     * The button to set developer mode
     */
    private Switch _developerModeSwitch;

    /**
     * Reference to the layout containing the developer mode switch and label
     */
    private LinearLayout _developerModeLayout;

    private Socket mSocket;
    private String spheroId;


    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);

        setupJoystick();
        setupCalibration();
        setupColorPicker();



        // Here, you need to route all the touch events to the joystick and calibration view so that they know about
        // them. To do this, you need a way to reference the view (in this case, the id "entire_view") and attach
        // an onTouchListener which in this case is declared anonymously and invokes the
        // Controller#interpretMotionEvent() method on the joystick and the calibration view.
        findViewById(R.id.entire_view).setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View v, MotionEvent event) {
                _joystick.interpretMotionEvent(event);
                _calibrationView.interpretMotionEvent(event);
                return true;
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
        // Show the picker only if it's not showing. This keeps multiple calls to onStart from showing too many pickers.
        if (!_robotPickerDialog.isShowing()) {
            _robotPickerDialog.show();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();

    }

    /**
     * Invoked when the user makes a selection on which robot they would like to use.
     * @param robotPicked The type of the robot that was selected
     */
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

    /**
     * Invoked when the discovery agent finds a new available robot, or updates and already available robot
     * @param robots The list of all robots, connected or not, known to the discovery agent currently
     */
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

    /**
     * Invoked when a robot changes state. For example, when a robot connects or disconnects.
     * @param robot The robot whose state changed
     * @param type Describes what changed in the state
     */
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
                // Don't forget to turn on UI elements
                _joystick.setEnabled(true);
                _calibrationView.setEnabled(true);
                _colorPickerButton.setEnabled(true);
                _calibrationButtonView.setEnabled(true);

                // Depending on what was connected, you might want to create a wrapper that allows you to do some
                // common functionality related to the individual robots. You can always of course use the
                // Robot#sendCommand() method, but Ollie#drive() reads a bit better.
                if (robot instanceof RobotLE) {
                    _connectedRobot = new Ollie(robot);

                    // Ollie has a developer mode that will allow a developer to poke at Bluetooth LE data manually
                    // without being disconnected. Here we set up the button to be able to enable or disable
                    // developer mode on the robot.
                    setupDeveloperModeButton();
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
                        mSocket.on("command", onNewMessage);
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
                // When a robot disconnects, it is a good idea to disable UI elements that send commands so that you
                // do not have to handle the user continuing to use them while the robot is not connected
                _joystick.setEnabled(false);
                _calibrationView.setEnabled(false);
                _colorPickerButton.setEnabled(false);
                _calibrationButtonView.setEnabled(false);

                // Disable the developer mode button when the robot disconnects so that it can be set up if a LE robot
                // connectes again
                if (robot instanceof RobotLE && _developerModeLayout != null) {
                    _developerModeLayout.setVisibility(View.INVISIBLE);
                }

                // When a robot disconnects, you might want to start discovery so that you can reconnect to a robot.
                // Starting discovery on disconnect however can cause unintended side effects like connecting to
                // a robot with the application closed. You should think carefully of when to start and stop discovery.
                // In this case, we will not start discovery when the robot disconnects. You can uncomment the following line of
                // code to see the start discovery on disconnection in action.
//                startDiscovery();
                break;
            default:
                Log.v(TAG, "Not handling state change notification: " + type);
                break;
        }
    }

    /**
     * Sets up the joystick from scratch
     */
    private void setupJoystick() {
        // Get a reference to the joystick view so that we can use it to send roll commands
        _joystick = (JoystickView)findViewById(R.id.joystickView);
        // In order to get the events from the joystick, you need to implement the JoystickEventListener interface
        // (or declare it anonymously) and set the listener.
        _joystick.setJoystickEventListener(new JoystickEventListener() {
            /**
             * Invoked when the user starts touching on the joystick
             */
            @Override
            public void onJoystickBegan() {
                // Here you can do something when the user starts using the joystick.
            }

            /**
             * Invoked when the user moves their finger on the joystick
             * @param distanceFromCenter The distance from the center of the joystick that the user is touching from 0.0 to 1.0
             *                           where 0.0 is the exact center, and 1.0 is the very edge of the outer ring.
             * @param angle The angle from the top of the joystick that the user is touching.
             */
            @Override
            public void onJoystickMoved(double distanceFromCenter, double angle) {
                // Here you can use the joystick input to drive the connected robot. You can easily do this with the
                // ConvenienceRobot#drive() method
                // Note that the arguments do flip here from the order of parameters
                _connectedRobot.drive((float)angle, (float)distanceFromCenter);
            }

            /**
             * Invoked when the user stops touching the joystick
             */
            @Override
            public void onJoystickEnded() {
                // Here you can do something when the user stops touching the joystick. For example, we'll make it stop driving.
                _connectedRobot.stop();
            }
        });

        // It is also a good idea to disable the joystick when a robot is not connected so that you do not have to
        // handle the user using the joystick while there is no robot connected.
        _joystick.setEnabled(false);
    }

    /**
     * Sets up the calibration gesture and button
     */
    private void setupCalibration() {
        // Get the view from the xml file
        _calibrationView = (CalibrationView)findViewById(R.id.calibrationView);
        // Set the glow. You might want to not turn this on if you're using any intense graphical elements.
        _calibrationView.setShowGlow(true);
        // Register anonymously for the calibration events here. You could also have this class implement the interface
        // manually if you plan to do more with the callbacks.
        _calibrationView.setCalibrationEventListener(new CalibrationEventListener() {
            /**
             * Invoked when the user begins the calibration process.
             */
            @Override
            public void onCalibrationBegan() {
                // The easy way to set up the robot for calibration is to use ConvenienceRobot#calibrating(true)
                Log.v(TAG, "Calibration began!");
                _connectedRobot.calibrating(true);
            }

            /**
             * Invoked when the user moves the calibration ring
             * @param angle The angle that the robot has rotated to.
             */
            @Override
            public void onCalibrationChanged(float angle) {
                // The usual thing to do when calibration happens is to send a roll command with this new angle, a speed of 0
                // and the calibrate flag set.
                _connectedRobot.rotate(angle);
            }

            /**
             * Invoked when the user stops the calibration process
             */
            @Override
            public void onCalibrationEnded() {
                // This is where the calibration process is "committed". Here you want to tell the robot to stop as well as
                // stop the calibration process.
                _connectedRobot.stop();
                _connectedRobot.calibrating(false);
            }
        });
        // Like the joystick, turn this off until a robot connects.
        _calibrationView.setEnabled(false);

        // To set up the button, you need a calibration view. You get the button view, and then set it to the
        // calibration view that we just configured.
        _calibrationButtonView = (CalibrationImageButtonView) findViewById(R.id.calibrateButton);
        _calibrationButtonView.setCalibrationView(_calibrationView);
        _calibrationButtonView.setEnabled(false);
    }

    /**
     * Sets up a new color picker fragment from scratch
     */
    private void setupColorPicker() {
        // To start, make a color picker fragment
        _colorPicker = new ColorPickerFragment();
        // Make sure you register for the change events. You will want to send the result of the picker to the robot.
        _colorPicker.setColorPickerEventListener(new ColorPickerEventListener() {

            /**
             * Called when the user changes the color picker
             * @param red The selected red component
             * @param green The selected green component
             * @param blue The selected blue component
             */
            @Override
            public void onColorPickerChanged(int red, int green, int blue) {
                Log.v(TAG, String.format("%d, %d, %d", red, green, blue));
                _connectedRobot.setLed(red, green, blue);
            }
        });

        // Find the color picker fragment and add a click listener to show the color picker
        _colorPickerButton = (Button)findViewById(R.id.colorPickerButton);
        _colorPickerButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                FragmentTransaction transaction = getFragmentManager().beginTransaction();
                transaction.add(R.id.fragment_root, _colorPicker, "ColorPicker");
                transaction.show(_colorPicker);
                transaction.addToBackStack("DriveSample");
                transaction.commit();
            }
        });

    }

    private void setupDeveloperModeButton() {
        // Getting the developer mode button
        if (_developerModeLayout == null)
        {
            _developerModeSwitch = (Switch)findViewById(R.id.developerModeSwitch);
            _developerModeLayout = (LinearLayout)findViewById(R.id.developerModeLayout);

            _developerModeSwitch.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
                @Override
                public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                    // We need to get the raw robot, as setting developer mode is an advanced function, and is not
                    // available on the Ollie object.
                    ((RobotLE)_connectedRobot.getRobot()).setDeveloperMode(isChecked);
                }
            });
        }
        _developerModeLayout.setVisibility(View.VISIBLE);
    }

    /**
     * Starts discovery on the set discovery agent and look for robots
     */
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

    private void myoCommandReceived(int angle, int speed){
        Log.d("command reveived", "Angle: " + angle + " ,Speed: " + speed);
    }

    private Emitter.Listener onNewMessage = new Emitter.Listener() {
        @Override
        public void call(final Object... args) {
            Log.d("call socket ", "call socket onNewMessage" + args[0].toString());
                MainActivity.this.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        //JSONObject data = (JSONObject) args;
                        Double x;
                        Double y;

                        // x = Double.parseDouble(data.getString("x"));
                        //y = Double.parseDouble(data.getString("y"));
                        x = Double.parseDouble(args[0].toString());
                        y = Double.parseDouble(args[1].toString());

                        y *= -1;
                        x += 360;
                        y += 360;

                        Log.d("Receiving", "x: " + x + "y: " + y);
                        if (!_calibrationView.isCalibrating() ) {
                            _joystick.sendDataToMyo(x, y);

                        }


                        // add the message to view
                        //addMessage(username, message);
                    }
                });
        }
    };

    @Override
    public void onResume() {
        super.onResume();  // Always call the superclass method first
    }


}
