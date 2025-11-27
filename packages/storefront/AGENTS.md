# Storefront Agent Entry Point

This file serves as the **entry point** for all agents operating inside the  
`packages/storefront` workspace package.

Agents must load context in the following order:

1. **/AGENTS/*** — global/system-level protocols (highest precedence)  
2. **This folder (`packages/storefront/AGENTS/*`)** — package-local protocol files  

Agents must then explore and load **all markdown files in the package-local protocol directory**:

```
packages/storefront/AGENTS/**
```

(e.g., `ANGULAR.md`, future domain-specific instructions, etc.)
This file contains **no rules of its own**.  
It exists only to establish the storefront agent scope and direct agents  
into the local protocol set.
