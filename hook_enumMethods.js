/**
 * 通用批量模糊Hook脚本
 */

var targetClassRegex = new RegExp("com.*");
var targetMethodName = "toString";
/**
 * 找到目标方法后是否开启Hook
 */
var is_need_hook = true;

setImmediate(function () {
    Java.perform(function () {
        // Java.enumerateClassLoaders({
        //     "onMatch": function (loader) {
        //         console.log(loader);
        //         Java.classFactory.loader = loader;
        //         enmuLoadedClass();
        //     },
        //     "onComplete": function () {
        //         console.log("!!!!!finish!!!!!");
        //     }
        // });

        enmuLoadedClass();

    })
})

function enmuLoadedClass() {
    console.log('target class:' + targetClassRegex);
    console.log('target method:' + targetMethodName);
    Java.enumerateLoadedClasses({
        onMatch: function (name, handle) {
            // if (name.startsWith("android")) {
            //     // 过滤系统类
            //     return;
            // }
            if (!targetClassRegex.test(name)) {
                return;
            }
            // console.log('finding class:' + name);
            enmuMethodByUse(name)
        },
        onComplete: function () {
            console.warn("batch fuzzy hook finish!");
        }
    });
}

function enmuMethodByUse(className) {
    try {
        var classInstance = Java.use(className);
        var methods = classInstance.class.getDeclaredMethods();
        methods.forEach(method => {
            var methodName = method.getName();
            var returnType = method.getReturnType();
            //console.warn("className: ", className, " ,method name: ", methodName, " ,returnType: ", returnType, " ,paramTypes: ", method.getParameterTypes());
            var isReturnString = returnType.getClass().getName().indexOf('java.lang.CharSequence') || returnType.indexOf('java.lang.String');
            if (methodName.indexOf(targetMethodName) != -1) {
                if(!isReturnString){
                    console.warn("but not return String,found target method >>>>>>>>>>>> className: ", className, " ,method name: ", methodName, " ,returnType: ", returnType, " ,paramTypes: ", method.getParameterTypes());
                    return;
                }
                console.warn("found target method >>>>>>>>>>>> className: ", className, " ,method name: ", methodName, " ,returnType: ", returnType, " ,paramTypes: ", method.getParameterTypes());
                hookTargetMethod(className, classInstance, methodName);
            }
        });
        classInstance.$dispose;
    } catch (error) {
        //ignore
    }
}



function hookTargetMethod(className, targetInstance, methodName) {
    if (!is_need_hook) {
        return;
    }
    var overloadCount = targetInstance[methodName].overloads.length;
    console.log("overloadCount: ", overloadCount);
    for (var i = 0; i < overloadCount; i++) {

        targetInstance[methodName].overloads[i].implementation = function () {
            console.warn("\n*** start print className: ", className, " methodName: ", methodName);
            // 打印参数
            if (arguments.length) console.log();
            for (var j = 0; j < arguments.length; j++) {
                console.log("arg[" + j + "]: " + arguments[j]);
            }
            //打印返回值
            var retval = this[methodName].apply(this, arguments); // rare crash (Frida bug?)
            console.log("\nreturn: " + retval);
            console.warn("\n*** end print className: ", className, " methodName: ", methodName);
            return retval;
        }
    }
}



/**
 * 这个会卡死，为什么？？扫描一下Java heap ，就卡死了？？？
 * @param {} className 
 */
function enmuMethodByChoose(className) {
    var classInstance = Java.choose(className, {
        onMatch: function (instance) {
            var methods = classInstance.class.getDeclaredMethods();
            methods.forEach(method => {
                var methodName = method.getName();
                var returnType = method.getReturnType();
                console.log("method name", methodName, "returnType", returnType);
                console.log("returnType is void ", (returnType == "void"));
            });
            classInstance.$dispose;
        }
        , onComplete: function () { }
    });

}