# `@prism/cli`

The Prism CLI provides a unified command-line interface for working across the entire Prism workspace.  
It streamlines development tasks, scaffolds new modules, and enables generative-agent workflows by exposing a stable surface for automation.

The CLI is designed to be lightweight, predictable, and tightly aligned with Prism’s blueprint-driven architecture.

---

## 🎯 Goals

- Speed up development inside the monorepo  
- Provide consistent tooling for pipelines, adapters, UI components, and workspace utilities  
- Integrate with blueprints to generate strongly-typed, consistent scaffolds  
- Offer a reliable automation surface for human and agent workflows  
- Reduce boilerplate and eliminate repetitive setup across packages

The CLI is intentionally minimal — it does not bundle heavy dependencies or runtime logic.  
Instead, it focuses on providing ergonomic commands and deferring functionality to other packages when appropriate.

---

## 📦 Capabilities

The CLI typically supports commands such as:

### **Scaffolding**
Generate new elements that follow Prism conventions:
- pipelines  
- adapters  
- evaluation modules  
- UI components (via `ui-core`)  
- blueprint stubs  

All scaffolds are derived from `@prism/blueprints` to maintain consistency.

---

### **Workspace Utilities**
High-level utilities for maintaining the monorepo:

- validating blueprint alignment  
- checking dependency consistency  
- regenerating derived code  
- cleaning or resetting workspace output  
- type-checking or linting wrappers  

---

### **Developer Workflow Enhancements**

The CLI may wrap or automate tasks like:

- spinning up example environments  
- creating development sandboxes  
- running sample pipelines  
- introspecting adapter capabilities  
- previewing UI tokens or component contracts  

Everything is optional and additive; the CLI should empower developers, not lock them into strict flows.

---

## 🧠 Philosophy

The CLI follows a few core principles:

### **Minimal surface area**
It only exposes commands that add real value and avoids becoming an all-purpose task runner.

### **Blueprint-aligned**
Any generated code or scaffolding must reflect the canonical contracts defined in `@prism/blueprints`.

### **Agent-friendly**
The CLI’s structure and help text should be easy for generative agents to understand and use safely.

### **Predictable**
Commands should be idempotent, stable, and transparent in what they generate or modify.

---

## 🔮 Future Directions

Possible future enhancements include:

- blueprint-driven diffing and migration helpers  
- interactive mode with pipeline or UI previews  
- adapter introspection tools  
- automatic test generation  
- project templates for new Prism-based applications  

---

The CLI is the connective tissue of Prism’s development experience — a small but powerful tool that keeps the workspace cohesive, productive, and generative-agent friendly.
