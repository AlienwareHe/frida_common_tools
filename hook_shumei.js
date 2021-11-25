Java.perform(function () {
    const system = Java.use('java.lang.System');
    const Runtime = Java.use('java.lang.Runtime');
    const VMStack = Java.use('dalvik.system.VMStack');
    system.loadLibrary.implementation = function (path) {
        console.log('System.loadLibrary("' + path + '")');
        const loaded = Runtime.getRuntime().loadLibrary0(VMStack.getCallingClassLoader(), path);
        if (path.includes("smsdk")) {
            hook_string_decrypt();
        }
    }
});

/**
 * 主动调用Java静态方法
 */
function callSmsdkY2() {
    hook_string_decrypt();
    Java.perform(function () {
        var smSdk = Java.use("com.ishumei.dfp.SMSDK");
        console.log("com.ishumei.dfp.SMSDK:::" + smSdk);
        var smSdkInstance = smSdk.$new();
        console.log("com.ishumei.dfp.SMSDK Instance:::" + smSdk);
        var result = smSdkInstance.y2(false, "aaa", true, "bbb");
        console.log("call SMSDK#y2 result:" + result);
    });

}

function hook_string_decrypt() {
    var libsmsdk_base_addr = Module.findBaseAddress('libsmsdk.so');
    // Native层字符串解密方法
    var sub_79ec_addr = libsmsdk_base_addr.add(0x79ec + 1);
    // Native指纹信息加密方法
    var sub_6188_addr = libsmsdk_base_addr.add(0x6188 + 1);
    // risk_files解密方法   
    var sub_4540C_addr = libsmsdk_base_addr.add(0x4089C + 1);
    // b5-b10: readdir目录计算指纹
    var sub_ECA4_addr = libsmsdk_base_addr.add(0xECA4 + 1);

    // com.ishumei.dfp.SMSDK#y2 sub_3F7AC
    Java.perform(function () {
        var smsdk = Java.use("com.ishumei.dfp.SMSDK");
        smsdk.y2.overload('boolean', 'java.lang.String', 'boolean', 'java.lang.String').implementation = function (b0, s0, b1, s1) {
            console.log('hook success:' + b0 + ' : ' + b1 + ' : ' + s0 + ' : ' + s1);
            return this.y2(b0, s0, b1, s1);
        }
    });

    console.log('find libsmsdk sub_79ec function addr:' + libsmsdk_base_addr + ":" + sub_79ec_addr);

    Interceptor.attach(sub_79ec_addr, {
        onEnter: function (args) {
            this.enc = args[0].readUtf8String();
        },
        onLeave: function (retval) {
            console.log("libsmsdk decrypt native string:" + this.enc + " to " + retval.readUtf8String());
        }
    });

    Interceptor.attach(sub_4540C_addr, {
        onEnter: function (args) {
            this.enc = args[0].readUtf8String();
        },
        onLeave: function (retval) {
            console.log("libsmsdk 4089C native string:" + this.enc + ",result:" + retval.readUtf8String());
        }
    });

    Interceptor.attach(sub_6188_addr, {
        onEnter: function (args) {
            this.params0 = args[0].readUtf8String();
        },
        onLeave: function (retval) {
            console.log("sub 6188 params0:" + this.params0);
            console.log("sub 6188 result:" + retval.readUtf8String());
        }
    });

    Interceptor.attach(sub_ECA4_addr, {
        onEnter: function (args) {
            this.params0 = args[0].readUtf8String();
        },
        onLeave: function (retval) {
            console.log("sub ECA4 params0:" + this.params0);
            console.log("sub ECA4 result:" + retval.readUtf8String());
        }
    });

    // returnType: char *,argType: char *
    // var sub_79ec = new NativeFunction(sub_79ec_addr, "pointer", ["pointer"]);
    // console.log("manual decrypt sub_79ec:", sub_79ec(Memory.allocUtf8String("eddJNgbip2zFiRmwdWiGJg==")).readUtf8String());
    // console.log("manual decrypt sub_79ec:", sub_79ec(Memory.allocUtf8String("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")).readUtf8String());
}


// setImmediate(hook);
