const fs = require('node:fs');
const path = require('node:path');
const YAML = require('yaml');

const root = path.resolve(__dirname, '..');
const maestroRoot = path.join(root, 'e2e', 'maestro');

function filesIn(directory, extension) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(target, extension) : entry.name.endsWith(extension) ? [target] : [];
  });
}

function fail(message) {
  throw new Error(`[e2e:validate] ${message}`);
}

const yamlFiles = filesIn(maestroRoot, '.yaml');
if (!yamlFiles.length) fail('No se encontraron flujos Maestro.');

const referencedIds = new Set();
const referencedVariables = new Set();

function inspectNode(node, sourceFile) {
  if (Array.isArray(node)) {
    node.forEach((item) => inspectNode(item, sourceFile));
    return;
  }
  if (!node || typeof node !== 'object') return;
  if (typeof node.id === 'string') referencedIds.add(node.id);
  if (node.runFlow) {
    const flowFile = typeof node.runFlow === 'string' ? node.runFlow : node.runFlow.file;
    if (flowFile && !fs.existsSync(path.resolve(path.dirname(sourceFile), flowFile))) {
      fail(`${path.relative(root, sourceFile)} referencia un subflujo inexistente: ${flowFile}`);
    }
  }
  Object.values(node).forEach((value) => inspectNode(value, sourceFile));
}

for (const yamlFile of yamlFiles) {
  const source = fs.readFileSync(yamlFile, 'utf8');
  const documents = YAML.parseAllDocuments(source);
  const errors = documents.flatMap((document) => document.errors);
  if (errors.length) fail(`${path.relative(root, yamlFile)}: ${errors[0].message}`);

  const isConfig = path.basename(yamlFile) === 'config.yaml';
  if (isConfig && documents.length !== 1) fail('config.yaml debe contener un solo documento.');
  if (!isConfig && documents.length !== 2) fail(`${path.relative(root, yamlFile)} debe tener cabecera y comandos.`);

  const header = documents[0].toJS();
  if (header?.appId !== 'com.techstore.mobile') fail(`${path.relative(root, yamlFile)} usa un appId incorrecto.`);
  if (!isConfig) {
    const commands = documents[1].toJS();
    if (!Array.isArray(commands) || commands.length === 0) fail(`${path.relative(root, yamlFile)} no tiene comandos.`);
    inspectNode(commands, yamlFile);
  }
  for (const match of source.matchAll(/\$\{(E2E_[A-Z_]+)\}/g)) referencedVariables.add(match[1]);
}

const sourceText = filesIn(path.join(root, 'src'), '.tsx')
  .map((file) => fs.readFileSync(file, 'utf8'))
  .join('\n');
const staticIds = new Set([...sourceText.matchAll(/testID="([^"]+)"/g)].map((match) => match[1]));
const dynamicIds = [...sourceText.matchAll(/testID=\{`([^`]+)`\}/g)].map((match) => {
  const placeholders = [];
  const withTokens = match[1].replace(/\$\{[^}]+\}/g, () => `__DYNAMIC_${placeholders.push(1) - 1}__`);
  const escaped = withTokens.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped.replace(/__DYNAMIC_\d+__/g, '.+')}$`);
});
for (const id of referencedIds) {
  if (!staticIds.has(id) && !dynamicIds.some((pattern) => pattern.test(id))) {
    fail(`El selector Maestro '${id}' no corresponde a un testID de la app.`);
  }
}

const documentation = fs.readFileSync(path.resolve(root, '..', 'docs', 'mobile', 'E2E.md'), 'utf8');
for (const variable of referencedVariables) {
  if (!documentation.includes(variable)) fail(`Falta documentar la variable ${variable}.`);
}

console.log(`E2E_OK yaml=${yamlFiles.length} selectors=${referencedIds.size} variables=${referencedVariables.size}`);
