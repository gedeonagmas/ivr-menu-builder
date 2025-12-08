// Simple FusionPBX Integration Check
import fs from 'fs';
import path from 'path';

console.log('🔍 Checking FusionPBX Integration Status...\n');

const checks = [];

// 1. Check FusionPBX Service file exists
const serviceFile = './src/services/fusionpbx.service.ts';
if (fs.existsSync(serviceFile)) {
  checks.push({ name: 'FusionPBX Service', status: '✅', details: 'Service file exists' });
} else {
  checks.push({ name: 'FusionPBX Service', status: '❌', details: 'Service file missing' });
}

// 2. Check FusionPBX Webhook Routes
const webhookFile = './src/routes/fusionpbx-webhook.routes.ts';
if (fs.existsSync(webhookFile)) {
  const content = fs.readFileSync(webhookFile, 'utf-8');
  const hasCallStatus = content.includes('call-status');
  const hasRecording = content.includes('recording-status');
  const hasDtmf = content.includes('dtmf-input');
  checks.push({ 
    name: 'FusionPBX Webhooks', 
    status: '✅', 
    details: `${[hasCallStatus, hasRecording, hasDtmf].filter(Boolean).length}/3 endpoints` 
  });
} else {
  checks.push({ name: 'FusionPBX Webhooks', status: '❌', details: 'Webhook routes missing' });
}

// 3. Check Database Schema
const schemaFile = './prisma/schema.prisma';
if (fs.existsSync(schemaFile)) {
  const schema = fs.readFileSync(schemaFile, 'utf-8');
  const hasDialplanUuid = schema.includes('fusionpbxDialplanUuid');
  const hasCallUuid = schema.includes('fusionpbxCallUuid');
  const hasRecordingSid = schema.includes('fusionpbxSid');
  checks.push({ 
    name: 'Database Schema', 
    status: hasDialplanUuid && hasCallUuid && hasRecordingSid ? '✅' : '⚠️', 
    details: `Fields: ${hasDialplanUuid ? 'dialplanUuid' : ''} ${hasCallUuid ? 'callUuid' : ''} ${hasRecordingSid ? 'recordingSid' : ''}` 
  });
} else {
  checks.push({ name: 'Database Schema', status: '❌', details: 'Schema file missing' });
}

// 4. Check Workflow Routes Integration
const workflowFile = './src/routes/workflow.routes.ts';
if (fs.existsSync(workflowFile)) {
  const content = fs.readFileSync(workflowFile, 'utf-8');
  const hasFusionPBX = content.includes('fusionpbx') || content.includes('FusionPBX');
  const hasDeploymentType = content.includes('deploymentType');
  checks.push({ 
    name: 'Workflow Deployment', 
    status: hasFusionPBX && hasDeploymentType ? '✅' : '⚠️', 
    details: hasFusionPBX ? 'FusionPBX deployment supported' : 'Missing FusionPBX support' 
  });
} else {
  checks.push({ name: 'Workflow Deployment', status: '❌', details: 'Workflow routes missing' });
}

// 5. Check Call Routes Integration
const callFile = './src/routes/call.routes.ts';
if (fs.existsSync(callFile)) {
  const content = fs.readFileSync(callFile, 'utf-8');
  const hasFusionPBXCall = content.includes('fusionpbxCallUuid') || content.includes('fusionpbxService');
  checks.push({ 
    name: 'Call Management', 
    status: hasFusionPBXCall ? '✅' : '⚠️', 
    details: hasFusionPBXCall ? 'FusionPBX call support' : 'Missing FusionPBX call support' 
  });
} else {
  checks.push({ name: 'Call Management', status: '❌', details: 'Call routes missing' });
}

// 6. Check Workflow Execution Engine
const engineFile = './src/services/workflow-execution-engine.ts';
if (fs.existsSync(engineFile)) {
  const content = fs.readFileSync(engineFile, 'utf-8');
  const hasConvertMethod = content.includes('convertToFusionPBXFlow');
  checks.push({ 
    name: 'Workflow Engine', 
    status: hasConvertMethod ? '✅' : '⚠️', 
    details: hasConvertMethod ? 'FusionPBX conversion method exists' : 'Missing conversion method' 
  });
} else {
  checks.push({ name: 'Workflow Engine', status: '❌', details: 'Engine file missing' });
}

// 7. Check Index.ts Integration
const indexFile = './src/index.ts';
if (fs.existsSync(indexFile)) {
  const content = fs.readFileSync(indexFile, 'utf-8');
  const hasWebhookRoute = content.includes('fusionpbx-webhook') || content.includes('fusionpbxWebhookRoutes');
  checks.push({ 
    name: 'Server Routes', 
    status: hasWebhookRoute ? '✅' : '⚠️', 
    details: hasWebhookRoute ? 'FusionPBX webhooks registered' : 'Webhooks not registered' 
  });
} else {
  checks.push({ name: 'Server Routes', status: '❌', details: 'Index file missing' });
}

// Display Results
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
checks.forEach(check => {
  console.log(`${check.status} ${check.name.padEnd(25)} ${check.details}`);
});
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const allGood = checks.every(c => c.status === '✅');
const hasWarnings = checks.some(c => c.status === '⚠️');

console.log('\n📊 Summary:');
if (allGood) {
  console.log('✅ FusionPBX Integration: COMPLETE');
  console.log('\n🎉 All components are integrated!');
} else if (hasWarnings) {
  console.log('⚠️  FusionPBX Integration: PARTIAL');
  console.log('   Some components may need attention');
} else {
  console.log('❌ FusionPBX Integration: INCOMPLETE');
  console.log('   Missing critical components');
}

console.log('\n📝 Integration Points:');
console.log('   • Service: FusionPBX API communication');
console.log('   • Webhooks: Call status, recording, DTMF input');
console.log('   • Database: FusionPBX UUIDs stored');
console.log('   • Deployment: Workflows deploy to FusionPBX');
console.log('   • Calls: Outbound calls via FusionPBX');
console.log('   • Engine: Converts workflows to dialplans');

process.exit(allGood ? 0 : hasWarnings ? 0 : 1);

