---
id: host-api
title: Host API Overview
nav: Overview
group: Host API
---

The Host API is the GML-side interface - the set of functions you call from your game to create environments, register names, and execute Lambda scripts.

::html
<div class="api-grid">
  <div class="api-card">
    <div class="api-card-label">Environment</div>
    <code>lambda_env()</code>
    <code>lambda_env_destroy(env)</code>
  </div>
  <div class="api-card">
    <div class="api-card-label">Registration</div>
    <code>lambda_register_function(env, name, fn)</code>
    <code>lambda_register_constant(env, name, val)</code>
    <code>lambda_register_dynamic_constant(env, name, getter)</code>
    <code>lambda_register_stdlib(env)</code>
  </div>
  <div class="api-card">
    <div class="api-card-label">Execution</div>
    <code>lambda_run(env, source)</code>
    <code>lambda_run_file(env, path)</code>
    <code>lambda_precompile(env, source)</code>
    <code>lambda_chunk_run(env, chunk)</code>
  </div>
  <div class="api-card">
    <div class="api-card-label">Calling Lambda</div>
    <code>lambda_grab_func(env, name)</code>
    <code>lambda_call(env, name, arg0, ...)</code>
  </div>
</div>
