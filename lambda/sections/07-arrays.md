---
id: arrays
title: Arrays
nav: Arrays
group: Language
---

Arrays are zero-indexed and dynamically sized.

```lambda
let arr = [1, 2, 3];

arr[0] = 99;
let len = array_length(arr); // 3

array_push(arr, 4);
array_pop(arr); // removes and returns 4

// Functional operations
let doubled = array_map(arr, func(v) { return v * 2; });
let evens   = array_filter(arr, func(v) { return v % 2 == 0; });
let sum     = array_reduce(arr, func(acc, v) { return acc + v; }, 0);
```
