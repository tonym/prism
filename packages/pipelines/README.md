# @prism/pipelines

`@prism/pipelines` contains Prism’s pipeline engine and the collection of reusable, composable pipeline modules that define how data and actions flow through the system.

Pipelines are the **core execution units** of Prism.
They encapsulate structured, multi-step logic built from blueprint-defined contracts and adapter-powered integrations.

This package focuses on orchestrating transformations, decisions, model calls, validations, and data flows in a predictable and testable way.

---

## 🎯 Purpose

Pipelines exist to turn inputs into outcomes through a controlled, deterministic series of steps.

They provide:

### **1. Composable execution blocks**
Each pipeline is built from small, purpose-specific units called *stages* or *steps*, such as:

- input validation
- enrichment
- LLM inference
- embedding lookup
- retrieval
- decision-making
- message formatting
- output shaping

All stages follow blueprints for consistency.

---

### **2. A clean separation of concerns**
Pipelines isolate:

- business or workflow logic
- the shape of data moving through the system
- step composition
- adapter interactions

This keeps application logic clean and reusable while allowing adapters to handle the complexity of external APIs.

---

### **3. Deterministic I/O**
Each pipeline provides:

- well-defined inputs
- predictable state transitions
- guaranteed output shapes (as defined by `@prism/blueprints`)
- controlled error surfaces

This makes pipelines safe for generative agents to create, modify, or extend.

---

### **4. Reusability across the workspace**
Pipelines power:

- interactive chat flows
- AI-assisted application features
- backend utility processes
- data cleaning or enrichment tasks
- UI integration workflows
- evaluation and testing scenarios

They are reusable building blocks that embody system logic in a consistent format.

---

## 🧩 What pipelines contain

- **Pipeline definitions**
  Describing the orchestration flow based on blueprints.

- **Reusable step modules**
  Common logic units used by many pipeline types.

- **Pipeline registries**
  Optional: a mapping or index of available pipelines for tooling or UI.

- **Error and result types**
  Blueprint-aligned representations of normal and exceptional outcomes.

- **Execution utilities**
  Helpers for running pipelines with adapters, custom contexts, fixtures, or test mocks.

Pipelines never embed provider-specific code — all external communication is delegated to `@prism/adapters`.

---

## 🧠 Design Principles

### **Blueprint-first**
A pipeline must follow the structure defined in `@prism/blueprints`.

### **Composable**
Small steps combine to form larger flows.

### **Deterministic**
Outputs and behavior should be predictable and testable.

### **Adapter-isolated**
No SDKs, HTTP clients, or vendor-specific logic directly inside pipelines.

### **Agent-safe**
Pipelines must be easy for generative agents to inspect and extend.

---

## 🔮 Future Directions

Possible extensions include:

- pipeline introspection tools
- visualization for debugging or documentation
- automatic scaffold generation from blueprints
- pipeline-level eval generation
- caching and memoization primitives
- plugin-based pipeline extension system

---

## Summary

`@prism/pipelines` is where Prism’s *logic* lives.

Pipelines:

- orchestrate multi-step processes
- enforce contract-driven structure
- coordinate adapters and data flows
- enable safe generative and human-driven development

They are the backbone of how Prism turns inputs into meaningful results.
