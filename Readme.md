# Cargo for C

A small module/crate system inspired by [cargo](https://github.com/rust-lang/cargo), but for c instead of rust.
I liked the idea and wanted to try out Deno, so see this as more a half-baked concept.
This is not meant for use in production.

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
#include "crate-root/map/hashmap.h"

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

### Specifying dependencies

Add a Git URL to the `cargo.toml` file to add a dependency.

```
[dependencies]
https://github.com/vurtun/lib.git
```

Run `cargo-for-c fetch` to pull the dependencies

Dependencies can now be included via their path, e.g.:

```
#include "github.com/vurtun/lib.git/json.h"
```

### Adding IDE support

To enable IntelliSense, the include path needs to be updated in the IDE/Language Plugin settings.
For instance, in VSCode, open "C/C++: Edit Configurations (UI)" from the command palette.
In the include path settings, add the following line: `${workspaceFolder}/.cargo-for-c/include`.

## Limitations

- Can only be used with header libraries
- No dynamic linking
- I have only tested this on *nix systems
- Dependencies can only be obtained if they are hosted via git
- Dependencies can not be versioned yet
- Include guards are still required, cargo does not inject them (yet)
