#!/usr/bin/env node

import { buildDaPublicArtifacts } from "./build-da-artifacts.mjs";

buildDaPublicArtifacts().catch((error) => {
  console.error(`[build-da] ${error.stack || error.message}`);
  process.exitCode = 1;
});
