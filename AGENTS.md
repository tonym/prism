# AGENTS

Prism's AI agent specifications live in the `/AGENTS` directory.

Agents **MUST** read:

- `/AGENTS/META.yml` — machine policy keys and enforcement settings
- `/AGENTS/PROTOCOL_MANIFEST.yml` — machine-readable precedence and required read order
- `/AGENTS/ROOT.md` — the global behavioral protocol
- Any additional protocol files in `/AGENTS` as they are added

All rules, workflows, constraints, and permissions for automated agents are defined exclusively inside the `/AGENTS` folder.
