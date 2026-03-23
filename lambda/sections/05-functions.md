---
id: functions
title: Functions & Closures
nav: Functions & Closures
group: Language
---

Functions are created with the `func` keyword and assigned to variables.

```lambda
let add = func(a, b) {
    return a + b;
};

let result = add(3, 4); // 7
```

### Higher-order functions

```lambda
let apply = func(f, x) { return f(x); };

let double = func(n) { return n * 2; };
apply(double, 5); // 10
```

### Closures

Functions capture their enclosing scope. This enables patterns like counters and factories.

```lambda
let make_counter = func() {
    let n = 0;
    return func() {
        n += 1;
        return n;
    };
};

let counter = make_counter();
counter(); // 1
counter(); // 2
counter(); // 3
```
