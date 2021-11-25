console.log("[+] Started..");
function hook() {

    Java.perform(function () {
        var activity = Java.use("android.app.Activity");
        activity.onCreate.overload('android.os.Bundle').implementation = function (c) {
            console.log('onCreate --> ' + this);

            // var scanRiskEvent = Java.use("com.sktelecom.tauth.nshc.ScanRiskEvent");
            // console.log("scanRiskEvent:" + scanRiskEvent);
            // scanRiskEvent.setValue.implementation = function (p1, p2, p3, p4, p5) {
            //     console.log("scanRiskEvent set value invoked:", p1, p2, p3, p4, p5);
            //     printStack();
            //     this.setValue(p1, p2, p3, p4, p5);
            // }

            // scanRiskEvent.$init.implementation = function(){
            //     console.log("scanRiskEvent create");
            //     printStack();
            //     return this.$init();
            // }
            this.onCreate(c);
        };

        var application = Java.use("com.xshield.da");
        application.onCreate.implementation = function () {
            console.log("xshield.da create!");
            this.onCreate();


            var FxShieldMessageActivity = Java.use("com.sktelecom.tauth.nshc.FxShieldMessageActivity");
            FxShieldMessageActivity.showFxShieldMessagePopup.implementation = function (p1) {
                console.log("showFxShieldMessagePopup params:" + p1);
                printStack();
                this.showFxShieldMessagePopup(p1);
            }

            var xshield_h = Java.use("com.xshield.h");
            xshield_h.x.overload("java.lang.String").implementation = function(p0){
                var result = this.x(p0);
                console.log("com.xshield.h#x invoke:" + p0 + ",and result:" + result);
                return result;
            }

            console.log("============= hook finished");
        }

    });

}

function printStack() {
    Java.perform(function () {
        var Exception = Java.use("java.lang.Exception");
        var ins = Exception.$new("Exception");
        var straces = ins.getStackTrace();
        if (straces != undefined && straces != null) {
            var strace = straces.toString();
            var replaceStr = strace.replace(/,/g, "\r\n");
            console.log("=============================Stack strat=======================");
            console.log(replaceStr);
            console.log("=============================Stack end=======================\r\n");
            Exception.$dispose();
        }
    });
}

setImmediate(hook);