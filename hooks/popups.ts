export interface InfoPopupDef {
  title: string;
  body: string[];
}

export const TIP_POS: Record<string, { x: number; y: number }> = {
  microhire: { x: 167, y: 525 },
  "not-contract": { x: 168, y: 560 },
  "not-grant": { x: 187, y: 620 },
  "reverse-grant": { x: 177, y: 670 },
  "constraint-reservoir": { x: 276, y: 476 },
  "reflex-constraints": { x: 276, y: 615 },
  "rc-assembly": { x: 276, y: 918 },
  reserves: { x: 701, y: 713 },
  stream: { x: 1341, y: 1217 },
};

export const POPUPS: Record<string, InfoPopupDef> = {
  microhire: {
    title: "Microhire Agents & Humans",
    body: [
      "Start with operations attaching a hire to responsibilities, because that's where the world's changed.",
      "A regular hire, same as you’d find anywhere, looks like a person, talks like a person, costs like one too. Or a role, a salary, a job title, as you like it. Rush past that, or read it again. What’s missing?",
      "Could be nothing much, really. Might cost a lot more than you want to spend.",
      "\"Guhmorfloping wane tro yi ghumyoriflop.\"",
      "In old work, boss says sort it out, you sort it, quickish, cheapish, for show, move on.",
      "Can you get away with not knowing what it means? Really? When?",
      "*  *  *",
      "Suddenly a new fraction of work appears. **Say it well enough and a bundled fraction of work can get you paid almost instantly, now.**",
      "Before: words are just words. make more of them, make less, get paid either way.",
      "After: you can operate machines through words. but please, choose your words wisely.",
      "That same fraction can be worthless somewhere else. That same worker, irrelevant five minutes later, without you losing more sleep wondering what agent gibberish means.",
    ],
  },
  "not-contract": {
    title: "Why: not a contract?",
    body: [
      "You said you would do it. They said they would pay. You both meant it.",
      "Then something changed.",
      "No clauses broken yet. Or maybe.",
      "Contracts exist for a reason: to stop reprisals from getting nasty. Resolve enough future conflict now that no one has to carry all of it everywhere, looking over your shoulder forever.",
      "What happens when they don't?",
    ],
  },
  "not-grant": {
    title: "Why: not a grant?",
    body: [
      "You can describe a problem, even if it takes hard work in a short time to do it well. ",
      "Work supplied with money by grants, whichever side you're on, does a lot with little changes in language. Write many words. Write some more. Keep going. Structure, revise, cross your fingers that what you've said resolves intended funding and delivery.",
      "Specific aims. Budget lines. Roles. Talent. Milestones. Deliverables. Review. Score. Revise. Resubmit.",
      "What grants did was spend scarce human judgement before cheap machine work had produced evidence good judgement can't happen without.",
      "A proposal can now cost more to evaluate than parts of it cost to falsify with agents.",
      "So if grants are working less and less, for whichever side of the money you're on what do we do?",
    ],
  },
  "reverse-grant": {
    title: "Why: not a reverse grant?",
    body: [
      "You don’t apply for their money. They apply to give you money.",
      "That is tempting because the asking flips. They have to find you, approach you, say what they’re offering, and make taking it worth your while. You can refuse it, change the amount, change the terms, or ask for something other than money.",
      "What’s wrong with it:",
      "It still starts by resolving the thing as a grant.",
      "The asking reversed. The grant did not.",
      "It still wants an amount, a reason for the transfer, terms around the transfer, and enough settled in advance for the transfer to happen. Once those are set, later changes push against what was already resolved.",
      "So “reverse grant” gets at something real and useful: make the grant apply to you.",
      "But that reversal stops too early.",
    ],
  },
  "constraint-reservoir": {
    title: "Constraint  Reservoir",
    body: [
      "Push hard enough on a hard problem and it starts coming apart.",
      "A constraint is that thing that keeps on not giving. Finding new ways to never yield. Winning at everyone's expense after the smartest people ever, all the money in the world, and endless attacks already had their turn, after turn, after turn. Constraints aren't nice to be around.",
      "Could be narrow enough to sit inside ten lines of code. Not the most interesting constraint though, is it?",
      "A reservoir ... is just a reservoir.",
      "Huh?",
    ],
  },
  "reflex-constraints": {
    title: "Reflex Constraints",
    body: [
      "Machines made tiny, portable, natural language based, and powered by thorniest knots around?   An almost clockwork intricate little mechanism, spring loaded and prewound?   A vendetta, huh?   Not really, but they do run for generations.",
    ],
  },
  "rc-assembly": {
    title: "RC Assembly",
    body: [
      "Half-finished work, spare compute, seven useful minutes, an agent holding a contradiction, uncommitted money, a room with the right machine already running: zero declare a role before they can change each other. ",
      "What happens between them changes what can happen next. A capability that had nowhere to land becomes useful. Two efforts that looked unrelated start changing each other.",
      "Play it back from what changed.",
      "Before AI transformation, know this:",
      "How do you make more with what you already have?",
      "Cheap here. Expensive there.",
      "A capability can be so ordinary from where you stand that you stop pricing it at all. Somewhere else, getting the same reach can cost money, time, access, people, or machinery you already have.",
      "Who knows both prices?",
      "Usually, nobody.",
      "And the cheap side is supposed to announce itself?",
      "Why would it?",
      "Exactly.",
      "How many of those are sitting around?",
    ],
  },
  reserves: {
    title: "Reserves",
    body: [
      "It’s the act, the resulting state, and the thing held back.",
      "A restaurant can take a table out of general circulation for a reservation without selling the table or the diner owning the restaurant.",
      "Now the listing runs itself. Wait, think about it. A little runner can sit inside any listing, as software, in any user facing surface, and ... do what?",
      "Code? Yeah.",
      "And then what, sit there admiring the code? Make the image. Cut the video. Send the message. Buy the thing. Wait — it can buy things? Why not? Call another model. Wake another runner. Nothing worth doing yet? Fine. Watch. Come back when that changes.",
      "But, there's a problem. It's obvious: Batteries not included.",
      "If only there was a way to reserve and release capacity to run at constraints until their not so unresolved anymore.",
    ],
  },
  stream: {
    title: "Readings & Screenings",
    body: [
      "Half-finished work, spare compute, seven useful minutes, an agent holding a contradiction, uncommitted money, a room with the right machine already running: zero declare a role before they can change each other. ",
      "What happens between them changes what can happen next. A capability that had nowhere to land becomes useful. Two efforts that looked unrelated start changing each other.",
      "Play it back from what changed.",
      "Before AI transformation, know this:",
      "How do you make more with what you already have?",
      "Cheap here. Expensive there.",
      "A capability can be so ordinary from where you stand that you stop pricing it at all. Somewhere else, getting the same reach can cost money, time, access, people, or machinery you already have.",
      "Who knows both prices?",
      "Usually, nobody.",
      "And the cheap side is supposed to announce itself?",
      "Why would it?",
      "Exactly.",
      "How many of those are sitting around?",
    ],
  },
};
