var ThreadsFollowed = {};
function isThreadFollowed(tid) {
  if (ThreadsFollowed.tid) {
    return true;
  } else {
    return false;
  }
}
function showAddr(tag, point)
{
	function isAppModule(m) {
		return !/^\/(usr\/lib|System|Developer)\//.test(m.path);
    }
    var m = new ModuleMap(isAppModule);
    var moduleName = m.findName(ptr(point));
    if(isShowSysAddr == false)
    {
        if(moduleName == "libc.so")
        {
            return;
        }
    }
    var libso = Module.findBaseAddress(moduleName);
	console.log(tag + "=> " + moduleName,"offset:",point.sub(libso));
}
function parseSysCall(sysCallobj,context)
{
    var strPare = "";
    var strsysCall = sysCallobj.toString();
    var numsysCall = Number(strsysCall);
    switch(numsysCall){
        case 0:   
        strPare = strPare + "[restart_syscall]";
        break;
    case 1:   
        strPare = strPare + "[exit]";
        break;
    case 2:   
        strPare = strPare + "[fork]";
        break;
    case 3:   
        strPare = strPare + "[read]";
        break;
    case 4:   
        strPare = strPare + "[write]";
        break;
    case 5:   
        strPare = strPare + "[open]";
        break;
    case 6:   
        strPare = strPare + "[close]";
        break;
    case 8:   
        strPare = strPare + "[creat]";
        break;
    case 9:   
        strPare = strPare + "[link]";
        break;
    case 10:  
        strPare = strPare + "[unlink]";
        break;
    case 11:  
        strPare = strPare + "[execve]";
        break;
    case 12:  
        strPare = strPare + "[chdir]";
        break;
    case 14:  
        strPare = strPare + "[mknod]";
        break;
    case 15:  
        strPare = strPare + "[chmod]";
        break;
    case 16:  
        strPare = strPare + "[lchown]";
        break;
    case 19:  
        strPare = strPare + "[lseek]";
        break;
    case 20:  
        strPare = strPare + "[getpid]";
        break;
    case 21:  
        strPare = strPare + "[mount]";
        break;
    case 23:  
        strPare = strPare + "[setuid]";
        break;
    case 24:  
        strPare = strPare + "[getuid]";
        break;
    case 26:  
        strPare = strPare + "[ptrace]";
        break;
    case 29:  
        strPare = strPare + "[pause]";
        break;
    case 33:  
        strPare = strPare + "[access]";
        break;
    case 34:  
        strPare = strPare + "[nice]";
        break;
    case 36:  
        strPare = strPare + "[sync]";
        break;
    case 37:  
        strPare = strPare + "[kill]";
        break;
    case 38:  
        strPare = strPare + "[rename]";
        break;
    case 39:  
        strPare = strPare + "[mkdir]";
        break;
    case 40:  
        strPare = strPare + "[rmdir]";
        break;
    case 41:  
        strPare = strPare + "[dup]";
        break;
    case 42:  
        strPare = strPare + "[pipe]";
        break;
    case 43:  
        strPare = strPare + "[times]";
        break;
    case 45:  
        strPare = strPare + "[brk]";
        break;
    case 46:  
        strPare = strPare + "[setgid]";
        break;
    case 47:  
        strPare = strPare + "[getgid]";
        break;
    case 49:  
        strPare = strPare + "[geteuid]";
        break;
    case 50:  
        strPare = strPare + "[getegid]";
        break;
    case 51:  
        strPare = strPare + "[acct]";
        break;
    case 52:  
        strPare = strPare + "[umount2]";
        break;
    case 54:  
        strPare = strPare + "[ioctl]";
        break;
    case 55:  
        strPare = strPare + "[fcntl]";
        break;
    case 57:  
        strPare = strPare + "[setpgid]";
        break;
    case 60:  
        strPare = strPare + "[umask]";
        break;
    case 61:  
        strPare = strPare + "[chroot]";
        break;
    case 62:  
        strPare = strPare + "[ustat]";
        break;
    case 63:  
        strPare = strPare + "[dup2]";
        break;
    case 64:  
        strPare = strPare + "[getppid]";
        break;
    case 65:  
        strPare = strPare + "[getpgrp]";
        break;
    case 66:  
        strPare = strPare + "[setsid]";
        break;
    case 67:  
        strPare = strPare + "[sigaction]";
        break;
    case 70:  
        strPare = strPare + "[setreuid]";
        break;
    case 71:  
        strPare = strPare + "[setregid]";
        break;
    case 72:  
        strPare = strPare + "[sigsuspend]";
        break;
    case 73:  
        strPare = strPare + "[sigpending]";
        break;
    case 74:  
        strPare = strPare + "[sethostname]";
        break;
    case 75:  
        strPare = strPare + "[setrlimit]";
        break;
    case 77:  
        strPare = strPare + "[getrusage]";
        break;
    case 78:  
        strPare = strPare + "[gettimeofday]";
        break;
    case 79:  
        strPare = strPare + "[settimeofday]";
        break;
    case 80:  
        strPare = strPare + "[getgroups]";
        break;
    case 81:  
        strPare = strPare + "[setgroups]";
        break;
    case 83:  
        strPare = strPare + "[symlink]";
        break;
    case 85:  
        strPare = strPare + "[readlink]";
        break;
    case 86:  
        strPare = strPare + "[uselib]";
        break;
    case 87:  
        strPare = strPare + "[swapon]";
        break;
    case 88:  
        strPare = strPare + "[reboot]";
        break;
    case 91:  
        strPare = strPare + "[munmap]";
        break;
    case 92:  
        strPare = strPare + "[truncate]";
        break;
    case 93:  
        strPare = strPare + "[ftruncate]";
        break;
    case 94:  
        strPare = strPare + "[fchmod]";
        break;
    case 95:  
        strPare = strPare + "[fchown]";
        break;
    case 96:  
        strPare = strPare + "[getpriority]";
        break;
    case 97:  
        strPare = strPare + "[setpriority]";
        break;
    case 99:  
        strPare = strPare + "[statfs]";
        break;
    case 100: 
        strPare = strPare + "[fstatfs]";
        break;
    case 103: 
        strPare = strPare + "[syslog]";
        break;
    case 104: 
        strPare = strPare + "[setitimer]";
        break;
    case 105: 
        strPare = strPare + "[getitimer]";
        break;
    case 106: 
        strPare = strPare + "[stat]";
        break;
    case 107: 
        strPare = strPare + "[lstat]";
        break;
    case 108: 
        strPare = strPare + "[fstat]";
        break;
    case 111: 
        strPare = strPare + "[vhangup]";
        break;
    case 114: 
        strPare = strPare + "[wait4]";
        break;
    case 115: 
        strPare = strPare + "[swapoff]";
        break;
    case 116: 
        strPare = strPare + "[sysinfo]";
        break;
    case 118: 
        strPare = strPare + "[fsync]";
        break;
    case 119: 
        strPare = strPare + "[sigreturn]";
        break;
    case 120: 
        strPare = strPare + "[clone]";
        break;
    case 121: 
        strPare = strPare + "[setdomainname]";
        break;
    case 122: 
        strPare = strPare + "[uname]";
        break;
    case 124: 
        strPare = strPare + "[adjtimex]";
        break;
    case 125: 
        strPare = strPare + "[mprotect]";
        break;
    case 126: 
        strPare = strPare + "[sigprocmask]";
        break;
    case 128: 
        strPare = strPare + "[init_module]";
        break;
    case 129: 
        strPare = strPare + "[delete_module]";
        break;
    case 131: 
        strPare = strPare + "[quotactl]";
        break;
    case 132: 
        strPare = strPare + "[getpgid]";
        break;
    case 133: 
        strPare = strPare + "[fchdir]";
        break;
    case 134: 
        strPare = strPare + "[bdflush]";
        break;
    case 135: 
        strPare = strPare + "[sysfs]";
        break;
    case 136: 
        strPare = strPare + "[personality]";
        break;
    case 138: 
        strPare = strPare + "[setfsuid]";
        break;
    case 139: 
        strPare = strPare + "[setfsgid]";
        break;
    case 140: 
        strPare = strPare + "[_llseek]";
        break;
    case 141: 
        strPare = strPare + "[getdents]";
        break;
    case 142: 
        strPare = strPare + "[_newselect]";
        break;
    case 143: 
        strPare = strPare + "[flock]";
        break;
    case 144: 
        strPare = strPare + "[msync]";
        break;
    case 145: 
        strPare = strPare + "[readv]";
        break;
    case 146: 
        strPare = strPare + "[writev]";
        break;
    case 147: 
        strPare = strPare + "[getsid]";
        break;
    case 148: 
        strPare = strPare + "[fdatasync]";
        break;
    case 149: 
        strPare = strPare + "[_sysctl]";
        break;
    case 150: 
        strPare = strPare + "[mlock]";
        break;
    case 151: 
        strPare = strPare + "[munlock]";
        break;
    case 152: 
        strPare = strPare + "[mlockall]";
        break;
    case 153: 
        strPare = strPare + "[munlockall]";
        break;
    case 154: 
        strPare = strPare + "[sched_setparam]";
        break;
    case 155: 
        strPare = strPare + "[sched_getparam]";
        break;
    case 156: 
        strPare = strPare + "[sched_setscheduler]";
        break;
    case 157: 
        strPare = strPare + "[sched_getscheduler]";
        break;
    case 158: 
        strPare = strPare + "[sched_yield]";
        break;
    case 159: 
        strPare = strPare + "[sched_get_priority_max]";
        break;
    case 160: 
        strPare = strPare + "[sched_get_priority_min]";
        break;
    case 161: 
        strPare = strPare + "[sched_rr_get_interval]";
        break;
    case 162: 
        strPare = strPare + "[nanosleep]";
        break;
    case 163: 
        strPare = strPare + "[mremap]";
        break;
    case 164: 
        strPare = strPare + "[setresuid]";
        break;
    case 165: 
        strPare = strPare + "[getresuid]";
        break;
    case 168: 
        strPare = strPare + "[poll]";
        break;
    case 169: 
        strPare = strPare + "[nfsservctl]";
        break;
    case 170: 
        strPare = strPare + "[setresgid]";
        break;
    case 171: 
        strPare = strPare + "[getresgid]";
        break;
    case 172: 
        strPare = strPare + "[prctl]";
        break;
    case 173: 
        strPare = strPare + "[rt_sigreturn]";
        break;
    case 174: 
        strPare = strPare + "[rt_sigaction]";
        break;
    case 175: 
        strPare = strPare + "[rt_sigprocmask]";
        break;
    case 176: 
        strPare = strPare + "[rt_sigpending]";
        break;
    case 177: 
        strPare = strPare + "[rt_sigtimedwait]";
        break;
    case 178: 
        strPare = strPare + "[rt_sigqueueinfo]";
        break;
    case 179: 
        strPare = strPare + "[rt_sigsuspend]";
        break;
    case 180: 
        strPare = strPare + "[pread64]";
        break;
    case 181: 
        strPare = strPare + "[pwrite64]";
        break;
    case 182: 
        strPare = strPare + "[chown]";
        break;
    case 183: 
        strPare = strPare + "[getcwd]";
        break;
    case 184: 
        strPare = strPare + "[capget]";
        break;
    case 185: 
        strPare = strPare + "[capset]";
        break;
    case 186: 
        strPare = strPare + "[sigaltstack]";
        break;
    case 187: 
        strPare = strPare + "[sendfile]";
        break;
    case 190: 
        strPare = strPare + "[vfork]";
        break;
    case 191: 
        strPare = strPare + "[ugetrlimit]";
        break;
    case 192: 
        strPare = strPare + "[mmap2]";
        break;
    case 193: 
        strPare = strPare + "[truncate64]";
        break;
    case 194: 
        strPare = strPare + "[ftruncate64]";
        break;
    case 195: 
        strPare = strPare + "[stat64]";
        break;
    case 196: 
        strPare = strPare + "[lstat64]";
        break;
    case 197: 
        strPare = strPare + "[fstat64]";
        break;
    case 198: 
        strPare = strPare + "[lchown32]";
        break;
    case 199: 
        strPare = strPare + "[getuid32]";
        break;
    case 200: 
        strPare = strPare + "[getgid32]";
        break;
    case 201: 
        strPare = strPare + "[geteuid32]";
        break;
    case 202: 
        strPare = strPare + "[getegid32]";
        break;
    case 203: 
        strPare = strPare + "[setreuid32]";
        break;
    case 204: 
        strPare = strPare + "[setregid32]";
        break;
    case 205: 
        strPare = strPare + "[getgroups32]";
        break;
    case 206: 
        strPare = strPare + "[setgroups32]";
        break;
    case 207: 
        strPare = strPare + "[fchown32]";
        break;
    case 208: 
        strPare = strPare + "[setresuid32]";
        break;
    case 209: 
        strPare = strPare + "[getresuid32]";
        break;
    case 210: 
        strPare = strPare + "[setresgid32]";
        break;
    case 211: 
        strPare = strPare + "[getresgid32]";
        break;
    case 212: 
        strPare = strPare + "[chown32]";
        break;
    case 213: 
        strPare = strPare + "[setuid32]";
        break;
    case 214: 
        strPare = strPare + "[setgid32]";
        break;
    case 215: 
        strPare = strPare + "[setfsuid32]";
        break;
    case 216: 
        strPare = strPare + "[setfsgid32]";
        break;
    case 217: 
        strPare = strPare + "[getdents64]";
        break;
    case 218: 
        strPare = strPare + "[pivot_root]";
        break;
    case 219: 
        strPare = strPare + "[mincore]";
        break;
    case 220: 
        strPare = strPare + "[madvise]";
        break;
    case 221: 
        strPare = strPare + "[fcntl64]";
        break;
    case 224: 
        strPare = strPare + "[gettid]";
        break;
    case 225: 
        strPare = strPare + "[readahead]";
        break;
    case 226: 
        strPare = strPare + "[setxattr]";
        break;
    case 227: 
        strPare = strPare + "[lsetxattr]";
        break;
    case 228: 
        strPare = strPare + "[fsetxattr]";
        break;
    case 229: 
        strPare = strPare + "[getxattr]";
        break;
    case 230: 
        strPare = strPare + "[lgetxattr]";
        break;
    case 231: 
        strPare = strPare + "[fgetxattr]";
        break;
    case 232: 
        strPare = strPare + "[listxattr]";
        break;
    case 233: 
        strPare = strPare + "[llistxattr]";
        break;
    case 234: 
        strPare = strPare + "[flistxattr]";
        break;
    case 235: 
        strPare = strPare + "[removexattr]";
        break;
    case 236: 
        strPare = strPare + "[lremovexattr]";
        break;
    case 237: 
        strPare = strPare + "[fremovexattr]";
        break;
    case 238: 
        strPare = strPare + "[tkill]";
        break;
    case 239: 
        strPare = strPare + "[sendfile64]";
        break;
    case 240: 
        strPare = strPare + "[futex]";
        break;
    case 241: 
        strPare = strPare + "[sched_setaffinity]";
        break;
    case 242: 
        strPare = strPare + "[sched_getaffinity]";
        break;
    case 243: 
        strPare = strPare + "[io_setup]";
        break;
    case 244: 
        strPare = strPare + "[io_destroy]";
        break;
    case 245: 
        strPare = strPare + "[io_getevents]";
        break;
    case 246: 
        strPare = strPare + "[io_submit]";
        break;
    case 247: 
        strPare = strPare + "[io_cancel]";
        break;
    case 248: 
        strPare = strPare + "[exit_group]";
        break;
    case 249: 
        strPare = strPare + "[lookup_dcookie]";
        break;
    case 250: 
        strPare = strPare + "[epoll_create]";
        break;
    case 251: 
        strPare = strPare + "[epoll_ctl]";
        break;
    case 252: 
        strPare = strPare + "[epoll_wait]";
        break;
    case 253: 
        strPare = strPare + "[remap_file_pages]";
        break;
    case 256: 
        strPare = strPare + "[set_tid_address]";
        break;
    case 257: 
        strPare = strPare + "[timer_create]";
        break;
    case 258: 
        strPare = strPare + "[timer_settime]";
        break;
    case 259: 
        strPare = strPare + "[timer_gettime]";
        break;
    case 260: 
        strPare = strPare + "[timer_getoverrun]";
        break;
    case 261: 
        strPare = strPare + "[timer_delete]";
        break;
    case 262: 
        strPare = strPare + "[clock_settime]";
        break;
    case 263: 
        strPare = strPare + "[clock_gettime]";
        break;
    case 264: 
        strPare = strPare + "[clock_getres]";
        break;
    case 265: 
        strPare = strPare + "[clock_nanosleep]";
        break;
    case 266: 
        strPare = strPare + "[statfs64]";
        break;
    case 267: 
        strPare = strPare + "[fstatfs64]";
        break;
    case 268: 
        strPare = strPare + "[tgkill]";
        break;
    case 269: 
        strPare = strPare + "[utimes]";
        break;
    case 270: 
        strPare = strPare + "[arm_fadvise64_64]";
        break;
    case 271: 
        strPare = strPare + "[pciconfig_iobase]";
        break;
    case 272: 
        strPare = strPare + "[pciconfig_read]";
        break;
    case 273: 
        strPare = strPare + "[pciconfig_write]";
        break;
    case 274: 
        strPare = strPare + "[mq_open]";
        break;
    case 275: 
        strPare = strPare + "[mq_unlink]";
        break;
    case 276: 
        strPare = strPare + "[mq_timedsend]";
        break;
    case 277: 
        strPare = strPare + "[mq_timedreceive]";
        break;
    case 278: 
        strPare = strPare + "[mq_notify]";
        break;
    case 279: 
        strPare = strPare + "[mq_getsetattr]";
        break;
    case 280: 
        strPare = strPare + "[waitid]";
        break;
    case 281: 
        strPare = strPare + "[socket]";
        break;
    case 282: 
        strPare = strPare + "[bind]";
        break;
    case 283: 
        strPare = strPare + "[connect]";
        break;
    case 284: 
        strPare = strPare + "[listen]";
        break;
    case 285: 
        strPare = strPare + "[accept]";
        break;
    case 286: 
        strPare = strPare + "[getsockname]";
        break;
    case 287: 
        strPare = strPare + "[getpeername]";
        break;
    case 288: 
        strPare = strPare + "[socketpair]";
        break;
    case 289: 
        strPare = strPare + "[send]";
        break;
    case 290: 
        strPare = strPare + "[sendto]";
        break;
    case 291: 
        strPare = strPare + "[recv]";
        break;
    case 292: 
        strPare = strPare + "[recvfrom]";
        break;
    case 293: 
        strPare = strPare + "[shutdown]";
        break;
    case 294: 
        strPare = strPare + "[setsockopt]";
        break;
    case 295: 
        strPare = strPare + "[getsockopt]";
        break;
    case 296: 
        strPare = strPare + "[sendmsg]";
        break;
    case 297: 
        strPare = strPare + "[recvmsg]";
        break;
    case 298: 
        strPare = strPare + "[semop]";
        break;
    case 299: 
        strPare = strPare + "[semget]";
        break;
    case 300: 
        strPare = strPare + "[semctl]";
        break;
    case 301: 
        strPare = strPare + "[msgsnd]";
        break;
    case 302: 
        strPare = strPare + "[msgrcv]";
        break;
    case 303: 
        strPare = strPare + "[msgget]";
        break;
    case 304: 
        strPare = strPare + "[msgctl]";
        break;
    case 305: 
        strPare = strPare + "[shmat]";
        break;
    case 306: 
        strPare = strPare + "[shmdt]";
        break;
    case 307: 
        strPare = strPare + "[shmget]";
        break;
    case 308: 
        strPare = strPare + "[shmctl]";
        break;
    case 309: 
        strPare = strPare + "[add_key]";
        break;
    case 310: 
        strPare = strPare + "[request_key]";
        break;
    case 311: 
        strPare = strPare + "[keyctl]";
        break;
    case 312: 
        strPare = strPare + "[semtimedop]";
        break;
    case 313: 
        strPare = strPare + "[vserver]";
        break;
    case 314: 
        strPare = strPare + "[ioprio_set]";
        break;
    case 315: 
        strPare = strPare + "[ioprio_get]";
        break;
    case 316: 
        strPare = strPare + "[inotify_init]";
        break;
    case 317: 
        strPare = strPare + "[inotify_add_watch]";
        break;
    case 318: 
        strPare = strPare + "[inotify_rm_watch]";
        break;
    case 319: 
        strPare = strPare + "[mbind]";
        break;
    case 320: 
        strPare = strPare + "[get_mempolicy]";
        break;
    case 321: 
        strPare = strPare + "[set_mempolicy]";
        break;
    case 322: 
        strPare = strPare + "[openat]";
        break;
    case 323: 
        strPare = strPare + "[mkdirat]";
        break;
    case 324: 
        strPare = strPare + "[mknodat]";
        break;
    case 325: 
        strPare = strPare + "[fchownat]";
        break;
    case 326: 
        strPare = strPare + "[futimesat]";
        break;
    case 327: 
        strPare = strPare + "[fstatat64]";
        break;
    case 328: 
        strPare = strPare + "[unlinkat]";
        break;
    case 329: 
        strPare = strPare + "[renameat]";
        break;
    case 330: 
        strPare = strPare + "[linkat]";
        break;
    case 331: 
        strPare = strPare + "[symlinkat]";
        break;
    case 332: 
        strPare = strPare + "[readlinkat]";
        break;
    case 333: 
        strPare = strPare + "[fchmodat]";
        break;
    case 334: 
        strPare = strPare + "[faccessat]";
        break;
    case 335: 
        strPare = strPare + "[pselect6]";
        break;
    case 336: 
        strPare = strPare + "[ppoll]";
        break;
    case 337: 
        strPare = strPare + "[unshare]";
        break;
    case 338: 
        strPare = strPare + "[set_robust_list]";
        break;
    case 339: 
        strPare = strPare + "[get_robust_list]";
        break;
    case 340: 
        strPare = strPare + "[splice]";
        break;
    case 341: 
        strPare = strPare + "[sync_file_range2]";
        break;
    case 342: 
        strPare = strPare + "[tee]";
        break;
    case 343: 
        strPare = strPare + "[vmsplice]";
        break;
    case 344: 
        strPare = strPare + "[move_pages]";
        break;
    case 345: 
        strPare = strPare + "[getcpu]";
        break;
    case 346: 
        strPare = strPare + "[epoll_pwait]";
        break;
    case 347: 
        strPare = strPare + "[kexec_load]";
        break;
    case 348: 
        strPare = strPare + "[utimensat]";
        break;
    case 349: 
        strPare = strPare + "[signalfd]";
        break;
    case 350: 
        strPare = strPare + "[timerfd_create]";
        break;
    case 351: 
        strPare = strPare + "[eventfd]";
        break;
    case 352: 
        strPare = strPare + "[fallocate]";
        break;
    case 353: 
        strPare = strPare + "[timerfd_settime]";
        break;
    case 354: 
        strPare = strPare + "[timerfd_gettime]";
        break;
    case 355: 
        strPare = strPare + "[signalfd4]";
        break;
    case 356: 
        strPare = strPare + "[eventfd2]";
        break;
    case 357: 
        strPare = strPare + "[epoll_create1]";
        break;
    case 358: 
        strPare = strPare + "[dup3]";
        break;
    case 359: 
        strPare = strPare + "[pipe2]";
        break;
    case 360: 
        strPare = strPare + "[inotify_init1]";
        break;
    case 361: 
        strPare = strPare + "[preadv]";
        break;
    case 362: 
        strPare = strPare + "[pwritev]";
        break;
    case 363: 
        strPare = strPare + "[rt_tgsigqueueinfo]";
        break;
    case 364: 
        strPare = strPare + "[perf_event_open]";
        break;
    case 365: 
        strPare = strPare + "[recvmmsg]";
        break;
    case 366: 
        strPare = strPare + "[accept4]";
        break;
    case 367: 
        strPare = strPare + "[fanotify_init]";
        break;
    case 368: 
        strPare = strPare + "[fanotify_mark]";
        break;
    case 369: 
        strPare = strPare + "[prlimit64]";
        break;
    case 370: 
        strPare = strPare + "[name_to_handle_at]";
        break;
    case 371: 
        strPare = strPare + "[open_by_handle_at]";
        break;
    case 372: 
        strPare = strPare + "[clock_adjtime]";
        break;
    case 373: 
        strPare = strPare + "[syncfs]";
        break;
    case 374: 
        strPare = strPare + "[sendmmsg]";
        break;
    case 375: 
        strPare = strPare + "[setns]";
        break;
    case 376: 
        strPare = strPare + "[process_vm_readv]";
        break;
    case 377: 
        strPare = strPare + "[process_vm_writev]";
        break;
    case 378: 
        strPare = strPare + "[kcmp]";
        break;
    case 379: 
        strPare = strPare + "[finit_module]";
        break;
    case 380: 
        strPare = strPare + "[sched_setattr]";
        break;
    case 381: 
        strPare = strPare + "[sched_getattr]";
        break;
    case 382: 
        strPare = strPare + "[renameat2]";
        break;
    case 383: 
        strPare = strPare + "[seccomp]";
        break;
    case 384: 
        strPare = strPare + "[getrandom]";
        break;
    case 385: 
        strPare = strPare + "[memfd_create]";
        break;
    case 386: 
        strPare = strPare + "[bpf]";
        break;
    default:
        strPare = strPare + "[NUll " + numsysCall + " ]";
        break;
    }
    if(isShowBackTrace == true)
    {
        strPare +=" BackTrace{"+Thread.backtrace(context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress)+ "} ";
    }
    return strPare;
}
function onMatch(context) {
    var tag;
    var sysCallNum;
    if(Process.pointerSize == 4)
    {
        sysCallNum = context.r7;
    }
    else
    {
        sysCallNum = context.x16;
    }
    tag = parseSysCall(sysCallNum,context);
    showAddr(tag,ptr(context.pc));
}
function UnfollowThread(threadId) {
    if (!isThreadFollowed(threadId)) {
      return;
    }
    delete ThreadsFollowed[threadId];
    console.log("[+] Unfollowing thread " + threadId);
    Stalker.unfollow(threadId);
    Stalker.garbageCollect();
}
function FollowThread(tid) {
    ThreadsFollowed[tid] = true;
    console.log("[+] Following thread " + tid);
    Stalker.follow(tid, {
      transform: function(iterator) {
        const instruction = iterator.next();
        do {
          // console.log(instruction)
          if (instruction.mnemonic === "svc") {
            iterator.putCallout(onMatch);
          }
          iterator.keep();
        } while (iterator.next() !== null);
      }
    });
}
function ThreadStalker() {
    Interceptor.attach(Module.findExportByName("libc.so","pthread_create"), {
        onEnter(args) {
            this.thread = args[0];
            this.funAddr = args[2];
        },
        onLeave(retVal) { 
            var tid = ptr(ptr(this.thread).readPointer().add(Process.pointerSize * 2)).readInt();
            showAddr("new Thread ",this.funAddr);
            if (isThreadFollowed(tid)) 
            {
                return;
            }
            FollowThread(tid);
        }
    });
}
var isShowSysAddr = false;
var isShowBackTrace = true;
function main() {
	console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\r\n");
	const ths = Process.enumerateThreads();
    for(var i=0;i<ths.length;i++){
        FollowThread(ths[i].id);
    }
    // ths.forEach((el) => {
    //     FollowThread(el.id);
    // });
    ThreadStalker();
};
setImmediate(main);