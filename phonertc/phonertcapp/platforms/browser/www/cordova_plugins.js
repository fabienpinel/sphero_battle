cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/com.dooble.phonertc/www/phonertc.js",
        "id": "com.dooble.phonertc.PhoneRTC",
        "pluginId": "com.dooble.phonertc",
        "clobbers": [
            "cordova.plugins.phonertc"
        ]
    },
    {
        "file": "plugins/com.dooble.phonertc/src/browser/PhoneRTCProxy.js",
        "id": "com.dooble.phonertc.PhoneRTCProxy",
        "pluginId": "com.dooble.phonertc",
        "runs": true
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "com.dooble.phonertc": "2.0.1",
    "cordova-plugin-whitelist": "1.2.0"
}
// BOTTOM OF METADATA
});