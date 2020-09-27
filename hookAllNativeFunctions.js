setImmediate(function() {

// var isDevMapOpened = false;
// Interceptor.attach(Module.findExportByName("libc.so" , "write"), {
//     onEnter: function(args) {
//         if(!isDevMapOpened){
//             return;
//         }
//         var fd = args[0];
//         var buffer = args[1];
//         var len = parseInt(args[2]);
//         console.log("write called!",fd,buffer,len);
//         var data = Memory.readByteArray(buffer,len);
//         console.log(hexdump(data, {
//             offset: 0,
//             length: len,
//             header: true,
//             ansi: false
//         }));
//     },
//     onLeave:function(retval){
    
//     }
// });

// Interceptor.attach(Module.findExportByName("libc.so" , "open"), {
//     onEnter: function(args) {
//         var path = args[0].readUtf8String();
//         console.log('open:' + path);
//         if(path.indexOf('nativeCache/dev_map')){
//             isDevMapOpened = true;
//         }
//     },
//     onLeave:function(retval){
    
//     }
// });

Interceptor.attach(Module.findExportByName("libc.so" , "strstr"), {
    onEnter: function(args) {
        var str = args[0].readUtf8String();
        var value = args[1].readUtf8String();
        if(value.indexOf('ratel')!=-1 || value.indexOf('sandhook')!=-1){
            var replace = Memory.allocUtf8String("/data/local/tmp/");
            console.log("strstr:",str,"||",value,"||",replace);
            args[1] = replace;
        }
    },
    onLeave:function(retval){
        
    }
});

Interceptor.attach(Module.findExportByName("libc.so" , "strlen"), {
    onEnter: function(args) {
        var str = args[0].readUtf8String();
        var value = args[1].readUtf8String();
        if(value.indexOf('ratel')!=-1 || value.indexOf('sandhook')!=-1){
            var replace = Memory.allocUtf8String("/data/local/tmp/");
            console.log("strstr:",str,"||",value,"||",replace);
            args[1] = replace;
        }
    },
    onLeave:function(retval){
        
    }
});

// Interceptor.replace(Module.findExportByName(null , "unlink"), new NativeCallback(function (v1) {
//         console.log('replace successful');
//     }, 'int', ['pointer', 'int']));
});
