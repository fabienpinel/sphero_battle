package com.orbotix.drivesample;

import android.util.Log;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.net.URL;
import java.net.URLConnection;

/**
 * Created by fabienpinel on 08/02/16.
 */
public class AjaxRunnable implements Runnable {
    String uri, query;

        public AjaxRunnable(String uri, String query){
            this.uri = uri;
            this.query = query;

        }
        @Override
        public void run() {
            try {
                URL url = new URL("http://192.168.1.69:3000/api" + uri);

                //make connection
                URLConnection urlc = url.openConnection();

                //use post mode
                urlc.setDoOutput(true);
                urlc.setAllowUserInteraction(false);

                //send query
                PrintStream ps = new PrintStream(urlc.getOutputStream());
                ps.print(query);
                ps.close();

                //get result
                BufferedReader br = new BufferedReader(new InputStreamReader(urlc
                        .getInputStream()));
                String l = null;
                while ((l = br.readLine()) != null) {
                    Log.d("POST RESULT", "" + l);
                }
                br.close();
            } catch (Exception e) {
                Log.d("POST exception", "" + e);

            }

    }
}
