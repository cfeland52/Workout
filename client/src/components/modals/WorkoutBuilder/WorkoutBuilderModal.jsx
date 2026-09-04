import { useEffect, useState } from 'react';
import { useApp } from '../../../state/AppContext.jsx';
import { cloneBlocksAsTemplate, draftFromWorkout, newDraft, val } from '../../../lib/draft.js';
import { exerciseGroupOf } from '../../../lib/selectors.js';
import { nowTimeStr } from '../../../lib/dateUtils.js';
import { uid } from '../../../lib/id.js';
import { clearInProgress, loadInProgress, sameModalSpec, saveInProgress } from '../../../lib/draftCache.js';
import ModalShell from '../ModalShell.jsx';
import { DraftProvider, useDraft } from './DraftContext.jsx';
import StepSetup from './StepSetup.jsx';
import StepSource from './StepSource.jsx';
import StepTemplate from './StepTemplate.jsx';
import StepBuild from './StepBuild.jsx';

function cleanForSave(draft, data) {
  const cleanedBlocks = [];
  draft.blocks.forEach((b) => {
    const exs = b.exercises
      .filter((ex) => ex.name && ex.name.trim() !== '')
      .map((ex) => {
        const sets = ex.sets
          .filter((s) => (s.isDrop ? s.stages.some((st) => st.reps || st.weight) : (s.reps || s.weight)))
          .map((s) => (s.isDrop
            ? { isDrop: true, stages: s.stages.map((st) => ({ reps: st.reps || '', weight: st.weight || '' })) }
            : { reps: s.reps || '', weight: s.weight || '' }));
        return { name: ex.name.trim(), muscleGroup: ex.muscleGroup || exerciseGroupOf(data, ex.name.trim()) || 'Other', sets };
      });
    if (exs.length) cleanedBlocks.push({ type: exs.length > 1 ? 'superset' : 'standard', exercises: exs });
  });
  const cleanedCardio = draft.cardio.filter((c) => Object.keys(c).some((k) => k !== 'machine' && c[k]));
  return { cleanedBlocks, cleanedCardio };
}

function BuilderBody() {
  const { data, ui, submit, openModal, closeModal, showToast } = useApp();
  const { draft, update } = useDraft();
  const [saving, setSaving] = useState(false);

  // A deliberate exit (the X button, or "Cancel"): the user doesn't want
  // this draft back, so drop the safety-net copy. Getting yanked away by the
  // OS backgrounding the tab is different — nothing runs then, so the saved
  // copy just sits there ready to resume, which is the whole point.
  function handleClose() {
    clearInProgress();
    closeModal();
  }

  function continueSetup() {
    update((d) => {
      d.date = val('d-date') || d.date;
      d.startTime = val('d-start');
      d.bodyWeight = val('d-bw');
      if (d.category === 'Cardio') { d.blocks = []; d.step = 'build'; }
      else { d.step = 'source'; }
    });
  }

  async function completeWorkout() {
    const { cleanedBlocks, cleanedCardio } = cleanForSave(draft, data);
    if (!cleanedBlocks.length && !cleanedCardio.length) {
      showToast('Add at least one exercise or cardio entry before saving.');
      return;
    }

    setSaving(true);
    try {
      const newNames = [];
      cleanedBlocks.forEach((b) => b.exercises.forEach((ex) => {
        if (!(data.exercises[ex.muscleGroup] || []).includes(ex.name)) newNames.push([ex.muscleGroup, ex.name]);
      }));
      // Sequential, not parallel: each op goes through the same outbox-ordering
      // path as everything else, so a Promise.all here would race them.
      for (const [group, name] of newNames) {
        await submit({ entity: 'exercise', action: 'add', muscleGroup: group, name });
      }

      const id = draft.editingId || uid('w');
      const payload = draft.editingId
        ? {
            ...data.workouts.find((w) => w.id === draft.editingId),
            date: draft.date,
            category: draft.category,
            bodyWeight: draft.bodyWeight === '' ? null : Number(draft.bodyWeight),
            blocks: cleanedBlocks,
            cardio: cleanedCardio,
          }
        : {
            userId: ui.currentUserId,
            date: draft.date,
            category: draft.category,
            bodyWeight: draft.bodyWeight === '' ? null : Number(draft.bodyWeight),
            startTime: draft.startTime || null,
            endTime: nowTimeStr(),
            notes: '',
            blocks: cleanedBlocks,
            cardio: cleanedCardio,
          };
      await submit({ entity: 'workout', action: 'upsert', id, payload });
      clearInProgress();
      openModal({ type: 'dayDetail', date: draft.date });
    } catch (err) {
      showToast(err.message);
    } finally {
      setSaving(false);
    }
  }

  const title = draft.editingId ? 'Edit Workout' : 'New Workout';
  let body, footer;

  if (draft.step === 'setup') {
    body = <StepSetup />;
    footer = (
      <>
        <button className="btn" onClick={handleClose}>Cancel</button>
        <button className="btn btn-accent" onClick={continueSetup}>Continue</button>
      </>
    );
  } else if (draft.step === 'source') {
    body = (
      <StepSource
        onScratch={() => update((d) => { d.blocks = []; d.step = 'build'; })}
        onTemplate={() => update((d) => { d.step = 'template'; })}
      />
    );
    footer = <button className="btn" onClick={() => update((d) => { d.step = 'setup'; })}>Back</button>;
  } else if (draft.step === 'template') {
    body = (
      <StepTemplate
        onScratch={() => update((d) => { d.blocks = []; d.step = 'build'; })}
        onPick={(id) => update((d) => {
          const w = data.workouts.find((x) => x.id === id);
          d.blocks = cloneBlocksAsTemplate(w ? w.blocks : []);
          d.step = 'build';
        })}
      />
    );
    footer = <button className="btn" onClick={() => update((d) => { d.step = 'source'; })}>Back</button>;
  } else {
    body = <StepBuild />;
    footer = (
      <>
        <button className="btn" onClick={() => (draft.editingId ? handleClose() : update((d) => { d.step = 'setup'; }))}>
          {draft.editingId ? 'Cancel' : 'Back'}
        </button>
        <button className="btn btn-accent" disabled={saving} onClick={completeWorkout}>
          {draft.editingId ? 'Save Changes' : 'Complete Workout'}
        </button>
      </>
    );
  }

  return <ModalShell title={title} footer={footer} onClose={handleClose}>{body}</ModalShell>;
}

export default function WorkoutBuilderModal() {
  const { data, ui } = useApp();
  const modal = ui.modal;
  const [draft, setDraft] = useState(() => {
    const saved = loadInProgress();
    if (saved && sameModalSpec(saved.modal, modal)) return saved.draft;
    if (modal.editingId) {
      const existing = data.workouts.find((w) => w.id === modal.editingId);
      return draftFromWorkout(existing);
    }
    return newDraft(modal.date);
  });

  useEffect(() => {
    saveInProgress(modal, ui.currentUserId, draft);
  }, [modal, ui.currentUserId, draft]);

  return (
    <DraftProvider draft={draft} setDraft={setDraft}>
      <BuilderBody />
    </DraftProvider>
  );
}
