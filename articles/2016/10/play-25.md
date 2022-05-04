---
title: play 2.5 のアレコレ
category: programming
date: 2016-10-24 04:56:18
tags: [Scala, Play]
pinned: false
---

play がいろいろと変わっているので、いろいろと走り書き

# logback.xml を使え

- WARN がうるさい
- logback.xml という名前でとりあえず次のようなファイルを作っとけば OK
- https://www.playframework.com/documentation/2.5.x/SettingsLogger

```
<!-- https://www.playframework.com/documentation/latest/SettingsLogger -->
<configuration>

    <conversionRule conversionWord="coloredLevel" converterClass="play.api.libs.logback.ColoredLevel"/>

    <appender name="FILE" class="ch.qos.logback.core.FileAppender">
        <file>${application.home:-.}/logs/application.log</file>
        <encoder>
            <pattern>%date [%level] from %logger in %thread - %message%n%xException</pattern>
        </encoder>
    </appender>

    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%coloredLevel %logger{15} - %message%n%xException{10}</pattern>
        </encoder>
    </appender>

    <appender name="ASYNCFILE" class="ch.qos.logback.classic.AsyncAppender">
        <appender-ref ref="FILE"/>
    </appender>

    <appender name="ASYNCSTDOUT" class="ch.qos.logback.classic.AsyncAppender">
        <appender-ref ref="STDOUT"/>
    </appender>

    <logger name="play" level="INFO"/>
    <logger name="application" level="DEBUG"/>

    <!-- Off these ones as they are annoying, and anyway we manage configuration ourselves -->
    <logger name="com.avaje.ebean.config.PropertyMapLoader" level="OFF"/>
    <logger name="com.avaje.ebeaninternal.server.core.XmlConfigLoader" level="OFF"/>
    <logger name="com.avaje.ebeaninternal.server.lib.BackgroundThread" level="OFF"/>
    <logger name="com.gargoylesoftware.htmlunit.javascript" level="OFF"/>

    <root level="WARN">
        <appender-ref ref="ASYNCFILE"/>
        <appender-ref ref="ASYNCSTDOUT"/>
    </root>

</configuration>
```

# GlobalSettings それ死んだよ

- ドキュメント曰く、ライフサイクル系は Guice の eagerSingleton に便乗して実現するっぽい
- JDBCConnectionPool まわりなんかもここで Application が Inject されることを期待して、記述すればよいっぽさ
- https://www.playframework.com/documentation/2.5.x/ScalaDependencyInjection#Stopping/cleaning-up

```
import javax.inject.{Inject, Singleton}

import play.api.{Application, Logger}
import play.api.inject.ApplicationLifecycle

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

@Singleton
class AppSettings @Inject()(lifecycle: ApplicationLifecycle, application: Application) {

  Logger.info("Start application...")
  // 旧 onStart の内容

  lifecycle.addStopHook(() => Future {
    Logger.info("Shutdown application...")
    // 旧 onStop の内容
  })

}
```

```
import com.google.inject.AbstractModule

class Module extends AbstractModule {

  def configure() = {
    bind(classOf[AppSettings]).asEagerSingleton()
  }

}
```

# sbt 0.13.12 から build.sbt 使え

- https://github.com/sbt/sbt/pull/2530
- nrhd...
