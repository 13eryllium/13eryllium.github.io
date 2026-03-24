---
id: stdlib-io
title: I/O & Types
nav: I/O & Types
group: Standard Library
---

::fn print(v)
Outputs `v` to the debug console.

::fn to_string(v) → string
Converts any value to its string representation.

::fn to_number(v) → number

::fn to_bool(v) → bool

::fn type_of(v) → string
Returns: `"null"` `"bool"` `"number"` `"string"` `"array"` `"struct"` `"function"` `"pointer"` `"unknown"`

### Type checks

All return `bool`: `is_null` &nbsp; `is_number` &nbsp; `is_string` &nbsp; `is_bool` &nbsp; `is_array` &nbsp; `is_struct` &nbsp; `is_function` &nbsp; `is_pointer`

### Misc

::fn assert(cond [, msg])
Throws if `cond` is falsy.

::fn error(msg)
Unconditionally throws `msg`.

::fn range(start, stop [, step]) → array

```lambda
range(0, 5);      // [0, 1, 2, 3, 4]
range(0, 10, 2);  // [0, 2, 4, 6, 8]
```

::fn zip(arr_a, arr_b) → array of [a,b] pairs

```lambda
zip([1,2,3], ["a","b","c"]);
// [[1,"a"], [2,"b"], [3,"c"]]
```
