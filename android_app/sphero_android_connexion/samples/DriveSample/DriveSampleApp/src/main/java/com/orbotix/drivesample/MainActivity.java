package com.orbotix.drivesample;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;

import com.github.nkzawa.emitter.Emitter;
import com.github.nkzawa.socketio.client.IO;
import com.github.nkzawa.socketio.client.Socket;
import com.orbotix.ConvenienceRobot;
import com.orbotix.Sphero;
import com.orbotix.calibration.api.CalibrationEventListener;
import com.orbotix.calibration.api.CalibrationImageButtonView;
import com.orbotix.calibration.api.CalibrationView;
import com.orbotix.classic.DiscoveryAgentClassic;
import com.orbotix.colorpicker.api.ColorPickerEventListener;
import com.orbotix.colorpicker.api.ColorPickerFragment;
import com.orbotix.common.DiscoveryAgentEventListener;
import com.orbotix.common.ResponseListener;
import com.orbotix.common.Robot;
import com.orbotix.common.RobotChangedStateListener;
import com.orbotix.common.internal.AsyncMessage;
import com.orbotix.common.internal.DeviceResponse;
import com.orbotix.joystick.api.JoystickEventListener;
import com.orbotix.joystick.api.JoystickView;
import com.orbotix.le.DiscoveryAgentLE;
import com.orbotix.robotpicker.RobotPickerDialog;

import java.net.URISyntaxException;
import java.util.List;

public class MainActivity extends Activity implements Connexion.RobotPickerListener{


    private static final String TAG = "MainActivity";

    private JoystickView _joystick;

    private ConvenienceRobot _connectedRobot;

    private CalibrationView _calibrationView;

    private CalibrationImageButtonView _calibrationButtonView;

    private ColorPickerFragment _colorPicker;

    private Socket mSocket;

    private String spheroId;
    private Connexion co;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.main);


        setupJoystick();
        setupCalibration();
        setupColorPicker();

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
        if (co == null) {
            co = new Connexion(this, this);
        }
        // Show the picker only if it's not showing. This keeps multiple calls to onStart from showing too many pickers.
        if (!co.isShowing()) {
            co.show();
        }

    }

    @Override
    protected void onPause() {  super.onPause();    }

    @Override
    public void onResume() {    super.onResume();   }

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
                _connectedRobot.drive((float) angle, (float) distanceFromCenter);
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
    public void onRobotPicked(ConvenienceRobot robotPicked, Socket socket) {
        co.dismiss();
        _connectedRobot = robotPicked;
        mSocket = socket;

        Log.d("ROBOT NAME", ""+_connectedRobot.getRobot().getName());
        Log.d("ROBOT NAME", ""+_connectedRobot.getRobot().isConnected());

        _joystick.setEnabled(true);
        _calibrationView.setEnabled(true);
        _calibrationButtonView.setEnabled(true);
    }
}
