// JS Hook Xposed API
Function.prototype.attach = function (context, onEnter, onLeave) {

    // 函数或全局上下文
    var _context = context || window;
    var _funcName = getFuncName(this);
    if (!_funcName) {
        console.log('hook target function is empty~ may be a bug');
        return false;
    }

    console.log('hook target function:' + _funcName);

    if (_context[_funcName].prototype && _context[_funcName].prototype.isHooked) {
        console.log("Already has been hooked:" + _funcName);
        return false;
    }

    // backup orig function
    var backupFuncName = getBackupFuncName(_funcName);
    _context[backupFuncName] = this;

    // replace orig function

    try {
        _context[_funcName] = function () {
            var args = Array.prototype.slice.call(arguments,0);
            var obj = this;
            var wrapper = {
                args: args
            };
            try {
                if (onEnter) {
                    onEnter.apply(obj, wrapper);
                }
            } catch (error) {
                console.log('onEnter call failure:' + _funcName, error);
            }

            var retval = _context[backupFuncName].apply(obj, wrapper.args);

            try {
                if (onLeave) {
                    retval = onLeave.call(obj, retval);
                }
            } catch (error) {
                console.log('onLeave call failure:' + _funcName, error);
            }

            return retval;
        }

        // 为什么要加eval
        // 为什么要用_funcName
        eval('_context[_funcName] = function ' + _funcName + ' () {\n' +
            'var args = Array.prototype.slice.call(arguments,0);\n'+
            'var obj = this;\n' +
            'try {\n' +
            'if (onEnter) {\n' +
            'onEnter.apply(obj, args);\n' +
            '}\n' +
            '} catch (error) {\n' +
            'console.log("onEnter call failure:" + _funcName, error);\n' +
            '}\n' +
            'var retval = _context[backupFuncName].apply(obj, args);\n' +
            'try {\n' +
            'if (onLeave) {\n' +
            'onLeave.call(obj, retval);\n' +
            '}\n' +
            '} catch (error) {\n' +
            'console.log("onLeave call failure:" + _funcName, error);\n' +
            '}\n' +
            'return retval;\n' +
            '}')
        _context[_funcName].prototype.isHooked = true;
        return true;
    } catch (error) {
        console.log('js function hook error:', error);
        return false;
    }

}

Function.prototype.unhook = function (context) {
    // 函数或全局上下文
    var _context = context || window;
    var _funcName = getFuncName(this);

    if (!_funcName) {
        console.log('the unhook target function is empty!');
        return false;
    }

    if (_context[_funcName] && _context[_funcName].prototype && _context[_funcName].prototype.isHooked) {
        _context[_funcName] = _context[getBackupFuncName(_funcName)];
        console.log('unhook function success:' + _funcName);
    } else {
        console.log('function is not hooked:' + _funcName);
    }

}

function getFuncName(fn) {
    var strFunc = fn.toString();
    var _regex = /function\s+(\w+)\s*\(/;
    var patten = strFunc.match(_regex);
    if (patten) {
        return patten[1];
    };
    return '';
}

function getBackupFuncName(realFuncName) {
    return realFuncName + "_xp_backup";
}



// =============== eg ===============

btoa.attach(window, function (wrapper) {
    console.log('hooked atob params:' + wrapper);
    wrapper.args = 'Hello World';
    console.log('hooked atob params 2:' + wrapper);
}, function (retval) {
    console.log('hooked atob result:' + retval);
});

var result = btoa('12313541234');
console.log('btoa invoke result:' + result + ",origin content:" + atob(result));