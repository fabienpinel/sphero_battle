cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/com.tribalyte.plugin.myo/www/myoapi.js",
        "id": "com.tribalyte.plugin.myo.myoapi",
        "clobbers": [
            "cordova.plugins.MyoApi"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "com.tribalyte.plugin.myo": "0.0.2"
}
// BOTTOM OF METADATA
});