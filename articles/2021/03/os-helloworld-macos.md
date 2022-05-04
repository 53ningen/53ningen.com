---
title: 「ゼロからの OS 自作入門」の Hello, World! を MacOS 上で行う
category: programming
date: 2021-03-24 02:38:14
tags: [OS]
pinned: false
---

[ゼロからの OS 自作入門](https://amzn.to/3secKoA) の第 1 章: Hello, World! と表示させるまでの流れを MacOS 上で作業したい場合の手順をまとめます。

メインで使っているような MacBook でやる際は自己責任で頑張ってね（ディスク取り違えたりしないようにほんとうに気をつけて）。

# Kernel の実装

単純な hlt 命令の無限ループで、実装は[ここ](https://github.com/uchan-nos/mikanos/blob/45a02699f3704eb73c19e24e644281eccba31a6b/kernel/main.cpp)に置いてあるので、kernel ディレクトリを掘って main.cpp という名前で作成

コンパイルとリンクは以下のコマンドにて行う

```
$ clang++ -O2 -Wall -g --target=x86_64-elf -ffreestanding -mno-red-zone -fno-exceptions -fno-rtti -std=c++17 -c kernel/main.cpp
$ ld.lld -entry KernelMain -z norelro --image-base 0x1000000 --static -o kernel.elf main.o
```

- clang++ の `--target=x86_64-elf` オプションは文字通り x86_64 むけの機械語を ELF 形式にて出力するという指定
- `-ffreestanding` オプションはフリースタンディング環境での動作環境を想定したコンパイルを意味する
  - OS 上で動作するプログラムは OS による支援が得られるのでホスト環境向けのコンパイルで良い

# ブートローダーの実装

## バイナリエディタ: hex-fiend の導入

```
$ brew install hex-fiend
```

## EFI ファイルの作成

- バイナリエディタを用いて本の内容に沿ってコツコツ入力していく
- ファイル自体は [ここ](https://github.com/uchan-nos/mikanos-build/tree/master/day01/bin) に置いてあるので拾ってきても良い

## EFI ファイルの配置

- 適当な USB メモリを MacBook にぶっさして次のような手順を実施する
  - ただし間違ったディスクに対して作業を行わないようにガチで注意して

```
$ # Disk を探す
$ diskutil  list
/dev/disk0 (internal):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:      GUID_partition_scheme                         251.0 GB   disk0
   1:                        EFI EFI                     314.6 MB   disk0s1
   2:                 Apple_APFS Container disk1         250.7 GB   disk0s2

/dev/disk1 (synthesized):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:      APFS Container Scheme -                      +250.7 GB   disk1
                                 Physical Store disk0s2
   1:                APFS Volume Macintosh HD            213.8 GB   disk1s1
   2:                APFS Volume Preboot                 72.5 MB    disk1s2
   3:                APFS Volume Recovery                1.0 GB     disk1s3
   4:                APFS Volume VM                      4.3 GB     disk1s4

/dev/disk2 (external, physical):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:     FDisk_partition_scheme                        *8.0 GB     disk2
   1:             Windows_FAT_32 boot                    66.1 MB    disk2s1
   2:                      Linux                         7.9 GB     disk2s2

$ # FAT 形式でフォーマットする
$ sudo newfs_msdos -F 16 /dev/disk2
newfs_msdos: warning: /dev/disk2 is not a character device
512 bytes per physical sector
newfs_msdos: warning: sectors/FAT limits sectors to 4194721, clusters to 65534
newfs_msdos: warning: FAT type limits file system to 4194144 sectors
/dev/disk2: 4193536 sectors in 65524 FAT16 clusters (32768 bytes/cluster)
bps=512 spc=64 res=1 nft=2 rde=512 mid=0xf0 spf=256 spt=32 hds=255 hid=0 drv=0x00 bsec=4194144

$ # EFI ファイルの配置
$ mkdir -p /Volumes/NO NAME/EFI/BOOT
$ cp ~/Desktop/BOOTX64.EFI /Volumes/NO NAME/EFI/BOOT/
```

## 実験用マシンで動作確認

- 実験用のマシンの BIOS 設定画面に入り、セキュアブートを無効化し、ブート順位として USB ストレージが優先されるように設定
- 設定を保存し再起動すると、Hello, Wolrd! と表示される（はず）

## MacOS 上の QEMU で動作確認

- 本に書いてあるとおり Ubuntu 上で実行したら動いたけど MacOS だとコケたので、そのあたりだけいじってみた
  - 自己責任でお願いします...

```
$ # mkfs.fat コマンドなどを利用できるように...
$ brew install dosfstools
$ brew install qemu llvm
$ # それぞれパスが通っている状態にしておく&つまづいたら不足しているものを導入してね！

$ git clone https://github.com/uchan-nos/mikanos-build.git && cd mikanos-build
$ qemu-img create -f raw ./disk.img 200M
$ mkfs.fat -n 'MIKAN OS' -s 2 -f 2 -R 32 -F 32 ./disk.img
$ mkdir -p ./mnt
$ hdiutil attach -mountpoint ./mnt ./disk.img
$ mkdir -p ./mnt/EFI/BOOT
$ cp ~/Desktop/BOOTX64.EFI ./mnt/EFI/BOOT/BOOTX64.EFI
$ hdiutil detach ./mnt
$ qemu-system-x86_64 -m 1G -drive if=pflash,format=raw,readonly,file=./OVMF_CODE.fd -drive if=pflash,format=raw,file=./OVMF_VARS.fd -drive if=ide,index=0,media=disk,format=raw,file=./disk.img -device nec-usb-xhci,id=xhci -device usb-mouse -device usb-kbd -monitor stdio
```

本の中で登場する run_qemu.sh についても同じような感じで書き換えてあげれば使えるはず。

<a href="https://static.53ningen.com/wp-content/uploads/2021/03/25001609/537ac146350dc30ead8122b9545b4e4c.png"><img src="https://static.53ningen.com/wp-content/uploads/2021/03/25001609/537ac146350dc30ead8122b9545b4e4c-1024x824.png" alt="" width="640" height="515" class="aligncenter size-large wp-image-5988" /></a>

## 実行可能ファイルの実行が開始されるまでの流れ

1. 電源投下
2. UEFI BIOS(Unified Extensible Firmware Interface Basic Input Output System) の実行を開始
3. 各ストレージの特定の領域を探索
4. 実行可能ファイルが見つかったら BIOS の実行を中断し、そちらを実行する

## C 言語での実行可能ファイルの作成

バイナリエディタで実行可能ファイルを作成したが面倒。 C 言語でやる手順は以下のとおり。

1. [hello.c](https://github.com/uchan-nos/mikanos-build/blob/master/day01/c/hello.c) を写経する
2. コンパイル: `clang -target x86_64-pc-win32-coff -mno-red-zone -fno-stack-protector -fshort-wchar -Wall -c hello.c`
3. リンク: `lld-link /subsystem:efi_application /entry:EfiMain /out:hello.efi hello.o`

あとは QEMU なり実機で動かしてみればよい。

## 参考資料

- [EDK II で UEFI アプリケーションを作る](https://osdev-jp.readthedocs.io/ja/latest/2017/create-uefi-app-with-edk2.html)

# メモリマップをファイル出力する

- メモリのどの位置に何があるのかを表すメモリマップを出力する UEFI アプリケーションの作成も基本的には本の手順通りでできる
- ソースコードは[ここ](https://github.com/uchan-nos/mikanos/blob/osbook_day02b/MikanLoaderPkg/Main.c)
- UEFI はおおまかに OS 起動に必要な機能（ブートサービス）と OS 起動前後いつでも使える機能（ランタイムサービス） を提供する
  - ブートサービスの機能は [UefiBootServicesTableLib の `gBS`](https://github.com/tianocore/edk2/blob/master/MdePkg/Library/UefiBootServicesTableLib/UefiBootServicesTableLib.c#L18) からアクセスできる
  - ランタイムサービスの機能は [UefiRuntimeServicesTableLib の `gRT`](https://github.com/tianocore/edk2/blob/master/MdePkg/Library/UefiRuntimeServicesTableLib/UefiRuntimeServicesTableLib.c) からアクセスできる
- UEFI 関連の仕様やリファレンスは以下のあたり
  - UEFI の仕様書: [https://uefi.org/specifications](https://uefi.org/specifications)
  - [edk2-docs](https://edk2-docs.gitbook.io/edk-ii-uefi-driver-writer-s-guide/5_uefi_services/readme.3/5311_getmemorymap)
  - [EFI_GET_MEMORY_MAP の型](https://dox.ipxe.org/UefiSpec_8h.html#a6a58fcf17f205e9b4ff45fd9b198829a)
  - IN, OUT などは引数の使われ方を示すだけで最終的に空文字に置き換えられるマクロ

実行すると以下のようなファイルが得られる

```
Index, Type, Type(name), PhysicalStart, NumberOfPages, Attribute
0, 3, EfiBootServicesCode, 00000000, 1, F
1, 7, EfiConventionalMemory, 00001000, 9F, F
2, 7, EfiConventionalMemory, 00100000, 700, F
3, A, EfiACPIMemoryNVS, 00800000, 8, F
4, 7, EfiConventionalMemory, 00808000, 8, F
5, A, EfiACPIMemoryNVS, 00810000, F0, F
6, 4, EfiBootServicesData, 00900000, B00, F
7, 7, EfiConventionalMemory, 01400000, 3AB36, F
8, 4, EfiBootServicesData, 3BF36000, 20, F
9, 7, EfiConventionalMemory, 3BF56000, 273F, F
10, 1, EfiLoaderCode, 3E695000, 2, F
11, 4, EfiBootServicesData, 3E697000, A, F
12, 9, EfiACPIReclaimMemory, 3E6A1000, 1, F
13, 4, EfiBootServicesData, 3E6A2000, 1EA, F
14, 3, EfiBootServicesCode, 3E88C000, A8, F
15, A, EfiACPIMemoryNVS, 3E934000, 12, F
16, 0, EfiReservedMemoryType, 3E946000, 1C, F
17, 3, EfiBootServicesCode, 3E962000, 10A, F
18, 6, EfiRuntimeServicesData, 3EA6C000, 5, F
19, 5, EfiRuntimeServicesCode, 3EA71000, 5, F
20, 6, EfiRuntimeServicesData, 3EA76000, 5, F
21, 5, EfiRuntimeServicesCode, 3EA7B000, 5, F
22, 6, EfiRuntimeServicesData, 3EA80000, 5, F
23, 5, EfiRuntimeServicesCode, 3EA85000, 7, F
24, 6, EfiRuntimeServicesData, 3EA8C000, 8F, F
25, 4, EfiBootServicesData, 3EB1B000, 702, F
26, 7, EfiConventionalMemory, 3F21D000, 4, F
27, 4, EfiBootServicesData, 3F221000, 6, F
28, 7, EfiConventionalMemory, 3F227000, 1, F
29, 4, EfiBootServicesData, 3F228000, 7F3, F
30, 7, EfiConventionalMemory, 3FA1B000, 1, F
31, 3, EfiBootServicesCode, 3FA1C000, 17F, F
32, 5, EfiRuntimeServicesCode, 3FB9B000, 30, F
33, 6, EfiRuntimeServicesData, 3FBCB000, 24, F
34, 0, EfiReservedMemoryType, 3FBEF000, 4, F
35, 9, EfiACPIReclaimMemory, 3FBF3000, 8, F
36, A, EfiACPIMemoryNVS, 3FBFB000, 4, F
37, 4, EfiBootServicesData, 3FBFF000, 201, F
38, 7, EfiConventionalMemory, 3FE00000, 8D, F
39, 4, EfiBootServicesData, 3FE8D000, 20, F
40, 3, EfiBootServicesCode, 3FEAD000, 20, F
41, 4, EfiBootServicesData, 3FECD000, 9, F
42, 3, EfiBootServicesCode, 3FED6000, 1E, F
43, 6, EfiRuntimeServicesData, 3FEF4000, 84, F
44, A, EfiACPIMemoryNVS, 3FF78000, 88, F
45, 6, EfiRuntimeServicesData, FFC00000, 400, 1
```

単にメモリマップを取得した様子を見たいなら画面への出力でよいので `SaveMemoryMap` を以下のような `PrintMemoryMap` に置き換えてみてもよさそう

```
EFI_STATUS PrintMemoryMap(struct MemoryMap *map)
{
  Print(L"Index, Type, Type(name), PhysicalStart, NumberOfPages, Attributen");

  EFI_PHYSICAL_ADDRESS iter;
  int i;
  for (iter = (EFI_PHYSICAL_ADDRESS)map->buffer, i = 0;
       iter < (EFI_PHYSICAL_ADDRESS)map->buffer + map->map_size;
       iter += map->descriptor_size, i++)
  {
    EFI_MEMORY_DESCRIPTOR *desc = (EFI_MEMORY_DESCRIPTOR *)iter;
    Print(L"%u, %x, %-ls, %08lx, %lx, %lxn", i, desc->Type, GetMemoryTypeUnicode(desc->Type), desc->PhysicalStart, desc->NumberOfPages, desc->Attribute & 0xffffflu);
  }

  return EFI_SUCCESS;
}
```

出力はこんな感じ

<a href="https://static.53ningen.com/wp-content/uploads/2021/03/25153533/31f31f0cb72b06743f1d3ec6009f5c8e.png"><img src="https://static.53ningen.com/wp-content/uploads/2021/03/25153533/31f31f0cb72b06743f1d3ec6009f5c8e-1024x824.png" alt="" width="640" height="515" class="aligncenter size-large wp-image-5999" /></a>

### memo: EFI_BOOT_SERVICES.GetMemoryMap() の仕様

Summary:Returns the current memory map.

Prototype:

```
typedef EFI_STATUS
(EFIAPI *EFI_GET_MEMORY_MAP) (
 IN OUT UINTN *MemoryMapSize,
 OUT EFI_MEMORY_DESCRIPTOR *MemoryMap,
 OUT UINTN *MapKey,
 OUT UINTN *DescriptorSize,
 OUT UINT32 *DescriptorVersion
 );
```

- Parameters:
  - MemoryMapSize: A pointer to the size, in bytes, of the MemoryMap buffer. On input, this is the size of the buffer allocated by the caller. On output, it is the size of the buffer returned by the firmware if the buffer was large enough, or the size of the buffer needed to contain the map if the buffer was too small.
  - MemoryMap: A pointer to the buffer in which firmware places the current memory map. The map is an array of EFI_MEMORY_DESCRIPTORs. See “Related Definitions.”
  - MapKey: A pointer to the location in which firmware returns the key for the current memory map.
  - DescriptorSize: A pointer to the location in which firmware returns the size, in bytes, of an individual EFI_MEMORY_DESCRIPTOR.
  - DescriptorVersion: A pointer to the location in which firmware returns the version number associated with the EFI_MEMORY_DESCRIPTOR. See “Related Definitions.”

ざっくりとキーポイントをまとめると、戻り値は EFI_STATUS でメモリマップの取得に成功したか否かとなる。取得成功時には MemoryMap 引数として渡したバッファに EFI_MEMORY_DESCRIPTOR の配列としてメモリマップの情報が格納されるという感じ。

### memo: ワイド文字列リテラル

- C11 で UTF-8 文字列リテラルを定義する頭語 `u8` が導入された: ex. `u8"hello"`
- 文字定数にて 1 バイトで表現できない文字を使うプログラムではワイド文字定数を使う
  - 頭語 L: ex. L'a' wchar_t
  - 頭語 u: ex. u'a' char16_t
  - 頭語 U: ex. U'a' char32_t
- 同様に文字列リテラルでも 1 バイトで表現できない文字を使うプログラムではワイド文字列リテラルを使う
