/**
 * Harvest Heist - 4-Tier Standardized Onion Grading Engine
 * Tier Classifications: Grade A (Export), Grade B (Domestic Market), Grade C (Local Consumption), Reject (Substandard)
 */

function calculateGrading(aiRawResult) {
  const total = aiRawResult.totalOnionsDetected || 1;
  const tierCounts = aiRawResult.tierCounts || {
    "Grade A": 0, "Grade B": 0, "Grade C": 0, "Reject": 0
  };

  const gradeA = tierCounts["Grade A"] || 0;
  const gradeB = tierCounts["Grade B"] || 0;
  const gradeC = tierCounts["Grade C"] || 0;
  const reject = tierCounts["Reject"] || 0;

  // Calculate 4-Tier Percentages
  const tierPercentages = {
    gradeA: Math.round((gradeA / total) * 100),
    gradeB: Math.round((gradeB / total) * 100),
    gradeC: Math.round((gradeC / total) * 100),
    reject: Math.round((reject / total) * 100)
  };

  // Deductions: Reject -30, Grade C -15, Grade B -5 per count normalized
  const deductions = (reject * 30 + gradeC * 15 + gradeB * 5);
  const rawScore = Math.max(15, Math.min(100, Math.round(100 - (deductions / total) * 2.2)));

  let assignedGrade = 'Grade A';
  if (rawScore < 55 || reject >= 2) {
    assignedGrade = 'Reject';
  } else if (rawScore < 72 || gradeC >= 3) {
    assignedGrade = 'Grade C';
  } else if (rawScore < 88 || gradeB >= 2) {
    assignedGrade = 'Grade B';
  }

  // Explainability Rationale
  let explanation = '';
  if (assignedGrade === 'Grade A') {
    explanation = `Premium Export Quality: ${gradeA} of ${total} onions (${tierPercentages.gradeA}%) meet Grade A standards with uniform diameter (>60mm), >96% sphericity, and zero rot.`;
  } else if (assignedGrade === 'Grade B') {
    explanation = `Standard Domestic Market Quality: Batch contains ${gradeB} Grade B onions with minor surface blemishes or slight diameter variations, but structurally sound.`;
  } else if (assignedGrade === 'Grade C') {
    explanation = `Fair Local Consumption Grade: ${gradeC} onions are undersized (<45mm) or exhibit mild sprouting, requiring immediate local processing.`;
  } else {
    explanation = `Substandard Batch Rejected: High defect threshold breached with ${reject} rotten or severely damaged onions.`;
  }

  return {
    qualityScore: rawScore,
    suggestedGrade: assignedGrade,
    finalAssignedGrade: assignedGrade,
    tierPercentages,
    explanationText: explanation
  };
}

module.exports = {
  calculateGrading
};
