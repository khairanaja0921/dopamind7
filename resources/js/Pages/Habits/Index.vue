<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, router, useForm, usePage } from '@inertiajs/vue3';
import { ref, computed } from 'vue';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import localeData from 'dayjs/plugin/localeData';

dayjs.extend(localeData);
dayjs.locale('id'); 

const props = defineProps({
    habits: Array,
    currentMonth: String,
});

const user = usePage().props.auth.user;

// --- STATE & DATA ---
const showCreateModal = ref(false);
const todayDate = dayjs().format('dddd, D MMMM YYYY');
const greeting = computed(() => {
    const hour = dayjs().hour();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 19) return 'Selamat Sore';
    return 'Selamat Malam';
});

const iconList = [
    '🔥', '💧', '🏃‍♂️', '📚', '🧘‍♂️', '💻', '💰', '💊', 
    '🥦', '💤', '🧹', '🎸', '🎨', '🐶', '🎓', '⚡',
    '🚫', '🥗', '🏋️', '🚴'
];

const form = useForm({
    name: '',
    icon: '⚡', 
    color: '#6366f1',
    monthly_target: 20
});

const colorPalette = [
    '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', 
    '#3b82f6', '#6366f1', '#d946ef', '#8b5cf6', '#64748b'
];

// --- LOGIC TANGGALAN ---
const monthDates = computed(() => {
    const daysInMonth = dayjs().daysInMonth();
    let days = [];
    for (let i = 1; i <= daysInMonth; i++) {
        const date = dayjs().date(i); 
        days.push({
            dateString: date.format('YYYY-MM-DD'),
            dayNumber: i,
            dayName: date.format('dd'), 
            isToday: date.isSame(dayjs(), 'day'),
            isFuture: date.isAfter(dayjs(), 'day')
        });
    }
    return days;
});

// --- STATISTIK ---
const totalCompletions = computed(() => {
    let total = 0;
    props.habits.forEach(h => total += h.progress_count);
    return total;
});

const overallPercentage = computed(() => {
    if (props.habits.length === 0) return 0;
    let totalPercent = 0;
    props.habits.forEach(h => totalPercent += h.progress_percent);
    return Math.round(totalPercent / props.habits.length);
});

// --- HELPERS ---
const getStatus = (habit, dateString) => {
    const log = habit.logs.find(l => l.date === dateString);
    return log ? log.status : 'empty';
};

const toggleStatus = (habit, dateString) => {
    if (dayjs(dateString).isAfter(dayjs(), 'day')) return;

    const currentStatus = getStatus(habit, dateString);
    let newStatus = 'completed';
    if (currentStatus === 'completed') newStatus = 'skipped';
    else if (currentStatus === 'skipped') newStatus = 'uncheck';
    
    router.post(route('habits.log', habit.id), {
        date: dateString, status: newStatus
    }, { preserveScroll: true });
};

const submitHabit = () => {
    form.post(route('habits.store'), {
        onSuccess: () => {
            showCreateModal.value = false;
            form.reset();
        }
    });
};

const deleteHabit = (id, name) => {
    if (confirm(`Hapus habit "${name}"?`)) {
        router.delete(route('habits.destroy', id), { preserveScroll: true });
    }
};
</script>

<template>
    <Head title="Habit Tracker" />

    <AuthenticatedLayout>
        
        <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="showCreateModal = false"></div>
            <div class="bg-white rounded-[2rem] p-8 w-full max-w-lg relative z-10 shadow-2xl animate-in zoom-in-95 overflow-hidden">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-2xl font-black text-slate-800">Habit Baru</h3>
                    <button @click="showCreateModal = false" class="text-slate-400 hover:text-slate-600">✕</button>
                </div>
                <form @submit.prevent="submitHabit" class="space-y-6">
                    <div>
                        <label class="text-xs font-bold text-slate-400 uppercase mb-2 block">Mau rutin ngapain?</label>
                        <input v-model="form.name" class="w-full text-lg font-bold py-3 px-4 rounded-xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-0 transition" placeholder="Contoh: Lari Pagi 5KM" required>
                    </div>
                    <div>
                        <label class="text-xs font-bold text-slate-400 uppercase mb-2 block">Pilih Ikon</label>
                        <div class="grid grid-cols-5 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 max-h-32 overflow-y-auto custom-scrollbar">
                            <button type="button" v-for="icon in iconList" :key="icon" @click="form.icon = icon" class="w-10 h-10 rounded-lg flex items-center justify-center text-xl hover:bg-white hover:shadow-sm transition" :class="form.icon === icon ? 'bg-white shadow-md ring-2 ring-indigo-500 transform scale-110' : 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100'">{{ icon }}</button>
                        </div>
                    </div>
                    <div class="flex gap-6">
                        <div class="flex-1">
                            <label class="text-xs font-bold text-slate-400 uppercase mb-2 block">Warna</label>
                            <div class="flex flex-wrap gap-2">
                                <button type="button" v-for="c in colorPalette" :key="c" @click="form.color = c" class="w-8 h-8 rounded-full flex items-center justify-center transition hover:scale-110" :style="{ backgroundColor: c }"><span v-if="form.color === c" class="text-white font-bold text-xs">✓</span></button>
                            </div>
                        </div>
                        <div class="flex-1">
                            <label class="text-xs font-bold text-slate-400 uppercase mb-2 block">Target: {{ form.monthly_target }} Kali</label>
                            <input v-model="form.monthly_target" type="range" min="1" max="31" class="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer">
                        </div>
                    </div>
                    <button type="submit" class="w-full py-4 rounded-xl font-bold text-white bg-indigo-950 hover:bg-indigo-900 shadow-xl transition transform hover:-translate-y-1" :disabled="form.processing">✨ Mulai Kebiasaan Baru</button>
                </form>
            </div>
        </div>

        <div class="bg-indigo-950 text-white pb-12 pt-10">
            <div class="max-w-7xl mx-auto px-6 lg:px-8">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/50 border border-indigo-800 text-indigo-300 text-xs font-bold mb-4">
                            <span>📅</span> {{ todayDate }}
                        </div>
                        <h1 class="text-3xl md:text-4xl font-black tracking-tight mb-2">
                            {{ greeting }}, <span class="text-indigo-400">{{ user.name }}</span>!
                        </h1>
                        <p class="text-indigo-200 text-sm leading-relaxed max-w-xl">
                            Fokus isi kotak hari ini aja. Besok urusan besok.
                        </p>
                    </div>

                    <button 
                        @click="showCreateModal = true"
                        class="bg-white text-indigo-950 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-50 transition transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        <span class="text-xl leading-none">+</span> Habit Baru
                    </button>
                </div>
            </div>
        </div>

        <div class="max-w-[98%] mx-auto px-2 mt-6 pb-20"> <div v-if="habits.length > 0" class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                
                <div class="overflow-x-auto custom-scrollbar relative">
                    <div class="inline-block min-w-full align-middle">
                        
                        <div class="table w-full">
                            
                            <div class="table-row bg-slate-50 sticky top-0 z-30">
                                <div class="table-cell sticky left-0 z-40 bg-slate-50 border-b border-r border-slate-200 w-64 md:w-80 min-w-[250px]">
                                    <div class="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Daftar Kebiasaan
                                    </div>
                                </div>
                                
                                <div v-for="day in monthDates" :key="'header-'+day.dayNumber" 
                                    class="table-cell text-center align-middle border-b border-slate-100 min-w-[40px] h-14"
                                    :class="day.isToday ? 'bg-indigo-50/50' : ''"
                                >
                                    <div class="flex flex-col items-center justify-center">
                                        <span class="text-[10px] font-bold uppercase text-slate-400 mb-0.5">{{ day.dayName }}</span>
                                        <span class="text-xs font-black text-slate-700 w-6 h-6 rounded-full flex items-center justify-center"
                                              :class="day.isToday ? 'bg-indigo-600 text-white shadow-md' : ''">
                                            {{ day.dayNumber }}
                                        </span>
                                    </div>
                                </div>
                                
                                <div class="table-cell sticky right-0 z-30 bg-slate-50 border-b border-l border-slate-200 p-3 min-w-[100px] text-center">
                                    <span class="text-xs font-bold text-slate-400 uppercase">Total</span>
                                </div>
                            </div>

                            <div v-for="habit in habits" :key="habit.id" class="table-row group hover:bg-slate-50/50 transition-colors">
                                
                                <div class="table-cell sticky left-0 z-20 bg-white group-hover:bg-slate-50 transition-colors border-r border-slate-100 align-middle shadow-[4px_0_10px_rgba(0,0,0,0.01)]">
                                    <div class="flex items-center gap-4 px-6 py-4">
                                        <div 
                                            class="w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-sm border border-slate-50 flex-shrink-0"
                                            :style="{ backgroundColor: habit.color + '15', color: habit.color }"
                                        >
                                            {{ habit.icon }}
                                        </div>
                                        <div class="min-w-0 flex-1">
                                            <h4 class="font-bold text-slate-800 text-sm truncate max-w-[150px]">{{ habit.name }}</h4>
                                            <button @click="deleteHabit(habit.id, habit.name)" class="text-[10px] text-slate-300 hover:text-rose-500 font-bold mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div v-for="day in monthDates" :key="day.dateString" 
                                    class="table-cell align-middle text-center border-b border-slate-50 px-1"
                                    :class="day.isToday ? 'bg-indigo-50/20' : ''"
                                >
                                    <button 
                                        @click="toggleStatus(habit, day.dateString)"
                                        :disabled="day.isFuture"
                                        class="w-8 h-8 rounded-md flex items-center justify-center transition-all duration-150 mx-auto"
                                        :class="{
                                            'shadow-sm text-white scale-100': getStatus(habit, day.dateString) === 'completed',
                                            'bg-slate-100 text-slate-300': getStatus(habit, day.dateString) === 'skipped',
                                            'bg-white border border-slate-200 hover:border-indigo-400': getStatus(habit, day.dateString) === 'empty' && !day.isFuture,
                                            'bg-slate-50/50 border border-slate-50 opacity-30 cursor-not-allowed': day.isFuture,
                                            'ring-2 ring-indigo-500 ring-offset-1': day.isToday && getStatus(habit, day.dateString) === 'empty'
                                        }"
                                        :style="getStatus(habit, day.dateString) === 'completed' ? { backgroundColor: habit.color } : {}"
                                    >
                                        <span v-if="getStatus(habit, day.dateString) === 'completed'" class="text-xs font-bold">✓</span>
                                        <span v-if="getStatus(habit, day.dateString) === 'skipped'" class="text-xs font-bold">-</span>
                                    </button>
                                </div>

                                <div class="table-cell sticky right-0 z-10 bg-white group-hover:bg-slate-50 transition-colors border-l border-b border-slate-100 align-middle text-center p-2">
                                    <div class="text-sm font-black text-slate-700">
                                        {{ habit.progress_count }}
                                    </div>
                                    <div class="text-[10px] text-slate-400 font-medium">
                                        / {{ habit.monthly_target }}
                                    </div>
                                </div>

                            </div>
                            </div>
                    </div>
                </div>
            </div>

            <div v-else class="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200 mt-6">
                <div class="text-5xl mb-4 opacity-50">🌱</div>
                <h3 class="text-lg font-bold text-slate-800">Belum ada habit</h3>
                <p class="text-slate-500 mb-6 text-sm">Ayo mulai bangun kebiasaan baru sekarang.</p>
                <button @click="showCreateModal = true" class="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition">
                    + Tambah Habit
                </button>
            </div>

            <div v-if="habits.length > 0" class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-6">
                <div class="bg-indigo-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div class="absolute right-0 top-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-10 -mt-10"></div>
                    <div class="relative z-10">
                        <div class="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">Rata-rata Konsistensi</div>
                        <div class="text-4xl font-black mb-2">{{ overallPercentage }}%</div>
                        <div class="w-full bg-indigo-900 rounded-full h-2">
                            <div class="bg-indigo-400 h-2 rounded-full transition-all duration-1000" :style="{ width: overallPercentage + '%' }"></div>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl">✅</div>
                    <div>
                        <div class="text-slate-400 text-xs font-bold uppercase">Total Checklist</div>
                        <div class="text-2xl font-black text-slate-800">{{ totalCompletions }} <span class="text-sm font-medium text-slate-400">Kali</span></div>
                    </div>
                </div>
                <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-2xl">🔥</div>
                    <div>
                        <div class="text-slate-400 text-xs font-bold uppercase">Mood Tracker</div>
                        <div class="text-xl font-black text-slate-800">On Fire!</div>
                    </div>
                </div>
            </div>

        </div>

    </AuthenticatedLayout>
</template>

<style>
.custom-scrollbar::-webkit-scrollbar { height: 10px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; border: 2px solid #fff; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>