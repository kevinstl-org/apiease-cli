class VersionCommand {
  constructor({
    cliVersion,
    stdout = process.stdout,
  } = {}) {
    this.cliVersion = cliVersion;
    this.stdout = stdout;
  }

  async run() {
    this.stdout.write(`${this.cliVersion}\n`);
    return 0;
  }
}

export { VersionCommand };
