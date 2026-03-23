---
id: environment
title: Environment
nav: Environment
group: Host API
---

An environment is an isolated execution context. Scripts running in separate environments cannot see each other's variables or registered names.

::fn lambda_env() → env struct
Creates and returns a new Lambda environment. Always call `lambda_register_stdlib` after creation unless you want a fully bare sandbox.

::fn lambda_env_destroy(env)
Destroys the environment and frees all associated memory. Call this when the environment is no longer needed - e.g., when a level ends or a mod is unloaded.

```gml
var env = lambda_env();
lambda_register_stdlib(env);
// ... use env ...
lambda_env_destroy(env);
```
