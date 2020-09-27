/**
 * IO模块：
 *  1. 读取文件中所有内容并保存为一个JS String对象
 *  2. 字符串输出到一个文件中
 * 
 * 使用方法：
 *  1. 如果仅仅想引用方法，拷贝方法即可。
 *  2. 如果脚本是个node.js module，可以在文件中引入该模块，然后通过frida-compile命令编译生成最终JS，例如:
 *      frida-compile antiTrace -o antiTrace_compiled.js && frida -U --no-pause -f com.xx.xx -l ~/code/frida-scripts/compiled/antiTrace_compiled.js
 *      ```
 *          var fs = require('./tools/file');
 *          fs.readFileToString('/proc/self/status');
 *      ```
 */

/**
 * 
 * @param {String} file_path 文件路径
 * @returns String 文件内容
 */
function readFileToString(file_path) {
    var addr_fopen = Module.findExportByName("libc.so", "fopen");
    // var addr_fputs = Module.findExportByName("libc.so", "fputs");
    var addr_fgets = Module.findExportByName("libc.so", "fgets");
    var addr_fclose = Module.findExportByName("libc.so", "fclose");
    var addr_feof = Module.findExportByName("libc.so", "feof");

    // console.log("addr_fopen:", addr_fopen, "addr_fgets:", addr_fgets, "addr_fclose:", addr_fclose);
    var fopen = new NativeFunction(addr_fopen, "pointer", ["pointer", "pointer"]);
    // var fputs = new NativeFunction(addr_fputs, "int", ["pointer", "pointer"]);
    var fgets = new NativeFunction(addr_fgets, "pointer", ["pointer", "int", "pointer"]);
    var fclose = new NativeFunction(addr_fclose, "int", ["pointer"]);
    var feof = new NativeFunction(addr_feof, "int", ["pointer"]);

    var filename = Memory.allocUtf8String(file_path);
    var open_mode = Memory.allocUtf8String("r");
    var file = fopen(filename, open_mode);
    // console.log("fopen:", file);

    try {
        var fileContent = "";
        var str = Memory.alloc(128);
        while (true) {
            if (feof(file)) {
                console.log(file_path + ' read end!');
                break;
            }
            var temp = Memory.readCString(fgets(str, 128, file));
            // console.log("read content:" + temp);
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