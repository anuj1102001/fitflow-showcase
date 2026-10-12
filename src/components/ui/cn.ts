import { extendTailwindMerge } from "tailwind-merge";

// Knows our custom tokens so a later class (e.g. `shadow-lift`, `text-2xs`) replaces an earlier one.
const merge = extendTailwindMerge({
  extend: {
    classGroups: {
      shadow: [{ shadow: ["card", "lift", "float", "pill", "inset", "ring"] }],
      "font-size": [{ text: ["2xs"] }],
    },
  },
});

export function cn(...classes: (string | false | null | undefined)[]) {
  return merge(classes.filter(Boolean).join(" "));
}
