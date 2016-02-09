package com.orbotix.drivesample;

import android.os.AsyncTask;
import android.util.Log;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.net.URL;
import java.net.URLConnection;

/**
 * Created by fabienpinel on 08/02/16.
 */
public class Player {
    private String id, name, color;
    private boolean powerAvailable;


    public Player(String id, String name){
        if(name.equals("Player 1")){
            this.setColor("blue");
        }else{
            this.setColor("orange");
        }
        this.setId(id);
        Log.d("PLAYER ID",""+this.getId());
        this.setName(name);
        this.setPowerAvailable(false);

    }

    /*
    * GETTERS AND SETTERS
    * */
    public boolean isPowerAvailable() {
        return powerAvailable;
    }

    public void setPowerAvailable(boolean powerAvailable) {
        this.powerAvailable = powerAvailable;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public void usePower(){

    }

}

