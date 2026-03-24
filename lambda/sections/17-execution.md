---
id: execution
title: Execution
nav: Execution
group: Host API
---

::fn lambda_run(env, source_string) → value
Compiles and runs a Lambda source string. Returns the last evaluated value.

::fn lambda_run_file(env, path) → value
Loads and runs a `.lam` file.

::fn lambda_precompile(env, source_string) → chunk
Compiles a source string into a reusable chunk. Faster than re-parsing the same script repeatedly.

::fn lambda_chunk_run(env, chunk) → value
Executes a pre-compiled chunk.

```gml
var chunk = lambda_precompile(env, "player_x + 10");
// Call every frame cheaply:
var result = lambda_chunk_run(env, chunk);
```

::fn lambda_grab_func(env, name) → GML callable
Returns a Lambda-defined function as a native GML callable. Use this to call into Lambda from your game loop without string lookups each time.

```gml
var on_update = lambda_grab_func(env, "on_update");
// In your Step event:
on_update(delta_time);
```

::fn lambda_call(env, name, arg0, arg1, ...) → value
Calls a Lambda function by name with arguments. Convenient for one-off calls.

```gml
lambda_call(env, "on_hit", other.id, damage);
```
