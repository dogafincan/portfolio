import type { CSSProperties } from "react";

import { AppHeader } from "@/components/app-header";

const PAGE_BACKGROUND = "var(--portfolio-page-background)";
const CLOUD_IMAGE = "var(--portfolio-header-cloud-image)";
const ATMOSPHERE_IMAGE = "var(--portfolio-page-atmosphere-image)";
const CLEARANCE_FEATHER = "var(--portfolio-header-clearance-feather)";
const CLEARANCE_COLOR = "var(--portfolio-header-clearance-color)";

const CLOUD_MASK = "radial-gradient(ellipse at center, black 0%, black 58%, transparent 78%)";

type CloudSlot = {
  height: [number, number];
  left: [number, number];
  opacity: [number, number];
  top: [number, number];
  width: [number, number];
};

const CLOUD_SLOTS: CloudSlot[] = [
  { left: [46, 120], top: [34, 78], width: [470, 590], height: [170, 235], opacity: [0.62, 0.78] },
  { left: [645, 760], top: [36, 86], width: [360, 480], height: [140, 205], opacity: [0.46, 0.64] },
  {
    left: [730, 820],
    top: [420, 468],
    width: [310, 410],
    height: [105, 150],
    opacity: [0.32, 0.46],
  },
  {
    left: [120, 230],
    top: [430, 470],
    width: [300, 410],
    height: [105, 145],
    opacity: [0.26, 0.4],
  },
];

export function OgImagePreview({ seed, title }: { seed: string; title: string }) {
  const cloudLayers = createCloudLayers(seed);

  return (
    <main
      aria-label={`${title} Open Graph image preview`}
      className="relative z-10 flex h-[630px] w-[1200px] items-center justify-center overflow-hidden text-white"
      data-og-preview
      data-og-seed={seed}
      style={{ background: PAGE_BACKGROUND }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-no-repeat"
        style={{
          backgroundImage: ATMOSPHERE_IMAGE,
          backgroundPosition: "center top",
          backgroundSize: "100% auto",
          opacity: 1,
        }}
      />
      {cloudLayers.map((layer, index) => (
        <div aria-hidden="true" className="absolute z-0 bg-no-repeat" key={index} style={layer} />
      ))}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 z-10 h-[18rem] w-[48rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: CLEARANCE_COLOR,
          boxShadow: `0 0 ${CLEARANCE_FEATHER} ${CLEARANCE_FEATHER} ${CLEARANCE_COLOR}`,
        }}
      />
      <AppHeader className="relative z-20 origin-center scale-[2.35]" title={title} />
    </main>
  );
}

function createCloudLayers(seed: string) {
  const random = createSeededRandom(seed);

  return CLOUD_SLOTS.map(
    (slot): CSSProperties => ({
      backgroundImage: CLOUD_IMAGE,
      backgroundPosition: `${range(random, 0, 100)}% ${range(random, 0, 100)}%`,
      backgroundSize: `${range(random, 245, 330)}% auto`,
      height: `${range(random, slot.height[0], slot.height[1])}px`,
      left: `${range(random, slot.left[0], slot.left[1])}px`,
      opacity: range(random, slot.opacity[0], slot.opacity[1]),
      top: `${range(random, slot.top[0], slot.top[1])}px`,
      WebkitMaskImage: CLOUD_MASK,
      maskImage: CLOUD_MASK,
      width: `${range(random, slot.width[0], slot.width[1])}px`,
    }),
  );
}

function createSeededRandom(seed: string) {
  let state = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    state ^= seed.charCodeAt(index);
    state = Math.imul(state, 16777619);
  }

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function range(random: () => number, min: number, max: number) {
  return min + random() * (max - min);
}
