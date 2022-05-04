---
title: PowerShell アレコレ
category: programming
date: 2018-09-01 02:30:09
tags: [PowerShell]
pinned: false
---

PowerShell ヨクワカランって感じだったので色々まとめた

## macOS への PowerShell の導入

macOS からも PowerShell が使える。物好きな方はどうぞ。というかこういうことできるのはやっぱり .NET Core にコードを寄せているからなのか？（これはいいこと）。

```
brew cask install powersh
$ pwsh
PowerShell v6.0.2
Copyright (c) Microsoft Corporation. All rights reserved.

https://aka.ms/pscore6-docs
Type 'help' to get help.

PS /Users/maintainer> Get-Host

Name             : ConsoleHost
Version          : 6.0.2
...
DebuggerEnabled  : True
IsRunspacePushed : False
Runspace         : System.Management.Automation.Runspaces.LocalRunspace
```

## PowerShell と PowerShell Core

> Although this repo started as a fork of the Windows PowerShell code base, changes made in this repo do not make their way back to Windows PowerShell 5.1 automatically. This also means that issues tracked here are only for PowerShell Core 6.0. Windows PowerShell specific issues should be opened on UserVoice.
> ([Windows PowerShell vs PowerShell Core](https://github.com/PowerShell/PowerShell#windows-powershell-vs-powershell-core))

6.0 以降を PowerShell Core とよんでいる模様

## Console Host と ISE の違い

- [Differences between the ISE and PowerShell console | PowerShell Team Blog](https://blogs.msdn.microsoft.com/powershell/2009/04/17/differences-between-the-ise-and-powershell-console/)
- [PowerShell ISE と PowerShell コンソール(powershell.exe)の違い - しばたテックブログ](http://blog.shibata.tech/entry/2015/10/04/120806)

## 便利なコマンド

### オブジェクトの中身を全部吐き出す

`gm` or `Get-Member` でメンバ一覧を表示できる

```
PS /Users/maintainer> $error | gm


   TypeName: System.Management.Automation.ErrorRecord

Name                  MemberType     Definition
----                  ----------     ----------
Equals                Method         bool Equals(System.Object obj)
GetHashCode           Method         int GetHashCode()
...
GetObjectData         Method         void GetObjectData(System.Runtime.Serialization.SerializationInfo info, PSMessageDetails      ScriptProperty System.Object PSMessageDetails {get=& { Set-StrictMode -Version 1; $this.Exception.InnerException.PSMessageDetails };}
```

json にして吐き出す

```
PS /Users/maintainer> $error | ConvertTo-Json
[
  {
    "Exception": {
      "ErrorRecord": "The term 'Convert-ToJson' is not recognized as the name of a cmdlet, function, script file, or operable program.\nCheck the spelling of the name, or if a path was included, verify that the path is correct and try again.",
      ...
    "PipelineIterationInfo": [],
    "PSMessageDetails": null
  }
]
```

## Preference_Variables

便利な変数: [about_Preference_Variables](https://technet.microsoft.com/ja-jp/library/hh847796.aspx)

- ErrorActionPreference
  - Stop:エラー メッセージが表示され、実行が停止されます。
  - Inquire:エラー メッセージが表示され、続行するかどうかを確認するメッセージが表示されます。
  - Continue (既定値):エラー メッセージが表示され、実行が続行されます。
  - Suspend:さらなる調査のため、ワークフロー ジョブを自動的に中断します。調査の後で、ワークフローを再開できます。
  - SilentlyContinue:影響を与えません。エラー メッセージは表示されず、中断されることなく実行が続行されます。
