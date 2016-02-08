package com.orbotix.drivesample;

import android.app.ActionBar;
import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

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
import com.thalmic.myo.AbstractDeviceListener;
import com.thalmic.myo.DeviceListener;
import com.thalmic.myo.Hub;
import com.thalmic.myo.Myo;
import com.thalmic.myo.Pose;
import com.thalmic.myo.Quaternion;
import com.thalmic.myo.Vector3;
import com.thalmic.myo.XDirection;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLConnection;
import java.util.List;

public class MainActivity extends Activity implements Connexion.RobotPickerListener{


    private static final String TAG = "MainActivity";

    private JoystickView _joystick;

    private ConvenienceRobot _connectedRobot;

    private CalibrationView _calibrationView;

    private CalibrationImageButtonView _calibrationButtonView;

    private ColorPickerFragment _colorPicker;

    private Socket mSocket;

    private Connexion co;
    private Hub hub;

    private  ActionBar actionBar;

    double  myo_x, myo_y;

    private Button powerButton;
    private boolean powerAvailable;

    private Player player;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        actionBar= getActionBar();
        actionBar.hide();

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




        //TODO remove this socket init
        try {
            mSocket = IO.socket("http://192.168.1.69:3000/");
        } catch (URISyntaxException e) {
            e.printStackTrace();
        }
        mSocket.connect();
        mSocket.on("player:register", onNewMessage);






        powerButton = (Button)findViewById(R.id.powerButton);
        powerButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                registerPlayerSocket();
            }
        });

        powerAvailable = false;

        if (co == null) {
            co = new Connexion(this, this);
        }
        // Show the picker only if it's not showing. This keeps multiple calls to onStart from showing too many pickers.
        if (!co.isShowing()) {
            co.show();
        }
    }

    @Override
    protected void onStart() {
        super.onStart();
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

                }
            });
        }
    };

    public Double max = 0.0;

    public void sendToSphero(Double x,Double y){
        if (x > max) max = x;
        //Log.d("AVANT MODIF","x="+(x*(signe >= 0 ? 1 : -1))+"\ty="+y + "\tmax="+  max);

        //x = 360 * (1 - x) * (signe >= 0 ? 1 : -1);
        x = _joystick.mJoystickPadCenterX * x ;

        y= - y * _joystick.mJoystickPadCenterY;

      //  y *= -1;

        x += _joystick.mJoystickPadCenterX;
        y += _joystick.mJoystickPadCenterY;


       //Log.d("APRES MODIF","x="+x+" y="+y);

        //Log.d("Receiving", "x: " + x + "y: " + y);

        if (!_calibrationView.isCalibrating() ) {
            if ((x > _joystick.mJoystickPadCenterX - _joystick.margin_X && x < _joystick.mJoystickPadCenterX + _joystick.margin_X) && (y > _joystick.mJoystickPadCenterY - _joystick.margin_Y && y < _joystick.mJoystickPadCenterY + _joystick.margin_Y)) {

            } else {
                if (x > _joystick.mJoystickPadCenterX - _joystick.margin_X && x < _joystick.mJoystickPadCenterX + _joystick.margin_X) x = _joystick.mJoystickPadCenterX;
                if (y > _joystick.mJoystickPadCenterY - _joystick.margin_Y && y < _joystick.mJoystickPadCenterY + _joystick.margin_Y) y = _joystick.mJoystickPadCenterY;
                _joystick.sendDataToMyo(x, y);
            }
        }
    }
    @Override
    public void onRobotPicked(ConvenienceRobot robotPicked, Hub myohub, Socket socket) {
        co.dismiss();
        _connectedRobot = robotPicked;
        mSocket = socket;
        hub = myohub;
        hub.addListener(mListener);
        Log.d("WHAT ", ""+hub.getConnectedDevices().get(0).getName());
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
        Log.d("ROBOT NAME", "" + _connectedRobot.getRobot().getName());
        Log.d("ROBOT NAME", "" + _connectedRobot.getRobot().isConnected());

        mSocket.on("command", onNewMessage);
        Log.d("socket okay ?", ""+mSocket.connected());
        _joystick.setEnabled(true);
        _calibrationView.setEnabled(true);
        _calibrationButtonView.setEnabled(true);
    }

    private DeviceListener mListener = new AbstractDeviceListener() {
        @Override
        public void onConnect(Myo myo, long timestamp) {
            Toast.makeText(getApplicationContext(), "Myo Connected!", Toast.LENGTH_SHORT).show();

            Log.d("MYO","co");
        }

        @Override
        public void onDisconnect(Myo myo, long timestamp) {
            Toast.makeText(getApplicationContext(), "Myo Disconnected!", Toast.LENGTH_SHORT).show();
            Log.d("MYO", "disco");
        }
        @Override
        public void onOrientationData(Myo myo, long timestamp, Quaternion rotation) {
            // Calculate Euler angles (roll, pitch, and yaw) from the quaternion.
            float roll = (float) Math.toDegrees(Quaternion.roll(rotation));
            float pitch = (float) Math.toDegrees(Quaternion.pitch(rotation));
            float yaw = (float) Math.toDegrees(Quaternion.yaw(rotation));
            // Adjust roll and pitch for the orientation of the Myo on the arm.
            if (myo.getXDirection() == XDirection.TOWARD_ELBOW) {
                roll *= -1;
                pitch *= -1;
            }
            //Log.d("ORIENTATION MTFCKR", "roll: " + roll + " pitch: " + pitch + " yaw: " + yaw);
            // Next, we apply a rotation to the text view using the roll, pitch, and yaw.

        }
        @Override
        public void onGyroscopeData (Myo myo, long timestamp, Vector3 gyro){

        }
        @Override
        public void onAccelerometerData (Myo myo, long timestamp, Vector3 accel){
            myo_x = accel.y();
            myo_y = accel.x();
            Log.d("ACCEL Y", "" + myo_x);
            sendToSphero(myo_x, myo_y);
        }

        @Override
        public void onPose(Myo myo, long timestamp, Pose pose) {
            Toast.makeText(getApplicationContext(), "Pose: " + pose, Toast.LENGTH_SHORT).show();
            Log.d("MYO", "pose");
            switch (pose) {
                case UNKNOWN:
                case REST:
                case DOUBLE_TAP:
                case FIST:
                case WAVE_IN:
                case WAVE_OUT:
                case FINGERS_SPREAD:
                    //send pouvoir action
                    mSocket.emit("usePower");
                    break;
            }
            if (pose != Pose.UNKNOWN && pose != Pose.REST) {
                // Tell the Myo to stay unlocked until told otherwise. We do that here so you can
                // hold the poses without the Myo becoming locked.
                myo.unlock(Myo.UnlockType.HOLD);
                // Notify the Myo that the pose has resulted in an action, in this case changing
                // the text on the screen. The Myo will vibrate.
                myo.notifyUserAction();
            } else {
                // Tell the Myo to stay unlocked only for a short period. This allows the Myo to
                // stay unlocked while poses are being performed, but lock after inactivity.
                myo.unlock(Myo.UnlockType.TIMED);
            }
            //TODO: Do something awesome.
        }
    };
    public void callPostAjax(String damnQuery, String uri){
        MainActivity.this.runOnUiThread(new AjaxRunnable(uri, damnQuery));
    }
    public void registerPlayer(){
        this.callPostAjax("", "/players");
    }
    public void registerPlayerSocket(){
        Log.d("Try to get player", "try to get player");
        Log.d("socket connected", "" + mSocket.connected());

        mSocket.emit("player:register");
    }


}
