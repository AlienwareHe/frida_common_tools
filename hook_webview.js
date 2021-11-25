function hook() {

    Java.perform(function () {
        var Webview = Java.use("android.webkit.WebView");
        Webview.loadUrl.overload("java.lang.String").implementation = function (url) {
            console.log("\n[+]Loading URL from", url);
            console.log("[+]Setting the value of setWebContentsDebuggingEnabled() to TRUE");
            this.setWebContentsDebuggingEnabled(true);
            this.loadUrl.overload("java.lang.String").call(this, url);
        }

        Webview.loadUrl.overload('java.lang.String', 'java.util.Map').implementation = function (url) {
            console.log("\n[+]Loading URL from", url);
            console.log("[+]Setting the value of setWebContentsDebuggingEnabled() to TRUE");
            this.setWebContentsDebuggingEnabled(true);
            this.loadUrl.overload("java.lang.String").call(this, url);
        }

        var CrosswalkWebView = Java.use("org.xwalk.core.XWalkPreferences");
        if (CrosswalkWebView) {
            console.log('CrosswalkWebView exists!');
            CrosswalkWebView.setValue('remote-debugging', true);
            CrosswalkWebView.setValue.overload('java.lang.String', 'boolean').implementation = function (key, value) {
                console.log("[+] XWalkPreferences setValue:" + key + " ; " + value);
                if (key == 'remote-debugging') {
                    value = true;
                }
                this.setValue.overload('java.lang.String', 'boolean').call(this, key, value);
            }
        }else{
            console.log("it is not a crosswalk webview app");
        }

    });


}

setImmediate(hook);