<script setup lang="ts">
import treeIcon from '../assets/tree.svg';
import type { TreeProject } from '../data/treedata';
import { formatStatus, formatTrees } from '../utils/treeProjects';

const props = defineProps<{
  project: TreeProject;
}>();

const emit = defineEmits<{
  close: [];
}>();

function getFundingProgress(project: TreeProject) {
  if (!project.new_tree_objective) return 0;
  return Math.min(100, Math.round((project.trees_funded / project.new_tree_objective) * 100));
}
</script>

<template>
  <aside class="absolute right-4 top-4 z-30 w-90 max-w-[calc(100vw-2rem)] overflow-hidden rounded-[28px] border border-emerald-100 bg-white/88 text-emerald-950 shadow-[0_24px_80px_rgba(22,101,52,0.2)] backdrop-blur-xl">
    <div class="h-36 overflow-hidden bg-emerald-100">
      <img :src="treeIcon" alt="" class="h-full w-full object-contain p-8" />
    </div>

    <div class="p-5">
      <div class="mb-3 flex items-start justify-between gap-4">
        <div>
          <div class="mb-2 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            {{ project.location }} · {{ formatStatus(project.status) }}
          </div>
          <h2 class="text-balance text-2xl font-black tracking-tight text-emerald-950">{{ project.name }}</h2>
        </div>
        <button
          type="button"
          class="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-emerald-100 bg-white/80 text-xl leading-none text-emerald-800 transition hover:bg-emerald-50"
          aria-label="Close project details"
          @click="emit('close')"
        >
          ×
        </button>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-2xl border border-emerald-100 bg-white/75 px-4 py-3 shadow-sm backdrop-blur">
          <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700/70">Trees funded</div>
          <div class="mt-1 text-lg font-bold text-emerald-950">{{ formatTrees(project.trees_funded) }}</div>
        </div>
        <div class="rounded-2xl border border-emerald-100 bg-white/75 px-4 py-3 shadow-sm backdrop-blur">
          <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700/70">Objective</div>
          <div class="mt-1 text-lg font-bold text-emerald-950">{{ formatTrees(project.new_tree_objective) }}</div>
        </div>
        <div class="rounded-2xl border border-emerald-100 bg-white/75 px-4 py-3 shadow-sm backdrop-blur">
          <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700/70">Rating</div>
          <div class="mt-1 text-lg font-bold text-emerald-950">{{ project.rating > 0 ? `${project.rating.toFixed(1)} / 5` : 'No rating' }}</div>
        </div>
        <div class="rounded-2xl border border-emerald-100 bg-white/75 px-4 py-3 shadow-sm backdrop-blur">
          <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700/70">Reviews</div>
          <div class="mt-1 text-lg font-bold text-emerald-950">{{ project.review_count.toLocaleString() }}</div>
        </div>
      </div>

      <div class="mt-5">
        <div class="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700/75">
          <span>Funding progress</span>
          <span>{{ getFundingProgress(props.project) }}%</span>
        </div>
        <div class="h-3 overflow-hidden rounded-full bg-emerald-100">
          <div class="h-full rounded-full bg-linear-to-r from-emerald-500 to-lime-400" :style="{ width: `${getFundingProgress(props.project)}%` }" />
        </div>
      </div>

      <dl class="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div>
          <dt class="text-emerald-700/70">Coordinates</dt>
          <dd class="font-semibold">{{ project.lat.toFixed(2) }}, {{ project.long.toFixed(2) }}</dd>
        </div>
        <div>
          <dt class="text-emerald-700/70">Tree price from</dt>
          <dd class="font-semibold">${{ project.species_price_from }}</dd>
        </div>
        <div>
          <dt class="text-emerald-700/70">Restocking</dt>
          <dd class="font-semibold">{{ project.is_restocking ? 'Yes' : 'No' }}</dd>
        </div>
        <div>
          <dt class="text-emerald-700/70">Project ID</dt>
          <dd class="font-semibold">#{{ project.id }}</dd>
        </div>
      </dl>
    </div>
  </aside>
</template>
