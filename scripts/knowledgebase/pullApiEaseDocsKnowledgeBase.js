#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ApiEaseDocsKnowledgeBasePullService } from '../../src/knowledgebase/ApiEaseDocsKnowledgeBasePullService.js';

async function runPullApiEaseDocsKnowledgeBase({
  argv = process.argv.slice(2),
  stdout = process.stdout,
  stderr = process.stderr,
  apiEaseDocsKnowledgeBasePullService = new ApiEaseDocsKnowledgeBasePullService(),
} = {}) {
  const check = argv.includes('--check');

  try {
    const result = await apiEaseDocsKnowledgeBasePullService.pullApiEaseDocsKnowledgeBase({ check });
    stdout.write(`${resolveSuccessMessage({ check, targetPath: result.targetPath })}\n`);
    return 0;
  } catch (error) {
    stderr.write(`${error.message}\n`);
    return 1;
  }
}

function shouldRunDirectly() {
  if (!process.argv[1]) {
    return false;
  }

  return path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

function resolveSuccessMessage({ check, targetPath }) {
  if (check) {
    return `Knowledge base target is current: ${targetPath}`;
  }

  return `Pulled knowledge base to: ${targetPath}`;
}

if (shouldRunDirectly()) {
  process.exitCode = await runPullApiEaseDocsKnowledgeBase();
}

export { runPullApiEaseDocsKnowledgeBase };
