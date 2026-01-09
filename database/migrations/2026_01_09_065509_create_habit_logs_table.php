<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('habit_logs', function (Blueprint $table) {
        $table->id();
        // Hubungkan ke Habit
        $table->foreignId('habit_id')->constrained('habits')->onDelete('cascade');
        
        $table->date('date'); // Tanggal kejadian (2024-02-25)
        
        // Status: completed (Hijau), skipped (Abu-abu/Izin)
        // Kita gak simpan 'failed', karena failed itu cuma ketiadaan data.
        $table->enum('status', ['completed', 'skipped'])->default('completed');
        
        $table->text('notes')->nullable(); // Catatan kecil (Opsional)
        $table->timestamps();
        
        // Mencegah duplikat: Satu habit cuma bisa ada satu log per tanggal
        $table->unique(['habit_id', 'date']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('habit_logs');
    }
};
