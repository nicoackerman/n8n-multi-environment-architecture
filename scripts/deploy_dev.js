const fs = require('fs');
const path = require('path');
const https = require('https');

const WORKFLOWS_DIR = 'workflows';
const API_URL = process.env.N8N_API_URL_DEV;
const API_KEY = process.env.N8N_API_KEY_DEV;

if (!API_URL || !API_KEY) {
  console.error('Error: N8N_API_URL_DEV and N8N_API_KEY_DEV must be set.');
  process.exit(1);
}

// Helper to make HTTP requests
function request(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_URL}${endpoint}`);
    const options = {
      method,
      headers: {
        'X-N8N-API-KEY': API_KEY, // Try standard header
        'Authorization': `Bearer ${API_KEY}`, // Try Bearer as well (user script used this)
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(body ? JSON.parse(body) : {});
          } catch (e) {
            resolve(body);
          }
        } else {
          reject(new Error(`Request failed with status ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function main() {
  try {
    // 1. Fetch all existing workflows to find IDs of [DEV] versions
    console.log('Fetching existing workflows...');
    // Note: /workflows endpoint returns a list of workflows (lightweight)
    const existingWorkflows = await request('GET', '/workflows');
    const devWorkflowMap = new Map();
    
    // Map Name -> ID for workflows that end in " [DEV]"
    existingWorkflows.data.forEach(w => {
        devWorkflowMap.set(w.name, w.id);
    });

    // 2. Process local workflow files
    const files = fs.readdirSync(WORKFLOWS_DIR).filter(f => f.endsWith('.json'));
    
    for (const file of files) {
      console.log(`Processing ${file}...`);
      const filePath = path.join(WORKFLOWS_DIR, file);
      const workflow = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      // Rename
      const originalName = workflow.name;
      const devName = `${originalName} [DEV]`;
      workflow.name = devName;

      // Handle ID
      if (devWorkflowMap.has(devName)) {
        const existingId = devWorkflowMap.get(devName);
        console.log(`  Found existing [DEV] workflow ID: ${existingId}. Updating...`);
        workflow.id = existingId;
      } else {
        console.log(`  No existing [DEV] workflow found. Creating new...`);
        delete workflow.id; // Remove ID to force creation
      }

      // 3. Deploy
      // We use the import endpoint or direct create/update
      // If we have an ID, we should probably use PUT /workflows/:id or just POST /workflows/import which handles it?
      // The original script used POST /rest/workflows/import. Let's stick to that if possible, 
      // but standard API is often POST /workflows (create) or PUT /workflows/:id (update).
      // However, /workflows/import is a special endpoint that handles file imports.
      // Let's try to use the standard CRUD endpoints for better control if we are manipulating JSON.
      
      // Actually, let's stick to the user's pattern of /rest/workflows/import if that's what they were using,
      // BUT they might be using the public API. 
      // If N8N_API_URL is the main URL, the API is usually under /api/v1.
      // The user's script used: "$N8N_API_URL_DEV/rest/workflows/import"
      // This suggests they might be using an older API or internal one? 
      // Standard public API is `POST /api/v1/workflows`.
      // Let's assume the user knows their URL structure. 
      // BUT, to be safe and robust with our logic (we need to fetch list first), we should probably use the Public API `/api/v1`.
      // If the user provided URL ends in /webhook or similar, we might need to adjust.
      // Let's assume N8N_API_URL_DEV is the base URL (e.g. https://n8n.example.com).
      
      // Let's try to detect if we should use /api/v1.
      // The user's script had: curl -X POST "$N8N_API_URL_DEV/rest/workflows/import"
      // This looks like the internal API or a specific setup.
      // To implement "List Workflows", we really need the Public API.
      // I will assume standard Public API availability at /api/v1.
      
      // If we use /api/v1/workflows:
      // List: GET /api/v1/workflows
      // Create: POST /api/v1/workflows
      // Update: PUT /api/v1/workflows/:id
      
      // I will update the script to use /api/v1 paths, and I'll update the workflow YAML to ensure the URL is correct.
      // If the user's secret includes /api/v1, we handle it.
      
      let endpoint = '/api/v1/workflows';
      
      // Check if we are updating or creating
      if (workflow.id) {
         // Update
         await request('PUT', `${endpoint}/${workflow.id}`, workflow);
         console.log(`  ✅ Updated ${devName} (${workflow.id})`);
      } else {
         // Create
         const result = await request('POST', endpoint, workflow);
         console.log(`  ✅ Created ${devName} (${result.id})`);
      }
    }

  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

main();
