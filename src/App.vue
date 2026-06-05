<script setup lang="ts">
import {
    computed,
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
    shallowRef,
    type Component,
} from "vue";
import GlobeGL from "globe.gl";
import * as THREE from "three";
import * as topojson from "topojson-client";
import { Compass, Sprout, Trees } from "@lucide/vue";
import MapLegend from "./components/MapLegend.vue";
import ProjectDetailsPanel from "./components/ProjectDetailsPanel.vue";
import ProjectHoverCard from "./components/ProjectHoverCard.vue";
import StatsPanel from "./components/StatsPanel.vue";
import treeIcon from "./assets/tree.svg";
import { map_projects, type TreeProject } from "./data/treedata";
import { getGeoCentroid } from "./utils/geo";
import {
    formatTrees,
    isValidProjectLocation,
    projectToPoint,
    projectToRing,
    type TreeProjectPoint,
} from "./utils/treeProjects";

type HtmlMarker = TreeProjectPoint & {
    avatarUrl: string;
    fallbackAvatarUrl: string;
};

type LabelData = {
    lat: number;
    lng: number;
    label: string;
    size?: number;
    color?: string;
    dotRadius?: number;
    altitude?: number;
    type?: "country" | "city";
};

type StatItem = {
    label: string;
    value: string;
    icon: Component;
    iconClass: string;
    featured?: boolean;
};

const globeContainer = ref<HTMLDivElement | null>(null);
const globe = shallowRef<any>(null);
const resizeObserver = shallowRef<ResizeObserver | null>(null);
const markerCache = new Map<string, HTMLElement>();
const hoveredMarker = ref<HtmlMarker | null>(null);
const hoverCoords = ref<{ x: number; y: number } | null>(null);
const selectedProject = ref<TreeProject | null>(null);
const hoverAnimationFrame = ref<number | null>(null);

const validProjects = computed(() =>
    map_projects.filter(isValidProjectLocation),
);
const totalTrees = computed(() =>
    validProjects.value.reduce((sum, project) => sum + project.trees_funded, 0),
);
const activeProjects = computed(
    () =>
        validProjects.value.filter((project) => project.status !== "closed")
            .length,
);
const projectPoints = computed(() => validProjects.value.map(projectToPoint));
const projectMarkers = computed<HtmlMarker[]>(() =>
    validProjects.value.map((project) => ({
        ...projectToPoint(project),
        altitude: 0.02,
        avatarUrl: treeIcon,
        fallbackAvatarUrl: treeIcon,
    })),
);

const rings = computed(() => {
    const topProjects = [...validProjects.value]
        .sort((a, b) => b.trees_funded - a.trees_funded)
        .slice(0, 14)
        .map((project) => projectToRing(project));

    if (!selectedProject.value) return topProjects;

    return [
        projectToRing(selectedProject.value, true),
        ...topProjects.filter(
            (ring) =>
                ring.lat !== selectedProject.value?.lat ||
                ring.lng !== selectedProject.value?.long,
        ),
    ];
});

const stats = computed<StatItem[]>(() => [
    {
        label: "Projects",
        value: validProjects.value.length.toLocaleString(),
        icon: Sprout,
        iconClass: "h-4.5 w-4.5",
    },
    {
        label: "Trees",
        value: formatTrees(totalTrees.value),
        icon: Trees,
        iconClass: "h-5 w-5",
        featured: true,
    },
    {
        label: "Open",
        value: activeProjects.value.toLocaleString(),
        icon: Compass,
        iconClass: "h-4.5 w-4.5",
    },
]);

function getMarkerKey(marker: HtmlMarker) {
    return `${marker.lat.toFixed(4)}:${marker.lng.toFixed(4)}:${marker.label || ""}`;
}

function getScreenCoords(marker: HtmlMarker) {
    if (!globe.value) return null;
    return globe.value.getScreenCoords(
        marker.lat,
        marker.lng,
        marker.altitude || 0,
    );
}

function startHoverFollow(marker: HtmlMarker) {
    hoveredMarker.value = marker;
    hoverCoords.value = getScreenCoords(marker);

    const update = () => {
        if (!hoveredMarker.value) return;
        hoverCoords.value = getScreenCoords(hoveredMarker.value);
        hoverAnimationFrame.value = requestAnimationFrame(update);
    };

    if (hoverAnimationFrame.value)
        cancelAnimationFrame(hoverAnimationFrame.value);
    update();
}

function stopHoverFollow() {
    hoveredMarker.value = null;
    hoverCoords.value = null;

    if (hoverAnimationFrame.value) {
        cancelAnimationFrame(hoverAnimationFrame.value);
        hoverAnimationFrame.value = null;
    }
}

function selectProject(marker: HtmlMarker) {
    selectedProject.value = marker.customData;
    stopHoverFollow();
}

function createMarkerElement(marker: HtmlMarker) {
    const key = getMarkerKey(marker);
    const color = marker.color || "#10b981";
    const markerSize = Math.round(30 + Math.min(18, (marker.size || 0.4) * 18));
    const template = `
    <div class="-translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer absolute left-0 top-0 z-10">
      <div class="rounded-full bg-white p-0.75 transition-transform duration-200 hover:scale-110" style="width: ${markerSize}px; height: ${markerSize}px; box-shadow: 0 0 0 2px ${color}, 0 5px 16px rgba(0, 0, 0, 0.38), 0 0 18px ${color};">
        <div class="h-full w-full overflow-hidden rounded-full bg-emerald-100">
          <img src="${treeIcon}" class="h-full w-full object-contain p-1" alt="" />
        </div>
      </div>
    </div>
  `;

    let element = markerCache.get(key);
    if (!element) {
        element = document.createElement("div");
        markerCache.set(key, element);
    }

    if (element.dataset.template !== template) {
        element.innerHTML = template;
        element.dataset.template = template;
    }

    element.style.pointerEvents = "auto";
    element.onmouseenter = () => {
        if (globe.value?.controls()) globe.value.controls().autoRotate = false;
        startHoverFollow(marker);
    };
    element.onmouseleave = () => {
        if (globe.value?.controls()) globe.value.controls().autoRotate = true;
        stopHoverFollow();
    };
    element.onclick = (event) => {
        event.stopPropagation();
        selectProject(marker);
    };

    return element;
}

function updateMarkers() {
    if (!globe.value) return;

    const nextKeys = new Set(projectMarkers.value.map(getMarkerKey));
    markerCache.forEach((element, key) => {
        if (!nextKeys.has(key)) {
            element.remove();
            markerCache.delete(key);
        }
    });

    globe.value
        .htmlElementsData(projectMarkers.value)
        .htmlLat("lat")
        .htmlLng("lng")
        .htmlAltitude("altitude")
        .htmlElement((marker: HtmlMarker) => createMarkerElement(marker));
}

function updateGlobeData() {
    if (!globe.value) return;

    globe.value
        .pointsData(projectPoints.value)
        .pointLat("lat")
        .pointLng("lng")
        .pointColor("color")
        .pointAltitude("altitude")
        .pointRadius("size")
        .pointLabel("label")
        .pointResolution(12)
        .ringsData(rings.value)
        .ringLat("lat")
        .ringLng("lng")
        .ringMaxRadius("maxRadius")
        .ringPropagationSpeed("propagationSpeed")
        .ringRepeatPeriod("repeatPeriod")
        .ringColor("color")
        .onPointClick((point: TreeProjectPoint) => {
            selectedProject.value = point.customData;
        });

    updateMarkers();
}

async function loadCountries() {
    if (!globe.value) return;

    try {
        const response = await fetch(
            "//unpkg.com/world-atlas/countries-110m.json",
        );
        const worldData = await response.json();
        const countriesGeo = (
            topojson.feature(worldData, worldData.objects.countries) as any
        ).features;
        const labels = countriesGeo
            .map((feature: any): LabelData | null => {
                const centroid = getGeoCentroid(feature);
                const label =
                    feature.properties.NAME ||
                    feature.properties.name ||
                    feature.properties.ADMIN ||
                    "";
                if (!centroid || !label) return null;

                return {
                    lat: centroid.lat,
                    lng: centroid.lng,
                    label,
                    size: 0.48,
                    color: "rgba(15, 23, 42, 0.72)",
                    dotRadius: 0,
                    altitude: 0.012,
                    type: "country",
                };
            })
            .filter(
                (label: LabelData | null): label is LabelData => label !== null,
            );

        globe.value
            .polygonsData(countriesGeo)
            .polygonCapColor(() => "rgba(0, 0, 0, 0)")
            .polygonSideColor(() => "rgba(0, 0, 0, 0)")
            .polygonStrokeColor(() => "rgba(255, 255, 255, 0.1)")
            .polygonLabel(() => "")
            .labelsData(labels)
            .labelLat("lat")
            .labelLng("lng")
            .labelText("label")
            .labelSize("size")
            .labelDotRadius("dotRadius")
            .labelColor("color")
            .labelAltitude("altitude")
            .labelResolution(2);
    } catch {
        // Country outlines are decorative; keep the globe usable if the atlas CDN fails.
    }
}

function initGlobe() {
    if (!globeContainer.value) return;

    const instance = (GlobeGL as any)()(globeContainer.value)
        .globeImageUrl(
            "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
        )
        .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
        .backgroundImageUrl(null)
        .backgroundColor("rgba(0,0,0,0)")
        .showGlobe(true)
        .showAtmosphere(true)
        .atmosphereColor("#8bd3ff")
        .atmosphereAltitude(0.22);

    const renderer = instance.renderer();
    if (renderer) {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
        renderer.shadowMap.enabled = false;
        renderer.setClearColor(0x000000, 0);
    }

    const material = instance.globeMaterial();
    if (material) material.color = new THREE.Color("#ffffff");

    instance.controls().autoRotate = true;
    instance.controls().autoRotateSpeed = 0.18;
    instance.controls().minDistance = 101;
    instance.controls().maxDistance = 400;
    instance.pointOfView({ lat: 18, lng: 18, altitude: 2.05 });

    globe.value = instance;

    resizeObserver.value = new ResizeObserver(() => {
        if (!globeContainer.value || !globe.value) return;
        globe.value.width(globeContainer.value.clientWidth);
        globe.value.height(globeContainer.value.clientHeight);
    });
    resizeObserver.value.observe(globeContainer.value);
    instance.width(globeContainer.value.clientWidth);
    instance.height(globeContainer.value.clientHeight);

    updateGlobeData();
    void loadCountries();
}

onMounted(async () => {
    await nextTick();
    initGlobe();
});

onBeforeUnmount(() => {
    stopHoverFollow();
    resizeObserver.value?.disconnect();

    if (globe.value?.controls()) globe.value.controls().dispose();
    if (globe.value?._destructor) globe.value._destructor();
    if (globe.value?.renderer()) {
        globe.value.renderer().dispose();
        globe.value.renderer().forceContextLoss();
    }
    globe.value = null;
    markerCache.clear();
});
</script>

<template>
    <main
        class="relative h-dvh min-h-160 overflow-hidden bg-[#071426] text-white"
    >
        <div
            class="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_45%,rgba(56,189,248,0.35),transparent_34%),radial-gradient(circle_at_50%_50%,rgba(15,23,42,0)_0%,rgba(2,6,23,0.92)_76%),radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.5)_0_1px,transparent_2px),radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.35)_0_1px,transparent_2px),radial-gradient(circle_at_30%_80%,rgba(255,255,255,0.3)_0_1px,transparent_2px)]"
        />

        <StatsPanel :stats="stats" />

        <div
            ref="globeContainer"
            class="absolute inset-0 z-10 overflow-hidden"
        />

        <MapLegend />

        <ProjectHoverCard
            v-if="hoveredMarker?.customData && hoverCoords && !selectedProject"
            :project="hoveredMarker.customData"
            :coords="hoverCoords"
        />

        <ProjectDetailsPanel
            v-if="selectedProject"
            :project="selectedProject"
            @close="selectedProject = null"
        />
    </main>
</template>
