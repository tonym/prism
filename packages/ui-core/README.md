# @prism/ui-core

`@prism/ui-core` provides Prism’s foundational UI building blocks — a lightweight, framework-agnostic component library designed for AI-driven interfaces, rapid prototyping, and consistent UX across all Prism applications.

Unlike application-specific UIs, **UI Core defines primitives**, not full products. These primitives are used by Storefront, external integrations, and any agent-generated UI.

---

## ✨ Purpose

UI Core exists to give Prism a **shared visual language** and prevent “UI drift” between packages and projects. It focuses on:

- **Consistent styling tokens** (colors, spacing, typography, motion)
- **Reusable components** (buttons, panels, inputs, layout primitives)
- **Accessible defaults** (keyboard, ARIA roles, contrast guidelines)
- **Low-complexity wrappers** for integrating runtime-generated UI

It is *not* an app framework — it is the layer beneath one.

---

## 🧩 Component Philosophy

UI Core follows these principles:

### **1. Headless-first**
Components expose behavior and structure; styling is optional and pluggable.

### **2. Agent-friendly**
Blueprint-aligned definitions allow generative agents to safely construct UI using a stable contract.

### **3. Minimal dependencies**
No heavy UI frameworks. Components are written in TypeScript and emit framework targets (React, Angular, Web Components) only when needed.

### **4. Deterministic render rules**
Clear, predictable props to ensure pipelines and agents can generate UI without ambiguity.

---

## 🚀 What Lives in UI Core?

- **Styling tokens** (design system)
- **UI primitives** (Button, Text, Card, Panel, Tabs, Modal)
- **Interaction utilities** (focus trap, keyboard navigation helpers)
- **Rendering adapters** shared with Storefront
- **Blueprint → UI mappers** enabling agent-driven UI generation

---

## 🔗 Relationship to Other Packages

- **Storefront** uses UI Core as its base widget set.
- **Blueprints** define the structure agents use; UI Core renders those structures.
- **Adapters** and **Pipelines** may trigger UI changes via Storefront.

UI Core ensures the whole Prism ecosystem speaks a unified UI language.

---

## 📦 Status

UI Core is early-stage and intended to expand as more generative workflows are codified.  
New primitives should follow the same design constraints and remain blueprint-aligned.

