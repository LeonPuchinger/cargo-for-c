function print_help() {
  const myString = `
    cargo-for-c help:
    run: cargo-for-c <command> [options]

    commands:
    - TBD
`;

    console.log(myString);
}

/**
 * Sets up cargo-for-c in an existing directory
 */
function init() {
    try {
        Deno.mkdirSync(".cargo-for-c/include", {recursive: true});
        Deno.mkdirSync("src");
        Deno.symlinkSync("src", ".cargo-for-c/include/crate-root", {type: "dir"});
    } catch (error) {
        if (!(error instanceof Deno.errors.AlreadyExists)) {
            throw error;
        }
    }
}

function handle_cli() {
    const args = Deno.args;
    if (args.length < 1) {
        print_help();
        Deno.exit(1);
    }
    switch (args[0]) {
        case "init":
            return init();
        default:
            return print_help();
    }
}

handle_cli();
