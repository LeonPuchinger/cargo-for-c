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

### Build the Project

The project can be built from its top-level directory using the `build` command:

```
cd my_project
cargo-for-c build
```

This will create an executable from the project in the `my_project/target/debug` directory.
The executable will have the same name as the containing project directory.

By default, the binary will be built with debugging enabled.
To create a release version, pass the `--release` (or `-r`) flag.

```
cargo-for-c build --release
```

In this case, the binary can be found in `my_project/target/release`.

### Importing modules

Code is structured into modules and crates.
Crates can contain multiple modules which are just c or header files.
When working on the project, modules are imported relative to the create root.

```
#include "crate/map/hashmap.h"

int main() {
    //...
}
```

```
.
├── src
│   ├── main.c
│   └── map
│       └── hashmap.h
```
