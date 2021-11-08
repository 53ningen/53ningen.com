---
slug: iterator-pattern
title: Iteratorパターンの確認
category: programming
date: 2014-06-29 15:47:03
tags: [Java, デザインパターン]
pinned: false
---

Iterator パターンはデータの集合体に対して順番に走査する仕組みを作りたいときによく用いられる．たとえば Java では配列やリストなど基本的なデータ構造に Iterator パターンが実装されており，これにより拡張 for 文が実現していたりします．

Iterator パターンの登場人物は主に次の４つになります．

- 集合体を表す Aggregate インターフェース
- 走査をしていく Iterator インターフェース
- ある集合体を表す ConcreteAggregate クラス
- ある集合体を走査していくための具体的方法を実装した ConcreteIterator クラス

Iterator パターンをある集合体に適用する場合，その集合体を走査するための Iterator を生成して返す iterator メソッドを必ず実装します． Iterator インターフェースは次の要素が存在するかどうかの boolean を返す hasNext()，今の要素を返して次の要素をポイントする next()を持ちます．集合体により走査のしかた，方法などは不定なので，それぞれにあった走査の方法は ConcreteIterator クラスを作り，そちらで実装します．クラス図で表すと次のような具合になります．

![](https://static.53ningen.com/wp-content/uploads/2018/02/17154746/iterator.jpg)

### 具体例

具体例として，生徒 Student クラスの集合体：生徒一覧 StudentList クラスに対して，Iterator パターンを適用したコードを書いてみました．

```java
// Aggregate.java
package DesignPattern.Iterator;

public interface Aggregate {
    public abstract Iterator iterator();
}


// Iterator.java
package DesignPattern.Iterator;

public interface Iterator {
    public abstract boolean hasNext();
    public abstract Object next();
}


// Student.java
package DesignPattern.Iterator;

public class Student {
    private String name;
    public Student(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Student)) return false;

        Student student = (Student) o;

        if (!name.equals(student.name)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return name.hashCode();
    }
}


// StudentList.java
package DesignPattern.Iterator;

public class StudentList implements Aggregate {
    private Student[] students;
    private int last = 0;
    public StudentList(int numOfStudents) {
        this.students = new Student[numOfStudents];
    }
    public Student getStudent(int number) {
        return students[number];
    }
    public void addStudent(Student student) {
        this.students[last] = student;
        last++;
    }
    public int getNumberOfStudents() {
        return this.last;
    }
    @Override
    public Iterator iterator() {
        return new StudentListIterator(this);
    }
}


// StudentListIterator.java
package DesignPattern.Iterator;

public class StudentListIterator implements Iterator {
    private StudentList studentList;
    private int index;

    public StudentListIterator(StudentList studentList) {
        this.studentList = studentList;
        this.index = 0;
    }

    @Override
    public boolean hasNext() {
        if(index < studentList.getNumberOfStudents())
            return true;
        else
            return false;
    }

    @Override
    public Object next() {
        Student student = studentList.getStudent(index);
        index++;
        return student;
    }
}
```

クラス図は以下のような具合になります．

![](https://static.53ningen.com/wp-content/uploads/2018/02/17154746/iterator.jpg)

### まとめ

- 肝になる部分は，集合とその数え上げ方（走査方法）が分離されているというところかな．
- ひとつの集合に対して，Iterator を実装したものを複数作れば，色々な方法で走査ができるところは良いですね．
