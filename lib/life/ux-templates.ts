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

function lines(value: string | string[]) {
  return Array.isArray(value) ? value.join('\n') : value
}

function bullets(items: string[]) {
  return items.map((item) => `- ${item}`).join('\n')
}

function section(title: string, body: string | string[]) {
  return `## ${title}\n${lines(body)}`
}

function worksheet(config: {
  purpose: string
  useWhen: string[]
  gather?: string[]
  leaveWith: string[]
  sections: Array<{ title: string; body: string | string[] }>
}) {
  return [
    section('Purpose', config.purpose),
    section('Use this page when', bullets(config.useWhen)),
    config.gather?.length ? section('Gather before starting', bullets(config.gather)) : null,
    section('Leave this page with', bullets(config.leaveWith)),
    ...config.sections.map((item) => section(item.title, item.body)),
  ]
    .filter(Boolean)
    .join('\n\n') + '\n'
}

export const UX_TEMPLATE_SECTIONS: UxTemplateSection[] = [
  {
    key: 'research',
    name: 'Research',
    phase: 'Discover',
    summary: 'Plan and collect user evidence before deciding what to build.',
    color: '#6fcfd6',
    pages: [
      {
        title: 'Research plan',
        body: worksheet({
          purpose: 'Turn a broad project idea into a focused learning plan grounded in user needs and decision risk.',
          useWhen: ['before interviews or observation begin', 'when the team is guessing too much', 'when scope is still fuzzy'],
          gather: ['existing assumptions', 'known constraints', 'available time', 'who can be recruited'],
          leaveWith: ['a research objective', 'participant criteria', 'method choice', 'a session guide', 'clear risks and biases to watch'],
          sections: [
            { title: 'Decision this research must unlock', body: ['What design or product decision is blocked right now?', 'Why is that decision risky without evidence?'] },
            { title: 'Primary learning goals', body: bullets(['What do users need to get done?', 'Where does the current experience break down?', 'What would change the design direction if learned?']) },
            { title: 'Assumptions to test', body: bullets(['List the beliefs the project is currently relying on.', 'Mark each assumption as high, medium, or low risk.', 'Note what evidence would prove it wrong.']) },
            { title: 'Participant criteria', body: ['Target users:', 'Relevant context or behavior:', 'Screening questions:', 'Who should explicitly not be included in this round?'] },
            { title: 'Method and rationale', body: bullets(['Choose the method: interview, contextual inquiry, diary, survey, analytics review, comparative audit.', 'Explain why this method fits the decision better than the alternatives.', 'State what the method will not tell you.']) },
            { title: 'Discussion guide', body: ['Opening questions:', 'Core tasks or scenarios:', 'Behavioral follow-ups:', 'Closing reflection questions:'] },
            { title: 'Evidence capture plan', body: bullets(['How will notes be taken?', 'Will screenshots, quotes, or recordings be captured?', 'How will findings be stored so they can be cited later?']) },
            { title: 'Bias and logistics check', body: bullets(['What could distort the results?', 'What is likely to be missed?', 'What practical constraints could reduce quality?']) },
          ],
        }),
      },
      {
        title: 'Interview notes',
        body: worksheet({
          purpose: 'Capture one participant session in a way that separates observed evidence from interpretation.',
          useWhen: ['during or right after a user interview', 'during contextual observation', 'when preserving direct evidence matters'],
          gather: ['participant context', 'research objective', 'session tasks or prompts'],
          leaveWith: ['behavior notes', 'direct quotes', 'pain points', 'surprises', 'follow-up questions'],
          sections: [
            { title: 'Participant snapshot', body: ['Name or code:', 'Role or segment:', 'Relevant experience level:', 'Why this participant matters to the study:'] },
            { title: 'Session context', body: ['Where did the session happen?', 'What was the participant trying to accomplish before the prompt?', 'What tools, devices, or constraints shaped behavior?'] },
            { title: 'Observed behavior', body: bullets(['Write what the participant actually did step by step.', 'Note hesitation, workarounds, skipped content, and self-corrections.', 'Avoid interpretation in this section.']) },
            { title: 'Direct quotes', body: bullets(['Capture exact phrases worth reusing later.', 'Mark any quote that reveals a mental model, fear, or unmet need.']) },
            { title: 'Moments of friction', body: ['Task or step:', 'What happened:', 'Why it seems significant:', 'Severity:'] },
            { title: 'Signals of success or delight', body: ['What felt easy or obvious?', 'What language suggested trust or confidence?', 'What feature or idea clearly resonated?'] },
            { title: 'Interpretation after the session', body: bullets(['What need or pattern might this point to?', 'What assumption became weaker or stronger?', 'What should be compared against other sessions before concluding?']) },
            { title: 'Follow-up', body: ['Open questions:', 'Artifacts to revisit:', 'Anything to test in the next session:'] },
          ],
        }),
      },
      {
        title: 'Insights',
        body: worksheet({
          purpose: 'Synthesize raw research into defensible findings that can drive product decisions.',
          useWhen: ['after several interviews or observations', 'when research notes feel noisy', 'before writing the problem statement'],
          gather: ['interview notes', 'quotes', 'screenshots', 'analytics or audit evidence'],
          leaveWith: ['patterns', 'user needs', 'frictions', 'opportunities', 'evidence-backed claims'],
          sections: [
            { title: 'Repeated patterns', body: bullets(['What came up across multiple participants?', 'Which patterns cut across different segments or contexts?', 'Which observations were one-off and should not be over-weighted?']) },
            { title: 'User needs', body: ['Need:', 'Context in which it appears:', 'Evidence supporting it:', 'What happens when it is unmet:'] },
            { title: 'Pain points and breakdowns', body: ['Breakdown:', 'Observed behavior or quote:', 'Why this matters:', 'How frequent or severe it appears to be:'] },
            { title: 'Mental models', body: bullets(['What do users believe the product should do?', 'What labels or structures did they expect?', 'Where did the product conflict with their expectations?']) },
            { title: 'Tensions and tradeoffs', body: bullets(['Where do users want two things that may conflict?', 'What tradeoff is emerging between simplicity, power, speed, trust, or flexibility?']) },
            { title: 'Design implications', body: ['Implication:', 'Research source:', 'What the team should change, test, or prioritize next:'] },
            { title: 'Claims to avoid', body: bullets(['What sounds true but is not sufficiently backed up yet?', 'What needs another round of evidence before becoming a design principle?']) },
          ],
        }),
      },
      {
        title: 'Competitor scan',
        body: worksheet({
          purpose: 'Study comparable products to understand expected patterns, whitespace, and positioning.',
          useWhen: ['before locking interaction patterns', 'when the project category is familiar to users', 'when you need benchmark context'],
          gather: ['3 to 6 direct or adjacent references', 'screenshots or links', 'the specific flow being compared'],
          leaveWith: ['benchmark notes', 'pattern inventory', 'gaps in the market', 'opportunities worth testing'],
          sections: [
            { title: 'Products reviewed', body: ['Direct competitors:', 'Analogous references:', 'Why each one is relevant:'] },
            { title: 'Flow or feature being compared', body: ['Which task or moment is the focus?', 'What should be held constant while comparing products?'] },
            { title: 'What each product does well', body: bullets(['Navigation or IA', 'Clarity of labels and content', 'Trust or reassurance', 'Speed and ease of completion', 'Visual hierarchy']) },
            { title: 'Weak spots or missed opportunities', body: bullets(['Where does the experience still feel confusing?', 'Where is accessibility or content quality weak?', 'What appears over-designed, under-explained, or bloated?']) },
            { title: 'Patterns users are likely to expect', body: bullets(['What conventions repeat often enough that breaking them would need a strong reason?', 'Which patterns look standard but are actually poor for this project?']) },
            { title: 'Opportunity areas', body: ['Opportunity:', 'What current products fail to do well:', 'Why this matters to your user:'] },
            { title: 'Do not copy blindly', body: bullets(['Which patterns only make sense because of another product’s business model, scale, or ecosystem?', 'What should be translated rather than copied?']) },
          ],
        }),
      },
      {
        title: 'Journey map',
        body: worksheet({
          purpose: 'Lay out the full user journey so design work responds to the real sequence of effort and emotion.',
          useWhen: ['when the problem spans multiple moments', 'before prioritizing screens or flows', 'when service or system context matters'],
          gather: ['research notes', 'existing flow', 'touchpoints and channels involved'],
          leaveWith: ['stages', 'emotional highs and lows', 'breakdowns', 'opportunities by step'],
          sections: [
            { title: 'Journey scope', body: ['Where does the journey start?', 'Where does it end?', 'What is out of scope for this map?'] },
            { title: 'Stages', body: bullets(['Stage 1:', 'Stage 2:', 'Stage 3:', 'Stage 4:']) },
            { title: 'Actions at each stage', body: ['What is the user trying to do?', 'What information do they need?', 'What decisions must they make?'] },
            { title: 'Emotional curve', body: bullets(['Where does confidence rise?', 'Where does stress, uncertainty, or effort spike?', 'Where does momentum break?']) },
            { title: 'Touchpoints and channels', body: ['Product screens involved:', 'People or services involved:', 'Offline or external dependencies:'] },
            { title: 'Failure points', body: ['Stage:', 'What goes wrong:', 'Evidence:', 'Severity:'] },
            { title: 'Opportunities', body: ['Stage:', 'Opportunity:', 'Why this would matter:', 'Potential design direction:'] },
          ],
        }),
      },
    ],
  },
  {
    key: 'define',
    name: 'Define',
    phase: 'Define',
    summary: 'Turn research into a clear problem, user need, and design direction.',
    color: '#9aa6ff',
    pages: [
      {
        title: 'Problem statement',
        body: worksheet({
          purpose: 'Translate research into a crisp statement of who is blocked, what they need, and why solving it matters.',
          useWhen: ['after research synthesis', 'before ideation starts', 'when the team keeps describing the problem too broadly'],
          gather: ['top findings', 'evidence or quotes', 'scope constraints'],
          leaveWith: ['one core problem statement', 'user group definition', 'barrier description', 'stakes and urgency'],
          sections: [
            { title: 'Primary user', body: ['Who is experiencing the problem most directly?', 'What context are they in when the problem appears?', 'Who is adjacent but not the primary focus?'] },
            { title: 'Need', body: ['What job is the user trying to complete?', 'What outcome are they hoping for?', 'What would “good enough” feel like for them?'] },
            { title: 'Barrier', body: ['What specifically gets in the way?', 'Is the barrier about comprehension, trust, effort, timing, discoverability, accessibility, or policy?'] },
            { title: 'Evidence', body: bullets(['Quote:', 'Observed behavior:', 'Pattern across participants:', 'Any quantitative or audit signal:']) },
            { title: 'Why this matters now', body: ['Why is this worth prioritizing?', 'What happens if it remains unsolved?', 'What opportunity is currently being missed?'] },
            { title: 'Problem statement draft', body: 'Write one tight sentence in this shape:\n\n[User] needs to [goal], but [barrier], which leads to [negative consequence].' },
            { title: 'Scope guardrails', body: bullets(['What is explicitly in scope?', 'What tempting adjacent problem is out of scope for this round?']) },
          ],
        }),
      },
      {
        title: 'How might we',
        body: worksheet({
          purpose: 'Reframe the core problem into multiple generative questions without jumping too quickly to one solution.',
          useWhen: ['after the problem statement is stable', 'before concept generation', 'when the team needs broader solution space'],
          gather: ['problem statement', 'research insights', 'constraints'],
          leaveWith: ['3 to 7 useful HMW prompts', 'which ones feel promising', 'which ones should be dropped'],
          sections: [
            { title: 'Source problem', body: ['What exact barrier are you reframing?', 'Which research finding is this HMW tied to?'] },
            { title: 'HMW question set', body: bullets(['How might we improve clarity?', 'How might we reduce effort?', 'How might we build trust?', 'How might we help users recover when they go wrong?']) },
            { title: 'Range check', body: bullets(['Is one prompt too narrow and already solution-biased?', 'Is one too broad to act on?', 'Which question opens the most useful design space?']) },
            { title: 'Promising directions', body: ['HMW:', 'What kinds of ideas it suggests:', 'Why it feels worth pursuing:'] },
            { title: 'Discarded reframes', body: ['HMW:', 'Why it was too vague, too narrow, or misaligned with evidence:'] },
            { title: 'Constraint reminder', body: bullets(['What must any future solution still respect?', 'What cannot be compromised while exploring ideas?']) },
          ],
        }),
      },
      {
        title: 'Success criteria',
        body: worksheet({
          purpose: 'Define what a good outcome looks like so the project can be judged by evidence instead of taste alone.',
          useWhen: ['before solution selection', 'before prototyping', 'when stakeholders are optimizing for different things'],
          gather: ['problem statement', 'project goals', 'class or business constraints', 'accessibility expectations'],
          leaveWith: ['user success signals', 'delivery constraints', 'accessibility standards', 'measurable checkpoints'],
          sections: [
            { title: 'User success', body: bullets(['What should users be able to do faster, more confidently, or with less confusion?', 'What observable behavior would prove improvement?']) },
            { title: 'Product or class success', body: bullets(['What outcome matters to the project beyond user ease?', 'What rubric, stakeholder goal, or strategic objective matters?']) },
            { title: 'Accessibility and inclusion', body: bullets(['What must be usable with keyboard, screen reader, zoom, and reduced precision?', 'What content or interaction risks exclusion?', 'Which WCAG-aligned checks must be met?']) },
            { title: 'Measures and proxies', body: ['Qualitative signals:', 'Quantitative signals:', 'What can be measured now versus later:'] },
            { title: 'Non-negotiables', body: bullets(['What should never be sacrificed for visual novelty or speed?', 'What would count as a regression even if the design looks better?']) },
            { title: 'Definition of done for this phase', body: ['What must be true before moving into the next phase?', 'What evidence is enough to continue?'] },
          ],
        }),
      },
      {
        title: 'Opportunity areas',
        body: worksheet({
          purpose: 'Group findings into a small set of strategic opportunity spaces that can guide ideation and prioritization.',
          useWhen: ['after synthesis', 'before selecting concepts', 'when the team has many findings but no hierarchy'],
          gather: ['insights', 'problem statement', 'success criteria'],
          leaveWith: ['ranked opportunity areas', 'evidence per opportunity', 'rationale for focus order'],
          sections: [
            { title: 'Opportunity list', body: ['Opportunity 1:', 'Opportunity 2:', 'Opportunity 3:'] },
            { title: 'Evidence for each opportunity', body: ['Related quote or behavior:', 'Who it affects:', 'How often it appears:', 'Why it matters:'] },
            { title: 'Impact versus effort', body: bullets(['Which opportunities would create the biggest user benefit?', 'Which ones are easiest to address first?', 'Which ones are important but probably later?']) },
            { title: 'Dependencies', body: bullets(['Does one opportunity depend on another being solved first?', 'Are there content, policy, or technical blockers?']) },
            { title: 'Priority decision', body: ['Priority order:', 'Reason for that order:', 'What gets deferred and why:'] },
          ],
        }),
      },
      {
        title: 'Design principles',
        body: worksheet({
          purpose: 'Establish a small set of principles that future concepts and screens must consistently follow.',
          useWhen: ['once the problem is defined', 'before detailed design work', 'when opinions are likely to drift'],
          gather: ['problem statement', 'success criteria', 'key research tensions'],
          leaveWith: ['3 to 5 design principles', 'examples of what each principle means', 'anti-principles to avoid'],
          sections: [
            { title: 'Principle list', body: ['Principle name:', 'One-sentence rule:', 'What it protects or optimizes for:'] },
            { title: 'Translate each principle into UI behavior', body: bullets(['How would this principle affect layout?', 'What does it mean for copy and labeling?', 'How should it change interaction feedback or state design?']) },
            { title: 'Tension handling', body: bullets(['Which principles may compete with each other?', 'How should tradeoffs be resolved when they conflict?']) },
            { title: 'Anti-principles', body: bullets(['What should the work deliberately avoid?', 'What patterns might look attractive but would violate the project’s direction?']) },
            { title: 'Review test', body: 'When reviewing a screen, ask: which principle does this screen clearly express, and where does it violate one?' },
          ],
        }),
      },
    ],
  },
  {
    key: 'moodboard',
    name: 'Moodboard',
    phase: 'Develop',
    summary: 'Collect visual direction, UI references, typography, color, and interaction patterns.',
    color: '#e58fb8',
    pages: [
      {
        title: 'Visual direction',
        body: worksheet({
          purpose: 'Define the emotional and stylistic territory before the interface becomes too concrete.',
          useWhen: ['after the problem is defined', 'before detailed UI exploration', 'when the product voice is unclear'],
          gather: ['reference images', 'brand constraints', 'platform context', 'audience expectations'],
          leaveWith: ['a visual thesis', 'color and type direction', 'interaction tone', 'clear boundaries on style'],
          sections: [
            { title: 'Desired feeling', body: bullets(['What should the interface feel like in 3 to 5 adjectives?', 'What emotional tone would be wrong for this project?']) },
            { title: 'Color direction', body: ['Primary palette idea:', 'Support colors:', 'Contrast and accessibility notes:', 'Places where restraint matters:'] },
            { title: 'Typography direction', body: ['Display tone:', 'Body readability needs:', 'Density expectations:', 'Any typographic references to study:'] },
            { title: 'Hierarchy and spacing', body: bullets(['Should the UI feel spacious, dense, editorial, operational, or quiet?', 'How much contrast should exist between primary and secondary content?']) },
            { title: 'Interaction feel', body: bullets(['Should interactions feel immediate, calm, tactile, formal, or playful?', 'What would over-animation look like here?']) },
            { title: 'Do and do not', body: ['Do:', 'Do not:'] },
          ],
        }),
      },
      {
        title: 'Reference notes',
        body: worksheet({
          purpose: 'Turn visual references into usable design learning instead of a loose pile of screenshots.',
          useWhen: ['while building a moodboard', 'when collecting UI inspiration', 'before borrowing visual patterns'],
          gather: ['screenshots, links, photos, and product examples'],
          leaveWith: ['annotated references', 'borrowable patterns', 'warnings about what not to copy'],
          sections: [
            { title: 'Reference details', body: ['Source:', 'Link or screenshot:', 'Feature or moment being studied:'] },
            { title: 'What works', body: bullets(['What specific detail is strong?', 'Why does it work in this context?', 'Does it support clarity, trust, rhythm, focus, or delight?']) },
            { title: 'What does not translate', body: bullets(['What only works because of another brand, scale, or audience?', 'What looks attractive but would be wrong for this project?']) },
            { title: 'How to adapt it', body: ['Pattern or idea to borrow:', 'How it should change for your project:', 'What guardrail keeps it from becoming imitation:'] },
            { title: 'Accessibility and platform check', body: bullets(['Would this still work with larger type, assistive tech, or poor lighting?', 'Does it fit iOS, Android, web, or desktop expectations?']) },
          ],
        }),
      },
      {
        title: 'UI inventory',
        body: worksheet({
          purpose: 'List the interface building blocks the product actually needs before styling them.',
          useWhen: ['before component design', 'before wireframes become high fidelity', 'when feature scope keeps expanding'],
          gather: ['core flows', 'task list', 'reference audit'],
          leaveWith: ['component inventory', 'state list', 'known content structures', 'complexity hotspots'],
          sections: [
            { title: 'Core components', body: bullets(['Navigation', 'Buttons', 'Inputs', 'Selections', 'Cards', 'Lists', 'Tables', 'Editors', 'Gallery or media blocks']) },
            { title: 'Content structures', body: ['What content repeats?', 'What content needs hierarchy?', 'What content can overflow or become long?'] },
            { title: 'State inventory', body: bullets(['Empty', 'Loading', 'Error', 'Success', 'Disabled', 'Draft', 'Archived']) },
            { title: 'Decision-heavy components', body: bullets(['Which components will need the most iteration?', 'Which ones are most tied to accessibility or system constraints?']) },
            { title: 'Component priority', body: ['Must design now:', 'Can be rough placeholders for now:', 'Can be inherited from an existing pattern:'] },
          ],
        }),
      },
      {
        title: 'Motion direction',
        body: worksheet({
          purpose: 'Define where motion improves clarity and where restraint is more appropriate.',
          useWhen: ['before prototyping motion', 'when interaction polish becomes a topic', 'before implementation handoff'],
          gather: ['reference clips', 'critical interaction moments', 'platform constraints'],
          leaveWith: ['motion principles', 'priority moments', 'restraint rules', 'implementation notes'],
          sections: [
            { title: 'Moments worth animating', body: bullets(['State changes', 'View transitions', 'Feedback after an action', 'Drag, sort, or gallery interactions']) },
            { title: 'Why motion is needed', body: bullets(['Does it explain change?', 'Does it reinforce hierarchy?', 'Does it improve perceived responsiveness?']) },
            { title: 'Motion references', body: ['Reference:', 'What is useful about it:', 'What to avoid copying exactly:'] },
            { title: 'Restraint rules', body: bullets(['Where should motion stay minimal?', 'Where would animation become decorative noise?', 'What should remain instant?']) },
            { title: 'Implementation reality', body: bullets(['What seems realistic to build?', 'What would be expensive for little gain?', 'What should degrade gracefully?']) },
          ],
        }),
      },
    ],
  },
  {
    key: 'ideation',
    name: 'Ideation',
    phase: 'Develop',
    summary: 'Generate, compare, and select possible solutions.',
    color: '#e9b765',
    pages: [
      {
        title: 'Idea log',
        body: worksheet({
          purpose: 'Capture concepts quickly while still tying them back to a real user need and tradeoff.',
          useWhen: ['during idea generation', 'after workshops', 'when exploring multiple directions'],
          gather: ['problem statement', 'HMW prompts', 'design principles'],
          leaveWith: ['a list of concepts', 'strengths and risks per concept', 'clear links to user needs'],
          sections: [
            { title: 'Concept name', body: ['Idea title:', 'One-sentence summary:'] },
            { title: 'Need addressed', body: ['Which user need or pain point does this respond to?', 'What part of the journey does it improve?'] },
            { title: 'What the concept does', body: bullets(['Describe the core interaction.', 'Call out the main value to the user.', 'Note what this concept intentionally does not solve.']) },
            { title: 'Strengths', body: bullets(['Why might this be strong for usability or clarity?', 'What could make it distinctive or compelling?']) },
            { title: 'Risks', body: bullets(['What could confuse users?', 'What might be expensive or hard to implement?', 'What accessibility issue might it introduce?']) },
            { title: 'Evidence check', body: ['What research finding supports this idea?', 'What part is still assumption?'] },
            { title: 'Next step', body: ['Should this be discarded, combined, or moved into wireframing? Why?'] },
          ],
        }),
      },
      {
        title: 'Concept selection',
        body: worksheet({
          purpose: 'Compare viable concepts with explicit criteria so selection is defensible.',
          useWhen: ['after ideation has produced several strong candidates', 'before committing to a wireframe direction'],
          gather: ['concepts to compare', 'success criteria', 'constraints'],
          leaveWith: ['a chosen direction', 'a comparison rationale', 'what was not chosen and why'],
          sections: [
            { title: 'Concepts being compared', body: ['Concept A:', 'Concept B:', 'Concept C:'] },
            { title: 'Selection criteria', body: bullets(['Usability', 'Clarity', 'Accessibility', 'Fit with design principles', 'Implementation effort', 'Differentiation']) },
            { title: 'Comparison notes', body: ['Where does each concept clearly win?', 'Where does each concept fail?', 'Which concept handles the hardest user moment best?'] },
            { title: 'Chosen direction', body: ['Selected concept or hybrid:', 'Why it wins:', 'What risks remain even after choosing it:'] },
            { title: 'Discarded concepts', body: ['Concept:', 'Why it was not selected:', 'Anything worth carrying forward from it:'] },
            { title: 'Proof needed next', body: bullets(['What must be tested in wireframes or prototypes before confidence is earned?', 'What assumption is still most fragile?']) },
          ],
        }),
      },
      {
        title: 'Crazy 8s recap',
        body: worksheet({
          purpose: 'Convert fast sketching output into actionable themes and next experiments.',
          useWhen: ['after a Crazy 8s or similar sketching sprint', 'after a workshop with many rough ideas'],
          gather: ['sketches', 'notes from the session', 'design principles'],
          leaveWith: ['strong ideas to keep', 'patterns across sketches', 'questions to refine in wireframes'],
          sections: [
            { title: 'Most promising sketches', body: bullets(['Which ideas deserve another pass?', 'What exactly made them promising?']) },
            { title: 'Unexpected ideas', body: bullets(['Which idea was surprising but worth keeping?', 'What assumption did it challenge?']) },
            { title: 'Repeated themes', body: bullets(['What patterns appeared across multiple sketches?', 'What interaction or layout ideas kept recurring?']) },
            { title: 'Weak or misleading directions', body: bullets(['Which sketches looked exciting but do not solve the right problem?', 'Which ones collapse under constraints?']) },
            { title: 'What to refine next', body: ['What should become a wireframe?', 'What should become a variant?', 'What should be dropped?'] },
          ],
        }),
      },
      {
        title: 'Decision matrix',
        body: worksheet({
          purpose: 'Score solution options against the criteria that actually matter for this project.',
          useWhen: ['when several concepts still seem viable', 'when the team is stuck in taste-based debate'],
          gather: ['concepts', 'selection criteria', 'weights if needed'],
          leaveWith: ['a scored comparison', 'a winner or hybrid', 'documented tradeoffs'],
          sections: [
            { title: 'Options', body: ['Option A:', 'Option B:', 'Option C:'] },
            { title: 'Criteria', body: bullets(['Usefulness', 'Ease of understanding', 'Accessibility', 'Effort to build', 'Strategic fit', 'Novelty only if it truly matters']) },
            { title: 'Weights', body: ['Which criteria matter most?', 'Should any criterion count more heavily? Why?'] },
            { title: 'Scoring table', body: ['Criterion | A | B | C', 'Add short notes explaining each score rather than numbers alone.'] },
            { title: 'Tradeoff summary', body: bullets(['What does the best option still sacrifice?', 'What should be merged from a lower-scoring option?']) },
            { title: 'Decision', body: ['Chosen direction:', 'Why this is the best current call:', 'What evidence would overturn this decision later?'] },
          ],
        }),
      },
    ],
  },
  {
    key: 'wireframes',
    name: 'Wireframes',
    phase: 'Develop',
    summary: 'Map flows, screens, layout decisions, and information architecture.',
    color: '#c79bff',
    pages: [
      {
        title: 'User flow',
        body: worksheet({
          purpose: 'Map the sequence of screens, decisions, and failure points before drawing interface detail.',
          useWhen: ['before producing detailed wireframes', 'when the task spans multiple screens or steps'],
          gather: ['problem statement', 'journey map', 'success criteria'],
          leaveWith: ['a clear flow', 'decision points', 'failure states', 'start and end conditions'],
          sections: [
            { title: 'Entry point', body: ['Where does the user begin?', 'What do they already know at this moment?', 'What motivation brought them here?'] },
            { title: 'Main path', body: bullets(['Step 1', 'Step 2', 'Step 3', 'Step 4']) },
            { title: 'Decision points', body: bullets(['Where can the user choose between paths?', 'Where can they back out, pause, or defer?']) },
            { title: 'Failure and recovery', body: bullets(['Where is the flow likely to break?', 'What should recovery look like?', 'Where should the user never hit a dead end?']) },
            { title: 'Completion states', body: ['Successful completion:', 'Partial completion:', 'Abandonment or blocked state:'] },
            { title: 'Questions before wireframing', body: bullets(['Which step still feels underdefined?', 'Which transition is most likely to confuse users?']) },
          ],
        }),
      },
      {
        title: 'Wireframe decisions',
        body: worksheet({
          purpose: 'Document why a screen is structured the way it is so layout decisions stay intentional.',
          useWhen: ['for each important screen or flow step', 'when comparing wireframe variants'],
          gather: ['user flow', 'design principles', 'content requirements'],
          leaveWith: ['screen purpose', 'hierarchy rationale', 'variant decisions', 'open validation questions'],
          sections: [
            { title: 'Screen summary', body: ['Screen or flow segment name:', 'Primary job of this screen:', 'What the user must notice first:'] },
            { title: 'Hierarchy choices', body: bullets(['What is primary versus secondary?', 'How are actions grouped?', 'What content is intentionally deferred or hidden?']) },
            { title: 'Layout rationale', body: bullets(['Why this structure instead of the alternatives?', 'How does the layout reduce effort or confusion?', 'What tradeoff did this layout make?']) },
            { title: 'Variant comparison', body: ['Variant A:', 'Variant B:', 'Which one seems stronger so far and why:'] },
            { title: 'Content and labels', body: bullets(['What labels need testing?', 'Where could copy become too long or vague?']) },
            { title: 'Questions to validate', body: bullets(['What should be tested before this becomes high fidelity?', 'What accessibility or edge-case concern remains unresolved?']) },
          ],
        }),
      },
      {
        title: 'Information architecture',
        body: worksheet({
          purpose: 'Define the structure, naming, and navigation model so the product feels mentally organized.',
          useWhen: ['before high-fidelity UI', 'when navigation is getting messy', 'when labels and structure need validation'],
          gather: ['feature list', 'user flow', 'research language', 'content inventory'],
          leaveWith: ['top-level structure', 'navigation logic', 'label candidates', 'known IA risks'],
          sections: [
            { title: 'Top-level structure', body: ['Main sections or modes:', 'Why these are the right top-level buckets:', 'What was excluded from top level:'] },
            { title: 'Navigation model', body: bullets(['How do users move between sections?', 'What is persistent versus contextual navigation?', 'Where should breadcrumbs, tabs, or drill-downs appear?']) },
            { title: 'Naming', body: bullets(['What labels are users most likely to understand?', 'Which internal or academic terms should be avoided?', 'What needs card-sort or label testing?']) },
            { title: 'Content placement', body: bullets(['What content belongs together?', 'What content should never compete on the same screen?']) },
            { title: 'Breakdown risks', body: bullets(['Where could users misfile, misread, or get lost?', 'What structure works on desktop but may fail on phone?']) },
          ],
        }),
      },
      {
        title: 'Edge cases',
        body: worksheet({
          purpose: 'Force the design to handle real-world states beyond the happy path.',
          useWhen: ['before prototype polish', 'before handoff', 'when the interface currently only works in ideal conditions'],
          gather: ['main flow', 'content extremes', 'error scenarios', 'role or permission differences'],
          leaveWith: ['empty, error, overflow, and role-based behavior plans'],
          sections: [
            { title: 'Empty states', body: ['No content yet:', 'First-time use:', 'No search results or filtered results:'] },
            { title: 'Error states', body: bullets(['Network or save failure', 'Validation errors', 'Permission errors', 'Unavailable dependency']) },
            { title: 'Long-tail content', body: bullets(['Too much text', 'Too many items', 'Missing image or metadata', 'Long names or labels']) },
            { title: 'Role or permission differences', body: ['Different user types:', 'What changes by role:', 'What must stay consistent regardless of role:'] },
            { title: 'Recovery expectations', body: bullets(['How does the user get unstuck?', 'Where should retry be possible?', 'Where should the system preserve their work?']) },
            { title: 'Accessibility stress test', body: bullets(['What happens at larger text sizes?', 'How does focus move?', 'Does meaning depend only on color or motion?']) },
          ],
        }),
      },
    ],
  },
  {
    key: 'prototype',
    name: 'Prototype',
    phase: 'Develop',
    summary: 'Track prototype links, assumptions, interaction decisions, and demo readiness.',
    color: '#7fd899',
    pages: [
      {
        title: 'Prototype links',
        body: worksheet({
          purpose: 'Keep the current prototype sources, recordings, and limitations in one reliable place.',
          useWhen: ['as soon as a prototype exists', 'before critique', 'before testing or handoff'],
          gather: ['Figma links', 'coded builds', 'recordings', 'notes on what is fake'],
          leaveWith: ['canonical links', 'version context', 'known limitations', 'next review focus'],
          sections: [
            { title: 'Primary files', body: ['Design file:', 'Interactive prototype:', 'Coded build or branch:', 'Recording or walkthrough:'] },
            { title: 'Scope of this prototype', body: bullets(['What flow or concept does it cover?', 'What is intentionally not represented yet?']) },
            { title: 'Known limitations', body: bullets(['Fake data', 'Incomplete edge cases', 'Non-working interactions', 'Missing accessibility support']) },
            { title: 'What should be reviewed here', body: ['Which parts are ready for critique?', 'Which parts are too rough to over-interpret?'] },
            { title: 'Version notes', body: ['What changed since the last review?', 'Why those changes were made:'] },
          ],
        }),
      },
      {
        title: 'Interaction notes',
        body: worksheet({
          purpose: 'Document the behavioral rules of the prototype so the interaction model is explicit.',
          useWhen: ['while refining screens', 'before testing', 'before implementation handoff'],
          gather: ['prototype', 'design principles', 'edge-case notes'],
          leaveWith: ['interaction rules', 'state behavior', 'motion intent', 'recovery behavior'],
          sections: [
            { title: 'Critical interactions', body: bullets(['What moments must feel obvious?', 'What actions are highest risk for user confusion?']) },
            { title: 'State behavior', body: ['Loading:', 'Success:', 'Error:', 'Empty:', 'Draft or unsaved:'] },
            { title: 'Feedback', body: bullets(['What feedback appears after a successful action?', 'What feedback appears after a failed action?', 'Where is feedback subtle versus prominent?']) },
            { title: 'Motion and transition intent', body: bullets(['What transitions help orientation?', 'What should be instant?', 'Where would motion create noise?']) },
            { title: 'Error recovery', body: bullets(['How does the interface help the user recover?', 'What work is preserved?', 'Where is retry available?']) },
            { title: 'Questions before build', body: bullets(['What behavior could engineering misread?', 'Which interactions need a stronger spec?']) },
          ],
        }),
      },
      {
        title: 'Prototype checklist',
        body: worksheet({
          purpose: 'Make sure the prototype is robust enough for critique, testing, or implementation review.',
          useWhen: ['before critique', 'before usability testing', 'before code handoff'],
          gather: ['prototype links', 'user flow', 'edge-case notes'],
          leaveWith: ['a readiness check', 'remaining gaps', 'next fixes before sharing'],
          sections: [
            { title: 'Critical flow coverage', body: bullets(['Does the main path work end to end?', 'Are alternate paths represented where needed?', 'Can the user recover from failure?']) },
            { title: 'State coverage', body: bullets(['Empty', 'Loading', 'Error', 'Success', 'Validation', 'Long content']) },
            { title: 'Accessibility pass', body: bullets(['Readable type', 'focus visibility', 'meaning not dependent only on color', 'sufficient contrast', 'keyboard logic']) },
            { title: 'Content quality', body: bullets(['Does placeholder copy hide real problems?', 'Are labels, errors, and CTAs specific enough?', 'Is any screen over-explained instead of well-structured?']) },
            { title: 'Demo and critique readiness', body: ['What still needs polish?', 'What is acceptable to leave rough?', 'What caveat should be stated when presenting?'] },
          ],
        }),
      },
      {
        title: 'Handoff notes',
        body: worksheet({
          purpose: 'Preserve the design intent that is easiest to lose when the work moves into build or future revisions.',
          useWhen: ['before engineering handoff', 'before stepping away from the project', 'after key prototype decisions'],
          gather: ['prototype', 'interaction notes', 'component decisions'],
          leaveWith: ['behavior rules', 'reusable component notes', 'tokens or measurements', 'known compromises'],
          sections: [
            { title: 'Reusable pieces', body: ['What components repeat?', 'What patterns should become shared behavior?'] },
            { title: 'Behavior rules', body: bullets(['What must happen on save, error, selection, hover, focus, upload, or deletion?', 'Which behaviors are non-obvious but important?']) },
            { title: 'Measurements and tokens', body: bullets(['Any spacing, type, or color decisions that should stay stable?', 'Any states that depend on precise rhythm or density?']) },
            { title: 'Accessibility expectations', body: bullets(['What should never be lost in implementation?', 'What fallback behavior matters if a polished effect is cut?']) },
            { title: 'Known compromises', body: ['What is intentionally unresolved?', 'What should be revisited after the first build or next testing round?'] },
          ],
        }),
      },
    ],
  },
  {
    key: 'testing',
    name: 'Usability Testing',
    phase: 'Deliver',
    summary: 'Plan sessions, capture feedback, and separate observed behavior from opinions.',
    color: '#ff6c61',
    pages: [
      {
        title: 'Test plan',
        body: worksheet({
          purpose: 'Design a usability test around concrete learning goals instead of generic feedback collection.',
          useWhen: ['before running sessions', 'before hallway tests or formal usability rounds'],
          gather: ['prototype link', 'top risks', 'participant criteria'],
          leaveWith: ['learning goals', 'task script', 'participant plan', 'success and failure signals'],
          sections: [
            { title: 'Learning goals', body: bullets(['What are you trying to learn from this round?', 'Which assumptions are most at risk?', 'What should this round explicitly not try to answer?']) },
            { title: 'Participants', body: ['Who fits this round?', 'Why are they the right audience?', 'How many participants are enough for this question?'] },
            { title: 'Tasks to attempt', body: bullets(['Write realistic scenarios, not instructions that reveal the answer.', 'List the top 3 to 5 tasks.']) },
            { title: 'Moderator script', body: ['Opening context:', 'Instructions before the first task:', 'Prompts for follow-up without leading:', 'Closing questions:'] },
            { title: 'What success looks like', body: bullets(['What behavior would indicate the design is working?', 'What breakdown would be especially concerning?']) },
            { title: 'Logistics', body: ['Prototype or device needed:', 'Recording plan:', 'Consent or incentive notes:'] },
          ],
        }),
      },
      {
        title: 'Testing notes',
        body: worksheet({
          purpose: 'Capture one participant session in a disciplined format that prioritizes observed behavior over opinion.',
          useWhen: ['during or immediately after a test session'],
          gather: ['test tasks', 'participant details', 'prototype'],
          leaveWith: ['task outcomes', 'behavior notes', 'quotes', 'issues to synthesize later'],
          sections: [
            { title: 'Participant snapshot', body: ['Name or code:', 'Relevant background:', 'Why they fit the audience:'] },
            { title: 'Task outcomes', body: ['Task 1 result:', 'Task 2 result:', 'Task 3 result:'] },
            { title: 'Observed behavior', body: bullets(['What did they do without prompting?', 'Where did they hesitate, backtrack, or misread?', 'What did they ignore entirely?']) },
            { title: 'Direct quotes', body: bullets(['Capture exact wording.', 'Mark any quote that reveals the user’s mental model.']) },
            { title: 'Breakdowns', body: ['Issue:', 'Where it happened:', 'Severity:', 'Any recovery or workaround attempted:'] },
            { title: 'Interpretation after session', body: bullets(['What likely caused the breakdown?', 'Is this participant-specific or a repeated pattern candidate?', 'What should be watched in the next session?']) },
          ],
        }),
      },
      {
        title: 'Findings',
        body: worksheet({
          purpose: 'Synthesize testing into prioritized findings with clear evidence and next actions.',
          useWhen: ['after several test sessions', 'before iteration planning'],
          gather: ['testing notes', 'clips, quotes, or recordings', 'task completion patterns'],
          leaveWith: ['prioritized findings', 'severity ratings', 'evidence-backed recommendations'],
          sections: [
            { title: 'Finding statement', body: ['State the issue or opportunity clearly in one sentence.'] },
            { title: 'Evidence', body: ['Observed behavior:', 'Quote:', 'How many participants were affected:', 'Task(s) involved:'] },
            { title: 'Severity', body: bullets(['Low: friction but recoverable', 'Medium: slows or confuses multiple users', 'High: blocks success or breaks trust']) },
            { title: 'Likely cause', body: ['What about the design may be causing this?'] },
            { title: 'Recommendation', body: ['What should change next?', 'Is the recommendation a layout, content, navigation, feedback, or system change?'] },
            { title: 'Confidence level', body: bullets(['How strong is the evidence?', 'What would strengthen or weaken this conclusion?']) },
          ],
        }),
      },
      {
        title: 'Recruitment tracker',
        body: worksheet({
          purpose: 'Track recruiting so testing stays aligned with the real audience and does not become improvised.',
          useWhen: ['before and during scheduling', 'when multiple sessions are being coordinated'],
          gather: ['target audience criteria', 'outreach list', 'session times'],
          leaveWith: ['participant status', 'fit notes', 'logistics readiness'],
          sections: [
            { title: 'Participant list', body: ['Name:', 'Contact route:', 'Relevant segment:'] },
            { title: 'Fit check', body: ['Why they match the audience:', 'What characteristic makes them useful for this round:'] },
            { title: 'Status', body: bullets(['Invited', 'Scheduled', 'Completed', 'No response', 'Declined']) },
            { title: 'Logistics', body: ['Session time:', 'Incentive:', 'Special setup or accommodation needed:'] },
            { title: 'Coverage gaps', body: bullets(['Which audience segments are still missing?', 'Is the current sample too narrow or too convenient?']) },
          ],
        }),
      },
      {
        title: 'Issue tracker',
        body: worksheet({
          purpose: 'Maintain a live backlog of issues found through testing so fixes can be prioritized and owned.',
          useWhen: ['after synthesis begins', 'between test rounds', 'during iteration planning'],
          gather: ['findings', 'severity notes', 'team ownership'],
          leaveWith: ['issue list', 'frequency and severity data', 'owners and next actions'],
          sections: [
            { title: 'Issue record', body: ['Issue:', 'Where it happens:', 'Who it affects:'] },
            { title: 'Frequency and severity', body: ['How often did it appear?', 'Severity:', 'What makes it serious or minor?'] },
            { title: 'Evidence', body: ['Quote or behavior:', 'Session references:', 'Any screenshot or clip:'] },
            { title: 'Proposed fix', body: ['What change should be attempted next?', 'Why that change might help:'] },
            { title: 'Owner and timing', body: ['Owner:', 'Next review date:', 'Status: open, testing, resolved, deferred'] },
          ],
        }),
      },
    ],
  },
  {
    key: 'iterations',
    name: 'Iterations',
    phase: 'Deliver',
    summary: 'Record what changed, why it changed, and what evidence drove the decision.',
    color: '#6fcfd6',
    pages: [
      {
        title: 'Iteration log',
        body: worksheet({
          purpose: 'Track major design changes so the project keeps a visible chain between evidence and revision.',
          useWhen: ['after critique', 'after testing', 'after any meaningful design revision'],
          gather: ['previous design state', 'feedback or evidence', 'new prototype state'],
          leaveWith: ['change record', 'reason for change', 'before/after notes', 'what to monitor next'],
          sections: [
            { title: 'What changed', body: ['Describe the change clearly and specifically.'] },
            { title: 'Why it changed', body: bullets(['What evidence triggered the revision?', 'Was this from testing, critique, implementation reality, or strategic refocus?']) },
            { title: 'Before and after', body: ['Before:', 'After:', 'Why the new version is stronger:'] },
            { title: 'Tradeoff introduced', body: ['What did this change improve?', 'What did it make harder, more complex, or less flexible?'] },
            { title: 'What to watch next', body: ['What should be tested or reviewed after this change?'] },
          ],
        }),
      },
      {
        title: 'Open issues',
        body: worksheet({
          purpose: 'Keep unresolved design problems visible so they do not disappear between critique, testing, and implementation.',
          useWhen: ['at the end of a sprint or review', 'before handoff', 'when the team needs a clear backlog'],
          gather: ['testing findings', 'critique notes', 'implementation constraints'],
          leaveWith: ['issue backlog', 'impact assessment', 'owners', 'next actions'],
          sections: [
            { title: 'Issue', body: ['Describe the unresolved problem.'] },
            { title: 'Impact', body: ['Who is affected?', 'How serious is it?', 'What part of the experience suffers?'] },
            { title: 'Why it is still open', body: bullets(['Needs more evidence', 'Needs a design decision', 'Blocked by time or implementation', 'Lower priority for now']) },
            { title: 'Owner', body: ['Who should move this forward?'] },
            { title: 'Next step', body: ['What exactly should happen next?', 'When should it be revisited?'] },
          ],
        }),
      },
      {
        title: 'Decision history',
        body: worksheet({
          purpose: 'Record major design decisions so future revisions can understand the reasoning instead of re-debating from scratch.',
          useWhen: ['after an important product or design choice', 'when several stakeholders are involved'],
          gather: ['context', 'options considered', 'evidence used'],
          leaveWith: ['decision record', 'tradeoffs', 'conditions for reopening'],
          sections: [
            { title: 'Decision', body: ['What was decided?'] },
            { title: 'Trigger', body: ['What forced the decision now?'] },
            { title: 'Options considered', body: ['Option 1:', 'Option 2:', 'Option 3:'] },
            { title: 'Reasoning', body: bullets(['What evidence supported the choice?', 'Which principle or criterion carried the most weight?']) },
            { title: 'Tradeoff', body: ['What was gained?', 'What was sacrificed?'] },
            { title: 'Revisit condition', body: ['What new evidence or context would justify reopening this decision?'] },
          ],
        }),
      },
      {
        title: 'Hypothesis log',
        body: worksheet({
          purpose: 'Tie each change to a hypothesis so iteration quality can be judged by outcome rather than activity.',
          useWhen: ['before testing a revision', 'when making targeted changes', 'during ongoing iteration rounds'],
          gather: ['issue or opportunity', 'planned change', 'signal to monitor'],
          leaveWith: ['hypothesis statement', 'linked design change', 'success signal', 'outcome note'],
          sections: [
            { title: 'Hypothesis', body: ['If we change X, then Y should improve because Z.'] },
            { title: 'Change tied to it', body: ['What exact design change is being made?'] },
            { title: 'Signal to watch', body: bullets(['What behavior, metric, or quote would show improvement?', 'What would count as disconfirmation?']) },
            { title: 'Test context', body: ['Where will this be observed?', 'In critique, usability testing, live use, or heuristic review?'] },
            { title: 'Outcome', body: ['What happened?', 'Did the hypothesis hold?', 'What should happen next?'] },
          ],
        }),
      },
    ],
  },
  {
    key: 'presentation',
    name: 'Presentation',
    phase: 'Deliver',
    summary: 'Prepare critique, class presentation, and final submission material.',
    color: '#e9b765',
    pages: [
      {
        title: 'Presentation outline',
        body: worksheet({
          purpose: 'Shape the project story so presentation time is spent on insight and decisions, not artifact dumping.',
          useWhen: ['before class critique', 'before final presentation', 'before portfolio narration'],
          gather: ['project artifacts', 'findings', 'iterations', 'outcomes'],
          leaveWith: ['story structure', 'key talking points', 'evidence sequence', 'weak spots to strengthen'],
          sections: [
            { title: 'Context', body: ['Who was the project for?', 'What situation or opportunity framed it?', 'What constraints mattered?'] },
            { title: 'Problem', body: ['What was the core problem?', 'Why was it worth solving?'] },
            { title: 'Process', body: bullets(['Which steps actually changed the direction of the work?', 'What should be shown briefly versus deeply?']) },
            { title: 'Solution', body: ['What did you design?', 'What makes the final direction coherent?'] },
            { title: 'Evidence', body: bullets(['What research, testing, or critique proves the work got stronger?', 'What visual proof should be shown?']) },
            { title: 'Reflection', body: ['What did you learn?', 'What would you refine next if given more time?'] },
          ],
        }),
      },
      {
        title: 'Critique notes',
        body: worksheet({
          purpose: 'Capture critique in a usable format so feedback becomes decisions rather than a pile of comments.',
          useWhen: ['during or immediately after critique', 'after instructor or peer review'],
          gather: ['feedback notes', 'screens under review', 'project goals'],
          leaveWith: ['grouped feedback themes', 'what to act on', 'what to question or ignore'],
          sections: [
            { title: 'Raw feedback', body: ['Capture comments as directly as possible before interpreting them.'] },
            { title: 'Themes', body: bullets(['Clarity', 'Flow', 'Visual hierarchy', 'Content', 'Accessibility', 'Feasibility']) },
            { title: 'Signal versus noise', body: bullets(['What feedback aligns with research or testing?', 'What is taste-based and should not automatically drive change?']) },
            { title: 'Decision', body: ['What will you act on?', 'What will you explicitly not act on and why?'] },
            { title: 'Follow-up', body: ['What needs revision now?', 'What needs more evidence first?'] },
          ],
        }),
      },
      {
        title: 'Slide plan',
        body: worksheet({
          purpose: 'Design the presentation deck as a sequence of purposeful slides rather than a loose visual dump.',
          useWhen: ['before building or refining slides'],
          gather: ['presentation outline', 'artifacts', 'time limit'],
          leaveWith: ['slide sequence', 'key visual per slide', 'speaker notes', 'known weak transitions'],
          sections: [
            { title: 'Slide sequence', body: bullets(['Slide 1: setup', 'Slide 2: problem', 'Slide 3: research', 'Slide 4: direction', 'Slide 5: solution', 'Slide 6: evidence', 'Slide 7: reflection']) },
            { title: 'Key visual for each slide', body: ['What image, frame, diagram, or quote carries each slide?'] },
            { title: 'Speaker note', body: ['What is the one thing you need to say on each slide? Keep it brief.'] },
            { title: 'Timing check', body: bullets(['Which slides are likely to run too long?', 'Which slides can be compressed?']) },
            { title: 'Story gaps', body: bullets(['Where might the logic feel weak?', 'Which slide needs stronger evidence or a better visual?']) },
          ],
        }),
      },
      {
        title: 'Submission checklist',
        body: worksheet({
          purpose: 'Reduce last-minute chaos by making deliverables, exports, and quality checks explicit.',
          useWhen: ['before final submission', 'before critique deadlines', 'before portfolio publishing'],
          gather: ['rubric or requirements', 'all exportable assets', 'links'],
          leaveWith: ['a complete deliverable list', 'quality pass', 'remaining risks before deadline'],
          sections: [
            { title: 'Required files', body: bullets(['Deck', 'Prototype link', 'Case study or report', 'Assets', 'Any source files or exports']) },
            { title: 'Export status', body: ['Ready:', 'Needs revision:', 'Missing:'] },
            { title: 'Quality check', body: bullets(['Typography', 'Spelling', 'Link validity', 'Image quality', 'Consistent naming', 'Readable contrast']) },
            { title: 'Submission packaging', body: bullets(['Do file names make sense?', 'Is there anything the evaluator will not know how to open?', 'Are links permission-safe?']) },
            { title: 'Deadline buffer', body: ['What still needs time before submission?', 'What is the contingency plan if something slips?'] },
          ],
        }),
      },
    ],
  },
  {
    key: 'case-study',
    name: 'Case Study',
    phase: 'Deliver',
    summary: 'Turn the project into a portfolio-ready narrative while the work is still fresh.',
    color: '#9aa6ff',
    pages: [
      {
        title: 'Case study draft',
        body: worksheet({
          purpose: 'Convert the project into a portfolio-ready narrative that shows judgment, not just output.',
          useWhen: ['after the project direction is stable', 'before portfolio publishing', 'while details are still fresh'],
          gather: ['project timeline', 'artifacts', 'findings', 'iterations', 'outcomes'],
          leaveWith: ['a draft story', 'clear role and constraints', 'key decisions', 'outcome and reflection'],
          sections: [
            { title: 'Project setup', body: ['What was the project?', 'Who was it for?', 'What context or class framed it?'] },
            { title: 'Problem', body: ['What challenge needed solving?', 'Why was it hard or worth solving?'] },
            { title: 'Role and contribution', body: ['What did you personally own?', 'What did collaborators own?'] },
            { title: 'Constraints', body: bullets(['Time', 'scope', 'stakeholder limits', 'technical limits', 'research access']) },
            { title: 'Process highlights', body: bullets(['Which steps meaningfully changed the work?', 'What should be skipped because it adds noise, not insight?']) },
            { title: 'Key decisions', body: ['Decision:', 'Why it mattered:', 'What evidence supported it:'] },
            { title: 'Outcome', body: ['What improved?', 'What evidence supports the claim?', 'What remains unresolved?'] },
            { title: 'Reflection', body: ['What did you learn?', 'What would you change next time?'] },
          ],
        }),
      },
      {
        title: 'Portfolio assets',
        body: worksheet({
          purpose: 'Curate the visuals that will carry the case study without overwhelming the reader.',
          useWhen: ['while assembling a portfolio page or PDF', 'when choosing screenshots and process artifacts'],
          gather: ['all candidate visuals', 'case study outline', 'before/after material'],
          leaveWith: ['hero asset', 'essential screens', 'process evidence', 'caption plan'],
          sections: [
            { title: 'Hero asset', body: ['Which image or frame best represents the project at a glance?', 'Why is it strong enough to lead?'] },
            { title: 'Essential screens', body: bullets(['Which screens are necessary to understand the solution?', 'Which screens are redundant and can be cut?']) },
            { title: 'Process assets', body: bullets(['Research artifact', 'Sketch or wireframe', 'Prototype frame', 'Testing evidence', 'Iteration comparison']) },
            { title: 'Before and after', body: ['What pair best shows improvement?', 'What caption makes the improvement obvious?'] },
            { title: 'Caption plan', body: bullets(['What does each asset need explained?', 'Where should the image speak for itself?']) },
          ],
        }),
      },
      {
        title: 'Narrative arc',
        body: worksheet({
          purpose: 'Make the case study read like a coherent story with tension, movement, and resolution.',
          useWhen: ['while drafting the final case study', 'when the case study feels flat or list-like'],
          gather: ['case study draft', 'key decisions', 'turning points'],
          leaveWith: ['opening hook', 'tension points', 'turning moments', 'strong ending'],
          sections: [
            { title: 'Opening hook', body: ['What makes the reader care immediately?', 'What fact, challenge, or contradiction opens the story well?'] },
            { title: 'Tension', body: ['What made this project difficult, uncertain, or constrained?', 'Where was the real design challenge?'] },
            { title: 'Turning points', body: bullets(['What moment changed the direction?', 'What evidence caused a pivot?', 'What design decision clarified the solution?']) },
            { title: 'Ending', body: ['What should the reader remember?', 'What does the ending say about your design judgment?'] },
            { title: 'What to cut', body: bullets(['What content is process theater rather than meaningful story?', 'What artifacts add volume but not insight?']) },
          ],
        }),
      },
      {
        title: 'Evidence bank',
        body: worksheet({
          purpose: 'Collect every usable proof point so the case study can make strong claims without bluffing.',
          useWhen: ['while drafting presentation or portfolio material', 'before claiming impact or improvement'],
          gather: ['metrics', 'quotes', 'screenshots', 'findings', 'critique notes'],
          leaveWith: ['quantitative evidence', 'qualitative evidence', 'visual proof', 'a list of claims to avoid'],
          sections: [
            { title: 'Quantitative evidence', body: ['Task completion:', 'Time saved:', 'Error reduction:', 'Survey or rubric scores:', 'Any counts or trend data:'] },
            { title: 'Qualitative evidence', body: ['User quotes:', 'Observed behaviors:', 'Critique comments worth citing:', 'Stakeholder reactions with context:'] },
            { title: 'Visual proof', body: bullets(['Screenshots that show change', 'Before/after comparisons', 'Research artifacts', 'Testing clips or stills']) },
            { title: 'Claim check', body: bullets(['What can be said confidently?', 'What would be overstating the evidence?', 'What needs softer language?']) },
            { title: 'Citation map', body: ['For each major claim, point to the asset, quote, or metric that supports it.'] },
          ],
        }),
      },
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
