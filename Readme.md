# Cargo for C

A small module/crate system inspired by [cargo](https://github.com/rust-lang/cargo), but for c instead of rust.

## Build

```
deno compile --allow-read --allow-write --allow-run --output bin/cargo-for-c src/main.ts
```

## Usage

### Create a Project

To create a new project with cargo-for-c, use the `new` command:

```
cargo-for-c new my_project
```

This will initiate a new cargo-for-c environment in the directory `my_project`.
The entrypoint for the project can be found in `my_project/src/main.c`.
If you want to create a new environment in an existing directory, use the `init` command:

```
mkdir my_project
cd my_project
cargo-for-c init
```