/**
 * Script breakdown utilities
 * Parses TipTap JSON content to extract screenplay breakdown data
 */

export type IntExtValue = 'INT' | 'EXT' | 'INT/EXT' | '';

export interface iBreakdownScene {
  sceneNumber: number;
  heading: string;
  location: string;
  intExt: IntExtValue;
  timeOfDay: string;
  characters: string[];
  pageStart: number;
  pageEnd: number;
}

export interface iBreakdownLocation {
  name: string;
  sceneCount: number;
  sceneNumbers: number[];
  characters: Set<string>;
}

export interface iBreakdownCharacter {
  name: string;
  sceneCount: number;
  sceneNumbers: number[];
  dialogueCount: number;
}

export interface iBreakdownProp {
  name: string;
  sceneNumbers: number[];
  mentions: number;
}

export interface iScriptBreakdown {
  scenes: iBreakdownScene[];
  locations: Map<string, iBreakdownLocation>;
  characters: Map<string, iBreakdownCharacter>;
  props: Map<string, iBreakdownProp>;
  totalPages: number;
}

interface iTipTapNode {
  type: string;
  content?: iTipTapNode[];
  text?: string;
  attrs?: Record<string, unknown>;
}

/**
 * Extracts text content from a TipTap node
 */
function extractText(node: iTipTapNode): string {
  if (node.text) return node.text;
  if (node.content) {
    return node.content.map(extractText).join('');
  }
  return '';
}

/**
 * Parses a scene heading to extract location and time of day
 * Format: INT./EXT. LOCATION - TIME OF DAY
 */
function parseSceneHeading(heading: string): {
  location: string;
  intExt: IntExtValue;
  timeOfDay: string;
} {
  const normalized = heading.toUpperCase().trim();

  let intExt: IntExtValue = '';
  let rest = normalized;

  // Extract INT/EXT prefix
  if (normalized.startsWith('INT/EXT.') || normalized.startsWith('INT./EXT.')) {
    intExt = 'INT/EXT';
    rest = normalized.replace(/^INT\.?\/?EXT\.\s*/, '');
  } else if (normalized.startsWith('INT.') || normalized.startsWith('INT ')) {
    intExt = 'INT';
    rest = normalized.replace(/^INT\.?\s*/, '');
  } else if (normalized.startsWith('EXT.') || normalized.startsWith('EXT ')) {
    intExt = 'EXT';
    rest = normalized.replace(/^EXT\.?\s*/, '');
  }

  // Split by dash to get location and time of day
  const parts = rest.split(/\s*-\s*/);
  const location = parts[0]?.trim() || rest;
  const timeOfDay = parts[1]?.trim() || '';

  return { location, intExt, timeOfDay };
}

/**
 * Estimates page number based on content position
 * Rough estimate: ~55 lines per page for screenplay format
 */
function estimatePageNumber(lineIndex: number): number {
  const LINES_PER_PAGE = 55;
  return Math.floor(lineIndex / LINES_PER_PAGE) + 1;
}

/**
 * Generates a full script breakdown from TipTap JSON content
 */
export function generateBreakdown(content: string | Record<string, unknown>): iScriptBreakdown {
  let doc: iTipTapNode;
  if (typeof content === 'string') {
    try {
      doc = JSON.parse(content) as iTipTapNode;
    } catch {
      doc = { type: 'doc', content: [] };
    }
  } else {
    doc = content as unknown as iTipTapNode;
  }

  const scenes: iBreakdownScene[] = [];
  const locations = new Map<string, iBreakdownLocation>();
  const characters = new Map<string, iBreakdownCharacter>();
  const props = new Map<string, iBreakdownProp>();

  let currentScene: iBreakdownScene | null = null;
  let sceneNumber = 0;
  let lineIndex = 0;

  function handleSceneHeading(text: string) {
    // Save previous scene's page end
    if (currentScene) {
      currentScene.pageEnd = estimatePageNumber(lineIndex);
    }

    sceneNumber += 1;
    const { location, intExt, timeOfDay } = parseSceneHeading(text);

    currentScene = {
      sceneNumber,
      heading: text,
      location,
      intExt,
      timeOfDay,
      characters: [],
      pageStart: estimatePageNumber(lineIndex),
      pageEnd: estimatePageNumber(lineIndex),
    };
    scenes.push(currentScene);

    // Track location
    const locKey = location.toUpperCase();
    if (locKey) {
      if (!locations.has(locKey)) {
        locations.set(locKey, {
          name: location,
          sceneCount: 0,
          sceneNumbers: [],
          characters: new Set(),
        });
      }
      const loc = locations.get(locKey);
      if (loc) {
        loc.sceneCount += 1;
        loc.sceneNumbers.push(sceneNumber);
      }
    }
  }

  function handleCharacter(text: string) {
    const charName = text
      .toUpperCase()
      .replaceAll(/\s*\(.*\)$/g, '')
      .trim();
    if (charName && currentScene) {
      // Track character in scene
      if (!currentScene.characters.includes(charName)) {
        currentScene.characters.push(charName);
      }

      // Update location's character list
      const locKey = currentScene.location.toUpperCase();
      const loc = locations.get(locKey);
      if (loc) {
        loc.characters.add(charName);
      }

      // Track character
      if (!characters.has(charName)) {
        characters.set(charName, {
          name: charName,
          sceneCount: 0,
          sceneNumbers: [],
          dialogueCount: 0,
        });
      }
      const char = characters.get(charName);
      if (char) {
        char.dialogueCount += 1;
        if (!char.sceneNumbers.includes(currentScene.sceneNumber)) {
          char.sceneNumbers.push(currentScene.sceneNumber);
          char.sceneCount += 1;
        }
      }
    }
  }

  function handleAction(text: string) {
    // Look for prop mentions in action blocks (format: [PROP NAME])
    const propMatches = text.match(/\[([^\]]+)\]/g);
    if (propMatches && currentScene) {
      for (const match of propMatches) {
        const propName = match.slice(1, -1).toUpperCase();
        if (!props.has(propName)) {
          props.set(propName, {
            name: propName,
            sceneNumbers: [],
            mentions: 0,
          });
        }
        const prop = props.get(propName);
        if (prop) {
          prop.mentions += 1;
          if (!prop.sceneNumbers.includes(currentScene.sceneNumber)) {
            prop.sceneNumbers.push(currentScene.sceneNumber);
          }
        }
      }
    }
  }

  function processNode(node: iTipTapNode) {
    const text = extractText(node).trim();

    switch (node.type) {
      case 'scene-heading':
        handleSceneHeading(text);
        break;
      case 'character':
        handleCharacter(text);
        break;
      case 'action':
        handleAction(text);
        break;
      default:
        break;
    }

    // Estimate line count for page calculation
    lineIndex += Math.ceil(text.length / 60) || 1;

    // Process nested content
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

  // Set final scene's page end
  const lastScene = scenes.at(-1);
  if (lastScene) {
    lastScene.pageEnd = estimatePageNumber(lineIndex);
  }

  return {
    scenes,
    locations,
    characters,
    props,
    totalPages: estimatePageNumber(lineIndex),
  };
}

/**
 * Groups scenes by INT/EXT and time of day for shooting schedule
 */
export function groupScenesForShooting(scenes: iBreakdownScene[]): {
  dayInt: iBreakdownScene[];
  dayExt: iBreakdownScene[];
  nightInt: iBreakdownScene[];
  nightExt: iBreakdownScene[];
  other: iBreakdownScene[];
} {
  const dayInt: iBreakdownScene[] = [];
  const dayExt: iBreakdownScene[] = [];
  const nightInt: iBreakdownScene[] = [];
  const nightExt: iBreakdownScene[] = [];
  const other: iBreakdownScene[] = [];

  for (const scene of scenes) {
    const isDay = /DAY|MORNING|AFTERNOON/.test(scene.timeOfDay.toUpperCase());
    const isNight = /NIGHT|EVENING|DUSK|DAWN/.test(scene.timeOfDay.toUpperCase());

    if (isDay && scene.intExt === 'INT') {
      dayInt.push(scene);
    } else if (isDay && scene.intExt === 'EXT') {
      dayExt.push(scene);
    } else if (isNight && scene.intExt === 'INT') {
      nightInt.push(scene);
    } else if (isNight && scene.intExt === 'EXT') {
      nightExt.push(scene);
    } else {
      other.push(scene);
    }
  }

  return { dayInt, dayExt, nightInt, nightExt, other };
}
