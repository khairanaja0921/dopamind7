// ==========================================
// 1. IMPORT & SETUP
// ==========================================
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, router, useForm, usePage } from '@inertiajs/vue3';
import { ref, computed, watch } from 'vue';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import 'dayjs/locale/en';
import localeData from 'dayjs/plugin/localeData';
import HabitChart from '@/Components/HabitChart.vue'; 
import axios from 'axios'; 

dayjs.extend(localeData);

const props = defineProps({
    habits: Object,
    currentMonth: String,
    monthQuery: String, 
    hasPrevHabits: Boolean, 
    prevMonthQuery: String,
    savedMood: String
});

const user = usePage().props.auth.user;

// --- STATE LOKAL (OPTIMISTIC UI) ---
const localHabits = ref(JSON.parse(JSON.stringify(props.habits.data)));

// Sync kalau props berubah
watch(() => props.habits, (newVal) => {
    localHabits.value = JSON.parse(JSON.stringify(newVal.data));
}, { deep: true });

const showCreateModal = ref(false);
const todayDate = dayjs().locale('id').format('dddd, D MMMM YYYY');

// Logic Sapaan
const greetingKey = computed(() => {
    const hour = dayjs().hour();
    if (hour < 11) return 'greet_morning';
    if (hour < 15) return 'greet_noon';
    if (hour < 19) return 'greet_afternoon';
    return 'greet_night';
});

// ==========================================
// 2. DATA STATIC (ICON & COLOR)
// ==========================================
const iconList = [
    '🔥', '💧', '🏃‍♂️', '📚', '🧘‍♂️', '💻', '💰', '💊', 
    '🥦', '💤', '🧹', '🎸', '🎨', '🐶', '🎓', '⚡',
    '🚫', '🥗', '🏋️', '🚴', '🤲', '🕌', '✈️', '🎵'
];

const colorPalette = [
    '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', 
    '#3b82f6', '#6366f1', '#d946ef', '#8b5cf6', '#64748b'
];

const form = useForm({
    id: null,
    name: '', 
    icon: '⚡', 
    color: '#6366f1', 
    monthly_target: 20
});

// ==========================================
// 3. LOGIC TANGGALAN & STATS
// ==========================================
const monthDates = computed(() => {
    const activeLang = usePage().props.locale || 'id'; 
    dayjs.locale(activeLang); 

    const targetDate = props.monthQuery ? dayjs(props.monthQuery) : dayjs();
    const daysInMonth = targetDate.daysInMonth();
    let days = [];
    
    for (let i = 1; i <= daysInMonth; i++) {
        const date = targetDate.date(i); 
        days.push({
            dateString: date.format('YYYY-MM-DD'),
            dayNumber: i,
            dayName: date.format('ddd'), 
            isToday: date.isSame(dayjs(), 'day'),
            isFuture: date.isAfter(dayjs(), 'day')
        });
    }
    return days;
});

// Progress Hari Ini
const todayProgress = computed(() => {
    if (localHabits.value.length === 0) return 0;
    const todayStr = dayjs().format('YYYY-MM-DD');
    let completed = 0;
    localHabits.value.forEach(h => {
        const log = h.logs.find(l => l.date === todayStr);
        if (log && log.status === 'completed') completed++;
    });
    return Math.round((completed / localHabits.value.length) * 100);
});

// Stats Bawah
const totalCompletions = computed(() => {
    let total = 0;
    localHabits.value.forEach(h => total += h.progress_count);
    return total;
});

const overallPercentage = computed(() => {
    if (localHabits.value.length === 0) return 0;
    let totalPercent = 0;
    localHabits.value.forEach(h => totalPercent += h.progress_percent);
    return Math.round(totalPercent / localHabits.value.length);
});

// ==========================================
// 4. ACTION HANDLERS (CRUD & TOGGLE)
// ==========================================
const changeMonth = (direction) => {
    const current = props.monthQuery ? dayjs(props.monthQuery) : dayjs();
    const newDate = direction === 'next' 
        ? current.add(1, 'month') 
        : current.subtract(1, 'month');
        
    router.get(route('habits.index'), { 
        month: newDate.format('YYYY-MM') 
    }, {
        preserveState: false,
        preserveScroll: true 
    });
};

const getStatus = (habit, dateString) => {
    const log = habit.logs.find(l => l.date === dateString);
    return log ? log.status : 'empty';
};

// 👇 FUNCTION TOGGLE STATUS (SUDAH DIBERSIHKAN)
const toggleStatus = async (habitId, dateString, forceStatus = null) => {
    // 1. Cek masa depan
    if (dayjs(dateString).isAfter(dayjs(), 'day')) return;

    // 2. Cari Data Lokal
    const habitIndex = localHabits.value.findIndex(h => h.id === habitId);
    if (habitIndex === -1) return;
    const habit = localHabits.value[habitIndex];

    // 3. Tentukan Status Sekarang
    const logIndex = habit.logs.findIndex(l => l.date === dateString);
    const currentStatus = logIndex !== -1 ? habit.logs[logIndex].status : 'empty';

    // 4. Logic Baru (Support Klik Kanan/Skip)
    let newStatus = 'completed';

    if (forceStatus) {
        newStatus = (currentStatus === forceStatus) ? 'uncheck' : forceStatus;
    } else {
        // KLIK KIRI BIASA: Cuma Centang <-> Kosong (Gak ada Skip)
        if (currentStatus === 'completed' || currentStatus === 'skipped') {
            newStatus = 'uncheck'; // Kalau udah centang/skip, jadi kosong
        } else {
            newStatus = 'completed'; // Kalau kosong, jadi centang
        }}

    // 5. Update Tampilan (Optimistic UI)
    if (logIndex !== -1) {
        if (newStatus === 'uncheck') habit.logs.splice(logIndex, 1);
        else habit.logs[logIndex].status = newStatus;
    } else if (newStatus !== 'uncheck') {
        habit.logs.push({ date: dateString, status: newStatus });
    }

    // 6. Hitung Ulang Progress (SUDAH MASUK KANDANG)
    const newCompletedCount = habit.logs.filter(l => l.status === 'completed').length;
    habit.progress_count = newCompletedCount;
    habit.progress_percent = habit.monthly_target > 0 
        ? Math.min(100, Math.round((newCompletedCount / habit.monthly_target) * 100)) 
        : 0;

    // 7. Kirim ke Server (Silent Mode / Axios)
    try {
        await axios.post(route('habits.log', habitId), {
            date: dateString, 
            status: newStatus
        });
    } catch (e) { 
        console.error("Gagal save:", e); 
    }
};



// --- UPDATE FUNGSI SUBMIT ---
const submitHabit = () => {
    // Kita "inject" data periode ke dalam form sebelum dikirim
    // props.monthQuery isinya "2026-01" (dari controller)
    form.transform((data) => ({
        ...data,
        period: props.monthQuery 
    }));

    if (isEditing.value) {
        // KALAU EDIT
        form.patch(route('habits.update', form.id), {
            onSuccess: () => { showCreateModal.value = false; form.reset(); }
        });
    } else {
        // KALAU BARU
        form.post(route('habits.store'), {
            onSuccess: () => { showCreateModal.value = false; form.reset(); }
        });
    }
};

// --- TAMBAH FUNGSI COPY ---
// Pasang ini di tombol "Salin dari Bulan Lalu"
// --- STATE MODAL COPY ---
const showCopyModal = ref(false);

// 1. Fungsi Buka Modal (Dipasang di tombol "Salin dari Bulan Lalu")
const openCopyModal = () => {
    showCopyModal.value = true;
};

// 2. Eksekusi Salin (Dipasang di tombol "Ya" dalam Modal)
const executeCopy = () => {
    router.post(route('habits.copy'), {
        current_period: props.monthQuery,
        prev_period: props.prevMonthQuery
    }, {
        preserveScroll: true,
        onSuccess: () => {
            showCopyModal.value = false; // Tutup modal kalau sukses
        }
    });
};

const deleteHabit = (id, name) => {
    if (confirm(`Hapus habit "${name}"?`)) {
        router.delete(route('habits.destroy', id), { preserveScroll: true });
    }
};


const deleteFromEdit = () => {
    showCreateModal.value = false;
    const habitData = localHabits.value.find(h => h.id === form.id);
    confirmDelete(habitData);
};

const isEditing = ref(false); // Penanda status

// Fungsi Buka Modal buat Edit
const editHabit = (habit) => {
    isEditing.value = true;
    showCreateModal.value = true;

    // Isi form dengan data habit yang mau diedit
    form.id = habit.id;
    form.name = habit.name;
    form.icon = habit.icon;
    form.color = habit.color;
    form.monthly_target = habit.monthly_target;
};

// Fungsi Buka Modal buat Baru (Reset dulu)
const openCreateModal = () => {
    isEditing.value = false;
    form.reset(); // Kosongkan form
    form.id = null;
    showCreateModal.value = true;
};

// Fungsi Tutup Modal & Bersihkan State
    const closeModal = () => {
        showCreateModal.value = false;
        
        // Tunggu animasi tutup bentar (opsional), lalu reset
        setTimeout(() => {
            isEditing.value = false;
            form.reset();
            form.id = null;
        }, 200);
    };

    // --- STATE DELETE MODAL ---
const showDeleteModal = ref(false);
const habitToDelete = ref(null); // Nyimpen object habit yg lagi dipilih

// 1. Buka Modal Konfirmasi
const confirmDelete = (habit) => {
    habitToDelete.value = habit;
    showDeleteModal.value = true;
};

// 2. Eksekusi Hapus (Ke Server)
const executeDelete = () => {
    if (!habitToDelete.value) return;

    router.delete(route('habits.destroy', habitToDelete.value.id), {
        preserveScroll: true,
        onSuccess: () => {
            showDeleteModal.value = false;
            habitToDelete.value = null; // Reset
        }
    });
};

// --- LOGIC KEYBOARD NAVIGATION & SPASI ---
// 🔥 UPDATE: Tambahkan parameter habitId & dateString biar spasi jalan
const handleGridNav = (e, hIndex, dIndex, habitId, dateString) => {
    const key = e.key;

    // 1. LOGIC SPASI (Manual Toggle)
    if (key === ' ') {
        e.preventDefault(); // Cegah layar scroll ke bawah saat spasi
        toggleStatus(habitId, dateString); // 🔥 Eksekusi centang/uncentang
        return; 
    }

    // 2. LOGIC PANAH (Navigasi)
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) return;

    e.preventDefault(); // Cegah scroll browser bawaan

    let targetH = hIndex;
    let targetD = dIndex;

    // Hitung Koordinat Baru
    if (key === 'ArrowUp') targetH--;
    if (key === 'ArrowDown') targetH++;
    if (key === 'ArrowLeft') targetD--;
    if (key === 'ArrowRight') targetD++;

    // Cari elemen tetangga
    const targetId = `cell-${targetH}-${targetD}`;
    const el = document.getElementById(targetId);

    if (el) {
        // A. Pindahkan Fokus (Biar ring pink pindah)
        el.focus();

        // B. AUTO SCROLL (Biar ngikutin zoom level berapapun)
        // 'nearest' artinya: "Geser scroll CUMA KALAU elemennya ketutupan/kepotong"
        el.scrollIntoView({ 
            behavior: 'auto', // Gerakannya halus
            block: 'nearest',   // Vertikal: Jaga posisi atas/bawah
            inline: 'nearest'   // Horizontal: Jaga posisi kiri/kanan (PENTING BUAT TABEL)
        });
    }
};


// ==========================================
// LOGIC MOOD TRACKER (DROPDOWN)
// ==========================================

// 1. Data Opsi Mood
// 1. Data Opsi Mood (Labelnya sekarang pakai KUNCI KAMUS)
    const moodOptions = [
        { code: 'fire', icon: '🔥', label_key: 'mood_fire', color: 'bg-amber-100 text-amber-600' },
        { code: 'happy', icon: '😄', label_key: 'mood_happy', color: 'bg-emerald-100 text-emerald-600' },
        { code: 'neutral', icon: '😐', label_key: 'mood_neutral', color: 'bg-slate-100 text-slate-600' },
        { code: 'sad', icon: '😢', label_key: 'mood_sad', color: 'bg-blue-100 text-blue-600' },
        { code: 'stress', icon: '🤯', label_key: 'mood_stress', color: 'bg-rose-100 text-rose-600' },
        { code: 'sick', icon: '🤒', label_key: 'mood_sick', color: 'bg-purple-100 text-purple-600' },
    ];
// 2. State Dropdown
const showMoodDropdown = ref(false);

// 3. Computed: Mood apa yang aktif sekarang?
const currentMoodData = computed(() => {
    // Kalau database kosong, default ke 'fire' (biar kayak tampilan awal kamu)
    if (!props.savedMood) return moodOptions[0]; 
    // Kalau ada, cari datanya
    return moodOptions.find(m => m.code === props.savedMood) || moodOptions[0];
});

// 4. Action: Pilih Mood
const selectMood = (code) => {
    showMoodDropdown.value = false; // Tutup menu
    router.post(route('habits.mood'), {
        mood_code: code,
        period: props.monthQuery
    }, { preserveScroll: true });
};