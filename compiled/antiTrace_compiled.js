(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _setImmediate2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/set-immediate"));

/**
 * 未完成！
 * 脚本作用：
 *  绕过/proc/self/status检测
 */
(0, _setImmediate2["default"])(function () {
  var fs = require('./tools/file');

  Interceptor.attach(Module.findExportByName(null, "dlopen"), {
    onEnter: function onEnter(args) {
      var soPath = Memory.readUtf8String(args[0]); // console.log("so load:" + soPath);
    }
  });
  Interceptor.attach(Module.findExportByName("libc.so", "open"), {
    onEnter: function onEnter(args) {
      var path = args[0].readUtf8String();

      if (path.indexOf('/proc') != -1) {
        console.log('libc.so open /proc:' + path);
      }

      if (path.indexOf('/proc/self/cmdline') != -1) {
        console.log("libc.so open /proc/self/cmdline");
        fs.writeStringToFile("/sdcard/cmdline", "");
        args[0] = Memory.allocUtf8String("/sdcard/cmdline");
      }

      if (path.indexOf('/proc/self/status') != -1) {
        console.log("libc.so open /proc/self/status");
        var status = fs.readFileToString("/proc/self/status"); // console.log('read /proc/pid/status file content:' + status);

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
        } // console.log("/proc/self/status mock:" + new_status);


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
        console.log("/proc/self/stat:" + stat); // 正常为17069 (sankuai.meituan) R 。。
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
    onLeave: function onLeave(retval) {}
  }); // Interceptor.attach(Module.findExportByName("libc.so", "strstr"), {
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

},{"./tools/file":2,"@babel/runtime-corejs2/core-js/set-immediate":3,"@babel/runtime-corejs2/helpers/interopRequireDefault":4}],2:[function(require,module,exports){
"use strict";

/**
 * 
 * @param {String} file_path 文件路径
 * @returns String 文件内容
 */
function readFileToString(file_path) {
  var addr_fopen = Module.findExportByName("libc.so", "fopen"); // var addr_fputs = Module.findExportByName("libc.so", "fputs");

  var addr_fgets = Module.findExportByName("libc.so", "fgets");
  var addr_fclose = Module.findExportByName("libc.so", "fclose");
  var addr_feof = Module.findExportByName("libc.so", "feof"); // console.log("addr_fopen:", addr_fopen, "addr_fgets:", addr_fgets, "addr_fclose:", addr_fclose);

  var fopen = new NativeFunction(addr_fopen, "pointer", ["pointer", "pointer"]); // var fputs = new NativeFunction(addr_fputs, "int", ["pointer", "pointer"]);

  var fgets = new NativeFunction(addr_fgets, "pointer", ["pointer", "int", "pointer"]);
  var fclose = new NativeFunction(addr_fclose, "int", ["pointer"]);
  var feof = new NativeFunction(addr_feof, "int", ["pointer"]);
  var filename = Memory.allocUtf8String(file_path);
  var open_mode = Memory.allocUtf8String("r");
  var file = fopen(filename, open_mode); // console.log("fopen:", file);

  try {
    var fileContent = "";
    var str = Memory.alloc(128);

    while (true) {
      if (feof(file)) {
        console.log(file_path + ' read end!');
        break;
      }

      var temp = Memory.readCString(fgets(str, 128, file)); // console.log("read content:" + temp);

      fileContent += temp;
    }

    fclose(file);
    return fileContent;
  } catch (e) {
    console.log(e);
    return null;
  }
}

function writeStringToFile(file_path, content) {
  var file = new File(file_path, "w");
  file.write(content);
  file.flush();
  file.close();
}

exports.readFileToString = readFileToString;
exports.writeStringToFile = writeStringToFile;

},{}],3:[function(require,module,exports){
module.exports = require("core-js/library/fn/set-immediate");
},{"core-js/library/fn/set-immediate":5}],4:[function(require,module,exports){
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;
},{}],5:[function(require,module,exports){
require('../modules/web.immediate');
module.exports = require('../modules/_core').setImmediate;

},{"../modules/_core":9,"../modules/web.immediate":26}],6:[function(require,module,exports){
module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

},{}],7:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

},{"./_is-object":21}],8:[function(require,module,exports){
var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};

},{}],9:[function(require,module,exports){
var core = module.exports = { version: '2.6.11' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef

},{}],10:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

},{"./_a-function":6}],11:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_fails":14}],12:[function(require,module,exports){
var isObject = require('./_is-object');
var document = require('./_global').document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};

},{"./_global":15,"./_is-object":21}],13:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var ctx = require('./_ctx');
var hide = require('./_hide');
var has = require('./_has');
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var IS_WRAP = type & $export.W;
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE];
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE];
  var key, own, out;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if (own && has(exports, key)) continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function (C) {
      var F = function (a, b, c) {
        if (this instanceof C) {
          switch (arguments.length) {
            case 0: return new C();
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if (IS_PROTO) {
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if (type & $export.R && expProto && !expProto[key]) hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;

},{"./_core":9,"./_ctx":10,"./_global":15,"./_has":16,"./_hide":17}],14:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

},{}],15:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef

},{}],16:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};

},{}],17:[function(require,module,exports){
var dP = require('./_object-dp');
var createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

},{"./_descriptors":11,"./_object-dp":22,"./_property-desc":23}],18:[function(require,module,exports){
var document = require('./_global').document;
module.exports = document && document.documentElement;

},{"./_global":15}],19:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function () {
  return Object.defineProperty(require('./_dom-create')('div'), 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_descriptors":11,"./_dom-create":12,"./_fails":14}],20:[function(require,module,exports){
// fast apply, http://jsperf.lnkit.com/fast-apply/5
module.exports = function (fn, args, that) {
  var un = that === undefined;
  switch (args.length) {
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return fn.apply(that, args);
};

},{}],21:[function(require,module,exports){
module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

},{}],22:[function(require,module,exports){
var anObject = require('./_an-object');
var IE8_DOM_DEFINE = require('./_ie8-dom-define');
var toPrimitive = require('./_to-primitive');
var dP = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

},{"./_an-object":7,"./_descriptors":11,"./_ie8-dom-define":19,"./_to-primitive":25}],23:[function(require,module,exports){
module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

},{}],24:[function(require,module,exports){
var ctx = require('./_ctx');
var invoke = require('./_invoke');
var html = require('./_html');
var cel = require('./_dom-create');
var global = require('./_global');
var process = global.process;
var setTask = global.setImmediate;
var clearTask = global.clearImmediate;
var MessageChannel = global.MessageChannel;
var Dispatch = global.Dispatch;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var defer, channel, port;
var run = function () {
  var id = +this;
  // eslint-disable-next-line no-prototype-builtins
  if (queue.hasOwnProperty(id)) {
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listener = function (event) {
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!setTask || !clearTask) {
  setTask = function setImmediate(fn) {
    var args = [];
    var i = 1;
    while (arguments.length > i) args.push(arguments[i++]);
    queue[++counter] = function () {
      // eslint-disable-next-line no-new-func
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id) {
    delete queue[id];
  };
  // Node.js 0.8-
  if (require('./_cof')(process) == 'process') {
    defer = function (id) {
      process.nextTick(ctx(run, id, 1));
    };
  // Sphere (JS game engine) Dispatch API
  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if (MessageChannel) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = listener;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (global.addEventListener && typeof postMessage == 'function' && !global.importScripts) {
    defer = function (id) {
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listener, false);
  // IE8-
  } else if (ONREADYSTATECHANGE in cel('script')) {
    defer = function (id) {
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function () {
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function (id) {
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set: setTask,
  clear: clearTask
};

},{"./_cof":8,"./_ctx":10,"./_dom-create":12,"./_global":15,"./_html":18,"./_invoke":20}],25:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};

},{"./_is-object":21}],26:[function(require,module,exports){
var $export = require('./_export');
var $task = require('./_task');
$export($export.G + $export.B, {
  setImmediate: $task.set,
  clearImmediate: $task.clear
});

},{"./_export":13,"./_task":24}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2ZyaWRhLWNvbXBpbGUvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImFudGlUcmFjZS5qcyIsInRvb2xzL2ZpbGUuanMiLCIuLi8uLi8uLi8uLi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy9mcmlkYS1jb21waWxlL25vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS1jb3JlanMyL2NvcmUtanMvc2V0LWltbWVkaWF0ZS5qcyIsIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2ZyaWRhLWNvbXBpbGUvbm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lLWNvcmVqczIvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHQuanMiLCIuLi8uLi8uLi8uLi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy9mcmlkYS1jb21waWxlL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vc2V0LWltbWVkaWF0ZS5qcyIsIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2ZyaWRhLWNvbXBpbGUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hLWZ1bmN0aW9uLmpzIiwiLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvZnJpZGEtY29tcGlsZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2FuLW9iamVjdC5qcyIsIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2ZyaWRhLWNvbXBpbGUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19jb2YuanMiLCIuLi8uLi8uLi8uLi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy9mcmlkYS1jb21waWxlL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY29yZS5qcyIsIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2ZyaWRhLWNvbXBpbGUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19jdHguanMiLCIuLi8uLi8uLi8uLi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy9mcmlkYS1jb21waWxlL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZGVzY3JpcHRvcnMuanMiLCIuLi8uLi8uLi8uLi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy9mcmlkYS1jb21waWxlL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZG9tLWNyZWF0ZS5qcyIsIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2ZyaWRhLWNvbXBpbGUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19leHBvcnQuanMiLCIuLi8uLi8uLi8uLi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy9mcmlkYS1jb21waWxlL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZmFpbHMuanMiLCIuLi8uLi8uLi8uLi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy9mcmlkYS1jb21waWxlL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZ2xvYmFsLmpzIiwiLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvZnJpZGEtY29tcGlsZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2hhcy5qcyIsIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2ZyaWRhLWNvbXBpbGUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19oaWRlLmpzIiwiLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvZnJpZGEtY29tcGlsZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2h0bWwuanMiLCIuLi8uLi8uLi8uLi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy9mcmlkYS1jb21waWxlL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faWU4LWRvbS1kZWZpbmUuanMiLCIuLi8uLi8uLi8uLi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy9mcmlkYS1jb21waWxlL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faW52b2tlLmpzIiwiLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvZnJpZGEtY29tcGlsZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2lzLW9iamVjdC5qcyIsIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2ZyaWRhLWNvbXBpbGUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtZHAuanMiLCIuLi8uLi8uLi8uLi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy9mcmlkYS1jb21waWxlL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fcHJvcGVydHktZGVzYy5qcyIsIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2ZyaWRhLWNvbXBpbGUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL190YXNrLmpzIiwiLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvZnJpZGEtY29tcGlsZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3RvLXByaW1pdGl2ZS5qcyIsIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2ZyaWRhLWNvbXBpbGUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL3dlYi5pbW1lZGlhdGUuanMiXSwibmFtZXMiOltdLCJt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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIifQ==
