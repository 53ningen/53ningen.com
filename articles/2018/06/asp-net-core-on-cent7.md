---
slug: asp-net-core-on-cent7
title: CentOS 7 上で ASP.NET Core アプリケーションを動かす
category: programming
date: 2018-06-22 18:09:28
tags: [C++, .NET, CentOS7, ASP.NET]
pinned: false
---

n 番煎じだとは思うが、　 C# でコマンドラインツールとかウェブアプリケーション少し触るかなーと思いたったので、まずは動くところまでやってみた個人用メモ

- 参考資料
  - [.NET and C# - Get started in 10 minutes](https://www.microsoft.com/net/learn/get-started/linux/centos)
  - [dotnet new コマンド - .NET Core CLI | Microsoft Docs](https://docs.microsoft.com/ja-jp/dotnet/core/tools/dotnet-new?tabs=netcore2x)

## 環境

- CentOS 7.5

```sh
$ cat /etc/redhat-release
CentOS Linux release 7.5.1804 (Core)
```

## 環境構築

- see: [.NET Downloads for Linux](https://www.microsoft.com/net/download/linux)

```sh
$ sudo rpm -Uvh https://packages.microsoft.com/config/rhel/7/packages-microsoft-prod.rpm
$ sudo yum update -y
...
$ sudo yum install dotnet-sdk-2.1 -y
...
$ dotnet --version
2.1.301
```

## コンソールアプリケーションで Hello, World!

```sh
$ dotnet new console -o myApp
$ cd myApp/
$ cat ./Program.cs
using System;

namespace myApp
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Hello World!");
        }
    }
}
$ dotnet run
Hello World!
$ dotnet publish -c release -r linux-x64

Microsoft (R) Build Engine version 15.7.179.6572 for .NET Core
Copyright (C) Microsoft Corporation. All rights reserved.

  Restoring packages for /home/centos/proj/myApp/myApp.csproj...
  Generating MSBuild file /home/centos/proj/myApp/obj/myApp.csproj.nuget.g.props.
  Generating MSBuild file /home/centos/proj/myApp/obj/myApp.csproj.nuget.g.targets.
  Restore completed in 323.25 ms for /home/centos/proj/myApp/myApp.csproj.
  myApp -> /home/centos/proj/myApp/bin/release/netcoreapp2.1/linux-x64/myApp.dll
  myApp -> /home/centos/proj/myApp/bin/release/netcoreapp2.1/linux-x64/publish/
$ ./bin/release/netcoreapp2.1/linux-x64/myApp
Hello World!
```

## ASP.NET Core アプリケーションで Hello, World!

```sh
$ dotnet new web -o myWeb
The template "ASP.NET Core Empty" was created successfully.

Processing post-creation actions...
Running 'dotnet restore' on myWeb/myWeb.csproj...
  Restoring packages for /home/centos/proj/myWeb/myWeb.csproj...
  Generating MSBuild file /home/centos/proj/myWeb/obj/myWeb.csproj.nuget.g.props.
  Generating MSBuild file /home/centos/proj/myWeb/obj/myWeb.csproj.nuget.g.targets.
  Restore completed in 1.43 sec for /home/centos/proj/myWeb/myWeb.csproj.

Restore succeeded.

$ cd myWeb
$ cat ./Startup.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace myWeb
{
    public class Startup
    {
        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.Run(async (context) =>
            {
                await context.Response.WriteAsync("Hello World!\n");
            });
        }
    }
}
$ nohup dotnet run &
[1] 13337
$ nohup: ignoring input and appending output to ‘nohup.out’
$ curl localhost:5000
Hello World!
```

結構簡単にできた。いいね。
