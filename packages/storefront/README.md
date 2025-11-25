# `@prism/storefront`

The **Storefront** is the interactive application layer of Prism — the place where pipelines, adapters, blueprints, and evals come together into a cohesive, human-facing experience. It serves as the **hub** in Prism’s hub-and-spoke architecture.

## 🚀 Purpose

The Storefront provides:

- A unified interface for experimenting with pipelines  
- A playground for composing or inspecting agents  
- UI surfaces for testing adapters and external integrations  
- Tooling for validating blueprint-driven workflows  
- A reference implementation for anyone embedding Prism in their own stack  

It is the “front door” to the entire system.

## 🧩 How It Fits Into Prism

- **Blueprints** define the shapes and expectations of every pipeline and agent.  
- **Adapters** implement external integrations behind clean, deterministic interfaces.  
- **Pipelines** define composable, blueprint-aligned flows.  
- **Evals** validate robustness and behavior.

The **Storefront** stitches these pieces together in a highly flexible environment.

## 🔧 Implementation Notes

- Intended to host UI components, demos, tools, dashboards, and agent UX.  
- Designed for rapid experimentation, not heavy production hardening (though it can grow in that direction).
- May include:
  - Angular or framework-specific UI modules  
  - Agent play areas  
  - Visualization tools (graphs, timelines, traces)  
  - Controls for running pipelines step-by-step  

## 🗺️ Vision

Storefront is the place where humans interact with Prism — not just a UI, but a **workspace for building, iterating, and understanding AI workflows**.
