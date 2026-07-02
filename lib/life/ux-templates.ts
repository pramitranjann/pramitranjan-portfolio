import 'server-only'

import { createProjectPage } from '@/lib/life/project-pages'
import { createProject, listProjects } from '@/lib/life/projects-db'
import type { ProjectRecord } from '@/lib/life/types'

export interface UxTemplatePage {
  title: string
  body: string
}

export interface UxTemplateSection {
  key: string
  name: string
  phase: 'Discover' | 'Define' | 'Develop' | 'Deliver'
  summary: string
  color: string
  pages: UxTemplatePage[]
}

export const UX_TEMPLATE_SECTIONS: UxTemplateSection[] = [
  {
    key: 'research',
    name: 'Research',
    phase: 'Discover',
    summary: 'Plan and collect user evidence before deciding what to build.',
    color: '#6fcfd6',
    pages: [
      { title: 'Research plan', body: '## Goal\nDescribe the decision this research needs to unlock.\n\n## Participants\nWho should you talk to or observe?\n\n## Method\nInterviews, shadowing, survey, diary study, analytics review, or something else.\n\n## Questions\n- What do you need to learn?\n- What assumptions are you trying to test?\n\n## Risks\nWhat could bias the research or leave gaps in the evidence?\n' },
      { title: 'Interview notes', body: '## Participant\nName, role, or segment.\n\n## Context\nWhere were they, and what were they trying to get done?\n\n## Observed behavior\nWhat did they actually do?\n\n## Quotes\nCapture direct language worth keeping.\n\n## Follow-up questions\nWhat still needs clarification?\n' },
      { title: 'Insights', body: '## Patterns\nWhat repeated across participants or sources?\n\n## Needs\nWhat outcomes were people trying to achieve?\n\n## Pain points\nWhere did they struggle, hesitate, or improvise?\n\n## Evidence\nLink each insight back to notes, screenshots, or recordings.\n' },
      { title: 'Competitor scan', body: '## Products or references reviewed\nList direct competitors, analogous products, and adjacent experiences.\n\n## What each one does well\nCapture patterns worth understanding.\n\n## Gaps or weaknesses\nWhat still feels unresolved?\n\n## Opportunities\nWhere could your project take a stronger position?\n' },
      { title: 'Journey map', body: '## Starting point\nWhere does the user begin?\n\n## Stages\nDescribe the key moments in sequence.\n\n## Emotions\nHow does confidence, confusion, or effort change along the way?\n\n## Breakdowns\nWhere does the experience fail or slow down?\n\n## Design implications\nWhat should the product respond to?\n' },
    ],
  },
  {
    key: 'define',
    name: 'Define',
    phase: 'Define',
    summary: 'Turn research into a clear problem, user need, and design direction.',
    color: '#9aa6ff',
    pages: [
      { title: 'Problem statement', body: '## User\nWho is blocked right now?\n\n## Need\nWhat are they trying to accomplish?\n\n## Barrier\nWhat gets in the way today?\n\n## Why it matters\nWhy is this worth solving now?\n' },
      { title: 'How might we', body: '## HMW questions\nWrite 3 to 5 reframes of the core problem.\n\n## Promising directions\nList directions worth exploring.\n\n## Rejected directions\nNote ideas you are intentionally not pursuing and why.\n' },
      { title: 'Success criteria', body: '## User success\nWhat behavior or outcome would show this works?\n\n## Business or class success\nWhat metric, rubric, or stakeholder outcome matters here?\n\n## Accessibility requirements\nWhat cannot be compromised?\n' },
      { title: 'Opportunity areas', body: '## Opportunity list\nWrite the most important opportunities revealed by research.\n\n## Evidence\nWhat supports each one?\n\n## Priority\nWhich opportunities matter now versus later?\n\n## Why this priority\nExplain the sequencing.\n' },
      { title: 'Design principles', body: '## Principle 1\nState a guiding rule for the work.\n\n## Principle 2\nAdd another non-negotiable design direction.\n\n## Principle 3\nWhat should the final solution consistently feel or optimize for?\n\n## Anti-principles\nWhat should the work avoid?\n' },
    ],
  },
  {
    key: 'moodboard',
    name: 'Moodboard',
    phase: 'Develop',
    summary: 'Collect visual direction, UI references, typography, color, and interaction patterns.',
    color: '#e58fb8',
    pages: [
      { title: 'Visual direction', body: '## Mood\nWhat should the interface feel like?\n\n## Color\nList palette directions or attach swatches.\n\n## Typography\nWhat kind of voice and density fit the project?\n\n## Interaction feel\nFast and quiet, playful, tactile, formal, editorial, etc.\n' },
      { title: 'Reference notes', body: '## Reference\nPaste links, screenshots, or product names.\n\n## What works\nWhich details are worth borrowing?\n\n## What to avoid\nWhat looks good but is wrong for this project?\n\n## How it applies\nTranslate the reference into concrete design direction.\n' },
      { title: 'UI inventory', body: '## Core components\nWhat repeated UI pieces will this project need?\n\n## Inputs and controls\nButtons, fields, selectors, filters, upload states, and so on.\n\n## Content blocks\nCards, lists, tables, galleries, boards, or editors.\n\n## State examples\nEmpty, loading, error, and success references to collect.\n' },
      { title: 'Motion direction', body: '## Interaction moments\nWhat moments need motion or visual feedback?\n\n## Motion references\nCapture examples worth borrowing.\n\n## Restraint\nWhere should motion stay minimal?\n\n## Production notes\nWhat seems feasible in code versus decorative only?\n' },
    ],
  },
  {
    key: 'ideation',
    name: 'Ideation',
    phase: 'Develop',
    summary: 'Generate, compare, and select possible solutions.',
    color: '#e9b765',
    pages: [
      { title: 'Idea log', body: '## Idea\nDescribe one concept at a time.\n\n## User need addressed\nWhich need or pain point does it respond to?\n\n## Strength\nWhy might this work well?\n\n## Risk\nWhat makes this fragile, expensive, or unclear?\n' },
      { title: 'Concept selection', body: '## Concepts compared\nWhich directions made it to review?\n\n## Selection criteria\nWhat are you judging them on?\n\n## Chosen direction\nWhat moves forward?\n\n## Why\nState the evidence or reasoning behind the choice.\n' },
      { title: 'Crazy 8s recap', body: '## Promising sketches\nWhich quick ideas deserve another look?\n\n## Unexpected directions\nWhich idea surprised you?\n\n## Shared patterns\nWhat themes kept returning across sketches?\n\n## Next refinement\nWhat should move into wireframes?\n' },
      { title: 'Decision matrix', body: '## Options\nList the strongest options.\n\n## Criteria\nUsability, clarity, effort, novelty, accessibility, implementation cost.\n\n## Scoring\nHow does each concept perform?\n\n## Outcome\nWhich concept or hybrid wins and why?\n' },
    ],
  },
  {
    key: 'wireframes',
    name: 'Wireframes',
    phase: 'Develop',
    summary: 'Map flows, screens, layout decisions, and information architecture.',
    color: '#c79bff',
    pages: [
      { title: 'User flow', body: '## Entry point\nWhere does the flow begin?\n\n## Steps\nList the key moments in order.\n\n## Decision points\nWhere can the user branch or fail?\n\n## Exit states\nWhat counts as complete, abandoned, or blocked?\n' },
      { title: 'Wireframe decisions', body: '## Screen\nName the screen or flow segment.\n\n## Purpose\nWhat job does it do?\n\n## Layout choices\nCall out hierarchy, grouping, and emphasis decisions.\n\n## Open questions\nWhat still needs validation?\n' },
      { title: 'Information architecture', body: '## Top-level structure\nWhat are the main sections or modes?\n\n## Navigation logic\nHow does the user move between them?\n\n## Naming\nWhat labels are currently working?\n\n## Confusions\nWhere might structure break down?\n' },
      { title: 'Edge cases', body: '## Empty states\nWhat shows when there is nothing yet?\n\n## Error states\nWhat should happen when actions fail?\n\n## Permission or role differences\nDoes the UI change by user type?\n\n## Long-tail content\nWhat happens with too much text, too many items, or missing data?\n' },
    ],
  },
  {
    key: 'prototype',
    name: 'Prototype',
    phase: 'Develop',
    summary: 'Track prototype links, assumptions, interaction decisions, and demo readiness.',
    color: '#7fd899',
    pages: [
      { title: 'Prototype links', body: '## Figma\nPaste the working design file or prototype.\n\n## Build\nLink the coded version if one exists.\n\n## Recording\nAdd walkthroughs or usability clips.\n\n## Known limitations\nWhat is still fake, missing, or brittle?\n' },
      { title: 'Interaction notes', body: '## Key interactions\nWhat moments need to feel especially clear?\n\n## States\nLoading, empty, success, error, edge cases.\n\n## Motion\nWhat transitions or feedback matter?\n\n## Error handling\nHow does the interface recover when things go wrong?\n' },
      { title: 'Prototype checklist', body: '## Critical flow coverage\nWhich flows must work end to end?\n\n## State coverage\nHave you shown empty, loading, error, and success?\n\n## Accessibility pass\nKeyboard, focus, contrast, readable type, obvious actions.\n\n## Demo readiness\nWhat should be polished before critique or testing?\n' },
      { title: 'Handoff notes', body: '## Components\nWhich pieces are reusable?\n\n## Behavior rules\nWhat should engineering or future-you not misinterpret?\n\n## Measurements or tokens\nWhat values are important to preserve?\n\n## Known compromises\nWhat is intentionally unresolved?\n' },
    ],
  },
  {
    key: 'testing',
    name: 'Usability Testing',
    phase: 'Deliver',
    summary: 'Plan sessions, capture feedback, and separate observed behavior from opinions.',
    color: '#ff6c61',
    pages: [
      { title: 'Test plan', body: '## Goal\nWhat are you trying to learn from this round?\n\n## Participants\nWho is included and why?\n\n## Tasks\nWhat should they attempt?\n\n## Moderator script\nWhat will you say before, during, and after?\n\n## Success signals\nWhat outcomes would count as a win?\n' },
      { title: 'Testing notes', body: '## Participant\nWho was tested?\n\n## Task result\nCompleted, struggled, abandoned, or misinterpreted.\n\n## Observed behavior\nStick to what happened.\n\n## Quote\nCapture exact phrasing when useful.\n\n## Issue\nWhat broke down?\n' },
      { title: 'Findings', body: '## Finding\nState the issue or opportunity clearly.\n\n## Evidence\nWhat behavior, quote, or pattern supports it?\n\n## Severity\nHow much does it matter?\n\n## Recommendation\nWhat should change next?\n' },
      { title: 'Recruitment tracker', body: '## Participant list\nWho have you reached out to?\n\n## Fit\nWhy does each person match the target audience?\n\n## Status\nInvited, scheduled, completed, no response.\n\n## Incentive or logistics\nAnything to track before the session?\n' },
      { title: 'Issue tracker', body: '## Issue\nWhat failed or confused users?\n\n## Frequency\nHow often did it appear?\n\n## Severity\nLow, medium, high.\n\n## Proposed fix\nWhat change should be tested next?\n\n## Owner\nWho will action it?\n' },
    ],
  },
  {
    key: 'iterations',
    name: 'Iterations',
    phase: 'Deliver',
    summary: 'Record what changed, why it changed, and what evidence drove the decision.',
    color: '#6fcfd6',
    pages: [
      { title: 'Iteration log', body: '## Change\nWhat changed in the design or product?\n\n## Reason\nWhat prompted the update?\n\n## Evidence\nWhat justified it?\n\n## Before\nDescribe the previous state.\n\n## After\nDescribe the new state.\n' },
      { title: 'Open issues', body: '## Issue\nWhat is still unresolved?\n\n## Impact\nWhy does it matter?\n\n## Owner\nWho needs to move it?\n\n## Next step\nWhat should happen next?\n' },
      { title: 'Decision history', body: '## Decision\nWhat was decided?\n\n## Trigger\nWhat forced the decision?\n\n## Tradeoff\nWhat did you gain and what did you give up?\n\n## Revisit condition\nWhat would make you reopen this decision later?\n' },
      { title: 'Hypothesis log', body: '## Hypothesis\nWhat do you believe will improve?\n\n## Change tied to it\nWhat did you modify?\n\n## Signal to watch\nHow will you know if the change helped?\n\n## Outcome\nWhat happened after the change?\n' },
    ],
  },
  {
    key: 'presentation',
    name: 'Presentation',
    phase: 'Deliver',
    summary: 'Prepare critique, class presentation, and final submission material.',
    color: '#e9b765',
    pages: [
      { title: 'Presentation outline', body: '## Context\nSet up the project and audience.\n\n## Problem\nWhat needed to be solved?\n\n## Process\nShow the important steps, not every artifact.\n\n## Solution\nWhat did you land on?\n\n## Evidence\nHow do you know it works?\n\n## Reflection\nWhat changed in your thinking?\n' },
      { title: 'Critique notes', body: '## Feedback\nCapture comments worth keeping.\n\n## Theme\nGroup similar points.\n\n## Decision\nWhat will you act on?\n\n## Follow-up\nWhat needs to be revised or clarified?\n' },
      { title: 'Slide plan', body: '## Slide sequence\nList each slide in order.\n\n## Key visual\nWhat asset leads each slide?\n\n## Speaker note\nWhat should you say, briefly?\n\n## Risk\nWhere might the story still feel weak?\n' },
      { title: 'Submission checklist', body: '## Required files\nWhat must be turned in?\n\n## Export status\nWhat is ready versus missing?\n\n## Quality check\nTypography, spelling, image quality, naming, links.\n\n## Deadline buffer\nWhat still needs time before submission?\n' },
    ],
  },
  {
    key: 'case-study',
    name: 'Case Study',
    phase: 'Deliver',
    summary: 'Turn the project into a portfolio-ready narrative while the work is still fresh.',
    color: '#9aa6ff',
    pages: [
      { title: 'Case study draft', body: '## Problem\nWhat challenge framed the work?\n\n## Role\nWhat did you own?\n\n## Constraints\nWhat made this difficult?\n\n## Process\nWhat steps mattered most?\n\n## Key decisions\nWhich decisions changed the direction?\n\n## Outcome\nWhat improved?\n\n## Reflection\nWhat would you refine next time?\n' },
      { title: 'Portfolio assets', body: '## Hero\nWhich image or frame represents the work best?\n\n## Screens\nWhich screens are essential?\n\n## Process images\nWhat sketches, boards, or diagrams should be included?\n\n## Before and after\nWhere can the improvement be shown clearly?\n\n## Captions\nWhat short explanations will each asset need?\n' },
      { title: 'Narrative arc', body: '## Opening hook\nWhat immediately makes the project worth reading?\n\n## Tension\nWhat was difficult or uncertain?\n\n## Turning points\nWhich moments changed the direction of the work?\n\n## Ending\nWhat should the reader remember?\n' },
      { title: 'Evidence bank', body: '## Quantitative evidence\nMetrics, completion rates, timing, counts, or survey results.\n\n## Qualitative evidence\nQuotes, observations, screenshots, or critiques.\n\n## Visual proof\nWhat images best show the improvement?\n\n## Claims to avoid\nWhat cannot be backed up yet?\n' },
    ],
  },
]

export function uxTemplateByKey(key: string) {
  return UX_TEMPLATE_SECTIONS.find((section) => section.key === key) || null
}

export async function applyUxTemplateSections(projectSlug: string, keys: string[]): Promise<{
  created: ProjectRecord[]
  skipped: UxTemplateSection[]
}> {
  const requested = keys
    .map((key) => uxTemplateByKey(key))
    .filter((section): section is UxTemplateSection => Boolean(section))

  const uniqueRequested = Array.from(new Map(requested.map((section) => [section.key, section])).values())
  if (uniqueRequested.length === 0) return { created: [], skipped: [] }

  const projects = await listProjects({ includeArchived: true })
  const existingChildren = projects.filter((project) => project.parent_slug === projectSlug)
  const existingNames = new Set(existingChildren.map((project) => project.name.trim().toLowerCase()))
  const created: ProjectRecord[] = []
  const skipped: UxTemplateSection[] = []

  for (const section of uniqueRequested) {
    if (existingNames.has(section.name.toLowerCase())) {
      skipped.push(section)
      continue
    }

    const child = await createProject({
      name: section.name,
      summary: `${section.phase}: ${section.summary}`,
      color: section.color,
      aliases: [section.key, section.name],
      parentSlug: projectSlug,
      projectKind: 'ux',
    })
    created.push(child)
    existingNames.add(section.name.toLowerCase())

    for (const page of section.pages) {
      await createProjectPage({
        projectSlug: child.slug,
        title: page.title,
        body: page.body,
      })
    }
  }

  return { created, skipped }
}
