/**
 * 未完成！
 * 脚本作用：
 *  绕过/proc/self/status检测
 */
setImmediate(function () {
    var fs = require('./tools/file');

    Interceptor.attach(Module.findExportByName(null, "dlopen"), {
        onEnter: function (args) {
            var soPath = Memory.readUtf8String(args[0]);
            // console.log("so load:" + soPath);
        }
    });

    Interceptor.attach(Module.findExportByName("libc.so", "open"), {
        onEnter: function (args) {
            var path = args[0].readUtf8String();

            if (path.indexOf('/proc') != -1) {
                console.log('libc.so open /proc:' + path);
            }

            if (path.indexOf('/proc/self/cmdline') != -1) {
                console.log("libc.so open /proc/self/cmdline");
                fs.writeStringToFile("/sdcard/cmdline","");
                args[0] = Memory.allocUtf8String("/sdcard/cmdline");
            }

            if (path.indexOf('/proc/self/status') != -1) {
                console.log("libc.so open /proc/self/status");
                var status = fs.readFileToString("/proc/self/status");
                // console.log('read /proc/pid/status file content:' + status);
                if (status == null) {
                    return;
                }
                if (status.indexOf("TracerPid") == -1) {
                    return;
                }
                var new_status = "";
                var status_array = status.split("\n");
                for (var lineNo in status_array) {
                    var line = status_array[lineNo];
                    if (line.indexOf("TracerPid") != -1) {
                        console.log('/proc/self/status TracerPid is:' + line);
                        new_status += "TracerPid:   0";
                    } else {
                        new_status += line;
                    }
                    new_status += '\n';
                }
                // console.log("/proc/self/status mock:" + new_status);
                fs.writeStringToFile("/sdcard/status", new_status);
                args[0] = Memory.allocUtf8String("/sdcard/status");
            }

            if (path.indexOf('/proc/self/wchan') != -1) {
                var wchan = fs.readFileToString("/proc/self/wchan");
                console.log('wchan:' + wchan);
                if (wchan.indexOf("ptrace") != -1) {
                    fs.writeStringToFile("/sdcard/wchan", "futex_wait_queue_me");
                    args[0] = Memory.allocUtf8String("/sdcard/wchan");
                }
            }

            if (path.indexOf('/proc/self/stat') != -1) {
                var stat = fs.readFileToString("/proc/self/stat");
                console.log("/proc/self/stat:" + stat);
                // 正常为17069 (sankuai.meituan) R 。。
                // 调试状态下为17069 (sankuai.meituan) t 。。
                var stat_array = stat.split(" ");
                if (stat_array[2] == 't' || stat_array[2] == 'T') {
                    stat_array[2] = "R";
                    var new_stat = stat_array.join(" ");
                    console.log('/proc/self/stat mock:' + new_stat);
                    fs.writeStringToFile("/sdcard/stat", new_stat);
                    args[0] = Memory.allocUtf8String("/sdcard/stat");
                }
            }
        },
        onLeave: function (retval) {

        }
    });

    // Interceptor.attach(Module.findExportByName("libc.so", "strstr"), {
    //     onEnter: function (args) {
    //         var str = args[0].readUtf8String();
    //         var value = args[1].readUtf8String();
    //         if (value.indexOf('ptrace') != -1 || value.indexOf('TracerPid') != -1) {
    //             var replace = Memory.allocUtf8String("0");
    //             console.log("strstr:", str, "||", value, "||", replace);
    //             args[0] = replace;
    //         }
    //     },
    //     onLeave: function (retval) {

    //     }
    // });

});
