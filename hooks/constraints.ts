import { Constraint } from "../types/reflex";

export const fundable = (constraint: Constraint) =>
  constraint.funding.kind !== "unset";

export const CONSTRAINTS: Constraint[] = [
  {
    code: "rc-00",
    name: "phd",
    category: "preresolved",
    funding: { kind: "prefunded" },
  },
  {
    code: "rc-01",
    name: "reflex",
    category: "preresolved",
    funding: { kind: "prefunded" },
  },
  {
    code: "rc-02",
    name: "antics bbs",
    category: "reprise reps [01]",
    funding: { kind: "prefunded" },
  },
  {
    code: "rc-03",
    name: "rc assembly",
    category: "reprise reps [01]",
    funding: { kind: "minimum", usd: 3000 },
  },
  {
    code: "rc-04",
    name: "media shuttle via fc-mca",
    category: "unresolved",
    funding: { kind: "minimum", usd: 6000 },
  },
  {
    code: "rc-05",
    name: "microhire ensemble ops via am3",
    category: "unresolved",
    funding: { kind: "unset" },
  },
  {
    code: "rc-06",
    name: "refab via fpv vt-adm",
    category: "unresolved",
    funding: { kind: "unset" },
  },
  {
    code: "rc-07",
    name: "stagerunner",
    category: "unresolved",
    funding: { kind: "unset" },
  },
];
