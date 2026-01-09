<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HabitLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'habit_id', 'date', 'status', 'notes'
    ];

    // Relasi: Log ini milik Habit siapa?
    public function habit()
    {
        return $this->belongsTo(Habit::class);
    }
}