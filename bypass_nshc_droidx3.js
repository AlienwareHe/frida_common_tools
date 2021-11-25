console.log("[+] Started..");
setImmediate(function () {
    Java.perform(function () {
        console.log("[*] Starting script");
        var dexclassLoader = Java.use("dalvik.system.DexClassLoader");
        dexclassLoader.$init.implementation = function (dexPath, optimizedDirectory, librarySearchPath, parent) {
            console.log("dexPath:" + dexPath);
            console.log("optimizedDirectory:" + optimizedDirectory);
            console.log("librarySearchPath:" + librarySearchPath);
            console.log("parent:" + parent);
            this.$init(dexPath, optimizedDirectory, librarySearchPath, parent);
        }
    });
});
Java.perform(function () {
    var exitClass = Java.use("java.lang.System");
    exitClass.exit.implementation = function () {
        console.log("[*] System.exit called");
    }
    console.log("[*] Hooking calls to System.exit");
});
var data = {
    "file": "",
    "content": []
};
var O_RDONLY = 0;
var O_WRONLY = 1;
var O_RDWR = 2;
var SEEK_SET = 0;
var SEEK_CUR = 1;
var SEEK_END = 2;
function getExportFunction(type, name, ret, args) {
    var nptr;
    nptr = Module.findExportByName(null, name);
    if (nptr === null) {
        console.log("cannot find " + name);
        return null;
    } else {
        if (type === "f") {
            var funclet = new NativeFunction(nptr, ret, args);
            if (typeof funclet === "undefined") {
                console.log("parse error " + name);
                return null;
            }
            return funclet;
        } else if (type === "d") {
            var datalet = Memory.readPointer(nptr);
            if (typeof datalet === "undefined") {
                console.log("parse error " + name);
                return null;
            }
            return datalet;
        }
    }
}
var memset = getExportFunction("f", "memset", "pointer", ["pointer", "int", "int"]);
var wrapper_open = getExportFunction("f", "open", "int", ["pointer", "int", "int"]);
var read = getExportFunction("f", "read", "int", ["int", "pointer", "int"]);
var write = getExportFunction("f", "write", "int", ["int", "pointer", "int"]);
var lseek = getExportFunction("f", "lseek", "int", ["int", "int", "int"]);
var wrapper_errno = getExportFunction("f", "__errno", "pointer", []);
var close = getExportFunction("f", "close", "int", ["int"]);
var dladdr = getExportFunction("f", "dladdr", "int", ["pointer", "pointer"]);
var wrapper_sscanf = getExportFunction("f", "sscanf", "int", ["pointer", "pointer", "pointer", "pointer", "pointer", "pointer", "pointer", "pointer", "pointer", "pointer", "pointer", "pointer", "pointer"]);
var getpid = getExportFunction("f", "getpid", "int", []);
var wrapper_popen = getExportFunction("f", "popen", "pointer", ["pointer", "pointer"]);
var pclose = getExportFunction("f", "pclose", "int", ["pointer"]);
var fgets = getExportFunction("f", "fgets", "pointer", ["pointer", "int", "pointer"]);
function malloc(size) {
    return Memory.alloc(size);
}
function allocStr(str) {
    return Memory.allocUtf8String(str);
}
function getStr(addr) {
    if (typeof addr == "number") {
        addr = ptr(addr);
    }
    return Memory.readUtf8String(addr);
}
function popen(command, type) {
    if (typeof command == "string") {
        command = allocStr(command);
    }
    if (typeof type == "string") {
        type = allocStr(type);
    }
    return wrapper_popen(command, type);
}
function open(pathname, flags, mode) {
    if (typeof pathname == "string") {
        pathname = allocStr(pathname);
    }
    return wrapper_open(pathname, flags, mode);
}

function readSmallFile(filepath) {
    var fd = open(filepath, O_RDONLY, 0);
    if (fd == -1) {
        return null;
    }
    var buffersize = 0x4000;
    var buffer = malloc(buffersize);
    lseek(fd, 0, SEEK_SET);
    var output = "";
    while (read(fd, buffer, buffersize) != 0) {
        output += getStr(buffer);
    }
    close(fd);
    return output;
}
function getCommandOutput(cmd) {
    var fp = popen(cmd, "r");
    if (fp.isNull()) {
        return null;
    }
    var output = "";
    var buffer = malloc(1024);
    while (fgets(buffer, 1024, fp) > 0) {
        output += getStr(buffer);
    }
    pclose(fp);
    return output;
}
// int kill(pid_t pid, int sig);
var _kill = getExportFunction("f", "kill", "int", ["int", "int"]);
Interceptor.replace(Module.findExportByName('libc.so', 'kill'), new NativeCallback(function (pid, sig) {
    console.log('[+][kill] ==================================================');
    console.log('[+] kill(pid=' + pid + ', sig=' + sig + ')');
    console.log('[+][kill] ==================================================');
    var address = Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join(':');
    var callback = address.split(':');
    console.log('[+][kill][' + Process.getModuleByAddress(callback[0]).name + '] called from: ' + callback[0] + '\\n');
    console.log('[+][kill] ==================================================');
    console.log('[+][kill] ' + hexdump(ptr(callback[0] - 10), { offset: 0, length: 64, header: true, ansi: false }));
    return -1;
}, "int", ["int", "int"]));
// void exit(int status)
var _exit = getExportFunction("f", "exit", "void", ["int"]);
Interceptor.replace(_exit, new NativeCallback(function (status) {
    console.log('[+] exit(status=' + status + ')');
    return 0;
}, "void", ["int"]));
// int stat(const char *path, struct stat *buf);
var stat = getExportFunction("f", "stat", "int", ["pointer", "pointer"]);
Interceptor.replace(stat, new NativeCallback(function (path, buf) {
    console.log('[+] stat(path=' + Memory.readCString(path) + ')');
    if (Memory.readCString(path).indexOf('/proc/1/status') !== -1) {
        console.log('[+][stat] =====================================================');
        var address = Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join(':');
        var callback = address.split(':');
        console.log('[+][stat][' + Process.getModuleByAddress(callback[0]).name + '] called from: ' + callback[0] + '\\n');
        console.log('[+][stat] =====================================================');
        console.log('[+][stat]' + hexdump(ptr(callback[0]), { offset: 0, length: 64, header: true, ansi: false }));
    }
    return stat(path, buf);
}, "int", ["pointer", "pointer"]));
// int lstat(const char *path, struct stat *buf);
var lstat = getExportFunction("f", "lstat", "int", ["pointer", "pointer"]);
Interceptor.replace(lstat, new NativeCallback(function (path, buf) {
    console.log('[+] lstat(path=' + Memory.readCString(path) + ')');
    return lstat(path, buf);
}, "int", ["pointer", "pointer"]));
/*
// int fstat(int fd, struct stat *buf);
var fstat = getExportFunction("f", "fstat", "int", ["int", "pointer"]);
Interceptor.replace(fstat, new NativeCallback(function(fd, buf) {
    console.log('[+] fstat('+fd+')');
    // return 0;
    return fstat(fd, buf);
}, "int", ["int", "pointer"]));
*/
// int access(const char *pathname, int mode)
var access = getExportFunction("f", "access", "int", ["pointer", "int"]);
Interceptor.replace(access, new NativeCallback(function (pathname, mode) {
    console.log('[+] access(pathname=' + Memory.readCString(pathname) + ', mode=' + mode + ')');
    return access(pathname, mode);
}, "int", ["pointer", "int"]));
// int unlink (const char *filename)
var unlink = getExportFunction("f", "unlink", "int", ["pointer"]);
Interceptor.replace(unlink, new NativeCallback(function (filename) {
    console.log('[+] unlink(filename=' + Memory.readCString(filename) + ')');
    return unlink(filename);
}, "int", ["pointer"]));
// int rmdir (const char *filename)
var rmdir = getExportFunction("f", "rmdir", "int", ["pointer"]);
Interceptor.replace(rmdir, new NativeCallback(function (filename) {
    console.log('[+] rmdir(filename=' + Memory.readCString(filename) + ')');
    return rmdir(filename);
}, "int", ["pointer"]));
var _open = getExportFunction("f", "open", "int", ["pointer", "int", "int"]);
Interceptor.replace(_open, new NativeCallback(function (path, flags, mode) {
    var address = Module.findExportByName(null, 'LoadEngine');
    if (address !== null) {
        module = Process.getModuleByAddress(address);
        Memory.protect(module.base, module.size, 'rwx');
        p1 = Module.findExportByName(null, 'Java_net_nshc_droidx3_engine_bengine_BEngineJNI_RootingCheck');
        console.log("============= rooting check found =============" + p1);
        if (p1 !== null) {
            Memory.writeU8(p1, 0x31);
            Memory.writeU8(p1.add(1), 0xC0);
            Memory.writeU8(p1.add(2), 0xC3);
        }
        p2 = Module.findExportByName(null, 'Java_net_nshc_droidx3_engine_bengine_BEngineJNI_RootingCheckEx');
        if (p2 !== null) {
            Memory.writeU8(p2, 0x31);
            Memory.writeU8(p2.add(1), 0xC0);
            Memory.writeU8(p2.add(2), 0xC3);
        }
        p3 = Module.findExportByName('libBengine.so', 'RootingCheck');
        if (p3 !== null) {
            console.log('[+] RootingCheck = ' + p3);
            Memory.writeU8(p3, 0x31);
            Memory.writeU8(p3.add(1), 0xC0);
            Memory.writeU8(p3.add(2), 0xC3);
        }
        p4 = Module.findExportByName('libBengine.so', 'pmon');
        if (p4 !== null) {
            console.log('[+] pmon = ' + p4);
            Memory.writeU8(p4, 0x31);
            Memory.writeU8(p4.add(1), 0xC0);
            Memory.writeU8(p4.add(2), 0xC3);
        }
        p5 = Module.findExportByName('libBengine.so', 'Java_net_nshc_droidx3_engine_bengine_BEngineJNI_Pmon');
        if (p5 !== null) {
            console.log('[+] p5 = ' + p5);
            Memory.writeU8(p5, 0x31);
            Memory.writeU8(p5.add(1), 0xC0);
            Memory.writeU8(p5.add(2), 0xC3);
        }
        console.log('[+] Rooting Checking is patched..!!');
    }else{
        console.log("============= loadEngine not found =============");
    }
    if (flags & O_RDONLY == O_RDONLY) {
        console.log("[+] open(path=" + Memory.readCString(path) + ", flags=O_RDONLY" + ", mode=" + mode + ")");
    }
    else if (flags & O_WRONLY == O_WRONLY) {
        console.log("[+] open(path=" + Memory.readCString(path) + ", flags=O_WRONLY" + ", mode=" + mode + ")");
    }
    else if (flags & O_RDWR == O_RDWR) {
        console.log("[+] open(path=" + Memory.readCString(path) + ", flags=O_RDWR" + ", mode=" + mode + ")");
    }
    else {
        console.log("[+] open(path=" + Memory.readCString(path) + ", flags=" + flags.toString(16) + ", mode=" + mode + ")");
    }
    if (Memory.readCString(path).indexOf('libBengine.so') !== -1) {
        console.log("[+]==================================================================");
        console.log("[+][WARNING] SECURITY MODULE Found..!! x===||>>>>>>>>  libBengine.so");
        console.log("[+]==================================================================");
        return -1;
    }
    return _open(path, flags, mode);
}, "int", ["pointer", "int", "int"]));
// int __android_log_print(int prio, const char *tag, const char *fmt, ...)
// var __android_log_print = getExportFunction("f", "__android_log_print", "int", ["int", "pointer", "pointer"]);
// Interceptor.replace(Module.findExportByName('liblog.so', '__android_log_print'), new NativeCallback(function (prio, tag, fmt) {
//     console.log('[+] __android_log_print(' + prio + ', ' + tag.readCString() + ', ' + fmt.readCString() + ')');
//     if (fmt.readCString().indexOf('VM beginnings with secure code') !== -1) {
//         var bypass = Module.findExportByName(null, "Java_com_xshield_da_z");
//         var module = Process.getModuleByAddress(bypass);
//         Memory.protect(module.base, module.size, 'rwx');
//         Memory.writeU8(module.base.add(0x4AA0), 0xC3);
//         console.log(hexdump(module.base.add(0x4AA0), { offset: 0, length: 64, header: true, ansi: false }));
//         Memory.writeU8(module.base.add(0x7D20), 0xC3);
//         console.log(hexdump(module.base.add(0x7D20), { offset: 0, length: 64, header: true, ansi: false }));
//     }
//     // return __android_log_print(prio, tag, fmt);
// }, "int", ["int", "pointer", "pointer"]));
/*
// int pthread_create(pthread_t *thread, const pthread_attr_t *attr, void *(*start_routine)(void *), void *arg);
var pthread_create = getExportFunction("f", "pthread_create", "int", ["pointer", "pointer", "pointer", "pointer"]);
Interceptor.replace(pthread_create, new NativeCallback(function(thread, attr, start_routine, arg) {
  console.log("[+] pthread_create('" + start_routine + "')");
  console.log('[+] =====================================================');
  // console.log(hexdump(start_routine, {offset: 0, length: 64, header: true, ansi: false}));
  address = Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join(':');
  var callback = address.split(':');
  console.log('[+]['+Process.getModuleByAddress(callback[0]).name+'] called from: '+callback[0]+'\\n');
  console.log('[+] =====================================================');
  return pthread_create(thread, attr, start_routine, arg);
}, "int", ["pointer", "pointer", "pointer", "pointer"]));
*/
// int socket(int domain, int type, int protocol);
var _socket = getExportFunction("f", "socket", "int", ["int", "int", "int"]);
console.log('[+] socket = ' + _socket.toString(16));
Interceptor.attach(_socket, {
    onEnter: function (args) {
        console.log('[+] socket(' + args[0] + ', ' + args[1] + ', ' + args[2] + ')');
    },
    onLeave: function (retval) {
    }
});
// int connect(int sockfd, const struct sockaddr *serv_addr, socklen_t addrlen);
var _connect = getExportFunction("f", "connect", "int", ["int", "pointer", "int"]);
console.log('[+] connect = ' + _connect.toString(16));
Interceptor.attach(_connect, {
    onEnter: function (args) {
        console.log('[+] connect');
        console.log(hexdump(args[1], { offset: 0, length: 64, header: true, ansi: false }));
    }
});
// ssize_t recv(int socket, void *buffer, size_t length, int flags)
var _recv = getExportFunction("f", "recv", "int", ["int", "pointer", "int", "int"]);
console.log('[+] recv = ' + _recv.toString(16));
Interceptor.attach(_recv, {
    onEnter: function (args) {
        this.buf = args[1];
        this.count = args[2].toInt32();
    },
    onLeave: function (retval) {
        console.log('[+] recv');
        console.log(hexdump(this.buf, { offset: 0, length: 128, header: true, ansi: false }));
    }
});
/*
scandir = getExportFunction("f", "scandir", "int", ["pointer", "pointer", "pointer", "pointer"]);
console.log('[+] scandir = ' + scandir.toString(16));
Interceptor.attach(scandir, {
    onEnter: function (args) {
        console.log('[+] scandir(' + args[0].readCString() + ')');
        if (args[0].readCString().indexOf("/proc/self/task") !== -1)
        {
            console.log('directory chaned');
            // args[0] = Memory.allocUtf8String("/data/local/tmp/blank");
        }
    },
    onLeave: function (retval) {
    }
});
*/
/*
Interceptor.attach(read, {
    onEnter: function (args) {
        this.Buf = args[1];
        this.count = args[2].toInt32();
    },
    onLeave: function (retval) {
        if (this.count < 200) {
            // console.log(hexdump(this.Buf, {offset: 0, length: this.count, header: true, ansi: false}));
        }
        var matches = Memory.scanSync(this.Buf, this.count, "66 72 69 64 61");
        if (matches.length !== 0)
        {
            for (var i = 0; i < matches.length; i++)
            {
                Memory.writeU8(matches[i].address, 0x20);
                Memory.writeU8(matches[i].address.add(1), 0x20);
                Memory.writeU8(matches[i].address.add(2), 0x20);
                Memory.writeU8(matches[i].address.add(3), 0x20);
                Memory.writeU8(matches[i].address.add(4), 0x20);
            }
        }
    }
});
*/
// void *dlopen(const char *filename, int flag);
var dlopen = getExportFunction("f", "dlopen", "pointer", ["pointer", "int"]);
Interceptor.replace(dlopen, new NativeCallback(function (path, mode) {
    console.log("[+] dlopen(" + "path=" + Memory.readCString(path) + ", mode=" + mode + ")");
    return dlopen(path, mode);
}, 'pointer', ['pointer', 'int']));
// int dlclose(void *handle)
var dlclose = getExportFunction("f", "dlclose", "int", ["pointer"]);
Interceptor.attach(Module.findExportByName(null, "dlsym"), {
    onEnter: function (args) {
        console.log('[+] dlsym(' + args[1].readCString() + ')');

        if (Memory.readCString(args[1]).indexOf('Java_com_xshield_da_z') !== -1) {
            var address = Module.findExportByName(null, 'Java_com_xshield_da_z');
            module = Process.findModuleByAddress(address);
            Memory.protect(module.base, module.size, 'rwx');

            console.log('[+] module.name = ' + module.name);
            console.log('[+] module.base = ' + module.base);
            Memory.writeU8(module.base.add(0x7AA0), 0xC3);
            console.log('[+] >>>>>>>>> 0x7AA0 is patched');
            console.log(hexdump(module.base.add(0x7AA0), { offset: 0, length: 64, header: true, ansi: false }));
            Memory.writeU8(module.base.add(0x7D20), 0xC3);
            console.log('[+] >>>>>>>>> 0x7D20 is patched');
            console.log(hexdump(module.base.add(0x7D20), { offset: 0, length: 64, header: true, ansi: false }));
            Memory.writeU8(module.base.add(0x7E20), 0xC3);
            console.log('[+] >>>>>>>>> 0x7E20 is patched');
            console.log(hexdump(module.base.add(0x7E20), { offset: 0, length: 64, header: true, ansi: false }));
            // console.log('[+] Dumping for ' + module.name);
            // var save_path = '/data/local/tmp/data.bin';
            // var fmodule = open(save_path, O_WRONLY, 0);
            // if (fmodule != -1) {
            //     console.log('[+] writing..');
            //     write(fmodule, Memory.dup(module.base, module.size), module.size);
            //     close(fmodule);
            // }
        }
        /*
        console.log('[+] =====================================================');
        address = Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join(':');
        var callback = address.split(':');
        console.log('[+]['+Process.getModuleByAddress(callback[0]).name+'] called from: '+callback[0]+'\\n');
        console.log('[+] =====================================================');
        if (callback[0].indexOf('.so') == -1)
        {
          console.log(hexdump(ptr(callback[0]), {offset: 0, length: 64, header: true, ansi: false}));
        }
        */
    }
});
    /*
console.log('[+] Dumping for ' + module.name);
var save_path = '/data/local/tmp/data.bin';
var fmodule = open(save_path, O_WRONLY, 0);
if (fmodule != -1) {
console.log('[+] writing..');
write(fmodule, Memory.dup(module.base, module.size), module.size);
close(fmodule);
}
*/