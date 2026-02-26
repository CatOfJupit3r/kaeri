---
name: tanstack-hotkeys
description: Type-safe keyboard shortcut management using TanStack Hotkeys. Supports hotkeys, multi-key sequences, recording, key state tracking, and cross-platform formatting.
---

# TanStack Hotkeys Skill

Use this skill when working with:

- Keyboard shortcut registration
- Command palette triggers
- Multi-key sequences (e.g. Vim navigation)
- Recording shortcuts in user settings UI
- Tracking held keys
- Cross-platform hotkey formatting
- Preventing default browser behavior
- App-wide shortcut systems

---

## 🔑 Cross-Platform Modifier

Always prefer:

```
Mod+S
```

Instead of:

```
Ctrl+S
Cmd+S
```

`Mod` resolves automatically:

| OS        | Resolves to |
| --------- | ----------- |
| macOS     | Meta (⌘)    |
| Win/Linux | Control     |

---

## 📚 API Reference Files

Load these **only when needed** to reduce context usage.

---

### Basic hotkey binding

➡️ Read:

```
api/useHotkey.md
```

When:

- user wants keyboard shortcut
- save shortcut
- command palette open shortcut
- modal close with Escape
- disable default browser shortcut

---

### Multi-Key Sequences

➡️ Read:

```
api/useHotkeySequence.md
```

When:

- Vim-like navigation requested
- "GG", "DIW", etc
- multi-step shortcuts
- GitHub-style navigation hotkeys

---

### User-Configurable Shortcuts UI

➡️ Read:

```
api/useHotkeyRecorder.md
patterns/settings-recorder-ui.md
```

When:

- user wants customizable shortcuts
- settings page for hotkeys
- rebinding keys
- key capture UI

---

### Held Key Detection

➡️ Read:

```
api/keyStateTracking.md
```

When:

- detecting if Shift is currently held
- combo logic
- press-and-hold interactions
- game-like controls
- drag modifiers

---

### Formatting for UI Display

➡️ Read:

```
api/formatting.md
```

When:

- displaying shortcut in tooltip
- command palette labels
- platform-specific rendering
- showing ⌘ vs Ctrl automatically

---

## 🧠 Usage Strategy

| User Request                  | Action                      |
| ----------------------------- | --------------------------- |
| Bind shortcut                 | read `useHotkey.md`         |
| Sequence shortcut             | read `useHotkeySequence.md` |
| Custom shortcut UI            | read recorder docs          |
| Check held keys               | read key tracking           |
| Show shortcut in UI           | read formatting             |
| Scope shortcuts to modal/page | read scoped-hotkeys.md      |

---

## Notes

- Defaults prevent browser behavior automatically
- Hotkeys ignored in input fields unless overridden
- Supports strings or config objects
- Sequences support timeout config
