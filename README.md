# Frida常用工具脚本集合 -- 创作中

- 记录日常使用Frida时经常使用到和学习到的一些工具类库集合。
- 同时也是Frida入门学习的可参考资料

## 目录
- [Frida 文件读写IO工具类](/tools/file.js)
  - 由于官方仅有文件写入的工具类，因此封装通过libc.so中的open、fgets等函数完成文件读取，实现readFileToString
  - 通过官方File API完成文件写入
- [Frida 简单过反调试](/antiTrace.js)
  - 常用的反调试中存在检测/proc/self/status、/proc/self/stat等文件来判断是否被ptrace，而Frida虽然也利用到了ptrace，但Frida只会短暂的使用ptrace便会deattach，因此可以使用frida spawn方式和重定向的方式来绕过这些简单的文件反调试。