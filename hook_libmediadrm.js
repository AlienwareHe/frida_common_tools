function hook() {

    var mediaDrmModule = Process.getModuleByName('libmedia_jni.so');
    console.log('mediaDrmModule:' + mediaDrmModule.name);
    console.log('mediaDrmModule:' + mediaDrmModule.base);
    console.log('mediaDrmModule symbols size:' + mediaDrmModule.enumerateExports().length);
    
    Interceptor.attach(mediaDrmModule.base.add(0x3B260), {
        onEnter: function (args) {
            console.log('hook success!!!');
            // this.params0 = args[0].readUtf8String();
            // console.log('getProperty for:' + this.params0);
        },
        onLeave: function (retval) {

        }
    });

    Interceptor.attach(mediaDrmModule.base.add(0x3B0B4), {
        onEnter: function (args) {
            console.log('hook success!!!');
            // this.params0 = args[0].readUtf8String();
            // console.log('getProperty for:' + this.params0);
        },
        onLeave: function (retval) {

        }
    });
    
    Interceptor.attach(mediaDrmModule.base.add(0x3882C), {
        onEnter: function (args) {
            console.log('hook success!!!');
            // this.params0 = args[0].readUtf8String();
            // console.log('getProperty for:' + this.params0);
        },
        onLeave: function (retval) {

        }
    });

}

setImmediate(hook);