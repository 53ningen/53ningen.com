---
title: macOS から .NET Core 2.1 の AWS Lambda 関数を作成する
category: programming
date: 2018-10-19 02:25:30
tags: [CSharp, Lambda]
pinned: false
---

Windows 版の Visual Studio では [AWS Toolkit for Visual Studio](https://docs.aws.amazon.com/ja_jp/toolkit-for-visual-studio/latest/user-guide/lambda-creating-project-in-visual-studio.html) を使ってサクッと Lambda 関数を作成できます。

ここでは macOS 上で Visual Studio for mac にて Lambda 関数をサクッと作る手順をメモ。とはいえ、とても簡単です。

## 環境

- macOS Sierra 10.12.6
- Visual Studio for Mac 7.5.1
- dotnet 2.1.403

## 1. .NET Core ライブラリ ソリューションの作成し、プロジェクトファイルを編集

1. .NET Core ライブラリのソリューションを作成します（Ex: `DotNetCoreLambda.sln`）
2. 依存ライブラリを追加

- exec: `dotnet add ./DotNetCoreLambda/DotNetCoreLambda.csproj package Amazon.Lambda.Serialization.Json`
- exec: `dotnet add ./DotNetCoreLambda/DotNetCoreLambda.csproj package Amazon.Lambda.Core`

3. .csproj（例: `DotNetCoreLambda/DotNetCoreLambda.csproj`） ファイルの `PropertyGroup` に `GenerateRuntimeConfigurationFiles` を追加します

- ついでに `AWSProjectType` も `Lambda` にしておくと Windows の Visual Studio で開くときに良い
- 一例として以下のような形になるかと

```
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>netcoreapp2.1</TargetFramework>
    <GenerateRuntimeConfigurationFiles>true</GenerateRuntimeConfigurationFiles>
    <AWSProjectType>Lambda</AWSProjectType>
  </PropertyGroup>

  <PropertyGroup Condition=" '$(Configuration)|$(Platform)' == 'Release|AnyCPU' " />

  <ItemGroup>
    <PackageReference Include="Amazon.Lambda.Core" Version="1.0.0" />
    <PackageReference Include="Amazon.Lambda.Serialization.Json" Version="1.4.0" />
  </ItemGroup>
</Project>
```

## 2. Lambda の実装コードを作成

一例として string を受け取り、Upper Case にして返す素敵な Lambad 関数を作ります。これを例えば `Function.cs` という名前で作成。

```
using Amazon.Lambda.Core;

[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.Json.JsonSerializer))]

namespace DotNetCoreLambda
{
    public class Function
    {
        public string FunctionHandler(string input, ILambdaContext context)
        {
            return input?.ToUpper();
        }
    }
}
```

## 3. Build & Deploy

以下のような手順にて作成した .zip パッケージファイルをデプロイ

```
dotnet publish -c Release
zip -j ~/Desktop/output.zip ./DotNetCoreLambda/bin/Release/netcoreapp2.1/publish/*
```

Lambda 関数のハンドラ名は `DotNetCoreLambda::DotNetCoreLambda.Function::FunctionHandler` となります

## 4. 動作検証

```
$ aws lambda invoke --function-name DotNetCoreLambda --payload '"abcdABCD1234"' /tmp/out && echo $(cat /tmp/out)
{
    "StatusCode": 200,
    "ExecutedVersion": "$LATEST"
}
"ABCDABCD1234"
```

## リポジトリ

ご自由にどうぞ

[https://github.com/53ningen/DotNetCoreLambda.git](https://github.com/53ningen/DotNetCoreLambda.git)

## Appendix1: C# から外部プロセスを呼び出し、標準出力を得る

以下のような形で実現できる。

```
using System.Diagnostics;
using Amazon.Lambda.Core;

[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.Json.JsonSerializer))]

namespace DotNetCoreLambda
{
    public class Function
    {
        public string FunctionHandler(string input, ILambdaContext context)
        {
            var app = new ProcessStartInfo
            {
                FileName = "echo",
                Arguments = "hoge fuga",
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardInput = false,
                CreateNoWindow = false,
            };
            var process = Process.Start(app);
            string results = process.StandardOutput.ReadToEnd();
            return results;
        }
    }
}
```

この Lambda 関数をデプロイして実行すると以下のような戻り値が得られる

```
"hoge fuga\n"
```
