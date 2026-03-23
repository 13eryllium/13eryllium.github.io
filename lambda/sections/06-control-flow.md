---
id: control-flow
title: Control Flow
nav: Control Flow
group: Language
---

### If / else

```lambda
if (x > 5) {
    print("big");
} else if (x == 3) {
    print("three");
} else {
    print("small");
}
```

### While loop

```lambda
let x = 5;
while (x > 0) {
    print(x);
    x -= 1;
}
```

### C-style for loop

```lambda
for (let i = 0; i < 10; i += 1) {
    print(i);
}
```

### For-in loop

Iterate over every element of an array.

```lambda
let items = ["sword", "shield", "potion"];
for (let item in items) {
    print(item);
}
```

### Break & Continue

```lambda
for (let i = 0; i < 10; i += 1) {
    if (i == 3) { continue; }
    if (i == 7) { break; }
    print(i);
}
```
