---
slug: os-kernel-hello
title: Hello, OS Kernel
category: programming
date: 2021-04-09 03:32:00
tags: [OS]
pinned: false
---

[ゼロからの OS 自作入門](https://amzn.to/3secKoA) を読みながらカーネルの最初の実装を行うところまでの流れを確認する


# Kernel の実装

- 単純な hlt 命令の無限ループで、実装は[ここ](https://github.com/uchan-nos/mikanos/blob/45a02699f3704eb73c19e24e644281eccba31a6b/kernel/main.cpp)に置いてあるの
- kernel ディレクトリを掘って main.cpp という名前で作成

コンパイルとリンクは以下のコマンドにて行う

```
$ clang++ -O2 -Wall -g --target=x86_64-elf -ffreestanding -mno-red-zone -fno-exceptions -fno-rtti -std=c++17 -c kernel/main.cpp
$ ld.lld -entry KernelMain -z norelro --image-base 0x1000000 --static -o kernel.elf main.o
```

- clang++ の `--target=x86_64-elf` オプションは文字通り x86_64 むけの機械語を ELF 形式にて出力するという指定
- `-ffreestanding` オプションはフリースタンディング環境での動作環境を想定したコンパイルを意味する
  - OS 上で動作するプログラムは OS による支援が得られるのでホスト環境向けのコンパイルで良い
- `ld.lld` は ELF の出力を行う LLVM 向けのリンカ

このようにして作成した ELF ファイルはただ待機するだけだが、ブートローダーではなく立派な Kernel であるが、そのために実際にマシンで実行するためにはこのカーネルを読み出すブートローダーを実装してやらなければならない


# ブートローダーの実装

- 実装は[ここ](https://github.com/uchan-nos/mikanos/blob/45a02699f3704eb73c19e24e644281eccba31a6b/MikanLoaderPkg/Main.c)
- おおまかには次のような流れ
  - メモリマップの取得と保存（別に保存しなくても OK）
  - カーネルファイルの読み出し
  - ブートサービスの終了
  - カーネルの実行

## メモリマップの取得とブートサービスの終了

- メモリマップ読み出しの話題を第二章で出したのは[ブートサービスを終了し、カーネルの実行へ移る際に必要な処理のための伏線](https://github.com/uchan-nos/mikanos/blob/45a02699f3704eb73c19e24e644281eccba31a6b/MikanLoaderPkg/Main.c#L155-L156)だったということがわかる
  - ブートサービスを終了させる gBS->ExitBootServices は最新のメモリマップのマップキーを引数として要求する
  - マップキーとはメモリマップの状態変化に紐づくキー


## カーネルファイルの読み出しと実行

- カーネルは ELF 形式
- ELF 形式ファイルの情報を読むには readelf コマンドが有用
  - brew install binutils で導入できる

```
$ readelf -h ~/Workspace/OS/MikanOS/kernel.elf
ELF Header:
  Magic:   7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00
  Class:                             ELF64
  Data:                              2's complement, little endian
  Version:                           1 (current)
  OS/ABI:                            UNIX - System V
  ABI Version:                       0
  Type:                              EXEC (Executable file)
  Machine:                           Advanced Micro Devices X86-64
  Version:                           0x1
  Entry point address:               0x1001120
  Start of program headers:          64 (bytes into file)
  Start of section headers:          880 (bytes into file)
  Flags:                             0x0
  Size of this header:               64 (bytes)
  Size of program headers:           56 (bytes)
  Number of program headers:         4
  Size of section headers:           64 (bytes)
  Number of section headers:         11
  Section header string table index: 9
```

# その他作業メモ

脇道にそれてメモった内容を残しておく


## レジスタ

* 大きく分けて次の２つに分類できる
  * 汎用レジスタ: 一般の計算に使える
  * 特殊レジスタ: CPU の設定やタイマーなど CPU の機能を制御するために使う
* CPU のアーキテクチャによりレジスタと演算命令の構成は異なるが x86_64 では 16 個の汎用レジスタがある


## ハードリンクとシンボリックリンク

前提

```
$ tree
.
└── pkg
    └── file

1 directory, 1 file
```

ハードリンクとシンボリックリンクを行う

```
$ ln ./pkg/file ./hardlinked_file
$ ln -s ./pkg/file ./softlinked_file
$
$ tree
.
├── hardlinked_file
├── pkg
│   └── file
└── softlinked_file -> ./pkg/file
```

ハードリンクは実体と同じ i ノードを指しているが、シンボリックリンクは異なる i ノードを指している。inode に関しては以前、これを[枯渇させる実験を行ったときのメモ記事](https://53ningen.com/run-out-of-inode/)もある。

```
$ ls -i ./pkg/file
98981669 ./pkg/file
dir $ ls -i ./hardlinked_file
98981669 ./hardlinked_file
dir $ ls -i ./softlinked_file
98981732 ./softlinked_file
```

そのためリンク先のファイルを削除するとシンボリックリンクからはアクセスできなくなる一方で、ハードリンクは普通にひらける

```
$ rm ./pkg/file
$ ioen ./softlinked_file
-bash: ioen: command not found
$ open ./hardlinked_file
$
```
