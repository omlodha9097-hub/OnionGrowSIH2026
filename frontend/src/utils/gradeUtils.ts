export interface GradeProfile {
  grade: 'A' | 'B' | 'C' | 'REJECT';
  canonicalGrade: string;
  displayName: string;
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  borderColor: string;
  sealColor: string;
  sealTitle: string;
  sealSubtitle: string;
  qualityScoreBenchmark: string;
  defaultRationale: string;
  diameterBenchmark: string;
  sphericityBenchmark: string;
  ratePerQuintal: number;
  marketDestination: string;
  recommendation: string;
  dbtEligible: boolean;
}

export function normalizeGrade(gradeInput?: string): 'A' | 'B' | 'C' | 'REJECT' {
  if (!gradeInput) return 'C';
  const raw = gradeInput.trim();
  const upper = raw.toUpperCase();

  // 1. Check REJECT / SUBSTANDARD first
  if (
    upper === 'REJECT' ||
    upper === 'REJECTED' ||
    upper === 'GRADE REJECT' ||
    upper === 'SUBSTANDARD' ||
    upper === 'D' ||
    upper === 'GRADE D' ||
    upper.includes('REJECT') ||
    upper.includes('SUBSTANDARD')
  ) {
    return 'REJECT';
  }

  // 2. Check Grade A / Export (must match Grade A specifically, not just letter 'A' in 'GRADE')
  if (
    upper === 'A' ||
    upper === 'GRADE A' ||
    upper === 'GRADE_A' ||
    upper.startsWith('GRADE A') ||
    /\bGRADE\s*A\b/.test(upper) ||
    upper.includes('EXPORT')
  ) {
    return 'A';
  }

  // 3. Check Grade B / Domestic
  if (
    upper === 'B' ||
    upper === 'GRADE B' ||
    upper === 'GRADE_B' ||
    upper.startsWith('GRADE B') ||
    /\bGRADE\s*B\b/.test(upper) ||
    upper.includes('DOMESTIC')
  ) {
    return 'B';
  }

  // 4. Check Grade C / Local
  if (
    upper === 'C' ||
    upper === 'GRADE C' ||
    upper === 'GRADE_C' ||
    upper.startsWith('GRADE C') ||
    /\bGRADE\s*C\b/.test(upper) ||
    upper.includes('LOCAL') ||
    upper.includes('PROCESSING')
  ) {
    return 'C';
  }

  if (upper.endsWith(' A') || upper.startsWith('A ')) return 'A';
  if (upper.endsWith(' B') || upper.startsWith('B ')) return 'B';
  if (upper.endsWith(' C') || upper.startsWith('C ')) return 'C';

  return 'C';
}

export function getGradeProfile(gradeInput?: string, batchId?: string): GradeProfile {
  const norm = normalizeGrade(gradeInput);
  switch (norm) {
    case 'A':
      return {
        grade: 'A',
        canonicalGrade: 'Grade A',
        displayName: 'Grade A (Export Quality)',
        label: 'Grade A - Premium Export Quality',
        badgeBg: 'bg-emerald-100',
        badgeText: 'text-emerald-800',
        badgeBorder: 'border-emerald-300',
        borderColor: 'border-emerald-500',
        sealColor: 'text-emerald-700',
        sealTitle: 'APPROVED FOR EXPORT',
        sealSubtitle: 'NAFED MSP BONUS +15%',
        qualityScoreBenchmark: '85 - 100 PTS',
        defaultRationale: 'Batch meets high-tier export parameters with < 3% defect ratio and uniform spherical size.',
        diameterBenchmark: '60 - 80 mm',
        sphericityBenchmark: '> 90%',
        ratePerQuintal: 2450,
        marketDestination: 'International Export & Supermarket Retail Chains',
        recommendation: 'Approved for immediate NAFED/NCCF procurement at premium MSP + 15% bonus.',
        dbtEligible: true
      };
    case 'B':
      return {
        grade: 'B',
        canonicalGrade: 'Grade B',
        displayName: 'Grade B (Domestic Market)',
        label: 'Grade B - Standard Domestic Market',
        badgeBg: 'bg-blue-100',
        badgeText: 'text-blue-800',
        badgeBorder: 'border-blue-300',
        borderColor: 'border-blue-500',
        sealColor: 'text-blue-700',
        sealTitle: 'APPROVED DOMESTIC',
        sealSubtitle: 'STANDARD NAFED MSP RATE',
        qualityScoreBenchmark: '70 - 84 PTS',
        defaultRationale: 'Batch meets standard domestic APMC mandi criteria with minor surface skin cuts.',
        diameterBenchmark: '50 - 65 mm',
        sphericityBenchmark: '80 - 89%',
        ratePerQuintal: 2125,
        marketDestination: 'Domestic APMC Mandis & Inter-State Wholesale',
        recommendation: 'Approved for APMC procurement at standard MSP.',
        dbtEligible: true
      };
    case 'C':
      return {
        grade: 'C',
        canonicalGrade: 'Grade C',
        displayName: 'Grade C (Local Processing)',
        label: 'Grade C - Local Retail / Processing Grade',
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-800',
        badgeBorder: 'border-amber-300',
        borderColor: 'border-amber-500',
        sealColor: 'text-amber-700',
        sealTitle: 'LOCAL PROCESSING ONLY',
        sealSubtitle: 'DEHYDRATION PLANT CLEARANCE',
        qualityScoreBenchmark: '50 - 69 PTS',
        defaultRationale: 'Higher proportion of skin cuts / minor sprouting detected; suitable for immediate dehydration processing.',
        diameterBenchmark: '40 - 55 mm',
        sphericityBenchmark: '70 - 79%',
        ratePerQuintal: 1750,
        marketDestination: 'Dehydration Plants & Local Processing Units',
        recommendation: 'Recommended for fast-track liquidation or processing units within 7 days.',
        dbtEligible: true
      };
    case 'REJECT':
    default:
      return {
        grade: 'REJECT',
        canonicalGrade: 'Reject',
        displayName: 'Substandard (Rejected Batch)',
        label: 'Substandard / Rejected Batch',
        badgeBg: 'bg-red-100',
        badgeText: 'text-red-800',
        badgeBorder: 'border-red-300',
        borderColor: 'border-red-500',
        sealColor: 'text-red-700',
        sealTitle: 'PROCUREMENT REJECTED',
        sealSubtitle: 'SEVERE ROTTING / SPROUTING',
        qualityScoreBenchmark: '< 50 PTS',
        defaultRationale: 'Severe fungal rotting or sprouting exceeding 30% thresholds.',
        diameterBenchmark: '< 40 mm',
        sphericityBenchmark: '< 70%',
        ratePerQuintal: 800,
        marketDestination: 'Composting & Industrial Extraction',
        recommendation: 'Not eligible for NAFED MSP procurement due to severe fungal rot / sprouting > 30%.',
        dbtEligible: false
      };
  }
}
