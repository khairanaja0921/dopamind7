<?php

namespace App\Http\Controllers;

use App\Models\Habit;
use App\Models\HabitLog; // Jangan lupa import ini
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class HabitController extends Controller
{
    /**
     * Tampilkan Halaman Utama Habit Tracker
     */
    public function index()
    {
        $user = Auth::user();
        
        // 1. Ambil Habit milik user + Log BULAN INI aja
        $habits = Habit::where('user_id', $user->id)
            ->where('is_archived', false) // Cuma yang aktif
            ->with(['logs' => function ($query) {
                // Filter log cuma dari tanggal 1 bulan ini sampai hari ini
                $query->whereMonth('date', Carbon::now()->month)
                      ->whereYear('date', Carbon::now()->year);
            }])
            ->get()
            ->map(function ($habit) {
                // 2. Modifikasi Data biar gampang dipake di Vue
                
                // Hitung total completed bulan ini (Volume)
                $completedCount = $habit->logs->where('status', 'completed')->count();
                
                // Cek status hari ini (buat tombol Checkbox)
                $todayLog = $habit->logs->where('date', Carbon::today()->format('Y-m-d'))->first();
                
                return [
                    'id' => $habit->id,
                    'name' => $habit->name,
                    'icon' => $habit->icon,
                    'color' => $habit->color,
                    'monthly_target' => $habit->monthly_target,
                    
                    // Data Tambahan (Computed)
                    'progress_count' => $completedCount, // Misal: 12
                    'progress_percent' => min(100, round(($completedCount / $habit->monthly_target) * 100)), // Misal: 60%
                    
                    // Status Hari Ini: null (belum isi), 'completed', atau 'skipped'
                    'today_status' => $todayLog ? $todayLog->status : null,
                    
                    // Kirim semua logs bulan ini buat visualisasi kalender (opsional nanti)
                    'logs' => $habit->logs->map(function ($log) {
                        return [
                            'date' => $log->date,
                            'status' => $log->status
                        ];
                    })
                ];
            });

        // 3. Render ke Halaman Vue (Kita akan buat file 'Habits/Index.vue' habis ini)
        return Inertia::render('Habits/Index', [
            'habits' => $habits,
            'currentMonth' => Carbon::now()->isoFormat('MMMM Y'), // Contoh: "Februari 2026"
        ]);
    }
    
    /**
     * Fungsi buat Nyentang / Skip Habit (Akan dipake nanti)
     */
    public function storeLog(Request $request, Habit $habit)
    {
        // Validasi: Pastikan habit ini punya user yang login
        if ($habit->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'date' => 'required|date',
            'status' => 'required|in:completed,skipped,uncheck' // 'uncheck' buat batalin centang
        ]);

        $date = $request->date;
        $status = $request->status;

        if ($status === 'uncheck') {
            // Kalau user mau batalin centang (apus log)
            HabitLog::where('habit_id', $habit->id)->where('date', $date)->delete();
        } else {
            // Kalau completed/skipped, update atau bikin baru (updateOrCreate)
            HabitLog::updateOrCreate(
                ['habit_id' => $habit->id, 'date' => $date],
                ['status' => $status]
            );
        }

        return back(); // Refresh halaman otomatis (Inertia magic)
    }

    /**
     * Simpan Habit Baru
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'icon' => 'required|string|max:10', // Emoji
            'color' => 'required|string|max:7', // Hex code
            'monthly_target' => 'required|integer|min:1|max:31',
        ]);

        Habit::create([
            'user_id' => Auth::id(),
            'name' => $request->name,
            'icon' => $request->icon,
            'color' => $request->color,
            'monthly_target' => $request->monthly_target,
        ]);

        return back();
    }

    /**
     * Hapus Habit
     */
    public function destroy(Habit $habit)
    {
        if ($habit->user_id !== Auth::id()) abort(403);
        
        $habit->delete();
        return back();
    }
}