export function parseCliArgs(argv) {
  const args = {
    flags: {},
    positionals: []
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token) {
      continue;
    }

    if (!token.startsWith('--')) {
      args.positionals.push(token);
      continue;
    }

    const eqIndex = token.indexOf('=');

    if (eqIndex > -1) {
      const key = token.slice(2, eqIndex);
      const value = token.slice(eqIndex + 1);
      args.flags[key] = value;
      continue;
    }

    const key = token.slice(2);
    const nextToken = argv[index + 1];

    if (!nextToken || nextToken.startsWith('--')) {
      args.flags[key] = true;
      continue;
    }

    args.flags[key] = nextToken;
    index += 1;
  }

  return args;
}
