---
id: error-handling
title: Error Handling
nav: Error Handling
group: Language
---

```lambda
try {
    throw "something went wrong";
} catch (err) {
    print($"Caught: {err}");
}

// Throw any value
try {
    throw { code: 404, msg: "not found" };
} catch (err) {
    print(err.msg);
}

// Assert (throws on false)
assert(x > 0, "x must be positive");
```
