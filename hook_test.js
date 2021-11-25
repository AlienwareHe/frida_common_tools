function hook_libart() {

    var symbols = Module.enumerateSymbolsSync("libart.so");
    var addrGetStringUTFChars = null;
    var addrNewStringUTF = null;
    var addrFindClass = null;
    var addrGetMethodID = null;
    var addrGetStaticMethodID = null;
    var addrGetFieldID = null;
    var addrGetStaticFieldID = null;
    var addrRegisterNatives = null;
    var addrCallObjectMethod = null;
    for (var i = 0; i < symbols.length; i++) {
        var symbol = symbols[i];
        if (symbol.name.indexOf('Method') >= 0) {
            console.log('find possiable method:' + symbol.name);
        }
        if (symbol.name.indexOf("art") >= 0 &&
            symbol.name.indexOf("JNI") >= 0 &&
            symbol.name.indexOf("CheckJNI") < 0
        ) {
            if (symbol.name.indexOf("GetStringUTFChars") >= 0) {
                addrGetStringUTFChars = symbol.address;
                console.log("GetStringUTFChars is at ", symbol.address, symbol.name);
            } else if (symbol.name.indexOf("NewStringUTF") >= 0) {
                addrNewStringUTF = symbol.address;
                console.log("NewStringUTF is at ", symbol.address, symbol.name);
            } else if (symbol.name.indexOf("FindClass") >= 0) {
                addrFindClass = symbol.address;
                console.log("FindClass is at ", symbol.address, symbol.name);
            } else if (symbol.name.indexOf("GetMethodID") >= 0) {
                addrGetMethodID = symbol.address;
                console.log("GetMethodID is at ", symbol.address, symbol.name);
            } else if (symbol.name.indexOf("GetStaticMethodID") >= 0) {
                addrGetStaticMethodID = symbol.address;
                console.log("GetStaticMethodID is at ", symbol.address, symbol.name);
            } else if (symbol.name.indexOf("GetFieldID") >= 0) {
                addrGetFieldID = symbol.address;
                console.log("GetFieldID is at ", symbol.address, symbol.name);
            } else if (symbol.name.indexOf("GetStaticFieldID") >= 0) {
                addrGetStaticFieldID = symbol.address;
                console.log("GetStaticFieldID is at ", symbol.address, symbol.name);
            } else if (symbol.name.indexOf("RegisterNatives") >= 0) {
                addrRegisterNatives = symbol.address;
                console.log("RegisterNatives is at ", symbol.address, symbol.name);
            } else if (symbol.name.indexOf("CallObjectMethod") >= 0) {
                addrCallObjectMethod = symbol.address;
                console.log("CallObjectMethod is at ", symbol.address, symbol.name);
            }
        }
    }

    if (addrCallObjectMethod != null) {
        Interceptor.attach(addrCallObjectMethod, {
            onEnter: function (args) {
                console.log("[addrCallObjectMethod] called:");

            },
            onLeave: function (retval) {
                if (retval != null) {
                    // var bytes = Memory.readCString(retval);
                    // console.log("[GetStringUTFChars] result:" + bytes);
                }
            }
        });
    }
    if (addrGetStringUTFChars != null) {
        Interceptor.attach(addrGetStringUTFChars, {
            onEnter: function (args) { },
            onLeave: function (retval) {
                if (retval != null) {
                    var bytes = Memory.readCString(retval);
                    console.log("[GetStringUTFChars] result:" + bytes);
                }
            }
        });
    }
    if (addrNewStringUTF != null) {
        Interceptor.attach(addrNewStringUTF, {
            onEnter: function (args) {
                if (args[1] != null) {
                    var string = Memory.readCString(args[1]);
                    console.log("[NewStringUTF] bytes:" + string);
                }
            },
            onLeave: function (retval) { }
        });
    }
    if (addrFindClass != null) {
        Interceptor.attach(addrFindClass, {
            onEnter: function (args) {
                if (args[1] != null) {
                    var name = Memory.readCString(args[1]);
                    console.log("[FindClass] name:" + name);
                }
            },
            onLeave: function (retval) { }
        });
    }
    if (addrGetMethodID != null) {
        Interceptor.attach(addrGetMethodID, {
            onEnter: function (args) {
                if (args[2] != null) {
                    var name = Memory.readCString(args[2]);
                    if (args[3] != null) {
                        var sig = Memory.readCString(args[3]);
                        console.log("[GetMethodID] name:" + name + ", sig:" + sig);
                    } else {
                        console.log("[GetMethodID] name:" + name);
                    }

                }
            },
            onLeave: function (retval) { }
        });
    }
    if (addrGetStaticMethodID != null) {
        Interceptor.attach(addrGetStaticMethodID, {
            onEnter: function (args) {
                if (args[2] != null) {
                    var name = Memory.readCString(args[2]);
                    if (args[3] != null) {
                        var sig = Memory.readCString(args[3]);
                        console.log("[GetStaticMethodID] name:" + name + ", sig:" + sig);
                    } else {
                        console.log("[GetStaticMethodID] name:" + name);
                    }

                }
            },
            onLeave: function (retval) { }
        });
    }
    if (addrGetFieldID != null) {
        Interceptor.attach(addrGetFieldID, {
            onEnter: function (args) {
                if (args[2] != null) {
                    var name = Memory.readCString(args[2]);
                    if (args[3] != null) {
                        var sig = Memory.readCString(args[3]);
                        console.log("[GetFieldID] name:" + name + ", sig:" + sig);
                    } else {
                        console.log("[GetFieldID] name:" + name);
                    }

                }
            },
            onLeave: function (retval) { }
        });
    }
    if (addrGetStaticFieldID != null) {
        Interceptor.attach(addrGetStaticFieldID, {
            onEnter: function (args) {
                if (args[2] != null) {
                    var name = Memory.readCString(args[2]);
                    if (args[3] != null) {
                        var sig = Memory.readCString(args[3]);
                        console.log("[GetStaticFieldID] name:" + name + ", sig:" + sig);
                    } else {
                        console.log("[GetStaticFieldID] name:" + name);
                    }

                }
            },
            onLeave: function (retval) { }
        });
    }

    if (addrRegisterNatives != null) {
        Interceptor.attach(addrRegisterNatives, {
            onEnter: function (args) {
                console.log("[RegisterNatives] method_count:", args[3]);
                var env = args[0];
                var java_class = args[1];
                var class_name = Java.vm.tryGetEnv().getClassName(java_class);

                var methods_ptr = ptr(args[2]);

                var method_count = parseInt(args[3]);
                for (var i = 0; i < method_count; i++) {
                    var name_ptr = Memory.readPointer(methods_ptr.add(i * Process.pointerSize * 3));
                    var sig_ptr = Memory.readPointer(methods_ptr.add(i * Process.pointerSize * 3 + Process.pointerSize));
                    var fnPtr_ptr = Memory.readPointer(methods_ptr.add(i * Process.pointerSize * 3 + Process.pointerSize * 2));

                    var name = Memory.readCString(name_ptr);
                    var sig = Memory.readCString(sig_ptr);
                    var find_module = Process.findModuleByAddress(fnPtr_ptr);
                    console.log("[RegisterNatives] java_class:", class_name, "name:", name, "sig:", sig, "fnPtr:", fnPtr_ptr, "module_name:", find_module.name, "module_base:", find_module.base, "offset:", ptr(fnPtr_ptr).sub(find_module.base));

                }
            },
            onLeave: function (retval) { }
        });
    }
}


function hook_libc() {
    var symbols = Module.enumerateSymbolsSync("libc.so");
    for (var i = 0; i < symbols.length; i++) {
        var symbol = symbols[i];
        if (symbol.name == 'time') {
            console.log('hook libc time:' + symbol.name + ",addr:" + JSON.stringify(symbol));
            Interceptor.attach(symbol.address, {
                onLeave: function (retval) {
                    console.log('time hook executed:' + retval);
                    retval.replace(0);
                }
            });
        }

        if (symbol.name == 'strstr') {
            console.log('hook libc strstr:' + symbol.name + ",addr:" + JSON.stringify(symbol));
            Interceptor.attach(symbol.address, {
                onEnter: function (args) {
                    this.args1 = Memory.readCString(args[0]);
                    this.args2 = Memory.readCString(args[0]);
                },
                onLeave: function (retval) {
                    //console.log('strstr ' + this.args1 + ' vs ' + this.args2 + ' = ' + retval);
                    //retval.replace(0);
                }
            });
        }

        if (symbol.name == 'open') {
            console.log('hook libc open:' + symbol.name + ",addr:" + JSON.stringify(symbol));
            Interceptor.attach(symbol.address, {
                onEnter: function (args) {
                    this.file = Memory.readCString(args[0]);
                    console.log("open file:", this.file);
                },
                onLeave: function (retval) {
                    if (this.file.indexOf('net/tcp') != -1) {
                        console.log('pass /proc/net/tcp check');
                        //retval.replace(0);
                    }
                    // if(this.file.indexOf('stat')!=-1){
                    //     console.log('pass /proc/self/stat check');
                    //     retval.replace(0);
                    // }
                    // if(this.file.indexOf('schedstat')!=-1){
                    //     console.log('pass /proc/self/schedstat check');
                    //     retval.replace(0);
                    // }
                    // if(this.file.indexOf('status')!=-1){
                    //     console.log('pass /proc/self/status check');
                    //     retval.replace(0);
                    // }
                }
            });
        }
    }
}


function hook_invoke_with_arg_array() {
    Interceptor.attach(addr_InvokeWithArgArray, {
        onEnter: function (args) {
            var addr_ArtMethod = args[1];
            allocPrettyMethod.writeByteArray(allocPrettyMethodInit);
            PrettyMethod(addr_ArtMethod_PrettyMethod, addr_ArtMethod, allocPrettyMethod, 0x100);
            var methodName = allocPrettyMethod.readCString();


            this.showResult = true;
            this.methodName = methodName;

            this.tid = args[0].readPointer().add(0x10).readU32();
            var argscount = args[2].add(0x8).readU32();

            console.log("[" + this.tid + "]InvokeWithArgArray->", methodName, args[1], args[2], args[3], args[4]);
            // console.log("["+this.tid+"]args count:", argscount, "NumBytes:", args[2].add(0xC).readU32());
            // console.log("addr_InvokeWithArgArray args[0]->", hexdump(args[2].add(0x10).readPointer()));
            var argspointer = args[2].add(0x10).readPointer();
            for (var i = 0; i < argscount; i++) {
                console.log("[" + this.tid + "]  args_", i + 1, "->0x" + argspointer.add(i * 4).readU32().toString(16));
            }

        },
        onLeave: function (retval) {
            if (this.showResult) {
                console.log("[" + this.tid + "]InvokeWithArgArray onLeave->", this.methodName, "\n  result->0x" + retval.toString(16));
            }
        }
    });
}

function hook_wechat_collect_k_info(){
    Java.perform(function () {
        var bClass = Java.use("com.fenbi.android.solarcommon.dataSource.b");
        console.log('get class:' + bClass.OW);
        bClass.u.implementation = function(p1) {
            console.log('collect info start');
            var result = this.u();
            console.log('collect info:' + result);
            return result;
        };

        // var pClass = Java.use("com.tencent.mm.protocal.j$a");
        // pClass.toProtoBuf.implementation = function(){
        //     var result = this.toProtoBuf();
        //     console.log(JSON.stringify(this.Hrj.HDz));
        //     return result;
        // }

        console.log('hook end');
    });
}

function hook() {
    // hook_libart();
    // hook_libc();
    hook_wechat_collect_k_info();
}


setImmediate(hook);