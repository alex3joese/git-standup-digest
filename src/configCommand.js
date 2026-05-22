import { loadConfig, saveConfig, resetConfig, getConfigPath, DEFAULTS } from './config.js';

export function handleConfigCommand(subcommand, args) {
  switch (subcommand) {
    case 'show':
      return showConfig();
    case 'set':
      return setConfigValue(args);
    case 'reset':
      return resetConfigCommand();
    case 'path':
      return showConfigPath();
    default:
      return showConfigHelp();
  }
}

function showConfig() {
  const config = loadConfig();
  console.log('Current configuration:');
  console.log(JSON.stringify(config, null, 2));
}

function setConfigValue(args) {
  if (!args.key || args.value === undefined) {
    console.error('Usage: git-standup-digest config set --key <key> --value <value>');
    process.exit(1);
  }

  const { key, value } = args;

  if (!(key in DEFAULTS)) {
    console.error(`Unknown config key: "${key}". Valid keys: ${Object.keys(DEFAULTS).join(', ')}`);
    process.exit(1);
  }

  const parsed = tryParseValue(value);
  saveConfig({ [key]: parsed });
  console.log(`Set ${key} = ${JSON.stringify(parsed)}`);
}

function resetConfigCommand() {
  resetConfig();
  console.log('Configuration reset to defaults.');
}

function showConfigPath() {
  console.log(getConfigPath());
}

function showConfigHelp() {
  console.log('Usage: git-standup-digest config <subcommand>');
  console.log('  show    Print current config');
  console.log('  set     Set a config value (--key, --value)');
  console.log('  reset   Reset config to defaults');
  console.log('  path    Show config file path');
}

function tryParseValue(value) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
