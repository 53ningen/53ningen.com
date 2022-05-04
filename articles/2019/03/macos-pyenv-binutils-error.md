---
title: macOS で pyenv から python を導入する際 binutils が入ってるとコケる
category: programming
date: 2019-03-11 00:54:48
tags: [python, pyenv]
pinned: false
---

```
$ pyenv install 3.7.2
python-build: use openssl from homebrew
python-build: use readline from homebrew
Downloading Python-3.7.2.tar.xz...
-> https://www.python.org/ftp/python/3.7.2/Python-3.7.2.tar.xz
Installing Python-3.7.2...
python-build: use readline from homebrew

BUILD FAILED (OS X 10.12.6 using python-build 20180424)

Inspect or clean up the working tree at /var/folders/js/twdldwjs53l2bjpvr69prpv477bjpd/T/python-build.20190311004219.80215
Results logged to /var/folders/js/twdldwjs53l2bjpvr69prpv477bjpd/T/python-build.20190311004219.80215.log

Last 10 log lines:
  "__Py_InitializeFromConfig", referenced from:
      _test_init_from_config in _testembed.o
      _test_init_dev_mode in _testembed.o
      _test_init_isolated in _testembed.o
ld: symbol(s) not found for architecture x86_64
clang: clangerror: : errorlinker command failed with exit code 1 (use -v to see invocation):
linker command failed with exit code 1 (use -v to see invocation)
make: *** [Programs/_testembed] Error 1
make: *** Waiting for unfinished jobs....
make: *** [python.exe] Error 1
```

一旦 `binutils` を消すみたいな対応をみんなやってるっぽい

```
$ brew uninstall binutils
```

[Failed install on MacOS Mojave · Issue #1236 · pyenv/pyenv](https://github.com/pyenv/pyenv/issues/1236)

> I was running into this as well, and noticed that my ar was /usr/local/bin/ar rather than the system ar. I ran brew remove binutils and was finally able to run pyenv install 2.7.15 and pyenv install 3.7.1 without problems . I had also upgraded to Xcode 10.1, but I think it was binutils that was giving me trouble. YMMV.
