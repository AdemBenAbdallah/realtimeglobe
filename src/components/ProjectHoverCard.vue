<script setup lang="ts">
import treeIcon from '../assets/tree.svg';
import type { TreeProject } from '../data/treedata';
import { formatStatus, formatTrees } from '../utils/treeProjects';

defineProps<{
  project: TreeProject;
  coords: { x: number; y: number };
}>();
</script>

<template>
  <div
    class="pointer-events-none absolute z-40 w-72 -translate-x-1/2 -translate-y-[calc(100%+34px)] rounded-2xl border border-white/15 bg-slate-950/90 p-4 text-white shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
    :style="{ left: `${coords.x}px`, top: `${coords.y}px` }"
  >
    <div class="absolute -bottom-3 left-1/2 h-0 w-0 -translate-x-1/2 border-l-12 border-r-12 border-t-12 border-l-transparent border-r-transparent border-t-slate-950/90" />
    <div class="flex items-start gap-3">
      <img :src="treeIcon" alt="" class="h-14 w-14 shrink-0 rounded-full border-2 border-emerald-300 bg-emerald-100 object-contain p-2" />
      <div class="min-w-0">
        <div class="truncate text-base font-black leading-5">{{ project.name }}</div>
        <div class="mt-1 text-xs text-sky-100/60">{{ project.location }} · {{ formatStatus(project.status) }}</div>
        <div class="mt-2 inline-flex rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-bold text-emerald-200">
          {{ formatTrees(project.trees_funded) }} trees funded
        </div>
      </div>
    </div>
    <div class="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
      <div>
        <span class="block text-slate-500">Objective</span>
        <strong class="text-white">{{ formatTrees(project.new_tree_objective) }}</strong>
      </div>
      <div>
        <span class="block text-slate-500">Rating</span>
        <strong class="text-white">{{ project.rating > 0 ? project.rating.toFixed(1) : '—' }}</strong>
      </div>
    </div>
  </div>
</template>
