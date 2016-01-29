package com.orbotix.drivesample;

import com.github.nkzawa.socketio.client.Manager;
import com.github.nkzawa.socketio.client.Socket;

import java.io.Serializable;

/**
 * Created by fabienpinel on 29/01/16.
 */
public class CustomSocket extends Socket implements Serializable {
    public CustomSocket(Manager io, String nsp) {
        super(io, nsp);
    }
}
