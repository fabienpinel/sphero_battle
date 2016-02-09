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

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLConnection;
import java.util.List;

public class MainActivity extends Activity implements Connexion.RobotPickerListener {

    private static final String TAG = "MainActivity";

    private JoystickView _joystick;

    private ConvenienceRobot _connectedRobot;

    private CalibrationView _calibrationView;

    private CalibrationImageButtonView _calibrationButtonView;

    private ColorPickerFragment _colorPicker;

    private Socket mSocket;

    private Connexion co;
    private Hub hub;

    private ActionBar actionBar;

    double myo_x, myo_y;

    private Button powerButton;

    private Player player;

    long lastTimeUsedPower;

    JSONArray allThePlayers;
    public static final float ORANGE = (float)(165.0/255.0);

    public boolean immunity, control_reversal,slow_down;
    boolean stopTheBall;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        lastTimeUsedPower = 0;
        allThePlayers = new JSONArray();
        actionBar = getActionBar();
        actionBar.hide();

        immunity = false;
        control_reversal = false;
        slow_down = false;

        stopTheBall = true;
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

        powerButton = (Button) findViewById(R.id.powerButton);
        powerButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                usePower();
            }
        });
        powerButton.setEnabled(false);

        Button replay = (Button) findViewById(R.id.replay);
        replay.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (!co.isShowing()) {
                    co.show();
                }
            }
        });




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
    protected void onPause() {
        super.onPause();
    }

    @Override
    public void onResume() {
        super.onResume();
    }


    /**
     * Sets up the joystick from scratch
     */
    private void setupJoystick() {
        // Get a reference to the joystick view so that we can use it to send roll commands
        _joystick = (JoystickView) findViewById(R.id.joystickView);
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
                if(!stopTheBall){
                    _connectedRobot.drive((float) angle, (float) distanceFromCenter);
                }
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
        _calibrationView = (CalibrationView) findViewById(R.id.calibrationView);
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

    private void myoCommandReceived(int angle, int speed) {
        Log.d("command reveived", "Angle: " + angle + " ,Speed: " + speed);
    }

    private Emitter.Listener newPlayer = new Emitter.Listener() {

        @Override
        public void call(final Object... args) {
            MainActivity.this.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    /*
                    * {"status":"success","player":"{\"id\":\"ikedwkra\",\"life\":100,\"name\":\"Player 1\",\"power\":0,\"spell\":\"SLOW_DOWN\",\"voteForSlowDown\":[],\"voteForControlReversal\":[],\"voteForHeal\":[],\"voteForImmunity\":[]}"}
02-08 20:41:21.866 8674-8674/com.orbotix.drivesample D/JSON DATA: {"status":"success","player":"{\"id\":\"ikedwkra\",\"life\":100,\"name\":\"Player 1\",\"power\":0,\"spell\":\"SLOW_DOWN\",\"voteForSlowDown\":[],\"voteForControlReversal\":[],\"voteForHeal\":[],\"voteForImmunity\":[]}"}
                    *
                    * */

                    try {
                        JSONObject data = (JSONObject) args[0];
                        JSONObject playerjson;
                        if (data.get("status").equals("success")) {
                            playerjson = (JSONObject) data.get("player");
                            player = new Player((String) playerjson.get("id"), (String) playerjson.get("name"));
                            if(player.getColor().equals("blue")){
                                _connectedRobot.setLed(0, 0, 1);
                            }else{
                                _connectedRobot.setLed(1, ORANGE, 0);
                           }
                        } else {
                            //displayToast("Problème de connexion");
                        }
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }

                }
            });
        }
    };

    private Emitter.Listener onDataChange = new Emitter.Listener() {

        @Override
        public void call(final Object... args) {
            MainActivity.this.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        JSONArray data = (JSONArray)(((JSONObject)args[0]).get("players"));

                        allThePlayers = data;
                        for (int i = 0; i < data.length(); i++) {
                            if ( player != null && data.getJSONObject(i).get("id").equals(player.getId())) {
                                //Log.d("datachange",""+data.getJSONObject(i));
                                //Log.d("datachange","power: "+(int) data.getJSONObject(i).get("power"));
                                if ((int) data.getJSONObject(i).get("power") >= 20 && (System.currentTimeMillis() - lastTimeUsedPower >= 3000)) {
                                    powerButton.setEnabled(true);
                                }
                            }else {
                            }
                        }
                    } catch (JSONException e1) {
                        e1.printStackTrace();
                    }
                }
            });
        }
    };
    private Emitter.Listener castIsReady = new Emitter.Listener() {

        @Override
        public void call(final Object... args) {
            MainActivity.this.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        Log.d("CastIsReady", "CastIsReady");
                        for (int i = 0; i < allThePlayers.length(); i++) {
                            if (player != null && allThePlayers.getJSONObject(i).get("id").equals(player.getId())) {
                                if ((int) allThePlayers.getJSONObject(i).get("power") >= 20) {
                                    powerButton.setEnabled(true);
                                }
                            }
                        }
                    } catch (JSONException e1) {
                        e1.printStackTrace();
                    }
                }
            });
        }
    };

    private Emitter.Listener onCast = new Emitter.Listener() {

        @Override
        public void call(final Object... args) {
            MainActivity.this.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    JSONObject data = (JSONObject) args[0];
                    try {
                        if(((String)data.get("playerId")).equals(player.getId())){
                            if(((String)data.get("spellType")).equals("IMMUNITY")){
                                immunity = true;
                            }
                        }else{
                            if(((String)data.get("spellType")).equals("SLOW_DOWN")){
                                slow_down=true;
                            }else if(((String)data.get("spellType")).equals("CONTROL_REVERSAL")){
                                control_reversal = true;
                            }

                        }
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                }
            });
        }
    };

    private Emitter.Listener onCastCancel = new Emitter.Listener() {

        @Override
        public void call(final Object... args) {
            MainActivity.this.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    JSONObject data = (JSONObject) args[0];
                    try {
                        if (((String) data.get("playerId")).equals(player.getId())) {
                            if (((String) data.get("spellType")).equals("IMMUNITY")) {
                                immunity = false;
                            }
                        } else {
                            if (((String) data.get("spellType")).equals("SLOW_DOWN")) {
                                slow_down = false;
                            } else if (((String) data.get("spellType")).equals("CONTROL_REVERSAL")) {
                                control_reversal = false;
                            }

                        }
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                }
            });
        }
    };
    private Emitter.Listener onEnd = new Emitter.Listener() {

        @Override
        public void call(final Object... args) {
            MainActivity.this.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        JSONArray data = (JSONArray)args[0];
                        allThePlayers = data;
                        int myScore = 0;
                        int hisScore = 0;
                        for (int i = 0; i < data.length(); i++) {
                            if ( player != null && data.getJSONObject(i).get("id").equals(player.getId())) {
                                myScore = (int)data.getJSONObject(i).get("life");
                            }else {
                                hisScore =  (int)data.getJSONObject(i).get("life");
                            }
                        }
                        if(myScore <= hisScore){
                            //red
                            _connectedRobot.setLed(1, 0, 0);
                        }else{
                            //green
                            _connectedRobot.setLed(0, 1, 0);
                        }
                        //stop the ball
                        stopTheBall  =true;
                    } catch (JSONException e1) {
                        e1.printStackTrace();
                    }
                }
            });
        }
    };

    private Emitter.Listener onStart = new Emitter.Listener() {

        @Override
        public void call(final Object... args) {
            MainActivity.this.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    //start the ball
                    stopTheBall = false;
                }
            });
        }
    };




    public void sendToSphero(Double x, Double y) {
        if(stopTheBall){
            return;
        }
        //Log.d("AVANT MODIF","x="+(x*(signe >= 0 ? 1 : -1))+"\ty="+y + "\tmax="+  max);

        //x = 360 * (1 - x) * (signe >= 0 ? 1 : -1);
        x = _joystick.mJoystickPadCenterX * x;
        y = -y * _joystick.mJoystickPadCenterY;

        //sort inversion des commandes
        if(control_reversal){
            Log.d("control_reversal","control_reversal");
            x *= -1.0;
            y *= -1.0;
        }else if(slow_down){
            Log.d("slow_down","slow_down");
            x/=5.0;
            y/=5.0;
        }

        x += _joystick.mJoystickPadCenterX;
        y += _joystick.mJoystickPadCenterY;
        //Log.d("APRES MODIF","x="+x+" y="+y);

        if (!_calibrationView.isCalibrating()) {
            if ((x > _joystick.mJoystickPadCenterX - _joystick.margin_X && x < _joystick.mJoystickPadCenterX + _joystick.margin_X) && (y > _joystick.mJoystickPadCenterY - _joystick.margin_Y && y < _joystick.mJoystickPadCenterY + _joystick.margin_Y)) {

            } else {
                if (x > _joystick.mJoystickPadCenterX - _joystick.margin_X && x < _joystick.mJoystickPadCenterX + _joystick.margin_X)
                    x = _joystick.mJoystickPadCenterX;
                if (y > _joystick.mJoystickPadCenterY - _joystick.margin_Y && y < _joystick.mJoystickPadCenterY + _joystick.margin_Y)
                    y = _joystick.mJoystickPadCenterY;
                _joystick.sendDataToMyo(x, y);
            }
        }
    }

    @Override
    public void onRobotPicked(ConvenienceRobot robotPicked, Hub myohub, Socket socket) {
        Log.d("onRobotPicked", "onRobotPicked");
        co.dismiss();
        _connectedRobot = robotPicked;

        mSocket = socket;
        mSocket.on("player:register", newPlayer);
        mSocket.on("player:castIsReady", castIsReady);
        mSocket.on("dataChange", onDataChange);
        mSocket.on("cast", onCast);
        mSocket.on("cast:cancel", onCastCancel);
        mSocket.on("end", onEnd);
        mSocket.on("start", onStart);

        registerPlayerSocket();


        hub = myohub;
        try{
            hub.addListener(mListener);
        }catch(Exception e){

        }


        _connectedRobot.addResponseListener(new ResponseListener() {
            @Override
            public void handleResponse(DeviceResponse deviceResponse, Robot robot) {

            }

            @Override
            public void handleStringResponse(String s, Robot robot) {

            }

            @Override
            public void handleAsyncMessage(AsyncMessage asyncMessage, Robot robot) {
                if(!immunity && !stopTheBall){
                    _connectedRobot.setLed(1, 0, 0);
                    mSocket.emit("player:collision");
                    if(player != null){
                        if(player.getColor().equals("blue")){
                            _connectedRobot.setLed(0, 0, 1);
                        }else{
                            _connectedRobot.setLed(1, ORANGE, 0);
                        }
                    }
                }
            }
        });
        Log.d("ROBOT NAME", "" + _connectedRobot.getRobot().getName());
        Log.d("ROBOT NAME", "" + _connectedRobot.getRobot().isConnected());
        Log.d("socket okay ?", "" + mSocket.connected());

        _joystick.setEnabled(true);
        _calibrationView.setEnabled(true);
        _calibrationButtonView.setEnabled(true);
    }

    private DeviceListener mListener = new AbstractDeviceListener() {
        @Override
        public void onConnect(Myo myo, long timestamp) {
            Toast.makeText(getApplicationContext(), "Myo Connected!", Toast.LENGTH_SHORT).show();
            Log.d("MYO", "co");
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

        }

        @Override
        public void onGyroscopeData(Myo myo, long timestamp, Vector3 gyro) {

        }

        @Override
        public void onAccelerometerData(Myo myo, long timestamp, Vector3 accel) {
            myo_x = accel.y();
            myo_y = accel.x();
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
                    usePower();
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
        }
    };

    public void registerPlayerSocket() {
        Log.d("Try to get player", "try to get player");
        Log.d("socket connected", "" + mSocket.connected());

        mSocket.emit("player:register");
    }

    public void displayToast(String text) {
        Toast.makeText(getApplicationContext(), "" + text, Toast.LENGTH_SHORT).show();
    }

    private void usePower() {
        if (System.currentTimeMillis() - this.lastTimeUsedPower >= 3000) {
            this.lastTimeUsedPower = System.currentTimeMillis();
            mSocket.emit("player:cast");
            powerButton.setEnabled(false);
        }
    }
}
