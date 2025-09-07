<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Modules\FeedManagement\Models\FeedProgram;

class FeedProgramsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $programs = [
            [
                'name' => 'Standard Broiler Program',
                'code' => 'SBP001',
                'description' => 'Complete 6-week feeding program for commercial broilers',
                'version' => '1.0',
                'breed_type' => 'broiler',
                'specific_breed' => 'Ross 308',
                'target_batch_size_min' => 100,
                'target_batch_size_max' => 5000,
                'program_data' => [
                    'weeks' => [
                        '1' => [
                            'feed_type' => 'starter',
                            'protein_content' => 22,
                            'daily_amount_per_bird' => 20,
                            'feeding_frequency' => 4,
                            'feeding_times' => ['06:00', '12:00', '18:00', '22:00'],
                            'notes' => 'Critical period - monitor closely'
                        ],
                        '2-3' => [
                            'feed_type' => 'starter',
                            'protein_content' => 20,
                            'daily_amount_per_bird' => 'progressive_25_to_60',
                            'feeding_frequency' => 3,
                            'feeding_times' => ['07:00', '14:00', '21:00']
                        ],
                        '4-5' => [
                            'feed_type' => 'grower',
                            'protein_content' => 19,
                            'daily_amount_per_bird' => 'progressive_70_to_120',
                            'feeding_frequency' => 3,
                            'feeding_times' => ['07:00', '14:00', '21:00']
                        ],
                        '6+' => [
                            'feed_type' => 'finisher',
                            'protein_content' => 17,
                            'daily_amount_per_bird' => 'progressive_130_to_150',
                            'feeding_frequency' => 2,
                            'feeding_times' => ['08:00', '20:00']
                        ]
                    ],
                    'transitions' => [
                        'starter_to_grower' => [
                            'start_week' => 4,
                            'transition_days' => 3,
                            'mixing_schedule' => [
                                'day_1' => ['starter' => 75, 'grower' => 25],
                                'day_2' => ['starter' => 50, 'grower' => 50],
                                'day_3' => ['starter' => 25, 'grower' => 75]
                            ]
                        ],
                        'grower_to_finisher' => [
                            'start_week' => 6,
                            'transition_days' => 3,
                            'mixing_schedule' => [
                                'day_1' => ['grower' => 75, 'finisher' => 25],
                                'day_2' => ['grower' => 50, 'finisher' => 50],
                                'day_3' => ['grower' => 25, 'finisher' => 75]
                            ]
                        ]
                    ]
                ],
                'expected_fcr' => 1.75,
                'expected_survival_rate' => 95.00,
                'total_duration_days' => 42,
                'estimated_cost_per_bird' => 185.00,
                'status' => 'active',
                'is_default' => true,
                'is_template' => true,
                'source' => 'admin_created',
                'created_by' => 1,
            ],
            [
                'name' => 'Layer Pullet Program',
                'code' => 'LPP001',
                'description' => 'Complete rearing program for layer pullets 0-18 weeks',
                'version' => '1.0',
                'breed_type' => 'layer',
                'specific_breed' => 'Lohmann Brown',
                'target_batch_size_min' => 200,
                'target_batch_size_max' => 10000,
                'program_data' => [
                    'weeks' => [
                        '1-6' => [
                            'feed_type' => 'starter',
                            'protein_content' => 18.5,
                            'daily_amount_per_bird' => 'progressive_15_to_50',
                            'feeding_frequency' => 4,
                            'feeding_times' => ['06:00', '11:00', '16:00', '21:00']
                        ],
                        '7-12' => [
                            'feed_type' => 'grower',
                            'protein_content' => 16.5,
                            'daily_amount_per_bird' => 'progressive_55_to_80',
                            'feeding_frequency' => 3,
                            'feeding_times' => ['07:00', '14:00', '21:00']
                        ],
                        '13-18' => [
                            'feed_type' => 'developer',
                            'protein_content' => 15.5,
                            'daily_amount_per_bird' => 'progressive_85_to_110',
                            'feeding_frequency' => 2,
                            'feeding_times' => ['08:00', '20:00']
                        ]
                    ],
                    'transitions' => [
                        'starter_to_grower' => [
                            'start_week' => 7,
                            'transition_days' => 5,
                            'mixing_schedule' => [
                                'day_1' => ['starter' => 80, 'grower' => 20],
                                'day_3' => ['starter' => 60, 'grower' => 40],
                                'day_5' => ['starter' => 40, 'grower' => 60]
                            ]
                        ]
                    ]
                ],
                'expected_fcr' => 2.20,
                'expected_survival_rate' => 96.00,
                'total_duration_days' => 126,
                'estimated_cost_per_bird' => 95.00,
                'status' => 'active',
                'is_default' => true,
                'source' => 'admin_created',
                'created_by' => 1,
            ],
            [
                'name' => 'Organic Broiler Program',
                'code' => 'OBP001',
                'description' => 'Organic feeding program for slow-growth broilers',
                'version' => '1.0',
                'breed_type' => 'broiler',
                'specific_breed' => 'Freedom Ranger',
                'target_batch_size_min' => 50,
                'target_batch_size_max' => 1000,
                'program_data' => [
                    'weeks' => [
                        '1-2' => [
                            'feed_type' => 'organic_starter',
                            'protein_content' => 20,
                            'daily_amount_per_bird' => 'progressive_18_to_35',
                            'feeding_frequency' => 4,
                            'feeding_times' => ['06:30', '12:00', '17:30', '22:00']
                        ],
                        '3-6' => [
                            'feed_type' => 'organic_grower',
                            'protein_content' => 18,
                            'daily_amount_per_bird' => 'progressive_40_to_100',
                            'feeding_frequency' => 3,
                            'feeding_times' => ['07:00', '14:00', '20:30']
                        ],
                        '7-10' => [
                            'feed_type' => 'organic_finisher',
                            'protein_content' => 16,
                            'daily_amount_per_bird' => 'progressive_110_to_140',
                            'feeding_frequency' => 2,
                            'feeding_times' => ['08:00', '19:00']
                        ]
                    ]
                ],
                'expected_fcr' => 2.50,
                'expected_survival_rate' => 92.00,
                'total_duration_days' => 70,
                'estimated_cost_per_bird' => 295.00,
                'status' => 'active',
                'is_template' => true,
                'source' => 'admin_created',
                'created_by' => 1,
            ],
            [
                'name' => 'Breeder Program',
                'code' => 'BRP001',
                'description' => 'Complete breeding stock feeding program',
                'version' => '1.0',
                'breed_type' => 'breeder',
                'specific_breed' => 'Ross 308 PS',
                'target_batch_size_min' => 100,
                'target_batch_size_max' => 2000,
                'program_data' => [
                    'weeks' => [
                        '20-30' => [
                            'feed_type' => 'breeder_developer',
                            'protein_content' => 16,
                            'daily_amount_per_bird' => 'restricted_110_to_140',
                            'feeding_frequency' => 1,
                            'feeding_times' => ['08:00']
                        ],
                        '31-60' => [
                            'feed_type' => 'breeder_layer',
                            'protein_content' => 16.5,
                            'daily_amount_per_bird' => 'restricted_160_to_170',
                            'feeding_frequency' => 1,
                            'feeding_times' => ['08:00']
                        ]
                    ]
                ],
                'expected_fcr' => 3.20,
                'expected_survival_rate' => 88.00,
                'total_duration_days' => 280,
                'estimated_cost_per_bird' => 850.00,
                'status' => 'active',
                'source' => 'admin_created',
                'created_by' => 1,
            ],
        ];

        foreach ($programs as $program) {
            FeedProgram::updateOrCreate(
                ['code' => $program['code']],
                $program
            );
        }
    }
}
