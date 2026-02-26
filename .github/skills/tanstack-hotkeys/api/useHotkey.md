# useHotkey API

Registers a keyboard shortcut.

---

## Basic Example

```tsx
import { useHotkey } from '@tanstack/react-hotkeys'

useHotkey('Mod+S', () => {
  saveDocument()
})
```

---

## Prevent Default Browser Action

```tsx
useHotkey('Mod+P', openPalette, {
  preventDefault: true
})
```

---

## Enable Inside Inputs

```tsx
useHotkey('Enter', submitForm, {
  enableOnFormTags: true
})
```

---

## Disable Based on State

```tsx
useHotkey('Escape', closeModal, {
  enabled: isModalOpen
})
```
