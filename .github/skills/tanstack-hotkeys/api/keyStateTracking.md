# Held Key Tracking

---

## Detect Held Keys

```tsx
const heldKeys = useHeldKeys()

if (heldKeys.includes('Shift')) {
  multiSelect()
}
```

---

## Detect Key Hold

```tsx
const isHoldingSpace = useKeyHold('Space')
```
