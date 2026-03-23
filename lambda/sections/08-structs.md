---
id: structs
title: Structs
nav: Structs
group: Language
---

Structs are key-value containers. Access fields with dot notation or bracket notation.

```lambda
let pt = { x: 10, y: 20 };

pt.x = 50;
pt["y"] = 80;

struct_has(pt, "x");  // true
struct_keys(pt);      // ["x", "y"]
struct_delete(pt, "y");

// Merging (override wins on conflict)
let base     = { hp: 100, speed: 5 };
let override = { speed: 8, name: "knight" };
let unit = struct_merge(base, override);
// { hp: 100, speed: 8, name: "knight" }
```

::callout
**Internal note:** Struct keys are prefixed with `_` in GML to avoid reserved-word collisions. This is fully transparent inside Lambda - you never see the prefix.

### Chained access

```lambda
let val = game.entities[0].name;
```
