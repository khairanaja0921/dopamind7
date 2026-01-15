<script setup>
defineProps({
    user: Object,
    greetingKey: String,
    todayDate: String,
    currentMonth: String,
    todayProgress: [Number, String],
    changeMonth: Function,
    openCreateModal: Function,
});
</script>

<template>
    <div class="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div class="max-w-full mx-auto px-4 py-4 md:py-6">

            <div class="flex flex-col md:flex-row justify-between items-center gap-4">

                <div class="w-full md:w-auto text-left">
                    <div class="inline-flex items-center gap-2 text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">
                        <span>📅</span>
                        <span>{{ todayDate }}</span>
                    </div>

                    <h1 class="text-xl md:text-3xl font-black text-slate-800 tracking-tight">
                        {{ $t(greetingKey) }},
                        <span class="text-indigo-600">
                            {{ user.name.split(' ')[0] }}
                        </span>!
                    </h1>

                    <p class="text-slate-500 text-sm mt-1 hidden md:block">
                        {{ $t('greet_subtitle') }}
                    </p>
                </div>

                <div class="flex items-center justify-between w-full md:w-auto gap-3">

                    <div class="flex items-center bg-slate-50 rounded-xl border border-slate-200 p-1 flex-1 md:flex-none justify-center">
                        <button @click="changeMonth('prev')" class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm transition">
                            ‹
                        </button>

                        <span class="px-2 md:px-4 text-[10px] md:text-xs font-bold text-slate-700 uppercase tracking-wide min-w-[80px] text-center">
                            {{ currentMonth }}
                        </span>

                        <button @click="changeMonth('next')" class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm transition">
                            ›
                        </button>
                    </div>

                    <div class="hidden md:flex flex-col items-end mr-2">
                        <span class="text-[10px] font-bold text-slate-400 uppercase"> {{ $t('today_is') }}</span>

                        <div class="flex items-center gap-2">
                            <div class="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div class="h-full bg-emerald-500 rounded-full transition-all duration-500" :style="{ width: todayProgress + '%' }"></div>
                            </div>
                            <span class="text-xs font-black text-slate-700">
                                {{ todayProgress }}%
                            </span>
                        </div>
                    </div>

                    <button @click="openCreateModal" class="flex-shrink-0 flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-bold text-xs md:text-sm shadow-lg hover:bg-indigo-700 transition">
                        <span>+</span>
                        <span class="hidden sm:inline">
                            {{ $t('habit_btn_new') }}
                        </span>
                    </button>

                </div>
            </div>

            <div class="border-t border-slate-100 pt-2 mt-3 flex items-center gap-4 md:gap-6 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                    {{ $t('legend_instruction') }}
                </span>

                <div class="flex items-center gap-1.5 shrink-0">
                    <div class="w-4 h-4 rounded bg-indigo-600 text-white flex items-center justify-center text-[9px] shadow-sm">
                        ✓
                    </div>
                    <span class="text-[10px] md:text-xs text-slate-600 font-bold">
                        {{ $t('legend_left_click') }}
                    </span>
                </div>

                <div class="flex items-center gap-1.5 shrink-0">
                    <div class="w-4 h-4 rounded bg-slate-100 text-slate-400 flex items-center justify-center text-[9px] border border-slate-200">
                        -
                    </div>
                    <span class="text-[10px] md:text-xs text-slate-600 font-bold">
                        {{ $t('legend_right_click') }}
                    </span>
                </div>

                <div class="flex items-center gap-1.5 shrink-0">
                    <div class="w-4 h-4 rounded bg-white border border-slate-200 hover:border-indigo-300"></div>
                    <span class="text-[10px] md:text-xs text-slate-500 font-medium">
                        {{ $t('legend_reset') }}
                    </span>
                </div>
            </div>

        </div>
    </div>
</template>