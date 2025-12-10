const fs = require('fs');
const path = require('path');

// Mock data
const mockExistingWorkflows = [
  { name: 'My Workflow [DEV]', id: 'existing-dev-id' }
];

const mockLocalWorkflow = {
  name: 'My Workflow',
  id: 'local-id',
  nodes: [],
  connections: {}
};

// Logic to test
function testLogic() {
  console.log('Testing Workflow Transformation Logic...');

  // 1. Simulate fetching existing workflows
  const devWorkflowMap = new Map();
  mockExistingWorkflows.forEach(w => devWorkflowMap.set(w.name, w.id));
  console.log('Mocked Existing Workflows:', mockExistingWorkflows);

  // 2. Simulate processing local file
  const workflow = { ...mockLocalWorkflow }; // Deep copy if needed, shallow is fine here
  console.log('Original Local Workflow:', workflow.name, workflow.id);

  // Rename
  const originalName = workflow.name;
  const devName = `${originalName} [DEV]`;
  workflow.name = devName;

  // Handle ID
  if (devWorkflowMap.has(devName)) {
    const existingId = devWorkflowMap.get(devName);
    workflow.id = existingId;
    console.log(`[MATCH] Found existing ID. New ID: ${workflow.id}`);
    if (workflow.id === 'existing-dev-id') {
      console.log('✅ PASS: ID updated correctly to existing DEV ID.');
    } else {
      console.error('❌ FAIL: ID mismatch.');
    }
  } else {
    delete workflow.id;
    console.log('[NO MATCH] No existing ID found. ID removed.');
  }

  // Test Case 2: New Workflow (no match)
  console.log('\nTesting New Workflow Logic...');
  const newWorkflow = { name: 'New Feature', id: 'new-id' };
  const newDevName = `${newWorkflow.name} [DEV]`;
  newWorkflow.name = newDevName;
  
  if (devWorkflowMap.has(newDevName)) {
     // Should not happen
     console.error('❌ FAIL: False positive match.');
  } else {
     delete newWorkflow.id;
     console.log(`[NO MATCH] ID removed. Current ID: ${newWorkflow.id}`);
     if (newWorkflow.id === undefined) {
       console.log('✅ PASS: ID removed correctly for new workflow.');
     } else {
       console.error('❌ FAIL: ID not removed.');
     }
  }
}

testLogic();
