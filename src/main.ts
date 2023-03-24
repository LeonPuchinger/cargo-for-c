function print_help() {
  const myString = `
    cargo-for-c help:
    run: cargo-for-c <command> [options]

    commands:
    - TBD
`;

    console.log(myString);
}

function handle_cli() {
    const args = Deno.args;
    if (args.length < 1) {
        print_help();
        Deno.exit(1);
    }
}

handle_cli();
