package com.orbotix.drivesample;

import com.orbotix.ConvenienceRobot;
import com.orbotix.Sphero;
import com.orbotix.common.Robot;

import java.io.Serializable;

/**
 * Created by fabienpinel on 29/01/16.
 */
public class Robby extends Sphero implements Serializable {
    public Robby(Robot robot) {
        super(robot);
    }
}
