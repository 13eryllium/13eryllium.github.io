---
id: wait-statement
title: Wait Statement
nav: Wait Statement
group: Language
---

The `wait` statement defers a block of code to run after a number of seconds.
```lambda
wait 3 once {
    run();
}
// run() is called approximately 3 seconds later.
```

### Syntax
```lambda
wait expr once {
    // body
}
```

`expr` is evaluated immediately and may be any number (decimals allowed). The body is compiled into an anonymous chunk at compile time and executes in the scope that was live when the `wait` ran.

### Host integration

The host **must** call `lambda_env_tick` every Step event for waits to fire:
```gml
// Step event or controller object
lambda_env_tick(env);
```

Without this call, pending waits will never execute.