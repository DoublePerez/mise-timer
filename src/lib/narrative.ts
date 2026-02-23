// Escalating focus labels — earned by completing work sessions.
// The label replaces "Work" silently. The number is the only score.

const NARRATIVE_LEVELS = [
  { threshold: 0, label: 'Starting' },
  { threshold: 1, label: 'Focused'  },
  { threshold: 3, label: 'Deep'     },
  { threshold: 5, label: 'Locked in'},
  { threshold: 8, label: 'Rare'     },
] as const;

/** Total work sessions completed across the whole day (passed in from storage). */
export function getNarrativeLabel(totalSessions: number): string {
  let label = NARRATIVE_LEVELS[0].label;
  for (const level of NARRATIVE_LEVELS) {
    if (totalSessions >= level.threshold) label = level.label;
  }
  return label;
}
