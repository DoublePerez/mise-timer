import { useEffect, useRef, useState } from 'react';
import type {
  TimerContext, WorkMode, CookMode,
  PastaVariant, EggVariant, SauceVariant,
  WorkDuration, BreakDuration, DeepWorkRounds,
  Phase,
} from '@/lib/types';
import {
  WORK_MODES, WORK_MODE_CONFIGS,
  COOK_MODES, COOK_MODE_CONFIGS,
  WORK_DURATIONS, BREAK_DURATIONS, DEEP_WORK_ROUNDS,
  PASTA_VARIANTS, EGG_VARIANTS, SAUCE_VARIANTS,
  PASTA_DESCRIPTIONS,
} from '@/lib/constants';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  context: TimerContext;
  workMode: WorkMode;
  cookMode: CookMode;
  onContextChange: (c: TimerContext) => void;
  onWorkModeChange: (m: WorkMode) => void;
  onCookModeChange: (m: CookMode) => void;
  workDuration: WorkDuration;
  breakDuration: BreakDuration;
  deepWorkRounds: DeepWorkRounds;
  onWorkDurationChange: (d: WorkDuration) => void;
  onBreakDurationChange: (d: BreakDuration) => void;
  onDeepWorkRoundsChange: (r: DeepWorkRounds) => void;
  pastaVariant: PastaVariant;
  eggVariant: EggVariant;
  sauceVariant: SauceVariant;
  onPastaVariantChange: (v: PastaVariant) => void;
  onEggVariantChange: (v: EggVariant) => void;
  onSauceVariantChange: (v: SauceVariant) => void;
  // Custom work
  customWorkName: string;
  customWorkMinutes: number;
  onCustomWorkNameChange: (n: string) => void;
  onCustomWorkMinutesChange: (m: number) => void;
  // Custom cook — multi-stage
  customCookStages: Phase[];
  onCustomCookStagesChange: (stages: Phase[]) => void;
}

// ── Info tooltip — (i) icon that reveals a hover popover ─────────────
function InfoTooltip({ lines }: { lines: string[] }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  return (
    <span
      ref={ref}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {/* The (i) glyph */}
      <span
        aria-label="More info"
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-muted)',
          lineHeight: 1,
          cursor: 'default',
          userSelect: 'none',
          letterSpacing: 0,
        }}
      >
        ⓘ
      </span>

      {/* Popover */}
      {visible && (
        <span
          role="tooltip"
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 'calc(100% + 6px)',
            transform: 'translateX(-50%)',
            background: 'var(--color-surface-raised)',
            border: 'var(--border-width) solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-2) var(--space-3)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)',
            zIndex: 50,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            minWidth: 120,
          }}
        >
          {lines.map((line, i) => (
            <span
              key={i}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-fg)',
                letterSpacing: 'var(--tracking)',
                lineHeight: 1.4,
              }}
            >
              {line}
            </span>
          ))}
        </span>
      )}
    </span>
  );
}

// ── Pill row: label stacked above pill group ─────────────────────────
function SegRow<T extends string | number>({
  label,
  options,
  selected,
  onChange,
  unit,
}: {
  label: string;
  options: readonly { value: T; label: string; tooltip?: string }[];
  selected: T;
  onChange: (v: T) => void;
  unit?: string;
}) {
  const tooltipLines = options
    .filter(o => o.tooltip)
    .map(o => `${o.label} — ${o.tooltip}`);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-xs)',
            fontWeight: 400,
            letterSpacing: 'var(--tracking-wide)',
            textTransform: 'uppercase',
            color: 'var(--color-muted)',
            lineHeight: 1,
          }}
        >
          {label}
        </span>
        {tooltipLines.length > 0 && <InfoTooltip lines={tooltipLines} />}
      </div>

      <div
        role="group"
        aria-label={label}
        style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          border: 'var(--border-width) solid var(--color-border)',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-bg)',
          padding: 'var(--inset-pill)',
          gap: 'var(--inset-pill)',
        }}
      >
        {options.map(opt => {
          const isActive = opt.value === selected;
          return (
            <button
              key={String(opt.value)}
              onClick={() => onChange(opt.value)}
              aria-pressed={isActive}
              aria-label={unit ? `${opt.label} ${unit}` : opt.label}
              title={opt.tooltip}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-xs)',
                fontWeight: isActive ? 500 : 400,
                letterSpacing: 'var(--tracking)',
                // Equal flex so all options share available space evenly
                flex: 1,
                padding: 'var(--space-2) 0',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                cursor: 'pointer',
                background: isActive ? 'var(--color-surface-raised)' : 'transparent',
                color: isActive ? 'var(--color-fg)' : 'var(--color-muted)',
                transition: [
                  'background var(--dur-fast) var(--ease)',
                  'color var(--dur-fast) var(--ease)',
                ].join(', '),
                lineHeight: 1,
                whiteSpace: 'nowrap',
                textAlign: 'center',
                outline: 'none',
              }}
              onMouseEnter={e => {
                if (!isActive)
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-fg)';
              }}
              onMouseLeave={e => {
                if (!isActive)
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)';
              }}
              onFocus={e => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.outline = 'var(--outline-width) solid var(--color-accent)';
                b.style.outlineOffset = 'var(--outline-offset)';
              }}
              onBlur={e => {
                (e.currentTarget as HTMLButtonElement).style.outline = 'none';
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div style={{ width: '100%', height: 'var(--border-width)', background: 'var(--color-border)', flexShrink: 0 }} />
  );
}

// ── Group: vertically stacked rows with consistent gap ────────────────
function Group({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {children}
    </div>
  );
}

// ── Text + number inputs for custom timer ────────────────────────────
const inputStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-xs)',
  fontWeight: 400,
  letterSpacing: 'var(--tracking)',
  background: 'var(--color-bg)',
  color: 'var(--color-fg)',
  border: 'var(--border-width) solid var(--color-border)',
  borderRadius: 'var(--radius-full)',
  padding: 'var(--space-2) var(--space-3)',
  outline: 'none',
  width: '100%',
};

// ── Single name + minutes row (used for custom work) ─────────────────
function CustomWorkRow({
  name, minutes,
  onNameChange, onMinutesChange,
}: {
  name: string;
  minutes: number;
  onNameChange: (n: string) => void;
  onMinutesChange: (m: number) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <span style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-xs)',
        fontWeight: 400,
        letterSpacing: 'var(--tracking-wide)',
        textTransform: 'uppercase',
        color: 'var(--color-muted)',
        lineHeight: 1,
      }}>
        Custom
      </span>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--space-2)', alignItems: 'center' }}>
        <input
          type="text"
          value={name}
          maxLength={20}
          placeholder="Name"
          onChange={e => onNameChange(e.target.value)}
          style={inputStyle}
          aria-label="Custom timer name"
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', flexShrink: 0 }}>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={minutes}
            onChange={e => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v >= 1) onMinutesChange(v);
            }}
            style={{ ...inputStyle, width: 44, textAlign: 'center', padding: 'var(--space-2) var(--space-1)' }}
            aria-label="Custom timer minutes"
          />
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-muted)',
            letterSpacing: 'var(--tracking)',
            lineHeight: 1,
            whiteSpace: 'nowrap',
            userSelect: 'none',
          }}>
            min
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Stage builder: multi-stage cook custom ────────────────────────────
const SECONDS_PER_MINUTE_LOCAL = 60;

// Shared style for the duration suffix badge (e.g. "min")
const durationSuffixStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-xs)',
  color: 'var(--color-muted)',
  letterSpacing: 'var(--tracking)',
  lineHeight: 1,
  whiteSpace: 'nowrap',
  userSelect: 'none',
};

function StageBuilder({
  stages,
  onChange,
}: {
  stages: Phase[];
  onChange: (s: Phase[]) => void;
}) {
  const updateLabel = (i: number, label: string) => {
    const next = stages.map((s, idx) => idx === i ? { ...s, label } : s);
    onChange(next);
  };
  const updateMinutes = (i: number, minutes: number) => {
    const next = stages.map((s, idx) =>
      idx === i ? { ...s, seconds: minutes * SECONDS_PER_MINUTE_LOCAL } : s
    );
    onChange(next);
  };
  const addStage = () => {
    onChange([...stages, { label: `Stage ${stages.length + 1}`, seconds: 5 * SECONDS_PER_MINUTE_LOCAL }]);
  };
  const removeStage = (i: number) => {
    if (stages.length <= 1) return;
    onChange(stages.filter((_, idx) => idx !== i));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {stages.map((stage, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 'var(--space-2)',
            alignItems: 'center',
          }}
        >
          {/* Left: name input */}
          <input
            type="text"
            value={stage.label}
            maxLength={16}
            placeholder={`Stage ${i + 1}`}
            onChange={e => updateLabel(i, e.target.value)}
            style={inputStyle}
            aria-label={`Stage ${i + 1} name`}
          />

          {/* Right: duration + remove — tight cluster */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', flexShrink: 0 }}>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={Math.round(stage.seconds / SECONDS_PER_MINUTE_LOCAL)}
              onChange={e => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v) && v >= 1) updateMinutes(i, v);
              }}
              style={{ ...inputStyle, width: 44, textAlign: 'center', padding: 'var(--space-2) var(--space-1)' }}
              aria-label={`Stage ${i + 1} minutes`}
            />
            <span style={durationSuffixStyle}>min</span>
            <button
              onClick={() => removeStage(i)}
              disabled={stages.length <= 1}
              aria-label={`Remove stage ${i + 1}`}
              style={{
                width: 16, height: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'none', border: 'none',
                cursor: stages.length <= 1 ? 'default' : 'pointer',
                color: stages.length <= 1 ? 'var(--color-border)' : 'var(--color-muted)',
                flexShrink: 0, outline: 'none', padding: 0,
              }}
            >
              <MinusIcon />
            </button>
          </div>
        </div>
      ))}

      {/* Add stage */}
      <button
        onClick={addStage}
        style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-xs)',
          letterSpacing: 'var(--tracking-wide)',
          textTransform: 'uppercase',
          color: 'var(--color-muted)',
          padding: 0,
          outline: 'none',
          marginTop: 'var(--space-1)',
        }}
        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-fg)'}
        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'}
      >
        <PlusIcon /> Add stage
      </button>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <line x1="5" y1="1" x2="5" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="1" y1="5" x2="9" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <line x1="1" y1="5" x2="9" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function SettingsPanel({
  open, onClose,
  context, workMode, cookMode,
  onContextChange, onWorkModeChange, onCookModeChange,
  workDuration, breakDuration, deepWorkRounds,
  onWorkDurationChange, onBreakDurationChange, onDeepWorkRoundsChange,
  pastaVariant, eggVariant, sauceVariant,
  onPastaVariantChange, onEggVariantChange, onSauceVariantChange,
  customWorkName, customWorkMinutes, onCustomWorkNameChange, onCustomWorkMinutesChange,
  customCookStages, onCustomCookStagesChange,
}: SettingsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    const id = setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => { clearTimeout(id); document.removeEventListener('mousedown', handler); };
  }, [open, onClose]);

  if (!open) return null;

  const numOpts = (vals: readonly number[]) => vals.map(v => ({ value: v, label: String(v) }));

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.2)',
          zIndex: 20,
        }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Settings"
        style={{
          position: 'fixed',
          top: 'var(--space-12)',
          right: 'var(--space-6)',
          zIndex: 30,
          width: 260,
          background: 'var(--color-surface)',
          border: 'var(--border-width) solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-xs)',
            fontWeight: 500,
            letterSpacing: 'var(--tracking-wide)',
            textTransform: 'uppercase',
            color: 'var(--color-muted)',
            lineHeight: 1,
          }}>
            Settings
          </span>
          <button
            onClick={onClose}
            aria-label="Close settings"
            style={{
              width: 16, height: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-muted)', borderRadius: 'var(--radius-sm)', outline: 'none',
              flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-fg)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'}
            onFocus={e => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.outline = 'var(--outline-width) solid var(--color-accent)';
              b.style.outlineOffset = 'var(--outline-offset)';
            }}
            onBlur={e => (e.currentTarget as HTMLButtonElement).style.outline = 'none'}
          >
            <XIcon />
          </button>
        </div>

        <Divider />

        {/* Context + sub-mode */}
        <Group>
          <SegRow
            label="Mode"
            options={[
              { value: 'work' as TimerContext, label: 'Work' },
              { value: 'cook' as TimerContext, label: 'Cook' },
            ]}
            selected={context}
            onChange={onContextChange}
          />
          {context === 'work' && (
            <SegRow
              label="Style"
              options={WORK_MODES.map(m => ({ value: m, label: WORK_MODE_CONFIGS[m].label }))}
              selected={workMode}
              onChange={onWorkModeChange}
            />
          )}
          {context === 'cook' && (
            <SegRow
              label="Timer"
              options={COOK_MODES.map(m => ({ value: m, label: COOK_MODE_CONFIGS[m].label }))}
              selected={cookMode}
              onChange={onCookModeChange}
            />
          )}
        </Group>

        {/* Duration / variant options */}
        {context === 'work' && workMode === 'pomodoro' && (
          <>
            <Divider />
            <Group>
              <SegRow
                label="Work"
                options={numOpts(WORK_DURATIONS)}
                selected={workDuration}
                onChange={v => onWorkDurationChange(v as WorkDuration)}
                unit="min"
              />
              <SegRow
                label="Break"
                options={numOpts(BREAK_DURATIONS)}
                selected={breakDuration}
                onChange={v => onBreakDurationChange(v as BreakDuration)}
                unit="min"
              />
            </Group>
          </>
        )}
        {context === 'work' && workMode === 'deep-work' && (
          <>
            <Divider />
            <Group>
              <SegRow
                label="Break"
                options={numOpts(BREAK_DURATIONS)}
                selected={breakDuration}
                onChange={v => onBreakDurationChange(v as BreakDuration)}
                unit="min"
              />
              <SegRow
                label="Rounds"
                options={numOpts(DEEP_WORK_ROUNDS)}
                selected={deepWorkRounds}
                onChange={v => onDeepWorkRoundsChange(v as DeepWorkRounds)}
              />
            </Group>
          </>
        )}
        {context === 'work' && workMode === 'custom' && (
          <>
            <Divider />
            <CustomWorkRow
              name={customWorkName}
              minutes={customWorkMinutes}
              onNameChange={onCustomWorkNameChange}
              onMinutesChange={onCustomWorkMinutesChange}
            />
          </>
        )}
        {context === 'cook' && cookMode === 'pasta' && (
          <>
            <Divider />
            <SegRow
              label="Type"
              options={PASTA_VARIANTS.map(p => ({
                value: p.id, label: p.label, tooltip: PASTA_DESCRIPTIONS[p.id],
              }))}
              selected={pastaVariant}
              onChange={onPastaVariantChange}
            />
          </>
        )}
        {context === 'cook' && cookMode === 'egg' && (
          <>
            <Divider />
            <SegRow
              label="Style"
              options={EGG_VARIANTS.map(e => ({
                value: e.id, label: e.label, tooltip: `${e.minutes} min`,
              }))}
              selected={eggVariant}
              onChange={onEggVariantChange}
            />
          </>
        )}
        {context === 'cook' && cookMode === 'sauce' && (
          <>
            <Divider />
            <SegRow
              label="Recipe"
              options={SAUCE_VARIANTS.map(s => {
                const totalMin = Math.round(s.phases.reduce((sum, p) => sum + p.seconds, 0) / 60);
                return {
                  value: s.id,
                  label: s.label,
                  tooltip: `${totalMin} min — ${s.phases.map(p => p.label).join(' → ')}`,
                };
              })}
              selected={sauceVariant}
              onChange={onSauceVariantChange}
            />
          </>
        )}
        {context === 'cook' && cookMode === 'custom' && (
          <>
            <Divider />
            <StageBuilder
              stages={customCookStages}
              onChange={onCustomCookStagesChange}
            />
          </>
        )}
      </div>
    </>
  );
}

// ── Sliders icon (settings) ──────────────────────────────────────────
// Clean horizontal sliders — universally understood settings icon
export function SlidersIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <line x1="1" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="10" cy="4" r="1.8" fill="var(--color-bg)" stroke="currentColor" strokeWidth="1.3" />
      <line x1="1" y1="11" x2="14" y2="11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="5" cy="11" r="1.8" fill="var(--color-bg)" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <line x1="1.5" y1="1.5" x2="10.5" y2="10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10.5" y1="1.5" x2="1.5" y2="10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
