---
id: registration
title: Registration
nav: Registration
group: Host API
---

Registration is how you expose your game's API to Lambda scripts. Only names you explicitly register are accessible - nothing else leaks through.

::fn lambda_register_function(env, name, gml_func)
Registers a GML function under a name callable from Lambda.

```gml
lambda_register_function(env, "damage_player", function(damage) {
    obj_player.hp -= damage;
});
```

::fn lambda_register_constant(env, name, value)
Registers a static constant. The value is read once at registration time.

```gml
lambda_register_constant(env, "MAX_ENEMIES", 50);
```

::fn lambda_register_dynamic_constant(env, name, getter_func)
Registers a dynamic constant backed by a getter. The getter is called every time the name is read in Lambda - ideal for live game state.

```gml
lambda_register_dynamic_constant(env, "enemy_count", function() {
    return instance_number(obj_enemy);
});
```

::fn lambda_register_stdlib(env)
Registers the full Lambda standard library into the environment. Call once after `lambda_env()` unless you want a minimal sandbox.
