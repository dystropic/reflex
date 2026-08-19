export type Category = "preresolved" | "reprise reps [01]" | "unresolved";

export type Funding =
  | { kind: "prefunded" }
  | { kind: "minimum"; usd: number }
  | { kind: "unset" };

export interface Constraint {
  code: string;
  name: string;
  category: Category;
  funding: Funding;
}
