import { useHotkey } from '@tanstack/react-hotkeys';
import { useState } from 'react';
import { LuKeyboard } from 'react-icons/lu';

import { Button } from '@~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@~/components/ui/dialog';
import { Kbd, KbdGroup } from '@~/components/ui/kbd';

// eslint-disable-next-line @typescript-eslint/naming-convention -- Platform detection constant
const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

const MOD_KEY = IS_MAC ? '⌘' : 'Ctrl';

interface iShortcut {
  keys: string[];
  description: string;
  context?: string;
}

const SHORTCUTS: iShortcut[] = [
  { keys: [MOD_KEY, 'N'], description: 'Create new project', context: 'Dashboard' },
  { keys: [MOD_KEY, 'E'], description: 'Export script', context: 'Script Editor' },
  { keys: [MOD_KEY, ','], description: 'Open settings', context: 'Script Editor' },
  { keys: [MOD_KEY, '/'], description: 'Show keyboard shortcuts', context: 'Global' },
];

function ShortcutRow({ shortcut }: { shortcut: iShortcut }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex flex-col">
        <span className="text-sm font-medium">{shortcut.description}</span>
        {shortcut.context ? <span className="text-xs text-muted-foreground">{shortcut.context}</span> : null}
      </div>
      <KbdGroup>
        {shortcut.keys.map((key, index) => (
          <span key={key} className="flex items-center gap-1">
            {index > 0 ? <span className="text-muted-foreground">+</span> : null}
            <Kbd>{key}</Kbd>
          </span>
        ))}
      </KbdGroup>
    </div>
  );
}

export function KeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);

  // Global shortcut to open the modal (Mod+/)
  useHotkey('Mod+/', () => setIsOpen(true), { preventDefault: true });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" tooltip="Keyboard shortcuts">
          <LuKeyboard className="size-4" aria-hidden="true" />
          <span className="sr-only">Keyboard shortcuts</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>Quick actions to help you work faster.</DialogDescription>
        </DialogHeader>
        <div className="divide-y divide-border">
          {SHORTCUTS.map((shortcut) => (
            <ShortcutRow key={shortcut.description} shortcut={shortcut} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
