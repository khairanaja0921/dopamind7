<script setup>
import { ref, computed } from 'vue';
import { Link, usePage, router } from '@inertiajs/vue3';
import { loadLanguageAsync } from 'laravel-vue-i18n';

// --- DATA USER & BAHASA ---
const user = usePage().props.auth.user;
const page = usePage();
const currentLang = computed(() => page.props.locale || 'id'); // Deteksi bahasa aktif

// --- STATE MENU MOBILE ---
const showingNavigationDropdown = ref(false);

// --- FUNGSI GANTI BAHASA ---
const switchLang = (lang) => {
    // Logic sama persis kayak GuestLayout:
    // Panggil route PHP -> Simpan Session -> Refresh Halaman
    router.visit(route('lang.switch', lang), {
        method: 'get',
        preserveScroll: true,
        onSuccess: () => {
            loadLanguageAsync(lang);
            // Opsional: window.location.reload() kalau mau hard refresh
        }
    });
};

// --- FUNGSI ACTIVE LINK ---
const isActive = (routeName) => route().current(routeName);
</script>

<template>
    <div class="flex h-screen bg-slate-50 font-sans overflow-hidden selection:bg-indigo-500 selection:text-white">
        
        <aside class="w-72 bg-white border-r border-slate-100 hidden md:flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex-shrink-0 transition-all duration-300">
            
            <div class="h-24 flex items-center px-8">
                <Link :href="route('dashboard')" class="group flex items-center gap-3">
                    <span class="text-3xl transition-transform duration-500 group-hover:rotate-180 text-indigo-600">✦</span>
                    <span class="text-2xl font-black text-indigo-950 tracking-tighter">DopaMind.</span>
                </Link>
            </div>

            <nav class="flex-1 px-6 space-y-2 overflow-y-auto py-6">
                <Link 
                    :href="route('dashboard')" 
                    class="flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group"
                    :class="isActive('dashboard') 
                        ? 'bg-indigo-50 text-indigo-700 shadow-sm font-bold' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'"
                >
                    <span class="text-xl">🏠</span>
                    <span>{{ $t('nav_dashboard') }}</span>
                </Link>

                <Link 
                    :href="route('habits.index')" 
                    class="flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group"
                    :class="isActive('habits.*') 
                        ? 'bg-indigo-50 text-indigo-700 shadow-sm font-bold' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'"
                >
                    <span class="text-xl">🌱</span>
                    <span>{{ $t('habit_page_title') }}</span>
                </Link>

                <div class="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-300 cursor-not-allowed select-none">
                    <span class="text-xl grayscale opacity-50">💸</span>
                    <span class="flex-1">Finance</span>
                    <span class="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Soon</span>
                </div>
            </nav>

            <div class="p-6 border-t border-slate-100 bg-slate-50/50 space-y-6">
                
                <div class="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    <button 
                        @click="switchLang('id')" 
                        class="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all"
                        :class="currentLang === 'id' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'"
                    >
                        🇮🇩 INDO
                    </button>
                    <button 
                        @click="switchLang('en')" 
                        class="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all"
                        :class="currentLang === 'en' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'"
                    >
                        🇬🇧 ENG
                    </button>
                </div>

                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-200">
                        {{ user.name.charAt(0).toUpperCase() }}
                    </div>
                    <div class="flex-1 overflow-hidden">
                        <p class="text-sm font-bold text-indigo-950 truncate">{{ user.name }}</p>
                        <Link :href="route('logout')" method="post" as="button" class="text-xs text-rose-500 hover:text-rose-700 font-medium hover:underline transition">
                            Log Out
                        </Link>
                    </div>
                </div>
            </div>
        </aside>

        <main class="flex-1 overflow-y-auto relative w-full bg-slate-50/50">
            
            <div class="md:hidden bg-white/80 backdrop-blur-md h-16 flex items-center justify-between px-6 border-b border-slate-100 sticky top-0 z-30 shadow-sm">
                <Link :href="route('dashboard')" class="flex items-center gap-2">
                    <span class="text-2xl text-indigo-600">✦</span>
                    <span class="font-black text-indigo-950 text-lg tracking-tight">DopaMind.</span>
                </Link>
                <button @click="showingNavigationDropdown = !showingNavigationDropdown" class="text-slate-500 hover:text-indigo-600 transition">
                    <svg v-if="!showingNavigationDropdown" class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    <svg v-else class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            <div v-show="showingNavigationDropdown" class="md:hidden bg-white border-b border-slate-100 p-4 shadow-xl space-y-4 animate-in slide-in-from-top-2">
                <div class="space-y-1">
                    <Link :href="route('dashboard')" class="block px-4 py-3 rounded-xl font-bold transition" :class="isActive('dashboard') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'">
                        {{ $t('nav_dashboard') }}
                    </Link>
                    <Link :href="route('habits.index')" class="block px-4 py-3 rounded-xl font-bold transition" :class="isActive('habits.*') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'">
                        {{ $t('habit_page_title') }}
                    </Link>
                </div>

                <hr class="border-slate-100">

                <div class="flex gap-2 px-2">
                    <button @click="switchLang('id')" class="flex-1 py-2 rounded-lg text-xs font-bold border transition" :class="currentLang === 'id' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-slate-100 text-slate-400'">🇮🇩 INDO</button>
                    <button @click="switchLang('en')" class="flex-1 py-2 rounded-lg text-xs font-bold border transition" :class="currentLang === 'en' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-slate-100 text-slate-400'">🇬🇧 ENG</button>
                </div>

                <div class="pt-2 border-t border-slate-100 px-4 flex justify-between items-center">
                    <span class="text-sm font-bold text-slate-700">{{ user.name }}</span>
                    <Link :href="route('logout')" method="post" as="button" class="text-sm text-rose-500 font-bold">Log Out</Link>
                </div>
            </div>

            <div class="w-full h-full">
                <slot />
            </div>
        </main>
    </div>
</template>