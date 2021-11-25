setImmediate(function () {
    // 有些机型Java层hook不了
    // Java.perform(function () {
    //     const system = Java.use('java.lang.System');
    //     const Runtime = Java.use('java.lang.Runtime');
    //     const VMStack = Java.use('dalvik.system.VMStack');
    //     system.loadLibrary.implementation = function (path) {
    //         console.log('System.loadLibrary("' + path + '")');
    //         const loaded = Runtime.getRuntime().loadLibrary0(VMStack.getCallingClassLoader(), path);
    //         if (path.includes("smsdk")) {
    //             hook_string_decrypt();
    //         }
    //     }
    // });

    hook_dlopen('smsdk');
});


function hook_dlopen(so_name) {
    var dlopen = Module.findExportByName(null, "dlopen");
    console.log('dlopen:', dlopen);
    if (dlopen != null) {
        Interceptor.attach(dlopen, {
            onEnter: function (args) {
                var soName = args[0].readCString();
                // console.log(soName);
                if (soName.indexOf(so_name) != -1) {
                    this.hook = true;
                }
            },
            onLeave: function (retval) {
                if (this.hook) {
                    dlopentodo();
                };
            }
        });
    }

    //第二种方式（针对新系统版本）
    var android_dlopen_ext = Module.findExportByName(null, "android_dlopen_ext");
    console.log('android_dlopen_ext:', android_dlopen_ext);
    if (android_dlopen_ext != null) {
        Interceptor.attach(android_dlopen_ext, {
            onEnter: function (args) {
                var soName = args[0].readCString();
                // console.log(soName);
                if (soName.indexOf(so_name) != -1) {
                    this.hook = true;
                }
            },
            onLeave: function (retval) {
                if (this.hook) {
                    dlopentodo();
                };
            }
        });
    }
}

function dlopentodo() {
    hook_string_decrypt();
}

function hook_java() {
    Java.perform(function () {
        // gysdk
        var gyResponse = Java.use('com.g.gysdk.GYResponse');
        console.log(gyResponse);
        gyResponse.$init.implementation = function () {
            console.log('gyResponse init!!!!');
            showJavaStacks('test');
            return this.$init();
        }

        gyResponse.obtain.implementation = function(z,i,str){
            var gy = this.obtain(z,i,str);
            console.log('========== gyresponse:' + gy.toString());
            return gy;
        }

    });
}

function hook_string_decrypt() {
    hook_java();

    // Java层指纹信息
    var class_JSONObject = Java.use('org.json.JSONObject');
    class_JSONObject.toString.overload().implementation = function () {
        var result = this.toString();
        if (result.indexOf('a1') != -1) {
            console.log('json toString:' + result);
        }
        return result;
    }

    var libsmsdk_base_addr = Module.findBaseAddress('libsmsdk.so');
    console.log('libsmsdk base addr:', libsmsdk_base_addr);
    // b系列部分值
    var fun1 = libsmsdk_base_addr.add(0x77318);
    // b24
    var fun2 = libsmsdk_base_addr.add(0x786c0);
    // y2
    var fun3 = libsmsdk_base_addr.add(0x58928);
    // Native字符串解密函数
    var fun4 = libsmsdk_base_addr.add(0x8414);
    // Native b系列加密函数，可以通过strlen在y2中来定位
    var fun5 = libsmsdk_base_addr.add(0x8FA4);
    // b系列部分值
    var fun6 = libsmsdk_base_addr.add(0x77318);

    Interceptor.attach(fun6, {
        onEnter: function (args) {
            // console.log("sub ECA4 params.length:" + args.length);
            // console.log("sub ECA4 params0:" + args[0].readUtf8String());
            console.log("sub fun6 params0:" + args[1].readUtf8String());
            console.log("sub fun6 params1:" + args[2].readUtf8String());

        },
        onLeave: function (retval) {

        }
    });
    
    Interceptor.attach(fun1, {
        onEnter: function (args) {
            // console.log("sub ECA4 params.length:" + args.length);
            // console.log("sub ECA4 params0:" + args[0].readUtf8String());
            console.log("sub ECA4 params0:" + args[1].readUtf8String());
            console.log("sub ECA4 params1:" + args[2].readUtf8String());

        },
        onLeave: function (retval) {

        }
    });

    Interceptor.attach(fun2, {
        onEnter: function (args) {
            // console.log("sub ECA4 params.length:" + args.length);
            // console.log("sub ECA4 params0:" + args[0].readUtf8String());
            console.log("sub 0x786c0 params0:" + args[1].readUtf8String());
            console.log("sub 0x786c0 result:" + args[2].readUtf8String());

        },
        onLeave: function (retval) {

        }
    });

    Interceptor.attach(fun4, {
        onEnter: function (args) {
            console.log("sub fun4 params0:" + args[0].readUtf8String());
            console.log("sub fun4 params:" + args[1]);

        },
        onLeave: function (retval) {
            console.log("sub fun4 result:" + retval.readUtf8String());
        }
    });

    Interceptor.attach(fun5, {
        onEnter: function (args) {
            this.params0 = args[0].readUtf8String();
        },
        onLeave: function (retval) {
            console.log("sub 6188 params0:" + this.params0);
            console.log("sub 6188 result:" + retval.readUtf8String());
        }
    });
}



function showJavaStacks(str_tag) {
    var Exception = Java.use("java.lang.Exception");
    var ins = Exception.$new("Exception");
    var straces = ins.getStackTrace();

    if (undefined == straces || null == straces) {
        return;
    }

    console.log("=============================" + str_tag + " Stack strat=======================");
    console.log("");

    for (var i = 0; i < straces.length; i++) {
        var str = "   " + straces[i].toString();
        console.log(str);
    }

    console.log("");
    console.log("=============================" + str_tag + " Stack end=======================\r\n");
    Exception.$dispose();
}