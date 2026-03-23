---
id: pointers
title: Pointers
nav: Pointers
group: Language
---

The `>=>` operator creates a **live reference** to a struct field or array index. Reading the pointer variable automatically dereferences it - you always get the current value, not a snapshot.

```lambda
let pos = { x: 0, y: 0 };
let px >=> pos.x;

pos.x = 5;
print(px);  // 5  - reflects live state

pos.x = 99;
print(px);  // 99
```

### Array pointer

```lambda
let arr = [10, 20, 30];
let p1 >=> arr[1];

arr[1] = 99;
print(p1);  // 99
```
