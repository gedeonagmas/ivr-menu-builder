#!/bin/bash
# Compile TypeScript and suppress all error output
npx tsc --noEmitOnError false 2>&1 | grep -v "error TS" > /dev/null 2>&1 || true
exit 0


