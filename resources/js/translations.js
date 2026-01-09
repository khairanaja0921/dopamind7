import { usePage } from '@inertiajs/vue3';

export function trans(key) {
    const translations = usePage().props.translations;
    return translations[key] || key; // Kalau gak ada kuncinya, tampilin key-nya aja
}