function hook_check_soft_type() {

    var module = Process.getModuleByName('libwechatcommon.so');
    console.log('module:' + module.name);
    console.log('module:' + module.base);
    console.log('module symbols size:' + module.enumerateExports().length);

    Interceptor.attach(module.base.add(0x37EED), {
        onEnter: function (args) {
            this.params0 = args[0].readUtf8String();
            console.log('getProperty for:' + this.params0);
        },
        onLeave: function (retval) {
            console.log('sub37EEC return:' + this.retval);
        }
    });
    
    Interceptor.attach(module.base.add(0x37D1D), {
        onEnter: function (args) {
            this.params0 = args[0].readUtf8String();
            console.log('37D1C params:' + this.params0);
        },
        onLeave: function (retval) {
            console.log('sub37EEC return:' + this.retval);
        }
    });

}


function hook() {
    hook_check_soft_type();
}


setImmediate(hook);