# `@prism/evals`

`@prism/evals` provides the evaluation framework for Prism.  
Its purpose is to validate the correctness, consistency, and resilience of pipelines, adapters, and generated artifacts across the monorepo.

Evals act as a quality gate for both human-written implementations and generative-agent-produced code.  
They ensure alignment with blueprints, detect contract drift, and help maintain predictable behavior.

---

## 🎯 Purpose

The eval system exists to answer one core question:

> **Does this pipeline, adapter, or component behave according to its blueprint?**

To do that, evals provide:

### **1. Contract validation**
Using the canonical contract definitions in `@prism/blueprints`, evals can:

- verify that pipeline inputs/outputs match defined structures  
- confirm adapter responses adhere to expected shapes  
- detect missing fields, incorrect types, or invalid variants  
- ensure data transformations respect blueprint invariants  

This is the backbone of structural correctness.

---

### **2. Behavioral testing**

Beyond raw shapes, evals test:

- control flow correctness  
- edge-case handling  
- error surface behavior  
- deterministic outputs when applicable  
- safe fallbacks and graceful degradation  

This ensures Prism modules behave reliably under real-world conditions.

---

### **3. Regression detection**

Evals establish a baseline for expected behavior and detect:

- unintended changes  
- breaking refactors  
- blueprint drift  
- adapter API mismatches  
- incorrectly generated code from agents  

This keeps the ecosystem stable as it evolves.

---

### **4. Scaffolds for generative agents**

Evals also serve as a safety harness for AI-generated modules by:

- testing generated pipelines or adapters against contracts  
- verifying naming, interface alignment, and IO structure  
- confirming that generated code composes safely with existing modules  

This allows safe iterative generation and regeneration throughout the codebase.

---

## 🧩 What evals typically include

- **unit-level behavioral tests** for pipelines and adapters  
- **contract conformance tests** keyed to blueprint definitions  
- **scenario-based evals** for workflows
