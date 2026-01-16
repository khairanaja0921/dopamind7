<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('habits', 'status')) {
            Schema::table('habits', function (Blueprint $table) {
                // Pake string/integer bebas, yang penting ada kolomnya
                $table->string('status')->default('active')->after('name');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('habits', 'status')) {
            Schema::table('habits', function (Blueprint $table) {
                $table->dropColumn('status');
            });
        }
    }
};
