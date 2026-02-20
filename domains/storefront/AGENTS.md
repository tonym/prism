# Storefront Agent Entry Point

This file serves as the **entry point** for all agents operating inside the  
`domains/storefront` workspace package.

Agents must load context in the following order:

1. **/AGENTS/*** — global/system-level protocols (highest precedence)  
2. **This folder (`domains/storefront/AGENTS/*`)** — package-local protocol files  

Agents must then explore and load **all markdown files in the package-local protocol directory**:

```
domains/storefront/AGENTS/**
```

(e.g., `ANGULAR.md`, future domain-specific instructions, etc.)
This file contains **no rules of its own**.  
It exists only to establish the storefront agent scope and direct agents  
into the local protocol set.
