<script setup lang="ts">
import type { Component } from 'vue';
import treeIcon from '../assets/tree.svg';

defineProps<{
  stats: Array<{
    label: string;
    value: string;
    icon: Component;
    iconClass: string;
    featured?: boolean;
  }>;
}>();
</script>

<template>
  <section class="absolute left-4 top-4 z-20 w-92 max-w-[calc(100vw-2rem)] overflow-hidden rounded-[26px] border border-white/15 bg-slate-950/42 p-3.5 text-white shadow-[0_18px_54px_rgba(2,6,23,0.34)] backdrop-blur-2xl">
    <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-300/60 to-transparent" />

    <div class="mb-3 flex items-center gap-3">
      <div class="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-300/20 bg-emerald-300/10 shadow-[0_0_20px_rgba(52,211,153,0.22)]">
        <img :src="treeIcon" alt="Tree Nation" class="h-6 w-6" />
      </div>
      <div>
        <div class="text-sm font-black tracking-tight text-white">Tree Nation</div>
        <div class="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-100/60">Reforestation globe</div>
      </div>
    </div>

    <h1 class="text-balance text-xl font-black leading-none tracking-tight text-white">Tree projects globe</h1>
    <p class="mt-2 max-w-68 text-xs leading-5 text-sky-100/68">
      Explore global planting projects through interactive tree markers.
    </p>

    <div class="mt-3.5 grid grid-cols-3 gap-2.5">
      <div
        v-for="item in stats"
        :key="item.label"
        :class="[
          'relative flex min-h-25 flex-col items-center justify-center rounded-[20px] border bg-white/96 px-2 py-3 text-center shadow-[0_12px_28px_rgba(2,6,23,0.18),inset_0_-2px_0_rgba(2,6,23,0.08)] backdrop-blur-xl',
          item.featured
            ? 'border-emerald-300/80 ring-2 ring-emerald-300/65 shadow-[0_0_34px_rgba(52,211,153,0.55),0_22px_60px_rgba(2,6,23,0.28),inset_0_0_34px_rgba(52,211,153,0.12)]'
            : 'border-white/70'
        ]"
      >
        <div class="absolute inset-0 rounded-[20px] bg-[radial-gradient(circle_at_50%_16%,rgba(16,185,129,0.1),transparent_45%)]" />
        <div class="relative mb-2 grid h-9 w-9 place-items-center rounded-full border border-emerald-200/80 bg-emerald-50 text-emerald-600 shadow-[0_7px_16px_rgba(15,118,110,0.14),inset_0_1px_0_rgba(255,255,255,0.9)]">
          <component :is="item.icon" :class="item.iconClass" :stroke-width="2.4" />
        </div>
        <div class="relative text-[9px] font-black uppercase tracking-[0.28em] text-cyan-800/75">{{ item.label }}</div>
        <div class="relative mt-1 text-2xl font-black leading-none tracking-tight text-slate-950 drop-shadow-sm">{{ item.value }}</div>
      </div>
    </div>
  </section>
</template>
