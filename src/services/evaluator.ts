import type { Scenario } from '../data/scenarios';

export interface EvaluationResult {
  stars: number;
  feedback: string;
  detailedFeedback: {
    requiredKeywordsFound: string[];
    bonusKeywordsFound: string[];
    forbiddenKeywordsFound: string[];
    missingRequiredKeywords: string[];
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

  evaluate(userResponse: string, scenario: Scenario): EvaluationResult {
    const { keywords } = scenario;
    
    const requiredKeywordsFound = this.findKeywords(userResponse, keywords.required);
    const bonusKeywordsFound = this.findKeywords(userResponse, keywords.bonus);
    const forbiddenKeywordsFound = this.findKeywords(userResponse, keywords.forbidden);
    
    const missingRequiredKeywords = keywords.required.filter(
      keyword => !requiredKeywordsFound.includes(keyword)
    );

    const requiredPercentage = requiredKeywordsFound.length / keywords.required.length;
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

    if (hasForbiddenWords) {
      stars = 0;
      feedback = scenario.feedback.poor;
    } else if (requiredPercentage === 1) {
      stars = Math.min(3, 2 + Math.floor(bonusPoints * 2));
      feedback = stars === 3 ? scenario.feedback.perfect : scenario.feedback.good;
    } else if (requiredPercentage >= 0.6) {
      stars = 1;
      feedback = scenario.feedback.needsWork;
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
      },
    };
  }
}

export const evaluator = new ResponseEvaluator();