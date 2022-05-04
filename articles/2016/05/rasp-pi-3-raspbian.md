---
title: ラズパイ3 にRASPBIANを入れるまで
category: programming
date: 2016-05-14 22:14:29
tags: [作業記録, Raspberry pi]
pinned: false
---

```
% diskutil list
/dev/disk0 (internal, physical):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:      GUID_partition_scheme                        *251.0 GB   disk0
   1:                        EFI EFI                     209.7 MB   disk0s1
   2:          Apple_CoreStorage Macintosh HD            250.1 GB   disk0s2
   3:                 Apple_Boot Recovery HD             650.0 MB   disk0s3
/dev/disk1 (internal, virtual):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:                  Apple_HFS Macintosh HD           +249.8 GB   disk1
                                 Logical Volume on disk0s2
                                 415E0457-62BD-4B99-A7CC-C80DBE5B311D
                                 Unlocked Encrypted
/dev/disk2 (disk image):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:     Apple_partition_scheme                        +18.1 MB    disk2
   1:        Apple_partition_map                         32.3 KB    disk2s1
   2:                  Apple_HFS Flash Player            18.1 MB    disk2s2
/dev/disk3 (internal, physical):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:     FDisk_partition_scheme                        *8.0 GB     disk3
   1:                 DOS_FAT_32 NO NAME                 8.0 GB     disk3s1

% sudo diskutil eraseDisk FAT32 RP3 MBRFormat /dev/disk3
% diskutil unmountDisk /dev/disk3
% sudo dd bs=1m if=2016-05-10-raspbian-jessie.img of=/dev/rdisk3
```

## man dd

```
DD(1)                     BSD General Commands Manual                    DD(1)

NAME
     dd -- convert and copy a file

SYNOPSIS
     dd [operands ...]

DESCRIPTION
     The dd utility copies the standard input to the standard output.  Input data is read and written in 512-byte blocks.  If input reads are short, input from
     multiple reads are aggregated to form the output block.  When finished, dd displays the number of complete and partial input and output blocks and truncated
     input records to the standard error output.
```
