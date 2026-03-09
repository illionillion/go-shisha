import type { Flavor } from "../types";

interface FlavorLabelProps {
  flavor: Flavor;
}

export function FlavorLabel({ flavor }: FlavorLabelProps) {
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white mt-1"
      style={{ backgroundColor: flavor.color || "#6b7280" }}
    >
      {flavor.name}
    </span>
  );
}
