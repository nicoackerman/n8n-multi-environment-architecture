const fs = require('fs');
const path = require('path');

const WORKFLOWS_DIR = 'workflows';
const CREDENTIAL_MAPPINGS_ENV = process.env.CREDENTIAL_MAPPINGS;

if (!CREDENTIAL_MAPPINGS_ENV) {
  console.log('No CREDENTIAL_MAPPINGS environment variable found. Skipping credential replacement.');
  process.exit(0);
}

let credentialMappings;
try {
  credentialMappings = JSON.parse(CREDENTIAL_MAPPINGS_ENV);
} catch (error) {
  console.error('Error parsing CREDENTIAL_MAPPINGS environment variable:', error);
  process.exit(1);
}

console.log('Loaded credential mappings:', Object.keys(credentialMappings));

function processWorkflowFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const workflow = JSON.parse(content);
    let modified = false;

    if (workflow.nodes) {
      workflow.nodes.forEach(node => {
        if (node.credentials) {
          Object.keys(node.credentials).forEach(credKey => {
            const cred = node.credentials[credKey];
            if (cred.name && credentialMappings[cred.name]) {
              const newId = credentialMappings[cred.name];
              if (cred.id !== newId) {
                console.log(`Replacing credential ID for "${cred.name}" in ${path.basename(filePath)}: ${cred.id} -> ${newId}`);
                cred.id = newId;
                modified = true;
              }
            }
          });
        }
      });
    }

    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(workflow, null, 2));
      console.log(`Updated ${filePath}`);
    } else {
      console.log(`No changes needed for ${filePath}`);
    }

  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

function main() {
  const workflowsPath = path.join(process.cwd(), WORKFLOWS_DIR);
  
  if (!fs.existsSync(workflowsPath)) {
    console.error(`Workflows directory not found at ${workflowsPath}`);
    process.exit(1);
  }

  const files = fs.readdirSync(workflowsPath);
  
  files.forEach(file => {
    if (path.extname(file) === '.json') {
      processWorkflowFile(path.join(workflowsPath, file));
    }
  });
}

main();
