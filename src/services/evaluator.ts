import type { Scenario } from '../data/scenarios';

export interface EvaluationResult {
  stars: number;
  feedback: string;
  summaryFeedback?: string;
  detailedFeedback: {
    requiredKeywordsFound: string[];
    bonusKeywordsFound: string[];
    forbiddenKeywordsFound: string[];
    missingRequiredKeywords: string[];
    numericalHints?: string[];
    specificHints?: string[];
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
      // Handle special cases for model names with special characters
      if (keyword === 'ÖV4') {
        return normalizedText.includes('öv4') || normalizedText.includes('ov4');
      }
      // Handle common misspellings
      if (keyword === 'Jakob') {
        return normalizedText.includes('jakob') || normalizedText.includes('jacob');
      }
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
    const specificHints: string[] = [];
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

    // Generate specific hints for missing keywords
    if (scenario.id === 'volvo') {
      const normalizedResponse = this.normalizeText(userResponse);
      
      // Check if they mentioned wrong names (but not common misspellings)
      const wrongNames = ['john', 'james', 'joseph', 'jack', 'johan', 'jonas'];
      const hasWrongName = wrongNames.some(name => normalizedResponse.includes(name));
      const hasJacobSpelling = normalizedResponse.includes('jacob');
      
      if (missingRequiredKeywords.includes('Jakob') && !hasJacobSpelling && hasWrongName) {
        specificHints.push('You do really need to look back at the actual car details and inspiration though. Hint: His name was Jakob');
      }
      
      // Check if they mentioned wrong model names
      const wrongModels = ['öv3', 'öv5', 'ov4', 'ov3', 'ov5'];
      const hasWrongModel = wrongModels.some(model => normalizedResponse.includes(model));
      
      if (missingRequiredKeywords.includes('ÖV4') || hasWrongModel) {
        specificHints.push('The model name is important too. Hint: It was the ÖV4');
      }
    }

    const hasForbiddenWords = forbiddenKeywordsFound.length > 0;
    const bonusPoints = bonusKeywordsFound.length * 0.1;

    let stars = 0;
    let feedback = '';
    let summaryFeedback = '';

    // Special case for financial scenario: "no", "nope", or "no thanks" should award at least 1 star
    const normalizedResponse = this.normalizeText(userResponse);
    const isFinancialScenario = scenario.id === 'financial';
    const hasNoResponse = normalizedResponse.includes('no') || 
                         normalizedResponse.includes('nope') || 
                         normalizedResponse.includes('no thanks');

    // Calculate actual number of required keywords found (including close numerical answers)
    const actualRequiredFound = requiredKeywordsFound.length;
    const totalRequired = keywords.required.length;
    
    // Generate summary feedback
    if (actualRequiredFound > 0 || hasCloseNumericalAnswer) {
      const rightParts: string[] = [];
      const wrongParts: string[] = [];
      
      // What they got right
      if (scenario.id === 'volvo') {
        if (requiredKeywordsFound.includes('1927')) rightParts.push('the year');
        else if (hasCloseNumericalAnswer) wrongParts.push('the year (close but not quite)');
        
        if (requiredKeywordsFound.includes('ÖV4')) rightParts.push('the model');
        else if (missingRequiredKeywords.includes('ÖV4')) wrongParts.push('the model name');
        
        if (requiredKeywordsFound.includes('Jakob')) rightParts.push('the inspiration');
        else if (missingRequiredKeywords.includes('Jakob')) wrongParts.push('who it was named after');
      } else if (isFinancialScenario) {
        if (requiredKeywordsFound.some(kw => ['compliance', 'regulations', 'policy'].includes(kw))) {
          rightParts.push('compliance awareness');
        }
        if (requiredKeywordsFound.some(kw => ['cannot', 'not allowed'].includes(kw))) {
          rightParts.push('appropriate boundaries');
        }
      }
      
      if (rightParts.length > 0 && wrongParts.length > 0) {
        summaryFeedback = `You nailed ${rightParts.join(' and ')} but forgot ${wrongParts.join(' and ')}.`;
      } else if (rightParts.length > 0) {
        summaryFeedback = `Great job on ${rightParts.join(' and ')}!`;
      }
    }
    
    if (hasForbiddenWords && !hasCloseNumericalAnswer) {
      stars = 0;
      feedback = scenario.feedback.poor;
    } else if (hasCloseNumericalAnswer && forbiddenKeywordsFound.length > 0) {
      // If they have a close numerical answer but used a forbidden keyword (like "1928")
      stars = 0.5; // Half star
      feedback = scenario.feedback.needsWork;
    } else if (actualRequiredFound === totalRequired) {
      // All required keywords found
      stars = Math.min(3, 2 + Math.floor(bonusPoints * 2));
      feedback = scenario.feedback.good;
      if (stars === 3) feedback = scenario.feedback.perfect;
    } else if (actualRequiredFound === totalRequired - 1 || (actualRequiredFound >= 2 && totalRequired === 3)) {
      // 2/3 key points covered = 2 stars
      stars = 2;
      feedback = scenario.feedback.good;
    } else if (actualRequiredFound >= 1 || hasCloseNumericalAnswer) {
      // At least 1 key point covered = 1 star
      stars = hasCloseNumericalAnswer ? 0.5 : 1;
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
      summaryFeedback: summaryFeedback || undefined,
      detailedFeedback: {
        requiredKeywordsFound,
        bonusKeywordsFound,
        forbiddenKeywordsFound,
        missingRequiredKeywords,
        numericalHints: numericalHints.length > 0 ? numericalHints : undefined,
        specificHints: specificHints.length > 0 ? specificHints : undefined,
      },
    };
  }
}

export const evaluator = new ResponseEvaluator();