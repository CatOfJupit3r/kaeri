---
name: tanstack-hotkeys-index
type: skill-router
---

# TanStack Hotkeys Semantic Index

This file helps the agent decide which additional documentation
should be loaded for the current task.

Do NOT load all referenced files by default.

Instead:

1. Understand user intent
2. Match it to a capability
3. Load ONLY the suggested file(s)

---

## 🎯 Intent → Documentation Routing

---

### Intent:
User wants to bind a keyboard shortcut

Examples:

- "add hotkey"
- "save on ctrl+s"
- "close modal on escape"
- "open command palette shortcut"
- "register keyboard shortcut"

➡️ Load:

```
api/useHotkey.md
```

---

### Intent:
User wants multi-step shortcut

Examples:

- "GG navigation"
- "vim shortcuts"
- "github navigation"
- "press g then h"
- "sequence hotkey"

➡️ Load:

```
api/useHotkeySequence.md
```

---

### Intent:
User wants customizable user shortcuts

Examples:

- "user can change shortcut"
- "settings page hotkeys"
- "record new shortcut"
- "remap keybind"
- "shortcut preferences UI"

➡️ Load:

```
api/useHotkeyRecorder.md
patterns/settings-recorder-ui.md
```

---

### Intent:
User needs to detect currently held key

Examples:

- "check if shift is pressed"
- "hold space to drag"
- "multi select with shift"
- "key hold interaction"
- "detect keydown state"

➡️ Load:

```
api/keyStateTracking.md
```

---

### Intent:
User wants to show shortcut in UI

Examples:

- "tooltip shortcut"
- "command palette label"
- "show ctrl or cmd automatically"
- "display keybinding"

➡️ Load:

```
api/formatting.md
```

---

### Intent:
Hotkeys must only work in modal / page / context

Examples:

- "disable hotkeys when modal closed"
- "scope shortcut to component"
- "only active on page"
- "modal keyboard navigation"

➡️ Load:

```
patterns/scoped-hotkeys.md
```

---

## 🧠 Routing Rules

| If request includes | Then |
|---------------------|------|
| Ctrl / Cmd / shortcut | useHotkey |
| Vim / GG / sequence | useHotkeySequence |
| Custom shortcut UI | recorder |
| Hold / pressed | key tracking |
| Show shortcut | formatting |
| Modal / page scope | scoped-hotkeys |

---

## ❗ Important

Never explain API without first loading:

- corresponding api file
- or pattern file

Avoid generating:

- raw addEventListener solutions
- non TanStack keyboard libraries
- manual keydown logic

Prefer TanStack Hotkeys usage.
