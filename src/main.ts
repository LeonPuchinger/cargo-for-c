import { basename, join } from "https://deno.land/std/path/mod.ts";

function print_help() {
  const myString = `
    cargo-for-c help:
    run: cargo-for-c <command> [options]

    commands:
    - init: create new cargo instance in the CWD
    - new <name>: create new cargo instance in the dir called <name>
    - build: create executable from project in target/
        options:
        -r, --release: build a release instead of a debug executable (default)
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
        Deno.writeTextFileSync(join(init_dir, "src", "main.c"), "int main() {\n}");
        Deno.writeTextFileSync(join(init_dir, "cargo.toml"), "[dependencies]\n");
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
 * Return the name of the cargo instance at the CWD
 */
function get_project_name() {
    assert_is_cargo_instance();
    const cwd = Deno.cwd();
    return basename(cwd);
}

/**
 * Build executable from cargo project in CWD
 */
function build_project(debug = true) {
    assert_is_cargo_instance();
    const cwd = Deno.cwd();
    const out_dir = `target/${debug ? "debug" : "release"}`;
    Deno.mkdirSync(out_dir, {recursive: true});
    const project_name = get_project_name();
    const cmd = [
        "cc",
        `-I${join(cwd, ".cargo-for-c/include")}`,
        "-o",
        join(out_dir, project_name),
        "src/main.c",
    ];
    if (debug) {
        cmd.push("-g");
    }
    Deno.run({cmd: cmd});
}

/**
 * Query list of dependencies from the cargo.toml file
 * 
 * @returns list of names/URLs of the dependencies
 */
function resolve_dependencies(): string[] {
    assert_is_cargo_instance();
    const cwd = Deno.cwd();
    let cargo_file_contents = "";
    try {
        cargo_file_contents = Deno.readTextFileSync(join(cwd, "cargo.toml"));
    } catch (error) {
        if (error != Deno.errors.NotFound) {
            throw error;
        }
        console.log("Could not fetch dependencies: no cargo.toml found");
        Deno.exit(1);
    }
    if (cargo_file_contents.startsWith("[dependencies]")) {
        cargo_file_contents = cargo_file_contents.replace("[dependencies]", "");
    } else {
        console.log("Could not fetch dependencies: no [dependencies] section found in cargo.toml");
        Deno.exit(1);
    }
    const dependencies: string[] = [];
    const dependency_line = /(\s*\n\s*(\S+))/g;
    let dependency_match;
    while ((dependency_match = dependency_line.exec(cargo_file_contents)) !== null) {
        // successful match has three capture groups
        if (dependency_match.length != 3) {
            console.log('Error resolving dependency, skipping');
            continue;
        } 
        dependencies.push(dependency_match[2]);
    }
    return dependencies;
}

/**
 * Actually pull the dependencies from their respective remotes
 * 
 * @param dependencies a list of dependency URLs
 */
async function fetch_dependencies(dependencies: string[]) {
    assert_is_cargo_instance();
    const cwd = Deno.cwd();
    for (const dependency of dependencies) {
        // ignore the protocol in the URL of the dependency
        const dependency_name = dependency.replace(/^\w+:\/\//, "");
        const dependency_path = join(cwd, ".cargo-for-c", "include", dependency_name);
        try {
            Deno.statSync(dependency_path);
            continue;
        } catch (error) {
            if (!(error instanceof Deno.errors.NotFound)) {
                throw error;
            }
        }
        console.log(`fetching ${dependency} ...`);
        const git_process = Deno.run({
            cmd: [
                "git",
                "clone",
                dependency,
                dependency_path,
            ],
            stderr: "piped",
        });
        const git_status = await git_process.status();
        if (!git_status.success) {
            console.log(`Error while trying to fetch ${dependency}, skipping...`);
            console.log(`The git process returned with exit code ${git_status.code}`);
            const stderr_output = (new TextDecoder).decode(await git_process.stderrOutput());
            console.log(`The output is shown below (stderr):\n${stderr_output}`);
            continue;
        }
        console.log("done!");
    }
}

/**
 * Handle command line parameters and trigger the appropriate functions
 */
async function handle_cli() {
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
        case "build": {
            const release = ["-r", "--release"].includes(args[1]);
            return build_project(!release);
        }
        case "fetch": {
            const dependencies = resolve_dependencies();
            return await fetch_dependencies(dependencies);
        }
    }
    print_help();
}

await handle_cli();
