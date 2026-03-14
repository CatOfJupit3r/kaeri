import { useCallback, useMemo, useState } from 'react';
import { LuPause, LuPlay, LuRotateCcw, LuUser, LuUsers } from 'react-icons/lu';

import { Badge } from '@~/components/ui/badge';
import { Button } from '@~/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@~/components/ui/dialog';
import { Input } from '@~/components/ui/input';
import { ScrollArea } from '@~/components/ui/scroll-area';
import { cn } from '@~/lib/utils';

interface iTableReadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  scriptTitle?: string;
}

interface iDialogueLine {
  type: 'scene-heading' | 'character' | 'dialogue' | 'parenthetical' | 'action' | 'transition';
  text: string;
  character?: string;
}

interface iTipTapNode {
  type: string;
  content?: iTipTapNode[];
  text?: string;
  attrs?: Record<string, unknown>;
}

/**
 * Extract text from a TipTap node
 */
function extractText(node: iTipTapNode): string {
  if (node.text) return node.text;
  if (node.content) {
    return node.content.map(extractText).join('');
  }
  return '';
}

/**
 * Parse TipTap JSON into dialogue lines
 */
function parseScript(content: string): { lines: iDialogueLine[]; characters: string[] } {
  let doc: iTipTapNode;
  try {
    doc = JSON.parse(content) as iTipTapNode;
  } catch {
    return { lines: [], characters: [] };
  }

  const lines: iDialogueLine[] = [];
  const characterSet = new Set<string>();
  let currentCharacter = '';

  function processNode(node: iTipTapNode) {
    const text = extractText(node).trim();
    if (!text) return;

    switch (node.type) {
      case 'scene-heading':
        lines.push({ type: 'scene-heading', text });
        currentCharacter = '';
        break;
      case 'character': {
        const name = text
          .toUpperCase()
          .replaceAll(/\s*\(.*\)$/g, '')
          .trim();
        currentCharacter = name;
        if (name) characterSet.add(name);
        lines.push({ type: 'character', text, character: name });
        break;
      }
      case 'dialogue':
        lines.push({ type: 'dialogue', text, character: currentCharacter || undefined });
        break;
      case 'parenthetical':
        lines.push({ type: 'parenthetical', text, character: currentCharacter || undefined });
        break;
      case 'action':
        lines.push({ type: 'action', text });
        currentCharacter = '';
        break;
      case 'transition':
        lines.push({ type: 'transition', text });
        currentCharacter = '';
        break;
      default:
        break;
    }

    if (node.content) {
      for (const child of node.content) {
        processNode(child);
      }
    }
  }

  if (doc.content) {
    for (const node of doc.content) {
      processNode(node);
    }
  }

  return { lines, characters: Array.from(characterSet).sort((a, b) => a.localeCompare(b)) };
}

/**
 * Default reader colors for assignment
 */
const READER_COLORS = [
  { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', name: 'Blue' },
  { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', name: 'Green' },
  { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', name: 'Amber' },
  { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300', name: 'Rose' },
  { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', name: 'Purple' },
  { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-300', name: 'Cyan' },
];

export function TableReadModal({ open, onOpenChange, content, scriptTitle }: iTableReadModalProps) {
  const [mode, setMode] = useState<'setup' | 'reading'>('setup');
  const [characterAssignments, setCharacterAssignments] = useState<Record<string, string>>({});
  const [readerNames, setReaderNames] = useState<Record<string, string>>({});
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const { lines, characters } = useMemo(() => parseScript(content), [content]);

  // Get unique readers assigned
  const assignedReaders = useMemo(
    () => Array.from(new Set(Object.values(characterAssignments))),
    [characterAssignments],
  );

  const handleAssignReader = (character: string, readerIndex: string) => {
    setCharacterAssignments((prev) => ({
      ...prev,
      [character]: readerIndex,
    }));
  };

  const handleReaderNameChange = (readerIndex: string, name: string) => {
    setReaderNames((prev) => ({ ...prev, [readerIndex]: name }));
  };

  const handleStartReading = () => {
    setMode('reading');
    setCurrentLineIndex(0);
  };

  const handleNextLine = useCallback(() => {
    if (currentLineIndex < lines.length - 1) {
      setCurrentLineIndex((prev) => prev + 1);
    } else {
      setIsPlaying(false);
    }
  }, [currentLineIndex, lines.length]);

  const handlePrevLine = () => {
    if (currentLineIndex > 0) {
      setCurrentLineIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentLineIndex(0);
    setIsPlaying(false);
  };

  const handleBackToSetup = () => {
    setMode('setup');
    setIsPlaying(false);
    setCurrentLineIndex(0);
  };

  const getReaderColor = (readerIndex: string) => {
    const index = Number.parseInt(readerIndex, 10);
    return READER_COLORS[index % READER_COLORS.length];
  };

  const currentLine = lines[currentLineIndex];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LuUsers className="h-5 w-5" />
            Table Read
          </DialogTitle>
          <DialogDescription>
            {scriptTitle ? `${scriptTitle} - ` : ''}
            {mode === 'setup' ? 'Assign characters to readers' : 'Reading in progress'}
          </DialogDescription>
        </DialogHeader>

        {mode === 'setup' && (
          <div className="space-y-4 py-4">
            <div className="text-sm text-muted-foreground">
              Found {characters.length} characters in the script. Assign them to readers:
            </div>

            <ScrollArea className="h-100 pr-4">
              <div className="space-y-3">
                {characters.map((character) => (
                  <div key={character} className="flex items-center gap-3 rounded-md border p-3">
                    <Badge variant="secondary" className="min-w-25">
                      {character}
                    </Badge>
                    <select
                      value={characterAssignments[character] ?? ''}
                      onChange={(e) => handleAssignReader(character, e.target.value)}
                      className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Unassigned</option>
                      {READER_COLORS.map((color) => (
                        <option key={color.name} value={String(READER_COLORS.indexOf(color))}>
                          Reader {READER_COLORS.indexOf(color) + 1} (
                          {readerNames[String(READER_COLORS.indexOf(color))] ?? color.name})
                        </option>
                      ))}
                    </select>
                    {characterAssignments[character] ? (
                      <Input
                        placeholder="Reader name"
                        value={readerNames[characterAssignments[character]] ?? ''}
                        onChange={(e) => handleReaderNameChange(characterAssignments[character], e.target.value)}
                        className="w-28 text-sm"
                      />
                    ) : null}
                  </div>
                ))}

                {characters.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground">No characters found in the script.</div>
                )}
              </div>
            </ScrollArea>

            {assignedReaders.length > 0 && (
              <div className="rounded-md border bg-muted/50 p-3">
                <div className="mb-2 block text-sm font-medium">Active Readers</div>
                <div className="flex flex-wrap gap-2">
                  {assignedReaders.map((readerId) => {
                    const color = getReaderColor(readerId);
                    const name = readerNames[readerId] ?? `Reader ${Number.parseInt(readerId, 10) + 1}`;
                    const assignedChars = characters.filter((c) => characterAssignments[c] === readerId);
                    return (
                      <Badge key={readerId} className={cn(color.bg, color.text)}>
                        <LuUser className="mr-1 h-3 w-3" />
                        {name} ({assignedChars.length})
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleStartReading} disabled={characters.length === 0}>
                Start Reading
              </Button>
            </div>
          </div>
        )}

        {mode === 'reading' && currentLine ? (
          <div className="space-y-4 py-4">
            {/* Progress */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Line {currentLineIndex + 1} of {lines.length}
              </span>
              <Button variant="ghost" size="sm" onClick={handleBackToSetup}>
                Back to Setup
              </Button>
            </div>

            {/* Current Line Display */}
            <div
              className={cn(
                'min-h-50 rounded-lg border p-6 text-center',
                currentLine.character && characterAssignments[currentLine.character]
                  ? getReaderColor(characterAssignments[currentLine.character]).bg
                  : 'bg-muted/30',
              )}
            >
              {currentLine.type === 'scene-heading' && (
                <div className="text-lg font-bold text-muted-foreground uppercase">{currentLine.text}</div>
              )}

              {currentLine.type === 'character' && (
                <div className="space-y-2">
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-base',
                      currentLine.character && characterAssignments[currentLine.character]
                        ? getReaderColor(characterAssignments[currentLine.character]).text
                        : '',
                    )}
                  >
                    {currentLine.character}
                  </Badge>
                  {currentLine.character && characterAssignments[currentLine.character] ? (
                    <div className="text-sm text-muted-foreground">
                      {readerNames[characterAssignments[currentLine.character]] ??
                        `Reader ${Number.parseInt(characterAssignments[currentLine.character], 10) + 1}`}
                    </div>
                  ) : null}
                </div>
              )}

              {currentLine.type === 'dialogue' && (
                <div className="space-y-2">
                  {currentLine.character ? (
                    <Badge
                      variant="outline"
                      className={cn(
                        characterAssignments[currentLine.character]
                          ? getReaderColor(characterAssignments[currentLine.character]).text
                          : '',
                      )}
                    >
                      {currentLine.character}
                    </Badge>
                  ) : null}
                  <div className="text-2xl leading-relaxed">{currentLine.text}</div>
                </div>
              )}

              {currentLine.type === 'parenthetical' && (
                <div className="text-lg text-muted-foreground italic">({currentLine.text})</div>
              )}

              {currentLine.type === 'action' && (
                <div className="text-base text-muted-foreground">{currentLine.text}</div>
              )}

              {currentLine.type === 'transition' && (
                <div className="text-base font-bold text-muted-foreground uppercase">{currentLine.text}</div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" size="icon" onClick={handleReset} title="Reset">
                <LuRotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handlePrevLine} disabled={currentLineIndex === 0}>
                Previous
              </Button>
              <Button
                size="lg"
                onClick={() => (isPlaying ? setIsPlaying(false) : handleNextLine())}
                className="min-w-25"
              >
                {isPlaying ? <LuPause className="mr-2 h-4 w-4" /> : <LuPlay className="mr-2 h-4 w-4" />}
                {isPlaying ? 'Pause' : 'Next'}
              </Button>
              <Button variant="outline" onClick={handleNextLine} disabled={currentLineIndex >= lines.length - 1}>
                Skip
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
