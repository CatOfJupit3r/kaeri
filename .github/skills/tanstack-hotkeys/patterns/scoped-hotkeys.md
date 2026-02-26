# Scoped Hotkeys Pattern

Use when shortcuts should only work in a specific UI context.

---

## Modal Example

```tsx
useHotkey('Escape', closeModal, {
  enabled: isModalOpen
})
```

---

## Page-Specific Shortcut

```tsx
useHotkey('Mod+K', openSearch, {
  enabled: pathname === '/dashboard'
})
```

---

## Temporarily Disable Shortcut

```tsx
useHotkey('Delete', removeItem, {
  enabled: selectedItem != null
})
```

---

Useful for:

* dialogs
* editors
* route specific shortcuts
* drag/drop interactions
