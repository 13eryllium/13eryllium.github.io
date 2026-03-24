---
id: lambda-debug
title: LAMBDA_DEBUG
nav: LAMBDA_DEBUG
group: Language
---

The `LAMBDA_DEBUG` macro in `lambda.gml` controls the verbosity of runtime and compile-time error messages. It defaults to `false`.
```gml
#macro LAMBDA_DEBUG false
```

`false`: Short, production-friendly error messages.
`true`: Extended context added at every pipeline stage.

When enabled, each stage enriches its errors as follows:

- **Lexer** — character ordinal value
- **Parser** — token index; got-value in all `expect`/`unexpected` errors
- **Compiler** — chunk name in every thrown message
- **VM** — type and value of offending operands; `ip` and chunk name for unknown opcodes

Set to `true` during development and `false` before shipping.