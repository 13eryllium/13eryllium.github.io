---
id: strings
title: String Interpolation
nav: String Interpolation
group: Language
---

Prefix a string literal with `$` to embed expressions inside `{}`.

```lambda
let name = "World";
print($"Hello, {name}!");        // Hello, World!

let a = 3;
let b = 4;
print($"{a} + {b} = {a + b}");  // 3 + 4 = 7

// Any expression works inside {}
print($"Type: {type_of(name)}");
```
