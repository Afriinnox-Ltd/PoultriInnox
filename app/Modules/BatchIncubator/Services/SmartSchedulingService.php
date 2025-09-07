<?php

namespace App\Modules\BatchIncubator\Services;

use App\Modules\BatchIncubator\Models\Batch;
use App\Modules\BatchIncubator\Models\MedicationProtocol;
use App\Modules\BatchIncubator\Models\VaccinationProtocol;
use App\Modules\FeedManagement\Models\FeedProgram;
use Carbon\Carbon;

class SmartSchedulingService
{
    /**
     * Get comprehensive recommendations for a batch
     */
    public function getRecommendationsForBatch(Batch $batch): array
    {
        return [
            'feed_recommendations' => $this->getFeedRecommendations($batch),
            'medication_recommendations' => $this->getMedicationRecommendations($batch),
            'vaccination_recommendations' => $this->getVaccinationRecommendations($batch),
            'health_alerts' => $this->getHealthAlerts($batch),
            'performance_insights' => $this->getPerformanceInsights($batch),
        ];
    }

    /**
     * Get smart feed program recommendations for batch
     */
    public function getFeedRecommendations(Batch $batch): array
    {
        $recommendations = [];

        // Get applicable feed programs with better filtering
        $feedPrograms = FeedProgram::where('status', 'active')
            ->where(function($query) use ($batch) {
                $query->where('breed_type', 'chicken')
                      ->orWhere('breed_type', 'broiler')
                      ->orWhere('breed_type', 'layer')
                      ->orWhere('breed_type', 'dual_purpose')
                      ->orWhere('specific_breed', $batch->breed)
                      ->orWhereNull('breed_type');
            })
            ->where(function($query) use ($batch) {
                $query->where('target_batch_size_min', '<=', $batch->current_count)
                      ->where('target_batch_size_max', '>=', $batch->current_count)
                      ->orWhere(function($q) {
                          $q->whereNull('target_batch_size_min')
                            ->whereNull('target_batch_size_max');
                      });
            })
            ->get();

        foreach ($feedPrograms as $program) {
            if ($this->feedProgramAppliesTo($program, $batch)) {
                $score = $this->calculateFeedProgramScore($program, $batch);
                $costAnalysis = $this->calculateFeedProgramCost($program, $batch);
                $performanceProjection = $this->projectFeedProgramPerformance($program, $batch);

                $recommendations[] = [
                    'program' => $program,
                    'compatibility_score' => $score,
                    'recommendation_reason' => $this->getFeedRecommendationReason($program, $batch),
                    'expected_benefits' => $this->getFeedProgramBenefits($program),
                    'implementation_notes' => $this->getFeedImplementationNotes($program, $batch),
                    'cost_analysis' => $costAnalysis,
                    'performance_projection' => $performanceProjection,
                    'risk_assessment' => $this->assessFeedProgramRisk($program, $batch),
                ];
            }
        }

        // Sort by compatibility score
        usort($recommendations, function($a, $b) {
            return $b['compatibility_score'] <=> $a['compatibility_score'];
        });

        return array_slice($recommendations, 0, 3); // Top 3 recommendations
    }

    /**
     * Get medication recommendations for batch
     */
    public function getMedicationRecommendations(Batch $batch): array
    {
        $recommendations = [];

        $medicationProtocols = MedicationProtocol::autoRecommend()
            ->whereIn('bird_type', ['chicken', 'broiler', 'layer', 'all'])
            ->forAge($batch->age_days)
            ->get();

        foreach ($medicationProtocols as $protocol) {
            if ($protocol->appliesTo($batch)) {
                $urgency = $this->calculateMedicationUrgency($protocol, $batch);
                $dosage = $protocol->calculateDosage($batch);

                $recommendations[] = [
                    'protocol' => $protocol,
                    'urgency_level' => $urgency,
                    'dosage_info' => $dosage,
                    'recommendation_reason' => $this->getMedicationRecommendationReason($protocol, $batch),
                    'timing' => $this->getMedicationTiming($protocol, $batch),
                    'cost_estimate' => $this->calculateMedicationCost($protocol, $batch),
                    'withdrawal_info' => $this->getWithdrawalInfo($protocol),
                ];
            }
        }

        // Sort by urgency level
        usort($recommendations, function($a, $b) {
            $urgencyOrder = ['critical' => 4, 'high' => 3, 'medium' => 2, 'low' => 1];
            return ($urgencyOrder[$b['urgency_level']] ?? 0) <=> ($urgencyOrder[$a['urgency_level']] ?? 0);
        });

        return $recommendations;
    }

    /**
     * Get vaccination recommendations for batch
     */
    public function getVaccinationRecommendations(Batch $batch): array
    {
        $recommendations = [];

        $vaccinationProtocols = VaccinationProtocol::autoRecommend()
            ->whereIn('bird_type', ['chicken', 'broiler', 'layer', 'all'])
            ->forAge($batch->age_days)
            ->get();

        foreach ($vaccinationProtocols as $protocol) {
            if ($protocol->appliesTo($batch)) {
                $priority = $this->calculateVaccinationPriority($protocol, $batch);
                $timing = $this->getVaccinationTiming($protocol, $batch);
                $doses = $protocol->calculateDosesNeeded($batch);

                $recommendations[] = [
                    'protocol' => $protocol,
                    'priority_level' => $priority,
                    'timing_info' => $timing,
                    'dose_info' => $doses,
                    'recommendation_reason' => $this->getVaccinationRecommendationReason($protocol, $batch),
                    'schedule_details' => $this->getVaccinationScheduleDetails($protocol, $batch),
                    'booster_requirements' => $this->getBoosterRequirements($protocol, $batch),
                ];
            }
        }

        // Sort by priority level
        usort($recommendations, function($a, $b) {
            $priorityOrder = ['critical' => 4, 'high' => 3, 'medium' => 2, 'low' => 1];
            return ($priorityOrder[$b['priority_level']] ?? 0) <=> ($priorityOrder[$a['priority_level']] ?? 0);
        });

        return $recommendations;
    }

    /**
     * Get health alerts for batch
     */
    public function getHealthAlerts(Batch $batch): array
    {
        $alerts = [];

        // High mortality alert
        if ($batch->mortality_rate > 5) {
            $alerts[] = [
                'type' => 'mortality',
                'level' => 'high',
                'message' => "Mortality rate ({$batch->mortality_rate}%) is above acceptable levels",
                'recommendations' => [
                    'Review feeding program',
                    'Check water quality',
                    'Consider preventive medication',
                    'Improve ventilation and housing conditions'
                ]
            ];
        }

        // Weight gain alert
        $expectedWeight = $this->calculateExpectedWeight($batch);
        $actualWeight = $batch->getAverageWeightPerBird();
        $weightVariance = (($actualWeight - $expectedWeight) / $expectedWeight) * 100;

        if ($weightVariance < -15) {
            $alerts[] = [
                'type' => 'growth',
                'level' => 'medium',
                'message' => "Weight gain is {$weightVariance}% below expected levels",
                'recommendations' => [
                    'Review feed quality and quantity',
                    'Check for disease symptoms',
                    'Evaluate environmental conditions',
                    'Consider growth-promoting supplements'
                ]
            ];
        }

        // Overdue vaccinations
        $overdueVaccinations = $this->getOverdueVaccinations($batch);
        if (!empty($overdueVaccinations)) {
            $alerts[] = [
                'type' => 'vaccination',
                'level' => 'high',
                'message' => count($overdueVaccinations) . " vaccination(s) are overdue",
                'recommendations' => array_map(function($v) {
                    return "Administer {$v['vaccine_name']} vaccination immediately";
                }, $overdueVaccinations)
            ];
        }

        return $alerts;
    }

    /**
     * Get performance insights for batch
     */
    public function getPerformanceInsights(Batch $batch): array
    {
        $insights = [];

        // FCR Analysis
        $fcr = $batch->getAverageFCR();
        if ($fcr > 0) {
            $fcrBenchmark = $this->getFCRBenchmark($batch->breed, $batch->age_days);
            $fcrVariance = (($fcr - $fcrBenchmark) / $fcrBenchmark) * 100;

            if ($fcrVariance > 10) {
                $insights[] = [
                    'type' => 'feed_efficiency',
                    'metric' => 'FCR',
                    'current_value' => $fcr,
                    'benchmark' => $fcrBenchmark,
                    'variance' => round($fcrVariance, 1),
                    'assessment' => 'Poor',
                    'improvement_tips' => [
                        'Review feed quality and composition',
                        'Check feeding schedule consistency',
                        'Evaluate environmental stress factors',
                        'Consider digestive supplements'
                    ]
                ];
            } elseif ($fcrVariance < -5) {
                $insights[] = [
                    'type' => 'feed_efficiency',
                    'metric' => 'FCR',
                    'current_value' => $fcr,
                    'benchmark' => $fcrBenchmark,
                    'variance' => round($fcrVariance, 1),
                    'assessment' => 'Excellent',
                    'achievement_notes' => 'Feed conversion is above industry standards'
                ];
            }
        }

        // Production insights for layers
        if ($batch->status->value === 'laying') {
            $productionRate = $batch->getProductionRate();
            $expectedRate = $this->getExpectedProductionRate($batch->breed, $batch->age_days);

            if ($productionRate < $expectedRate * 0.9) {
                $insights[] = [
                    'type' => 'production',
                    'metric' => 'Egg Production Rate',
                    'current_value' => $productionRate,
                    'expected_value' => $expectedRate,
                    'assessment' => 'Below Expected',
                    'improvement_tips' => [
                        'Check lighting program (14-16 hours daily)',
                        'Ensure adequate calcium in feed',
                        'Review stress factors',
                        'Monitor water consumption'
                    ]
                ];
            }
        }

        return $insights;
    }

    /**
     * Check if feed program applies to batch
     */
    private function feedProgramAppliesTo(FeedProgram $program, Batch $batch): bool
    {
        // Check breed compatibility
        if ($program->specific_breed && $program->specific_breed !== $batch->breed) {
            return false;
        }

        // Check breed type compatibility
        if ($program->breed_type) {
            $batchBreedType = $this->getBirdTypeFromBreed($batch->breed);
            if ($program->breed_type !== $batchBreedType && $program->breed_type !== 'universal') {
                return false;
            }
        }

        // Check batch size compatibility
        if ($program->target_batch_size_min && $batch->current_count < $program->target_batch_size_min) {
            return false;
        }

        if ($program->target_batch_size_max && $batch->current_count > $program->target_batch_size_max) {
            return false;
        }

        // Check if age is within program duration
        if ($program->total_duration_days && $batch->age_days > $program->total_duration_days) {
            return false;
        }

        return true;
    }

    /**
     * Calculate feed program compatibility score
     */
    private function calculateFeedProgramScore(FeedProgram $program, Batch $batch): float
    {
        $score = 0;

        // Base score for general compatibility
        $score += 40;

        // Specific breed match bonus
        if ($program->specific_breed === $batch->breed) {
            $score += 30;
        } elseif ($program->breed_type === 'chicken') {
            $score += 15;
        }

        // Batch size optimization bonus
        if ($program->target_batch_size_min && $program->target_batch_size_max) {
            $targetMid = ($program->target_batch_size_min + $program->target_batch_size_max) / 2;
            $deviation = abs($batch->current_count - $targetMid) / $targetMid;
            $score += (1 - $deviation) * 15; // Up to 15 points for optimal batch size
        }

        // Success rate bonus
        if ($program->success_rate) {
            $score += ($program->success_rate / 100) * 10;
        }

        // Performance metrics bonus
        if ($program->expected_fcr && $program->expected_fcr < 1.8) {
            $score += 5; // Good FCR bonus
        }

        return min(100, max(0, $score));
    }

    /**
     * Calculate feed program cost analysis
     */
    private function calculateFeedProgramCost(FeedProgram $program, Batch $batch): array
    {
        $dailyCost = ($program->estimated_cost_per_bird ?? 0) * $batch->current_count;
        $daysRemaining = max(1, ($program->total_duration_days ?? 42) - $batch->age_days);
        $totalCost = $dailyCost * $daysRemaining;

        return [
            'daily_cost' => round($dailyCost, 2),
            'total_cost_estimate' => round($totalCost, 2),
            'cost_per_bird' => round($program->estimated_cost_per_bird ?? 0, 2),
            'days_remaining' => $daysRemaining,
        ];
    }

    /**
     * Project feed program performance
     */
    private function projectFeedProgramPerformance(FeedProgram $program, Batch $batch): array
    {
        return [
            'expected_fcr' => $program->expected_fcr ?? 1.75,
            'expected_survival_rate' => $program->expected_survival_rate ?? 95,
            'expected_daily_gain' => 55, // grams per day typical
            'projected_final_weight' => $this->calculateProjectedWeight($program, $batch),
        ];
    }

    /**
     * Assess feed program implementation risks
     */
    private function assessFeedProgramRisk(FeedProgram $program, Batch $batch): array
    {
        $risks = [];

        if ($batch->age_days > ($program->total_duration_days ?? 42) * 0.8) {
            $risks[] = 'Late implementation may reduce effectiveness';
        }

        if ($batch->mortality_rate > 3) {
            $risks[] = 'High mortality rate may indicate health issues - monitor closely';
        }

        if (!$program->success_rate || $program->success_rate < 80) {
            $risks[] = 'Limited success data available for this program';
        }

        return [
            'risk_level' => count($risks) > 1 ? 'medium' : (count($risks) > 0 ? 'low' : 'minimal'),
            'risk_factors' => $risks,
        ];
    }

    /**
     * Calculate projected final weight
     */
    private function calculateProjectedWeight(FeedProgram $program, Batch $batch): float
    {
        $currentWeight = $batch->getAverageWeightPerBird();
        $daysRemaining = max(1, ($program->total_duration_days ?? 42) - $batch->age_days);
        $dailyGain = 55; // Default daily gain in grams

        if ($program->program_data && isset($program->program_data['expected_daily_gain'])) {
            $dailyGain = $program->program_data['expected_daily_gain'];
        }

        return $currentWeight + ($dailyGain * $daysRemaining);
    }

    /**
     * Calculate medication urgency level
     */
    private function calculateMedicationUrgency(MedicationProtocol $protocol, Batch $batch): string
    {
        if ($protocol->is_emergency_protocol) {
            return 'critical';
        }

        if ($batch->mortality_rate > 5) {
            return 'high';
        }

        if ($protocol->medication_type === 'antibiotic' && $batch->age_days < 7) {
            return 'medium';
        }

        return 'low';
    }

    /**
     * Calculate vaccination priority
     */
    private function calculateVaccinationPriority(VaccinationProtocol $protocol, Batch $batch): string
    {
        if ($protocol->is_mandatory) {
            return 'critical';
        }

        return $protocol->priority_level;
    }

    /**
     * Get FCR benchmark for breed and age
     */
    private function getFCRBenchmark(string $breed, int $ageDays): float
    {
        // Industry standard FCR benchmarks
        $benchmarks = [
            'Ross 308' => ['35' => 1.55, '42' => 1.65, '49' => 1.80],
            'Cobb 500' => ['35' => 1.50, '42' => 1.60, '49' => 1.75],
            'default' => ['35' => 1.60, '42' => 1.70, '49' => 1.85],
        ];

        $breedBenchmarks = $benchmarks[$breed] ?? $benchmarks['default'];

        if ($ageDays <= 35) return $breedBenchmarks['35'];
        if ($ageDays <= 42) return $breedBenchmarks['42'];
        return $breedBenchmarks['49'];
    }

    /**
     * Calculate expected weight for batch age
     */
    private function calculateExpectedWeight(Batch $batch): float
    {
        // Simple weight projection - should be enhanced with breed-specific data
        $dailyGainGrams = match($batch->breed) {
            'Ross 308' => 60,
            'Cobb 500' => 58,
            default => 55,
        };

        return 45 + ($batch->age_days * $dailyGainGrams); // 45g starting weight
    }

    /**
     * Get overdue vaccinations for batch
     */
    private function getOverdueVaccinations(Batch $batch): array
    {
        $overdue = [];

        $protocols = VaccinationProtocol::active()
            ->where('is_mandatory', true)
            ->get();

        foreach ($protocols as $protocol) {
            if ($protocol->appliesTo($batch) && !$protocol->hasBeenAppliedTo($batch)) {
                $scheduleForAge = $protocol->getScheduleForAge($batch->age_days);
                if ($scheduleForAge) {
                    $overdue[] = [
                        'vaccine_name' => $protocol->vaccine_name,
                        'prevents_disease' => $protocol->prevents_disease,
                        'days_overdue' => $batch->age_days - $scheduleForAge['age_days'],
                    ];
                }
            }
        }

        return $overdue;
    }

    /**
     * Get feed recommendation reason
     */
    private function getFeedRecommendationReason(FeedProgram $program, Batch $batch): string
    {
        $reasons = [];

        if ($program->specific_breed === $batch->breed) {
            $reasons[] = "Specifically formulated for {$batch->breed} breed";
        } elseif ($program->breed_type === 'chicken') {
            $reasons[] = "Designed for chicken production systems";
        }

        if ($program->target_batch_size_min && $program->target_batch_size_max) {
            $targetMid = ($program->target_batch_size_min + $program->target_batch_size_max) / 2;
            if (abs($batch->current_count - $targetMid) / $targetMid < 0.2) {
                $reasons[] = "Optimal batch size match ({$batch->current_count} birds)";
            }
        }

        if ($program->success_rate && $program->success_rate > 85) {
            $reasons[] = "Proven effectiveness with {$program->success_rate}% success rate";
        }

        if ($program->expected_fcr && $program->expected_fcr < 1.7) {
            $reasons[] = "Superior feed conversion efficiency (FCR: {$program->expected_fcr})";
        }

        $daysRemaining = ($program->total_duration_days ?? 42) - $batch->age_days;
        if ($daysRemaining > 0) {
            $reasons[] = "Well-suited for remaining {$daysRemaining} days of production cycle";
        }

        return implode('. ', $reasons) ?: "Compatible feeding program for current batch requirements";
    }

    /**
     * Get medication recommendation reason
     */
    private function getMedicationRecommendationReason(MedicationProtocol $protocol, Batch $batch): string
    {
        if ($protocol->is_emergency_protocol) {
            return "Emergency protocol for urgent health management";
        }

        if ($batch->mortality_rate > 5) {
            return "Recommended due to elevated mortality rate ({$batch->mortality_rate}%)";
        }

        return "Preventive medication suitable for current batch age and condition";
    }

    /**
     * Get vaccination recommendation reason
     */
    private function getVaccinationRecommendationReason(VaccinationProtocol $protocol, Batch $batch): string
    {
        if ($protocol->is_mandatory) {
            return "Mandatory vaccination required for disease prevention";
        }

        return "Recommended vaccination against {$protocol->prevents_disease} for {$batch->breed} breed";
    }

    // Additional helper methods for detailed recommendations...
    private function getFeedProgramBenefits(FeedProgram $program): array
    {
        $benefits = [];

        if ($program->expected_fcr && $program->expected_fcr < 1.7) {
            $benefits[] = 'Excellent feed conversion efficiency (FCR: ' . $program->expected_fcr . ')';
        }

        if ($program->expected_survival_rate && $program->expected_survival_rate > 95) {
            $benefits[] = 'High survival rate expected (' . $program->expected_survival_rate . '%)';
        }

        if ($program->success_rate && $program->success_rate > 85) {
            $benefits[] = 'Proven track record with ' . $program->success_rate . '% success rate';
        }

        $benefits[] = 'Optimized nutrition for current growth stage';
        $benefits[] = 'Consistent feeding schedule and portion control';

        return $benefits;
    }

    private function getFeedImplementationNotes(FeedProgram $program, Batch $batch): string
    {
        $notes = [];

        if ($batch->age_days > 0) {
            $notes[] = "Gradual transition over 5-7 days recommended";
        }

        if ($program->total_duration_days) {
            $remainingDays = $program->total_duration_days - $batch->age_days;
            $notes[] = "Program suitable for remaining {$remainingDays} days";
        }

        $notes[] = "Monitor feed intake and adjust portions based on consumption patterns";

        if ($program->estimated_cost_per_bird) {
            $notes[] = "Budget approximately $" . number_format($program->estimated_cost_per_bird, 2) . " per bird";
        }

        return implode('. ', $notes) . '.';
    }

    private function getMedicationTiming(MedicationProtocol $protocol, Batch $batch): array
    {
        return [
            'recommended_start' => 'Immediately',
            'duration' => $protocol->treatment_duration_days . ' days',
            'best_time' => 'Morning application recommended'
        ];
    }

    private function calculateMedicationCost(MedicationProtocol $protocol, Batch $batch): float
    {
        $dosage = $protocol->calculateDosage($batch);
        return $protocol->cost_per_unit ? $dosage['total_dosage'] * $protocol->cost_per_unit : 0;
    }

    private function getWithdrawalInfo(MedicationProtocol $protocol): array
    {
        return [
            'withdrawal_period' => $protocol->withdrawal_period_days . ' days',
            'affects_consumption' => $protocol->withdrawal_period_days > 0,
        ];
    }

    private function getVaccinationTiming(VaccinationProtocol $protocol, Batch $batch): array
    {
        $schedule = $protocol->getScheduleForAge($batch->age_days);
        return [
            'recommended_age' => $schedule ? $schedule['age_days'] . ' days' : 'Current age suitable',
            'timing' => 'Best administered in the morning',
            'environmental_requirements' => 'Stable temperature and humidity'
        ];
    }

    private function getVaccinationScheduleDetails(VaccinationProtocol $protocol, Batch $batch): array
    {
        return [
            'primary_vaccination' => true,
            'booster_required' => $protocol->requires_booster,
            'booster_interval' => $protocol->booster_interval_days . ' days',
        ];
    }

    private function getBoosterRequirements(VaccinationProtocol $protocol, Batch $batch): ?array
    {
        if (!$protocol->requires_booster) {
            return null;
        }

        return [
            'required' => true,
            'interval' => $protocol->booster_interval_days . ' days',
            'next_due' => now()->addDays($protocol->booster_interval_days)->format('Y-m-d'),
        ];
    }

    private function getExpectedProductionRate(string $breed, int $ageDays): float
    {
        // Industry standard production rates by breed and age
        if ($ageDays < 140) return 0; // Not yet laying
        if ($ageDays < 160) return 75; // Coming into lay
        if ($ageDays < 250) return 92; // Peak production
        if ($ageDays < 350) return 88; // Mid-production
        return 80; // Later production
    }

    /**
     * Map specific breed names to general bird types
     */
    private function getBirdTypeFromBreed(string $breed): string
    {
        $breedMap = [
            // Broiler breeds
            'Ross 308' => 'broiler',
            'Cobb 500' => 'broiler',
            'Hubbard' => 'broiler',

            // Layer breeds
            'Leghorn' => 'layer',
            'Rhode Island Red' => 'layer',
            'ISA Brown' => 'layer',

            // Dual purpose
            'Plymouth Rock' => 'dual_purpose',
            'New Hampshire' => 'dual_purpose',
        ];

        return $breedMap[$breed] ?? 'chicken'; // Default to chicken if breed not found
    }
}
