---
slug: lambda-byolr
title: Lambda で各種言語を試す
category: programming
date: 2018-12-01 00:21:06
tags: [C++, Lambda, bash, Ruby]
pinned: false
---

Lambda にて Ruby 2.5 がサポートされたのに加え、Bring Your Own Language Runtime という形でお好きな言語のランタイムの導入がサポートされました。各種言語での Hello, World を試しておきます。

## 目次

- [Ruby 2.5](#ruby25)
- [Golang 1.x](#golang1x)
- [C/C++](#cpp)
- [Bash](#bash)
- [PHP](#php)
- [Python3.6](#python36)
- [COBOL](#cobol)
- [C#](#csharp)
- [F#](#fsharp)
- [VB.NET](#vbdotnet)
- TODO
  - D
  - Erlang
  - Elixir
  - FORTRAN
  - Haskell
  - Rust
  - Swift

<a name="ruby25"></a>

### Ruby 2.5

ランタイムとして Ruby 2.5 が選択できるようになっているので、その状態で Lambda 関数を作成します。

```ruby
def lambda_handler(event:, context:)
    'Hello, World!'
end
```

<a name="golang1x"></a>

### Golang 1.x

あらかじめ `go get -u github.com/aws/aws-lambda-go/lambda` を実行したのち次のような関数を作成する

```go
package main

import (
 "fmt"
 "github.com/aws/aws-lambda-go/lambda"
)

type MyEvent struct{}

type Response struct {
 Message string
}

func handler(event MyEvent) (Response, error) {
 res := Response{Message: "Hello, World!"}
 fmt.Println(res)
 return res, nil
}

func main() {
 lambda.Start(handler)
}
```

デプロイは以下のような具合でできる

```sh
#!/bin/sh

ROLE_ARN=...

GOOS=linux GOARCH=amd64 go build -o ./bin/handler
zip -j ./bin/handler.zip ./bin/handler

aws lambda create-function \
  --function-name GolangHelloWorld \
  --runtime go1.x \
  --role $ROLE_ARN \
  --handler handler \
  --zip-file fileb://./bin/handler.zip
```

実行してみる

```
$ aws lambda invoke --function-name GolangHelloWorld /tmp/out; echo `cat /tmp/out`
{
    "StatusCode": 200,
    "ExecutedVersion": "$LATEST"
}
{"Message":"Hello, World!"}
```

お手軽ですね。

## Runtime API を使う

[新機能 – AWS Lambda :あらゆるプログラム言語への対応と一般的なコンポーネントの共有
](https://aws.amazon.com/jp/blogs/news/new-for-aws-lambda-use-any-programming-language-and-share-common-components/) に記載があるように Lambda Layers と Lambda Runtime API が追加されました。それぞれどういうものであるか、引用します。

> - Lambda Layers, 複数の関数で共用されるコードやデータをセンタライズし管理するものです
> - Lambda Runtime API, あなたが開発する、どんなプログラム言語や特定のバージョンでも簡単に利用できるようになるものです

このうち Lambda Runtime API を利用して、様々なプログラム言語で Lambda 関数を作ってみたいと思います。

<a name="cpp"></a>

### C/C++

C/C++ に関しては [Introducing the C++ Lambda Runtime
](https://aws.amazon.com/jp/blogs/compute/introducing-the-c-lambda-runtime/) を参考にしつつ進めました。

まずは Linux ベースの環境を用意します。推奨されているのは Amazon Linux なので EC2 インスタンスをたてます。そして必要そうなものを入れます。

```
# on EC2 Instance (AMI: Amazon Linux AMI 2018.03.0 (HVM), SSD Volume Type ami-063fa8762cdc9a5a6)
$ sudo yum update -y
$ sudo yum install gcc64-c++ libcurl-devel
$ export CC=gcc64
$ export CXX=g++64
$ sudo yum install git
$ gcc -v
Using built-in specs.
COLLECT_GCC=gcc
COLLECT_LTO_WRAPPER=/usr/libexec/gcc/x86_64-amazon-linux/6.4.1/lto-wrapper
Target: x86_64-amazon-linux
Configured with: ../configure --enable-bootstrap --enable-languages=c,c++,fortran,lto --prefix=/usr --mandir=/usr/share/man --infodir=/usr/share/info --with-bugurl=http://bugzilla.redhat.com/bugzilla --enable-shared --enable-threads=posix --enable-checking=release --enable-multilib --with-system-zlib --enable-__cxa_atexit --disable-libunwind-exceptions --enable-gnu-unique-object --enable-linker-build-id --with-linker-hash-style=gnu --enable-plugin --enable-initfini-array --disable-libgcj --with-default-libstdcxx-abi=gcc4-compatible --with-isl --enable-libmpx --enable-libsanitizer --enable-libcilkrts --enable-libatomic --enable-libquadmath --enable-libitm --enable-gnu-indirect-function --with-tune=generic --with-arch_32=x86-64 --build=x86_64-amazon-linux
Thread model: posix
gcc version 6.4.1 20170727 (Red Hat 6.4.1-1) (GCC)
```

続いて、ランタイムをビルドして ~/out に静的ライブラリとして配置するために次のように進めます

```
$ git clone https://github.com/awslabs/aws-lambda-cpp.git
$ cd aws-lambda-cpp
$ mkdir build
$ cd build
$ cmake3 .. -DCMAKE_BUILD_TYPE=Release -DBUILD_SHARED_LIBS=OFF \
    -DCMAKE_INSTALL_PREFIX=~/out
$ make && make install
```

そして、Lambda 関数を作成します

```
$ mkdir hello-world-cpp
$ cd hello-world-cpp
$ vi main.cpp
$ cat main.cpp
// main.cpp
#include <aws/lambda-runtime/runtime.h>

using namespace aws::lambda_runtime;

invocation_response my_handler(invocation_request const& request)
{
   return invocation_response::success("Hello, World!", "application/json");
}

int main()
{
   run_handler(my_handler);
   return 0;
}

$ vi CMakeList.txt
$ cat CMakeList.txt
cmake_minimum_required(VERSION 3.5)
set(CMAKE_CXX_STANDARD 11)
project(hello LANGUAGES CXX)

find_package(aws-lambda-runtime REQUIRED)
add_executable(${PROJECT_NAME} "main.cpp")
target_link_libraries(${PROJECT_NAME} PUBLIC AWS::aws-lambda-runtime)
aws_lambda_package_target(${PROJECT_NAME})

$ mkdir build
$ cd build
$ cmake3 .. -DCMAKE_BUILD_TYPE=Release -DCMAKE_PREFIX_PATH=~/out
$ make
$ make aws-lambda-package-hello
```

最後にデプロイを行います

```
$ aws lambda create-function \
    --function-name CppHelloWorld \
    --role arn:aws:iam::? \
    --runtime provided \
    --timeout 15 \
    --memory-size 128 \
    --handler hello \
    --zip-file fileb://hello.zip
$ aws lambda invoke --function-name CppHelloWorld --invocation-type RequestResponse /tmp/output
{
    "ExecutedVersion": "$LATEST",
    "StatusCode": 200
}
$ cat /tmp/output
Hello, World!
```

<a name="bash"></a>

## Bash

公式ドキュメント: [Tutorial – Publishing a Custom Runtime](https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/runtimes-walkthrough.html) に沿って簡単に作れます。ネイティブに依存するバイナリコードが含まれないので手元マシンから作成しても大丈夫かと思いますが、Windows の場合、パーミッションに気をつける必要がありそうです。

ひとまず bootstrap ファイルを作成します。これはドキュメントより引用です。

```
#!/bin/sh

set -euo pipefail

# Initialization - load function handler
source $LAMBDA_TASK_ROOT/"$(echo $_HANDLER | cut -d. -f1).sh"

# Processing
while true
do
  HEADERS="$(mktemp)"
  # Get an event
  EVENT_DATA=$(curl -sS -LD "$HEADERS" -X GET "http://${AWS_LAMBDA_RUNTIME_API}/2018-06-01/runtime/invocation/next")
  REQUEST_ID=$(grep -Fi Lambda-Runtime-Aws-Request-Id "$HEADERS" | tr -d '[:space:]' | cut -d: -f2)

  # Execute the handler function from the script
  RESPONSE=$($(echo "$_HANDLER" | cut -d. -f2) "$EVENT_DATA")

  # Send the response
  curl -X POST "http://${AWS_LAMBDA_RUNTIME_API}/2018-06-01/runtime/invocation/$REQUEST_ID/response"  -d "$RESPONSE"
done
```

つづいて、関数の実体となるファイルを作成します。

```
function handler () {
    echo 'Hello, Wolrd!'
}
```

最後にデプロイを行います

```
$ aws lambda create-function \
    --function-name BashHelloWorld \
    --role arn:aws:iam::? \
    --runtime provided \
    --timeout 15 \
    --memory-size 128 \
    --handler function.handler \
    --zip-file fileb://function.zip
$ aws lambda invoke --function-name BashHelloWorld --invocation-type RequestResponse /tmp/output
{
    "ExecutedVersion": "$LATEST",
    "StatusCode": 200
}
$ cat /tmp/output
Hello, World!
```

### 単純に他のランタイムからシェルコマンドを実行する

もっと単純にシェルコマンドをサクッと実行したいだけなら以下のような形でも問題ありません(Python)

```py
import subprocess

def lambda_handler(event, context):
    cmd = ['echo', 'Hello, World!']
    out = subprocess.run(cmd, stdout=subprocess.PIPE)
    print(out.stdout.decode())

```

あるいは `os.system` 関数を使う形で以下のようにもできます

```py
import os

def lambda_handler(event, context):
    os.system('cat lambda_function.py')
```

<a name="php"></a>

### PHP

#### 用意されている Layer を使う方法

[stackery/php-lambda-layer: PHP Runtime Layer for AWS Lambda](https://github.com/stackery/php-lambda-layer) を使うとお手軽に PHP な Lambda 関数を作成できます。使い方は README に書いてあります。

まず、デプロイ先の S3 バケットをつくります。次に作業ディレクトリの作成と、 `template.yaml` ファイルの作成をします。

```
$ mkdir php-app
$ cd php-app
$ vi template.yaml
...

$ cat template.yaml

AWSTemplateFormatVersion: 2010-09-09
Description: My PHP Application
Transform: AWS::Serverless-2016-10-31
Resources:
  phpserver:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: !Sub ${AWS::StackName}-phpserver
      Description: PHP Webserver
      CodeUri: src
      Runtime: provided
      Handler: index.php
      MemorySize: 3008
      Timeout: 30
      Tracing: Active
      Layers:
        - !Sub arn:aws:lambda:${AWS::Region}:887080169480:layer:php71:7
      Events:
        api:
          Type: Api
          Properties:
            Path: /{proxy+}
            Method: ANY
```

つづいて php のコードを配置

```
$ mkdir src
$ echo '<?php echo "{\"message\":\"Hello, Wolrd!\"}\n";' > ./src/index.php
```

そしてデプロイしておわり

```
$ sam package \
    --template-file template.yaml \
    --output-template-file serverless-output.yaml \
    --s3-bucket <your SAM deployment bucket created above>

$ sam deploy \
    --template-file serverless-output.yaml \
    --stack-name PHPLambdaHelloWorld \
    --capabilities CAPABILITY_IAM

$ curl https://?.execute-api.ap-northeast-1.amazonaws.com/Prod/index.php
{"message":"Hello, Wolrd!"}
```

<a name="python36"></a>

### Python 3.6

標準で使えるランタイムです。

単純に以下のような形で Hello, World! となります

```python
def lambda_handler(event, context):
    print('Hello, World!')
    return { 'value': 'Hello, World!' }
```

#### 依存パッケージをレイヤーに切り出す

充実した計算用ライブラリや機械学習系のライブラリが Python の強みですが、計算のパフォーマンスのため一部のライブラリでは環境に依存した形のバイナリを含みます。

その場合 Lambda が実行される環境と同じアーキテクチャの環境にてパッケージもしくはレイヤーを作成する必要があります。

Lambda の実行環境については [Lambda 実行環境と利用できるライブラリ](https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/current-supported-versions.html) に記載されています。2018 年 12 月時点では次のような内容となっています。

```
オペレーティングシステム – Amazon Linux
AMI – amzn-ami-hvm-2017.03.1.20170812-x86_64-gp2
Linux カーネル – 4.14.77-70.59.amzn1.x86_64
AWS SDK for JavaScript – 2.290.0
SDK for Python (Boto3) – 3-1.7.74 botocore-1.10.74
```

ここでは numpy をレイヤーに切り出し、Lambda 関数の実装コードはそのレイヤーに納めた numpy を利用する形で Lambda 関数を動作させてみます。

ちなみに現時点では 1 つの Lambda 関数に 5 つのレイヤーまで使用可能で、関数とすべてのレイヤーの解凍後のサイズが 250 MB までという制限があります。

[AWS Lambda レイヤー](https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/configuration-layers.html) においては依存ライブラリを以下のようなパスに配置する必要があります。

- python

まず python3.6 環境を pyenv でサクッと用意します

```
# pyenv/pyenv: Simple Python version management
# https://github.com/pyenv/pyenv#installation
sudo yum install git gcc zlib-devel bzip2-devel openssl-devel readline-devel sqlite sqlite-devel libffi-devel -y
git clone https://github.com/pyenv/pyenv.git ~/.pyenv
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bash_profile
echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bash_profile
echo -e 'if command -v pyenv 1>/dev/null 2>&1; then\n  eval "$(pyenv init -)"\nfi' >> ~/.bash_profile
exec "$SHELL"
source ~/.bash_profile
pyenv install --list
pyenv install 3.6.8
pyenv global 3.6.8
```

つづいて以下のようにしてお手軽にレイヤーを作成できます

```
$ mkdir python

$ pip install -t ./python numpy
Collecting numpy
  Downloading https://files.pythonhosted.org/packages/e0/b5/63b79fe426433fa1cd110eb04a94ec0c6967e56e5f57c98caf455a5fb6e2/numpy-1.16.1-cp27-cp27mu-manylinux1_x86_64.whl (17.0MB)
    100% |████████████████████████████████| 17.0MB 67kB/s
Installing collected packages: numpy
Successfully installed numpy-1.16.1

$ zip numpy.zip python -r
  adding: python/ (stored 0%)
```

最後にレイヤーを使った簡単な Lambda 関数を実装します

```
import json
import numpy as np

def lambda_handler(event, context):
    arr = [[1, 2], [3, 4]]
    a = np.array(arr)
    return {
        'statusCode': 200,
        'dim': a.ndim
    }
```

これを実行すると次のように numpy を使った計算結果が正常に得られます

```json
{
  "statusCode": 200,
  "dim": 2
}
```

<a name="cobol"></a>

### COBOL

COBOL 全然詳しくないので 記事: [AWS Lambda の Custom Runtime で COBOL を動かしてみた](https://dev.classmethod.jp/cloud/aws/lambda-custom-runtimes-cobol/) を参考にさせていただきました

#### macOS での環境構築

めっちゃお手軽

```
$ brew install gnu-cobol
$ cat HELLO_WORLD.cob
       IDENTIFICATION DIVISION.
       PROGRAM-ID. HELLO_WORLD.
       ENVIRONMENT DIVISION.
       DATA DIVISION.
       PROCEDURE DIVISION.
       MAIN.
           DISPLAY 'Hello World'.
           STOP RUN.

$ cobc -x -Wall -debug HELLO_WORLD.cob
$ ./HELLO_WORLD
Hello World
```

#### カスタムランタイムの作成

gnu-cobol の導入

```
# on EC2 Instance (AMI: Amazon Linux AMI 2018.03.0 (HVM), SSD Volume Type ami-063fa8762cdc9a5a6)
$ sudo yum -y update
$ sudo yum groupinfo "Development tools"
$ sudo yum install gmp-devel db4 db4-devel ncurses-devel gcc -y
$ wget https://sourceforge.net/projects/open-cobol/files/gnu-cobol/2.2/gnucobol-2.2.tar.gz
$ tar zxvf gnucobol-2.2.tar.gz
$ ./configure --prefix=/usr --libdir=/usr/lib64
$ make
$ sudo make install
```

この状態で多分前述の COBOL Hello, World! がコンパイル&実行できる状態になっているかと思います

```
$ cobc -x -Wall -debug hello.cob
$ ./hello
Hello world!
```

#### デプロイパッケージの作成

bootstrap ファイルは[チュートリアル](https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/runtimes-walkthrough.html)の内容をベースに lambda handler に指定したファイル名で実行形式ファイルを走らせるようなものとしている

```sh
#!/bin/sh

set -euo pipefail

# Initialization - load function handler
FN=$_HANDLER

# Processing
while true
do
  HEADERS="$(mktemp)"
  # Get an event
  EVENT_DATA=$(curl -sS -LD "$HEADERS" -X GET "http://${AWS_LAMBDA_RUNTIME_API}/2018-06-01/runtime/invocation/next")
  REQUEST_ID=$(grep -Fi Lambda-Runtime-Aws-Request-Id "$HEADERS" | tr -d '[:space:]' | cut -d: -f2)

  # Execute the handler function from the script
  RESPONSE=$(./$FN "$EVENT_DATA")

  # Send the response
  curl -sS -X POST "http://${AWS_LAMBDA_RUNTIME_API}/2018-06-01/runtime/invocation/$REQUEST_ID/response"  -d "$RESPONSE" -o /dev/null
done
```

パッケージのビルドとデプロイ

```
$ mkdir -p build && cd build
$ cp ../bootstrap ../hello.cob \
    /usr/lib64/libcob.so.4 \
    /usr/lib64/libgmp.so.10 \
    /usr/lib64/libdb-4.7.so \
    /lib64/libm.so.6 \
    /lib64/libncursesw.so.\
    /lib64/libtinfo.so.5 \
    /lib64/libdl.so.2 \
    /lib64/libc.so.6 \
    /lib64/libpthread.so.0 \
    /lib64/ld-linux-x86-64.so.2 \
    ./
$ export COB_LDFLAGS="-Wl,--rpath=./ -Wl,--dynamic-linker=./ld-linux-x86-64.so.2"
$ cobc -x hello.cob
$ zip -r9 ../package.zip .
$ aws lambda create-function --function-name cobol-hello-world --runtime provided --handler hello --zip-file fileb://../package.zip --region ap-northeast-1 --role arn:aws:iam::?:role/lambda_basic_execution
```

<a name="csharp"></a>

### CSharp

.NETCore のマネージドランタイムがあるのでこれを利用すればよく、お手軽。[公式のドキュメント](https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/lambda-dotnet-how-to-create-deployment-package.html)もあります。

- .NET Core 3.0: [.NET Core 3.0 on Lambda with AWS Lambda’s Custom Runtime | AWS Developer Blog](https://aws.amazon.com/jp/blogs/developer/net-core-3-0-on-lambda-with-aws-lambdas-custom-runtime/)

まずはプロジェクトの作成から。.NETCore 2.1 ランタイムで C# での開発を行いたい場合は以下のようなコマンドを実行

```
$ dotnet new -i Amazon.Lambda.Templates
$ dotnet new lambda.EmptyFunction
```

すると Lambda の雛形が作成されるので、あとはビルド・デプロイしておしまいです。Amazon.Lambda.Tools .NET Core Global Tool という便利なツールが提供されているので導入します。

```
$ dotnet tool install -g Amazon.Lambda.Tools
```

.csproj のあるディレクトリまで移動して次のようなコマンドでデプロイできる（お手軽〜〜〜！！）

```
$ dotnet lambda deploy-function MyFunction
```

関数の実装はシンプルに以下のようなものです

```
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Amazon.Lambda.Core;

// Assembly attribute to enable the Lambda function's JSON input to be converted into a .NET class.
[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.Json.JsonSerializer))]

namespace dot
{
    public class Function
    {

        /// <summary>
        /// A simple function that takes a string and does a ToUpper
        /// </summary>
        /// <param name="input"></param>
        /// <param name="context"></param>
        /// <returns></returns>
        public string FunctionHandler(string input, ILambdaContext context)
        {
            return input?.ToUpper();
        }
    }
}
```

<a name="fsharp"></a>

### FSharp

.NETCore のマネージドランタイムがあるのでこれを利用すればよいはず。しかし F# 向けのドキュメントはないので自力で頑張ります。

まずはプロジェクトの作成から。.NETCore 2.1 ランタイムで F# での開発を行いたい場合は以下のようなコマンドを実行

```
$ dotnet new classlib -f netcoreapp2.1 --language F# --name DotnetCoreLambdaFs
```

つづいて生成されたプロジェクトファイルを少しいじります

```
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>netcoreapp2.1</TargetFramework>
    <GenerateRuntimeConfigurationFiles>true</GenerateRuntimeConfigurationFiles>
    <AWSProjectType>Lambda</AWSProjectType>
  </PropertyGroup>

  <ItemGroup>
    <Compile Include="Function.fs" />
  </ItemGroup>

  <ItemGroup>
    <PackageReference Include="Amazon.Lambda.Core" Version="1.1.0" />
    <PackageReference Include="Amazon.Lambda.Serialization.Json" Version="1.6.0" />
  </ItemGroup>

</Project>
```

この状態で `nuget restore` すると IDE で開発するときにライブラリの依存が解決された状態となり、サクッと開発できるかと思います

Function.fs の実装は簡単に次のようなものとします

```
namespace DotnetLambdaCoreFs

open Amazon.Lambda.Core
open Amazon.Lambda.Serialization.Json

[<assembly:LambdaSerializer(typeof<JsonSerializer>)>]
do ()

module Function =
    let handler (input: string) (_: ILambdaContext) =
        match input with
        | null -> ""
        | s -> s.ToUpper()
```

デプロイに向けひとつだけ準備として `aws-lambda-tools-defaults.json` というファイルを次のような内容で作成しておきます

```
{
  "profile":"",
  "region" : "",
  "configuration" : "Release",
  "framework" : "netcoreapp2.1",
  "function-runtime":"dotnetcore2.1",
  "function-memory-size" : 256,
  "function-timeout" : 30,
  "function-handler" : "DotnetCoreLambdaFs::DotnetLambdaCoreFs.Function::handler"
}
```

最後にデプロイコマンドを実行して完了です

```
$ dotnet lambda deploy-function MyFunction
```

<a name="vb"></a>

### Visual Basic

C# や F# 同様 .NETCore のマネージドランタイムがあるのでこれを利用すればよいはず。

まずはプロジェクトの作成から。.NETCore 2.1 ランタイムで Visual Basic での開発を行いたい場合は以下のようなコマンドを実行

```
$ dotnet new classlib -f netcoreapp2.1 --language VisualBasic --name DotnetCoreLambdaFs
```

つづいて生成されたプロジェクトファイルを少しいじります

```
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <RootNamespace>DotnetCoreLambdaVB</RootNamespace>
    <TargetFramework>netcoreapp2.1</TargetFramework>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Amazon.Lambda.Core" Version="1.1.0" />
    <PackageReference Include="Amazon.Lambda.Serialization.Json" Version="1.6.0" />
  </ItemGroup>

</Project>
```

Function.vb の実装は簡単に次のようなものとします

```
Imports Amazon.Lambda.Core

<Assembly: LambdaSerializer(GetType(Amazon.Lambda.Serialization.Json.JsonSerializer))>
Public Class Fun
    Public Function Handler(ByVal input As String, ByVal context As ILambdaContext) As String
        Return input?.ToUpper()
    End Function
End Class
```

デプロイに向けひとつだけ準備として `aws-lambda-tools-defaults.json` というファイルを次のような内容で作成しておきます

```
{
  "profile": "",
  "region": "",
  "configuration": "Release",
  "framework": "netcoreapp2.1",
  "function-runtime": "dotnetcore2.1",
  "function-memory-size": 256,
  "function-timeout": 30,
  "function-handler": "DotnetCoreLambdaVB::DotnetCoreLambdaVB.Fun::Handler"
}
```

最後にデプロイコマンドを実行して完了です

```
$ dotnet lambda deploy-function MyFunction
```

### D

TODO

### Erlang

TODO

### Elixir

### FORTRAN

TODO

### Haskell

TODO

### Rust

TODO

### Swift

TODO

## Appendix1: Lambda 関数のローカルで読み書きする

Lambda 関数実行時に一時ファイルを作成したり、それを読み込んだりできますが、一部ディレクトリをのぞいて readonly となっています。これは以下のようなコードにて確認可能です。

```
import os

def lambda_handler(event, context):
    os.system('echo test > ./hoge')
```

これを実行すると以下のようなエラーメッセージが出力されます。

```
START RequestId: ? Version: $LATEST
sh: ./hoge: Read-only file system
...
```

一方で `/tmp` 下には書き込みできるようになっています。

```
import os

def lambda_handler(event, context):
    os.system('echo ls > /tmp/hoge')
    os.system('sh /tmp/hoge')
```

これを実行すると以下のように出力されます

```
START RequestId: ? Version: $LATEST
lambda_function.py
...
```

## Appendix2: docker-lambda の利用

Lambda 関数の実行環境に依存するデプロイパッケージやレイヤーの作成のために同様の環境の EC2 インスタンスを立ててビルドするというのはサーバーレス的な視点からいうと微妙です。

[docker-lambda](https://github.com/lambci/docker-lambda) を用いると、ローカル環境での Lambda 関数の実行や、パッケージの作成など手元でお手軽にできるようになります。

### Lambda 関数のローカル実行

index.handler.js というファイル名で以下のような簡単な Lambda 関数を作ります

```js
exports.handler = async (event) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  }
  console.log(response)
  return response
}
```

これを docker-lambda を用いてローカル環境で実行してみます

```
$ docker run --rm -v "$PWD":/var/task lambci/lambda:nodejs8.10 index.handler '{"some": "event"}'

Unable to find image 'lambci/lambda:nodejs8.10' locally
nodejs8.10: Pulling from lambci/lambda
b022ae66572d: Already exists
3e9be76694eb: Pull complete
4095d134d750: Pull complete
Digest: sha256:8d61e20b3a1e5e825d961bc35b91faffcd7c4b7b015613badfd0bdf222ec2939
Status: Downloaded newer image for lambci/lambda:nodejs8.10
START RequestId: 2c30c26c-091e-195b-3274-31d70a19a122 Version: $LATEST
2019-03-01T13:07:43.408Z 2c30c26c-091e-195b-3274-31d70a19a122 { statusCode: 200, body: '"Hello from Lambda!"' }
END RequestId: 2c30c26c-091e-195b-3274-31d70a19a122
REPORT RequestId: 2c30c26c-091e-195b-3274-31d70a19a122 Duration: 20.83 ms Billed Duration: 100 ms Memory Size: 1536 MB Max Memory Used: 31 MB

{"statusCode":200,"body":"\"Hello from Lambda!\""}
```

### 実行環境に依存するライブラリを導入する

ホストマシンのディスクをマウントしてそのパスにライブラリを流しこむことにより実現できます

```
$ docker run --rm -v "$PWD":/var/task -w /var/task lambci/lambda:build-python3.6 pip install pandas -t python
Collecting pandas
  Downloading https://files.pythonhosted.org/packages/e6/de/a0d3defd8f338eaf53ef716e40ef6d6c277c35d50e09b586e170169cdf0d/pandas-0.24.1-cp36-cp36m-manylinux1_x86_64.whl (10.1MB)
Collecting python-dateutil>=2.5.0 (from pandas)
  Downloading https://files.pythonhosted.org/packages/41/17/c62faccbfbd163c7f57f3844689e3a78bae1f403648a6afb1d0866d87fbb/python_dateutil-2.8.0-py2.py3-none-any.whl (226kB)
Collecting pytz>=2011k (from pandas)
  Downloading https://files.pythonhosted.org/packages/61/28/1d3920e4d1d50b19bc5d24398a7cd85cc7b9a75a490570d5a30c57622d34/pytz-2018.9-py2.py3-none-any.whl (510kB)
Collecting numpy>=1.12.0 (from pandas)
  Downloading https://files.pythonhosted.org/packages/35/d5/4f8410ac303e690144f0a0603c4b8fd3b986feb2749c435f7cdbb288f17e/numpy-1.16.2-cp36-cp36m-manylinux1_x86_64.whl (17.3MB)
Collecting six>=1.5 (from python-dateutil>=2.5.0->pandas)
  Downloading https://files.pythonhosted.org/packages/73/fb/00a976f728d0d1fecfe898238ce23f502a721c0ac0ecfedb80e0d88c64e9/six-1.12.0-py2.py3-none-any.whl
serverlessrepo 0.1.5 has requirement six~=1.11.0, but you'll have six 1.12.0 which is incompatible.
aws-sam-cli 0.10.0 has requirement aws-lambda-builders==0.0.5, but you'll have aws-lambda-builders 0.1.0 which is incompatible.
aws-sam-cli 0.10.0 has requirement six~=1.11.0, but you'll have six 1.12.0 which is incompatible.
Installing collected packages: six, python-dateutil, pytz, numpy, pandas
Successfully installed numpy-1.16.2 pandas-0.24.1 python-dateutil-2.8.0 pytz-2018.9 six-1.12.0
You are using pip version 19.0.2, however version 19.0.3 is available.
You should consider upgrading via the 'pip install --upgrade pip' command.

$ ls -a ./python/
. bin numpy-1.16.2.dist-info python_dateutil-2.8.0.dist-info six-1.12.0.dist-info
.. dateutil pandas pytz six.py
__pycache__ numpy pandas-0.24.1.dist-info pytz-2018.9.dist-info
```

最終的に Python の Lambda のレイヤーとして固めるためには以下のようにすればよい

```
$ zip -r9 ./layer.zip ./python/
...
```
