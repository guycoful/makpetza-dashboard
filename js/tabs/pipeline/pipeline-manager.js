// ========== PIPELINE MANAGER — 8-Step Orchestrator ==========
import { getState, setState } from '../../core/state.js';
import { emit, on } from '../../core/events.js';
import { navigate, getStepName } from '../../core/router.js';

const STEPS = [
  { num: 1, id: 'idea',       title: 'רעיון השקעה',    icon: '\u{1F4A1}' },
  { num: 2, id: 'bus',        title: 'BUS Score',       icon: '\u{1F3E2}' },
  { num: 3, id: 'financial',  title: 'יחסים פיננסיים', icon: '\u{1F4CA}' },
  { num: 4, id: 'technical',  title: 'ניתוח טכני',     icon: '\u{1F4C8}' },
  { num: 5, id: 'valuation',  title: 'תמחור',          icon: '\u{1F4B0}' },
  { num: 6, id: 'risk',       title: 'סיכונים',        icon: '\u{26A0}\u{FE0F}' },
  { num: 7, id: 'decision',   title: 'החלטה',          icon: '\u{2696}\u{FE0F}' },
  { num: 8, id: 'monitoring', title: 'מעקב',           icon: '\u{1F4CB}' }
];

export { STEPS };

// Check if a step is unlocked (step 1 always unlocked, others require previous completion)
export function isStepUnlocked(stepNum) {
  if (stepNum <= 1) return true;
  const completed = getState('pipeline.completed') || [];
  return !!completed[stepNum - 2]; // previous step must be completed
}

// Check if a step has been completed
export function isStepComplete(stepNum) {
  const completed = getState('pipeline.completed') || [];
  return !!completed[stepNum - 1];
}

// Mark a step as complete and unlock next
export function completeStep(stepNum) {
  if (stepNum < 1 || stepNum > 8) return false;
  // Can't complete a locked step
  if (!isStepUnlocked(stepNum)) return false;

  const completed = getState('pipeline.completed') || [false,false,false,false,false,false,false,false];
  completed[stepNum - 1] = true;
  setState('pipeline.completed', [...completed]);
  emit('pipeline:step-completed', { step: stepNum });
  return true;
}

// Reset a step (and lock all subsequent steps)
export function resetStep(stepNum) {
  const completed = getState('pipeline.completed') || [false,false,false,false,false,false,false,false];
  for (let i = stepNum - 1; i < 8; i++) {
    completed[i] = false;
  }
  setState('pipeline.completed', [...completed]);
  emit('pipeline:step-reset', { step: stepNum });
}

// Get current active step number
export function getCurrentStep() {
  return getState('pipeline.currentStep') || 1;
}

// Navigate to a step
export function goToStep(stepNum) {
  if (!isStepUnlocked(stepNum)) return false;
  const step = STEPS.find(s => s.num === stepNum);
  if (!step) return false;
  setState('pipeline.currentStep', stepNum);
  navigate('pipeline', step.id);
  return true;
}

// Render the pipeline step sidebar (inside main content area)
export function renderPipelineNav(container) {
  container.textContent = '';

  const nav = document.createElement('div');
  nav.className = 'pipeline-steps';

  STEPS.forEach(step => {
    const unlocked = isStepUnlocked(step.num);
    const completed = isStepComplete(step.num);
    const current = getCurrentStep() === step.num;

    const btn = document.createElement('button');
    btn.className = 'pipeline-step';
    if (current) btn.classList.add('active');
    if (completed) btn.classList.add('completed');
    if (!unlocked) btn.classList.add('locked');
    btn.dataset.step = step.num;

    const icon = document.createElement('span');
    icon.className = 'step-icon';
    icon.textContent = unlocked ? step.icon : '\u{1F512}';
    btn.appendChild(icon);

    const info = document.createElement('span');
    info.className = 'step-info';

    const title = document.createElement('span');
    title.className = 'step-title';
    title.textContent = step.title;
    info.appendChild(title);

    const status = document.createElement('span');
    status.className = 'step-status';
    status.textContent = completed ? 'הושלם' : unlocked ? 'פתוח' : 'נעול';
    info.appendChild(status);

    btn.appendChild(info);

    btn.addEventListener('click', () => {
      if (unlocked) goToStep(step.num);
    });

    nav.appendChild(btn);
  });

  container.appendChild(nav);
}

// Initialize pipeline — listen for route changes within pipeline tab
export function initPipeline() {
  on('pipeline:step-completed', () => {
    // Re-render nav when step status changes
    const nav = document.querySelector('.pipeline-steps');
    if (nav && nav.parentElement) {
      renderPipelineNav(nav.parentElement);
    }
  });
}
