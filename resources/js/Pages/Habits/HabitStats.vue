<script setup>
import { ref } from 'vue'; // Kita butuh ref buat dropdown mood lokal
const showMoodDropdownLocal = ref(false);

const props = defineProps({
    localHabits: Array,
    overallPercentage: Number,
    totalCompletions: Number,
    currentMoodData: Object,
    moodOptions: Array,
    savedMood: String,
    
    // Actions
    selectMood: Function
});

// Helper buat toggle mood dropdown biar gak ganggu parent
const toggleDropdown = () => {
    showMoodDropdownLocal.value = !showMoodDropdownLocal.value;
}
</script>

<template>
    <div v-if="localHabits.length > 0" class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 animate-in slide-in-from-bottom-5 px-4 md:px-0 w-full md:max-w-[95%] mx-auto pb-20">
        
        <div class="bg-indigo-600 rounded-2xl p-5 md:p-6 text-white shadow-xl shadow-indigo-200">
            <div class="text-indigo-200 text-[10px] md:text-xs font-bold uppercase mb-1">{{ $t('stats_consistency') }}</div>
            <div class="text-3xl md:text-4xl font-black mb-2">{{ overallPercentage }}%</div>
            <div class="w-full bg-indigo-800 rounded-full h-2">
                <div class="bg-white h-2 rounded-full" :style="{ width: overallPercentage + '%' }"></div>
            </div>
        </div>

        <div class="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100 flex items-center gap-4">
            <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl md:text-2xl">✅</div>
            <div>
                <div class="text-slate-400 text-[10px] md:text-xs font-bold uppercase">{{ $t('stats_total_check') }}</div>
                <div class="text-xl md:text-2xl font-black text-slate-800">{{ totalCompletions }}</div>
            </div>
        </div>

        <div class="relative">
            <div v-if="showMoodDropdownLocal" @click="showMoodDropdownLocal = false" class="fixed inset-0 z-10 cursor-default"></div>

            <button 
                @click="toggleDropdown"
                class="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition cursor-pointer text-left w-full h-full relative z-20"
                :class="showMoodDropdownLocal ? 'ring-2 ring-indigo-500 border-transparent' : ''"
            >
                <div class="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-xl md:text-2xl transition-colors shrink-0" :class="currentMoodData.color">
                    {{ currentMoodData.icon }}
                </div>
                
                <div class="flex-1 min-w-0">
                    <div class="text-slate-400 text-[10px] md:text-xs font-bold uppercase flex justify-between items-center">
                        <span>{{ $t('stats_mood') }}</span>
                        <span class="text-[10px] opacity-50">▼</span>
                    </div>
                    <div class="text-lg md:text-xl font-black text-slate-800 truncate">
                        {{ $t(currentMoodData.label_key) }}
                    </div>
                </div>
            </button>

            <div v-if="showMoodDropdownLocal" class="absolute bottom-full mb-2 left-0 w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-30 animate-in slide-in-from-bottom-2 grid grid-cols-1 gap-1 max-h-64 overflow-y-auto custom-scrollbar">
                <button v-for="m in moodOptions" :key="m.code" @click="selectMood(m.code); showMoodDropdownLocal = false" class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition w-full text-left" :class="savedMood === m.code ? 'bg-indigo-50 border border-indigo-100' : ''">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-lg shrink-0" :class="m.color">
                        {{ m.icon }}
                    </div>
                    <span class="font-bold text-sm text-slate-700">{{ $t(m.label_key) }}</span>
                    <span v-if="savedMood === m.code" class="ml-auto text-indigo-600 font-bold">✓</span>
                </button>
            </div>
        </div>

    </div>
</template>