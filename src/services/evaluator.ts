import type { Scenario } from '../data/scenarios';

export interface EvaluationResult {
  stars: number;
  feedback: string;
  detailedFeedback: {
    requiredKeywordsFound: string[];
    bonusKeywordsFound: string[];
    forbiddenKeywordsFound: string[];
    missingRequiredKeywords: string[];
    numericalHints?: string[];
  };
}

export class ResponseEvaluator {
  private normalizeText(text: string): string {
    return text.toLowerCase().trim();
  }

  private findKeywords(text: string, keywords: string[]): string[] {
    const normalizedText = this.normalizeText(text);
    return keywords.filter(keyword => {
      const normalizedKeyword = this.normalizeText(keyword);
      return normalizedText.includes(normalizedKeyword);
    });
  }

  private evaluateNumericalAnswer(userResponse: string, correctYear: string, tolerance: number = 2): { isClose: boolean; hint?: string } {
    // Extract all 4-digit numbers from the response
    const yearMatches = userResponse.match(/\b(19\d{2}|20\d{2})\b/g);
    if (!yearMatches) return { isClose: false };

    const correctYearNum = parseInt(correctYear);
    
    for (const yearMatch of yearMatches) {
      const userYear = parseInt(yearMatch);
      const difference = userYear - correctYearNum;
      
      if (Math.abs(difference) === 0) {
        return { isClose: true };
      } else if (Math.abs(difference) <= tolerance) {
        const hint = difference > 0 
          ? "Almost! A little bit earlier" 
          : "Almost! A little bit later";
        return { isClose: true, hint };
      }
    }
    
    return { isClose: false };
  }

  evaluate(userResponse: string, scenario: Scenario): EvaluationResult {
    const { keywords } = scenario;
    
    const requiredKeywordsFound = this.findKeywords(userResponse, keywords.required);
    const bonusKeywordsFound = this.findKeywords(userResponse, keywords.bonus);
    const forbiddenKeywordsFound = this.findKeywords(userResponse, keywords.forbidden);
    
    const missingRequiredKeywords = keywords.required.filter(
      keyword => !requiredKeywordsFound.includes(keyword)
    );

    // Check for numerical answers (years)
    const yearKeywords = keywords.required.filter(kw => /^\d{4}$/.test(kw));
    const numericalHints: string[] = [];
    let hasCloseNumericalAnswer = false;
    
    for (const yearKeyword of yearKeywords) {
      if (!requiredKeywordsFound.includes(yearKeyword)) {
        const { isClose, hint } = this.evaluateNumericalAnswer(userResponse, yearKeyword);
        if (isClose && hint) {
          hasCloseNumericalAnswer = true;
          numericalHints.push(hint);
          // Remove from missing keywords if it's close
          const index = missingRequiredKeywords.indexOf(yearKeyword);
          if (index > -1) {
            missingRequiredKeywords.splice(index, 1);
          }
        }
      }
    }

    const adjustedRequiredFound = requiredKeywordsFound.length + (hasCloseNumericalAnswer ? 0.5 : 0);
    const requiredPercentage = adjustedRequiredFound / keywords.required.length;
    const hasForbiddenWords = forbiddenKeywordsFound.length > 0;
    const bonusPoints = bonusKeywordsFound.length * 0.1;

    let stars = 0;
    let feedback = '';

    // Special case for financial scenario: "no", "nope", or "no thanks" should award at least 1 star
    const normalizedResponse = this.normalizeText(userResponse);
    const isFinancialScenario = scenario.id === 'financial';
    const hasNoResponse = normalizedResponse.includes('no') || 
                         normalizedResponse.includes('nope') || 
                         normalizedResponse.includes('no thanks');

    if (hasForbiddenWords && !hasCloseNumericalAnswer) {
      stars = 0;
      feedback = scenario.feedback.poor;
    } else if (hasCloseNumericalAnswer && forbiddenKeywordsFound.length > 0) {
      // If they have a close numerical answer but used a forbidden keyword (like "1928")
      stars = 0.5; // Half star
      feedback = numericalHints.join(' ') + ' ' + scenario.feedback.needsWork;
    } else if (requiredPercentage === 1) {
      stars = Math.min(3, 2 + Math.floor(bonusPoints * 2));
      feedback = stars === 3 ? scenario.feedback.perfect : scenario.feedback.good;
    } else if (requiredPercentage >= 0.6 || hasCloseNumericalAnswer) {
      stars = hasCloseNumericalAnswer ? 0.5 : 1;
      feedback = hasCloseNumericalAnswer 
        ? numericalHints.join(' ') + ' ' + scenario.feedback.needsWork
        : scenario.feedback.needsWork;
    } else if (isFinancialScenario && hasNoResponse) {
      // Award at least 1 star for "no" responses in financial scenario
      stars = 1;
      feedback = scenario.feedback.needsWork;
    } else {
      stars = 0;
      feedback = scenario.feedback.poor;
    }

    return {
      stars,
      feedback,
      detailedFeedback: {
        requiredKeywordsFound,
        bonusKeywordsFound,
        forbiddenKeywordsFound,
        missingRequiredKeywords,
        numericalHints: numericalHints.length > 0 ? numericalHints : undefined,
      },
    };
  }
}

export const evaluator = new ResponseEvaluator();