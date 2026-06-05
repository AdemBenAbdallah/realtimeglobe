import type { TreeProject } from '../data/treedata';

export interface DataPoint {
  lat: number;
  lng: number;
  color?: string;
  size?: number;
  altitude?: number;
  label?: string;
  customData?: unknown;
}

export interface RingData {
  lat: number;
  lng: number;
  maxRadius?: number;
  propagationSpeed?: number;
  repeatPeriod?: number;
  color?: string;
}

export type TreeProjectPoint = DataPoint & {
  customData: TreeProject;
};

export const PROJECT_STATUS_COLORS = {
  active: '#10b981',
  closed: '#14b8a6',
  restocking: '#84cc16',
  sunset: '#94a3b8',
} as const;

export function getProjectColor(project: TreeProject) {
  if (project.in_process_to_sunset) return PROJECT_STATUS_COLORS.sunset;
  if (project.is_restocking) return PROJECT_STATUS_COLORS.restocking;

  const normalizedStatus = project.status.toLowerCase();

  if (normalizedStatus.includes('closed')) return PROJECT_STATUS_COLORS.closed;
  if (normalizedStatus.includes('affiliated') || normalizedStatus.includes('active')) return PROJECT_STATUS_COLORS.active;

  return PROJECT_STATUS_COLORS.active;
}

export function getProjectSize(treesFunded: number) {
  if (!Number.isFinite(treesFunded) || treesFunded <= 0) return 0.22;
  return Math.max(0.24, Math.min(0.82, Math.log10(treesFunded + 10) / 7.6));
}

export function formatTrees(value: number) {
  return new Intl.NumberFormat('en', {
    notation: value >= 1_000_000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 1_000_000 ? 1 : 0,
  }).format(value);
}

export function formatStatus(status: string) {
  return status
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function projectToPoint(project: TreeProject): TreeProjectPoint {
  const color = getProjectColor(project);

  return {
    lat: project.lat,
    lng: project.long,
    color,
    size: getProjectSize(project.trees_funded),
    altitude: 0.006,
    label: `${project.name} · ${formatTrees(project.trees_funded)} trees`,
    customData: project,
  };
}

export function projectToRing(project: TreeProject, selected = false): RingData {
  return {
    lat: project.lat,
    lng: project.long,
    color: selected ? 'rgba(34, 197, 94, 0.75)' : 'rgba(20, 184, 166, 0.28)',
    maxRadius: selected ? 5.5 : 2.8,
    propagationSpeed: selected ? 1.6 : 0.7,
    repeatPeriod: selected ? 900 : 2400,
  };
}

export function isValidProjectLocation(project: TreeProject) {
  return Number.isFinite(project.lat)
    && Number.isFinite(project.long)
    && Math.abs(project.lat) <= 90
    && Math.abs(project.long) <= 180;
}
