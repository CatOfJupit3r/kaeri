# useHotkeyRecorder API

Captures shortcuts dynamically for settings UI.

---

## Basic Usage

```tsx
const { startRecording, hotkey } = useHotkeyRecorder()

<button onClick={startRecording}>
  Record Shortcut
</button>
```

---

## Example Output

```
Mod+Shift+K
```

Store in:

* localStorage
* database
* user profile settings
