<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Habit;
use App\Models\HabitLog;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class HabitSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ambil User Pertama (atau bikin kalau belum ada)
        $user = User::first();
        
        if (!$user) {
            $user = User::create([
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => bcrypt('password'),
            ]);
        }

        // 2. Daftar Kebiasaan Contoh
        $habits = [
            [
                'name' => 'Lari Pagi',
                'icon' => '🏃‍♂️',
                'color' => '#10b981', // Emerald-500
                'monthly_target' => 20,
            ],
            [
                'name' => 'Baca Buku',
                'icon' => '📚',
                'color' => '#6366f1', // Indigo-500
                'monthly_target' => 15,
            ],
            [
                'name' => 'Minum Air 2L',
                'icon' => '💧',
                'color' => '#3b82f6', // Blue-500
                'monthly_target' => 30, // Tiap hari
            ],
            [
                'name' => 'Meditasi',
                'icon' => '🧘‍♂️',
                'color' => '#f59e0b', // Amber-500
                'monthly_target' => 10,
            ],
        ];

        // 3. Loop buat masukin ke Database
        foreach ($habits as $data) {
            $habit = Habit::create([
                'user_id' => $user->id,
                'name' => $data['name'],
                'icon' => $data['icon'],
                'color' => $data['color'],
                'monthly_target' => $data['monthly_target'],
            ]);

            // 4. Bikin Riwayat Palsu (Logs) untuk Bulan Ini
            // Kita isi acak dari tanggal 1 sampai hari ini
            $startDate = Carbon::now()->startOfMonth();
            $today = Carbon::now();

            for ($date = $startDate; $date->lte($today); $date->addDay()) {
                
                // Logic acak: 
                // 60% Kemungkinan Completed
                // 10% Kemungkinan Skipped
                // 30% Kemungkinan Kosong (Gak bikin log)
                
                $chance = rand(1, 100);

                if ($chance <= 60) {
                    HabitLog::create([
                        'habit_id' => $habit->id,
                        'date' => $date->format('Y-m-d'),
                        'status' => 'completed',
                    ]);
                } elseif ($chance > 60 && $chance <= 70) {
                    HabitLog::create([
                        'habit_id' => $habit->id,
                        'date' => $date->format('Y-m-d'),
                        'status' => 'skipped', // Izin/Skip
                    ]);
                }
                // Sisanya (chance > 70) gak bikin record apa-apa (artinya Missed/Kosong)
            }
        }
    }
}