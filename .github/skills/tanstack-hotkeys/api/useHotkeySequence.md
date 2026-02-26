# useHotkeySequence API

Registers multi-step sequences.

---

## Vim-Style Navigation

```tsx
import { useHotkeySequence } from '@tanstack/react-hotkeys'

useHotkeySequence(['G','G'], scrollToTop)
```

---

## Multi-Key Action

```tsx
useHotkeySequence(['D','I','W'], deleteInnerWord)
```

---

## Custom Timeout

```tsx
useHotkeySequence(['G','H'], goHome, {
  timeout: 1000
})
```
