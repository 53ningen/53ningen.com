---
slug: xamarin-ios-memo
title: Xamarin.iOSアレコレメモ
category: programming
date: 2018-04-13 22:49:22
tags: [Xamarin, Xamarin.iOS]
pinned: false
---

<h2>NSDate と DateTime の相互変換</h2>

<ul>
<li>実際にはもうちょっとタイムゾーンとか色々気を使う必要あるけどざっくりまとめ</li>
<li>https://forums.xamarin.com/discussion/27184/convert-nsdate-to-datetime</li>
</ul>

<h3>NSDate => DateTime</h3>

<p>ReferenceDate ってなんなの...（https://developer.apple.com/documentation/foundation/nsdate）</p>

```
    public static class FoundationExtensions
    {
        public static DateTime ToDateTime(this NSDate date)
        {
            // ref: https://developer.apple.com/documentation/foundation/nsdate
            var referenceDate = new DateTime(2001, 1, 1);
            return referenceDate.AddSeconds(date.SecondsSinceReferenceDate);
        }
    }
```

```
        public static NSDate ToNSDate(this DateTime dateTime)
        {
            var universalTime = dateTime.ToUniversalTime();
            var date = NSDate.FromTimeIntervalSinceReferenceDate((universalTime - referenceDate).TotalSeconds);
            return date;
        }
```
