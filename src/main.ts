import { join } from "https://deno.land/std/path/mod.ts";

function print_help() {
  const myString = `
    cargo-for-c help:
    run: cargo-for-c <command> [options]

    commands:
    - init: create new cargo instance in the CWD
    - new <name>: create new cargo instance in the dir called <name>
    - build: create executable from project in target/
`;

    console.log(myString);
}

/**
 * Sets up cargo-for-c in an existing directory
 * 
 * @param init_dir The directory where the init should take place relative to the CWD
 */
function init_cargo_dir(init_dir = "") {
    const cwd = Deno.cwd();
    init_dir = join(cwd, init_dir);
    const cargo_dir = join(init_dir, ".cargo-for-c");
    try {
        Deno.mkdirSync(
            join(cargo_dir, "include"),
            {recursive: true},
        );
        Deno.mkdirSync(join(init_dir, "target"));
        Deno.mkdirSync(join(init_dir, "src"));
        Deno.symlinkSync(
            join(init_dir, "src"),
            join(cargo_dir, "include/crate-root"),
            {type: "dir"},
        );
    } catch (error) {
        if (!(error instanceof Deno.errors.AlreadyExists)) {
            throw error;
        }
    }
}

/**
 * Create a new directory and setup cargo-for-c within
 * 
 * @param new_dir_name The name for the new directory
 */
function new_cargo_dir(new_dir_name: string) {
    try {
        Deno.mkdirSync(new_dir_name);
    } catch (error) {
        if (!(error instanceof Deno.errors.AlreadyExists)) {
            throw error;
        }
    }
    init_cargo_dir(new_dir_name);
}

/**
 * Checks whether the CWD is a cargo-for-c instance
 */
function is_cargo_instance(): boolean {
    const cwd = Deno.cwd();
    for (const dirEntry of Deno.readDirSync(cwd)) {
        if (dirEntry.isDirectory && dirEntry.name == ".cargo-for-c") {
            return true;
        }
    }
    return false;
}

/**
 * Panics if the CWD is not a cargo-for-c instance
 */
function assert_is_cargo_instance() {
    if (!is_cargo_instance()) {
        console.log("ERROR: could not find cargo environment in current working directory");
        Deno.exit(1);
    }
}

/**
 * Build executable from cargo project in CWD
 */
function build_project(debug = true) {
    assert_is_cargo_instance();
    const cwd = Deno.cwd();
    const out_dir = `target/${debug ? "debug" : "release"}`;
    Deno.mkdirSync(out_dir, {recursive: true});
    const project_name = "output";
    Deno.run({cmd: [
        "cc",
        `-I${join(cwd, ".cargo-for-c/include")}`,
        "-o",
        join(out_dir, project_name),
        "src/main.c",
        debug ? "-g" : "",
    ]});
}

/**
 * Handle command line parameters and trigger the appropriate functions
 */
function handle_cli() {
    const args = Deno.args;
    if (args.length < 1) {
        print_help();
        Deno.exit(1);
    }
    switch (args[0]) {
        case "init":
            return init_cargo_dir();
        case "new":
            if (args.length != 2) {
                break;
            }
            return new_cargo_dir(args[1]);
        case "build":
            return build_project();
    }
    print_help();
}

handle_cli();
