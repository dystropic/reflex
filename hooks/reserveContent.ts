export interface ReserveSeg {
  t: string;
  c?: "gray" | "cyan" | "yellow";
  href?: string;
  action?: "reprise" | "reverb" | "attack";
}

export const ATTACK_LINES: ReserveSeg[][] = [
  [{ t: "[attack] ", c: "gray" }, { t: "-" }, { t: " onset." }],
  [{ t: "The leading edge of a signal: how it rises from zero into the envelope of available space." }],
];

export const REVERB_LINES: ReserveSeg[][] = [
  [
    { t: "[reverb loops] ", c: "gray" },
    { t: "-" },
    { t: " A return re-enters a system that'ss already changed since it left." },
  ],
];

export const REPRISE_LINES: ReserveSeg[][] = [
  [
    { t: "[reprise]", c: "gray" },
    { t: " - attack constraints again, updated by backpropagated " },
    { t: "[reverb loops]", c: "cyan", action: "reverb" },
    { t: "." },
  ],
  [{ t: "Nothing in a reflex just \"runs once\". " }],
  [{ t: "There's a word for that in system mechanics, and music. Multiple words, ack... " }],
  [
    { t: "An " },
    { t: "[attack]", c: "cyan", action: "attack" },
    {
      t: " comes first: onset. Repeat the onset and the response doesn't repeat with it. The first pass is still decaying, resonating, buffering, returning while the constraint changes under it. Wavelike. Not replaying unless you've made reservations.   > Want to replay?",
    },
  ],
  [{ t: "[1] keep buffer capacity on standby" }],
  [{ t: "[2] back to repo stars & issues" }],
  [{ t: "[3] watch readings & screenings" }],
];

export interface ReserveSection {
  id: string;
  header: ReserveSeg[];
  lines: ReserveSeg[][];
}

export interface ReserveDoc {
  subtitle: string;
  link?: string;
  sections: ReserveSection[];
}

const attractorsFor = (repo: string): ReserveSection => ({
  id: "attractors",
  header: [{ t: "[attractors]", c: "yellow" }],
  lines: [
    [{ t: " · Every spec meets a model that swears it understands — fluently. " }],
    [
      { t: "And that's why we have " },
      { t: "[issues]", c: "cyan", href: `${repo}/issues` },
      { t: "." },
    ],
    [{ t: " · Stargazer, stargazer, sauce me a " }],
    [{ t: "..." }, { t: "[star]", c: "cyan", href: repo }, { t: "?" }],
    [
      { t: " · " },
      { t: "[Fork]", c: "cyan", href: repo },
      { t: " it, then you twerk it. " },
    ],
    [{ t: "Ti esrever dna ti pilf, nwod gniht ym tup" }],
    [
      { t: " · Already fixed, in " },
      { t: "[PR]", c: "cyan", href: `${repo}/pulls` },
      { t: "? " },
    ],
    [
      { t: " · " },
      { t: "[propose]", c: "cyan", href: `${repo}/issues` },
      { t: " a new attractor on the repo" },
    ],
  ],
});

const propsWithFile = (repo: string): ReserveSection => ({
  id: "props",
  header: [{ t: "[props]", c: "yellow" }],
  lines: [
    [
      { t: " · The " },
      { t: "[file]", c: "cyan", href: `${repo}/blob/main/phd_standard.phd.md` },
      { t: " in the repo is a template + wizard. Resolved, until it isn't." },
    ],
    [
      { t: " · " },
      { t: "[propose]", c: "cyan", href: `${repo}/issues` },
      { t: " a new prop on the repo" },
    ],
  ],
});

const propsProposeOnly = (repo: string): ReserveSection => ({
  id: "props",
  header: [{ t: "[props]", c: "yellow" }],
  lines: [
    [
      { t: " · " },
      { t: "[propose]", c: "cyan", href: `${repo}/issues` },
      { t: " a new prop on the repo" },
    ],
  ],
});

const REPO_00 = "https://github.com/dystropic/phd";
const REPO_01 = "https://github.com/dystropic/reflex";
const REPO_02 = "https://github.com/dystropic/anticsbbs";
const REPO_03 = "https://github.com/dystropic/rcassembly";

export const RESERVE_DOCS: Record<string, ReserveDoc> = {
  "rc-00": {
    subtitle: "Prop Handshake Document",
    link: REPO_00,
    sections: [
      {
        id: "status",
        header: [{ t: "status:", c: "gray" }],
        lines: [
          [
            { t: "preresolved by deployment; ready to " },
            { t: "[reprise]", c: "cyan", action: "reprise" },
            { t: "." },
          ],
        ],
      },
      {
        id: "why",
        header: [{ t: "why:", c: "gray" }],
        lines: [
          [
            {
              t: "Agents run on what you say, and how someone else lets you say it. Most of what you know about work, how you want it, when you want it from them, comes out wrong. Between people, in person, a handshake takes measures to settle it, when you can't wait for a better truce. ",
            },
          ],
          [{ t: "For agents, you need a PHD. " }],
          [{ t: "This document standard is part template, part wizard, and lots of retraining." }],
        ],
      },
      attractorsFor(REPO_00),
      propsWithFile(REPO_00),
    ],
  },
  "rc-01": {
    subtitle: "Reflex Constraint Assembly",
    link: REPO_01,
    sections: [
      {
        id: "status",
        header: [{ t: "status:", c: "gray" }],
        lines: [
          [
            { t: "preresolved by deployment; reprise reps " },
            { t: "[01]", c: "gray" },
            { t: "; ready to " },
            { t: "[reprise]", c: "cyan", action: "reprise" },
            { t: "." },
          ],
        ],
      },
      {
        id: "why",
        header: [{ t: "why:", c: "gray" }],
        lines: [
          [
            {
              t: "Contracts and grants were supposed to make uncertain work workable by settling enough of it in advance. Now machine work gets cheaper faster than human judgment can specify, price, approve, and police it. The squeeze keeps tightening. Everyone answers by putting in more hours, more judgment, more supervision, more of themselves, just to lose ground more slowly.",
            },
          ],
          [
            {
              t: "This reserve keeps research and development of the reflex primitive under continuous pressure from all angles.",
            },
          ],
        ],
      },
      attractorsFor(REPO_01),
      propsProposeOnly(REPO_01),
    ],
  },
  "rc-02": {
    subtitle: "",
    link: REPO_02,
    sections: [
      {
        id: "status",
        header: [{ t: "status:", c: "gray" }],
        lines: [
          [
            { t: "web TUI teaser deployed; terminal-native TUI held on reserves to " },
            { t: "[reprise]", c: "cyan", action: "reprise" },
            { t: "." },
          ],
        ],
      },
      {
        id: "why",
        header: [{ t: "why:", c: "gray" }],
        lines: [
          [
            {
              t: "Too much context running away with your attention. There's something about a crucible problem, garbled model messages, endless cascades of corrections, that don't like it when you sleep. Shrinking social spaces. Platforms engineered to addict you.",
            },
          ],
          [
            {
              t: "What's a builder supposed to do with all these credits if not imagine a place to hop between worlds where wild minds stay up late with skies the color of television humming in the background?",
            },
          ],
        ],
      },
      attractorsFor(REPO_02),
      propsProposeOnly(REPO_02),
    ],
  },
  "rc-03": {
    subtitle: "",
    link: REPO_03,
    sections: [
      {
        id: "status",
        header: [{ t: "status:", c: "gray" }],
        lines: [
          [{ t: "ready to " }, { t: "[assemble]", c: "cyan" }, { t: "." }],
        ],
      },
      {
        id: "why",
        header: [{ t: "why:", c: "gray" }],
        lines: [
          [
            {
              t: "What costs almost nothing over here can cost a fortune over yonder, and seeing what's what, when and where it is costs too more human attention than it could. ",
            },
          ],
        ],
      },
      attractorsFor(REPO_03),
      propsProposeOnly(REPO_03),
    ],
  },
};
