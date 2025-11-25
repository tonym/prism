# `@prism/adapters`

Adapters form Prism’s integration boundary with the outside world.  
They encapsulate communication with third-party APIs, SDKs, databases, and services, translating them into clean, deterministic, blueprint-aligned structures.

This keeps Prism’s core pipelines, UI, evals, and agents fully isolated from vendor-specific complexity.

---

## 🚀 Purpose

Adapters serve three core roles in the Prism architecture:

### **1. Normalize external APIs**
Different providers return data in different shapes.  
Adapters translate these into the stable contract shapes defined in `@prism/blueprints`, ensuring:

- consistent data models  
- predictable behavior  
- safe pipeline composition  
- reduced surface area for breakage  

### **2. Encapsulate third-party dependencies**
Vendor SDKs and HTTP clients live *exclusively* inside adapters.  
No other Prisma packages directly depend on external libraries.

This prevents dependency sprawl and preserves a clean architectural boundary.

### **3. Provide deterministic I/O**
Adapters expose simple, predictable functions like:

- `fetchData()`
- `sendMessage()`
- `getEmbedding()`
- `executeAction()`

Internally they may handle:

- retries  
- pagination  
- authentication flows  
- rate limiting  
- response normalization  
- error mapping  

But externally they present a stable and testable interface.

---

## 📐 Relationship to Blueprints

Blueprints define the contract.  
Adapters implement that contract using real providers.

This separation ensures:

- pipelines remain pure  
- tests remain deterministic  
- evals can validate I/O boundaries  
- UI components only receive known shapes  
- upgrading providers becomes predictable  

---

## 📚 Folder Structure


