---
title: Windows における時刻
category: programming
date: 2018-08-28 04:06:58
tags: [Windows, Clock]
pinned: false
---

Windows に関連する時刻形式は大まかに以下のようなものがあります

- リアルタイムクロック
- システムクロック
- ローカルタイム
- ファイルタイム

Time-related functions return time in one of several formats. You can use the time functions to convert between some time formats for ease of comparison and display. The following table summarizes the time formats.

Format Type Description
System SYSTEMTIME Year, month, day, hour, second, and millisecond, taken from the internal hardware clock.
Local SYSTEMTIME or FILETIME A system time or file time converted to the system's local time zone.
File FILETIME The number of 100-nanosecond intervals since January 1, 1601.
MS-DOS WORD A packed word for the date, another for the time.
Windows DWORD or ULONGLONG The number of milliseconds since the system was last started. When retrieved as a DWORD value, Windows time cycles every 49.7 days.
Interrupt Count ULONGLONG The number of 100-nanosecond intervals since the system was last started.

### システムクロック

- 情報ソース: [System Time | Microsoft Docs](https://docs.microsoft.com/en-us/windows/desktop/sysinfo/system-time)

Windows 開始時にはコンピュータのリアルタイムクロックを元にシステムクロックが設定され、時刻を刻み始めます。

> When the system first starts, it sets the system time to a value based on the real-time clock of the computer and then regularly updates the time. ([System Time | Microsoft Docs](https://docs.microsoft.com/en-us/windows/desktop/sysinfo/system-time))
