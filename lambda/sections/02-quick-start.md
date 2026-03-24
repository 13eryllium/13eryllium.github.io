---
id: quick-start
title: Quick Start
nav: Quick Start
group: Getting Started
---

Set up Lambda running in your project in minutes.

### 1. Create an environment

```gml
var env = lambda_env();
lambda_register_stdlib(env);
```

### 2. Expose your game to mod scripts

```gml
// Expose a function
lambda_register_function(env, "spawn", function(layer, instance) {
    instance_create_layer(layer, instance, "Instances", obj_enemy);
});

// Expose a static constant
lambda_register_constant(env, "TILE_SIZE", 32);

// Expose a live game value (re-read on every access)
lambda_register_dynamic_constant(env, "player_x", function() {
    return obj_player.x;
});
```

### 3. Run a script

```gml
// From a .lam file bundled in Included Files
lambda_run_file(env, "mod.lam");

// Or from a string
lambda_run(env, "print($\"player is at {player_x}\");");
```

### 4. Call Lambda functions from GML

```gml
// Grab as a reusable GML callable
var on_update = lambda_grab_func(env, "on_update");
on_update(delta_time);

// Or one-shot call by name
lambda_call(env, "on_hit", other.id, damage);
```

### 5. Clean up

```gml
lambda_env_destroy(env);
```
