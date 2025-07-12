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
  
  private checkPhraseSimilarity(text: string, phrase: string): boolean {
    // Split phrase into words and check if they appear near each other
    const words = phrase.split(' ');
    if (words.length < 2) return false;
    
    // Check if all words appear within a reasonable distance
    let lastIndex = -1;
    for (const word of words) {
      // Also check for partial matches (e.g., "inside" matches part of "insider")
      const index = text.indexOf(word);
      const partialIndex = text.search(new RegExp(word.slice(0, -1) + '\\w*'));
      
      if (index === -1 && partialIndex === -1) return false;
      
      const foundIndex = index !== -1 ? index : partialIndex;
      // Words should be within 10 characters of each other
      if (lastIndex !== -1 && foundIndex - lastIndex > 15) return false;
      lastIndex = foundIndex;
    }
    
    return true;
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
      // Handle variations for policy
      if (keyword === 'policy') {
        return normalizedText.includes('policy') || normalizedText.includes('policies') ||
               normalizedText.includes('polici'); // Handle typos like "polici"
      }
      // Handle compliance variations
      if (keyword === 'compliance') {
        return normalizedText.includes('compliance') || normalizedText.includes('complian') ||
               normalizedText.includes('comply');
      }
      // Handle regulations variations
      if (keyword === 'regulations') {
        return normalizedText.includes('regulation') || normalizedText.includes('regulat') ||
               normalizedText.includes('rules') || normalizedText.includes('law');
      }
      // Handle "cannot" variations
      if (keyword === 'cannot') {
        return normalizedText.includes('cannot') || normalizedText.includes('can\'t') || 
               normalizedText.includes('can not') || normalizedText.includes('unable');
      }
      // Handle "not allowed" variations
      if (keyword === 'not allowed') {
        return normalizedText.includes('not allowed') || normalizedText.includes('not permitted') || 
               normalizedText.includes('against') || normalizedText.includes('prohibited');
      }
      // Handle "insider trading" as a phrase with common variations
      if (keyword === 'insider trading') {
        return normalizedText.includes('insider trading') || 
               normalizedText.includes('inside trading') || // Common typo/variation
               (normalizedText.includes('insider') && normalizedText.includes('trad')) ||
               (normalizedText.includes('inside') && normalizedText.includes('trad')) ||
               this.checkPhraseSimilarity(normalizedText, 'insider trading');
      }
      
      // For multi-word phrases, use similarity check
      if (keyword.includes(' ')) {
        return normalizedText.includes(normalizedKeyword) || 
               this.checkPhraseSimilarity(normalizedText, normalizedKeyword);
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
    
    // Check for off-topic marker
    const isOffTopic = userResponse.includes('[OFF_TOPIC]');
    if (isOffTopic && scenario.id === 'financial') {
      return {
        stars: 0,
        feedback: 'You seem confused about the topic. Remember to stay focused on the question asked.',
        detailedFeedback: {
          requiredKeywordsFound: [],
          bonusKeywordsFound: [],
          forbiddenKeywordsFound: [],
          missingRequiredKeywords: keywords.required,
          specificHints: ['The client asked about insider tips. You need to address this directly.'],
        },
      };
    }
    
    const requiredKeywordsFound = this.findKeywords(userResponse, keywords.required);
    const bonusKeywordsFound = this.findKeywords(userResponse, keywords.bonus);
    const forbiddenKeywordsFound = this.findKeywords(userResponse, keywords.forbidden);
    
    // Debug logging for financial scenario
    if (scenario.id === 'financial') {
      console.log('Financial scenario evaluation:', {
        userResponse: userResponse.substring(0, 100),
        requiredKeywordsFound,
        keywords: keywords.required
      });
    }
    
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

    // Special case: in financial scenario, if they use "tips" in a refusal context, don't count it as forbidden
    const isFinancialScenario = scenario.id === 'financial';
    let effectiveForbiddenWords = forbiddenKeywordsFound;
    if (isFinancialScenario && forbiddenKeywordsFound.includes('tips')) {
      const normalizedResponse = this.normalizeText(userResponse);
      // Check if "tips" is used in a refusal context
      if (normalizedResponse.includes('cannot') || normalizedResponse.includes('can\'t') || 
          normalizedResponse.includes('not') || normalizedResponse.includes('no')) {
        effectiveForbiddenWords = forbiddenKeywordsFound.filter(word => word !== 'tips');
      }
    }
    
    const hasForbiddenWords = effectiveForbiddenWords.length > 0;
    const bonusPoints = bonusKeywordsFound.length * 0.1;

    let stars = 0;
    let feedback = '';
    let summaryFeedback = '';

    // Special case for financial scenario: "no", "nope", or "no thanks" should award at least 1 star
    const normalizedResponse = this.normalizeText(userResponse);
    const hasNoResponse = normalizedResponse.includes('no') || 
                         normalizedResponse.includes('nope') || 
                         normalizedResponse.includes('no thanks');
    
    // For financial scenario, check if they have a proper refusal with explanation
    // A refusal can be either explicit "no" with explanation OR just compliance language indicating refusal
    const hasFinancialRefusal = isFinancialScenario && 
                               ((hasNoResponse && 
                                 (normalizedResponse.includes('polic') || normalizedResponse.includes('complian') || 
                                  normalizedResponse.includes('regulat') || normalizedResponse.includes('against') ||
                                  normalizedResponse.includes('illegal') || normalizedResponse.includes('allowed') ||
                                  normalizedResponse.includes('insider'))) ||
                                // Also accept compliance refusals without explicit "no"
                                (normalizedResponse.includes('against') && normalizedResponse.includes('polic')) ||
                                (normalizedResponse.includes('cannot') && normalizedResponse.includes('polic')) ||
                                (normalizedResponse.includes('not allowed') && normalizedResponse.includes('polic')));
    
    // Special handling for concatenated responses like "nope its against our policies"
    // This should be treated as a 2-star response with contextual feedback
    const isSimpleNoFollowedByPolicy = isFinancialScenario && 
                                      normalizedResponse.match(/^(no|nope)\s+(its?\s+against|against)\s+(our\s+)?polic/);

    // Calculate actual number of required keywords found (including close numerical answers)
    const actualRequiredFound = requiredKeywordsFound.length;
    const totalRequired = keywords.required.length;
    
    // Debug logging for Volvo scenario
    if (scenario.id === 'volvo') {
      console.log('Volvo scenario evaluation:', {
        userResponse: userResponse.substring(0, 100),
        requiredKeywordsFound,
        actualRequiredFound,
        totalRequired,
        hasCloseNumericalAnswer,
        yearKeywords,
        numericalHints
      });
    }
    
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
    
    // Debug logging for financial scenario
    if (isFinancialScenario) {
      console.log('Financial evaluation debug:', {
        userResponse: userResponse.substring(0, 50),
        normalizedResponse: normalizedResponse.substring(0, 50),
        hasNoResponse,
        hasFinancialRefusal,
        isSimpleNoFollowedByPolicy,
        requiredKeywordsFound,
        bonusKeywordsFound,
        actualRequiredFound,
        hasForbiddenWords,
        forbiddenKeywordsFound
      });
    }
    
    // For close numerical answers, don't count the wrong year as a forbidden word
    let effectiveForbiddenCount = forbiddenKeywordsFound.length;
    if (hasCloseNumericalAnswer && scenario.id === 'volvo') {
      // Remove year-related forbidden words from count
      const nonYearForbiddenWords = forbiddenKeywordsFound.filter(word => !/^\d{4}$/.test(word));
      effectiveForbiddenCount = nonYearForbiddenWords.length;
    }
    
    if (effectiveForbiddenCount > 0 && !hasCloseNumericalAnswer) {
      stars = 0;
      feedback = scenario.feedback.poor;
    } else if (hasCloseNumericalAnswer && effectiveForbiddenCount > 0) {
      // Has close year but also non-year forbidden words
      stars = 0.5;
      feedback = scenario.feedback.needsWork;
    } else if (actualRequiredFound === totalRequired) {
      // All required keywords found
      stars = Math.min(3, 2 + Math.floor(bonusPoints * 2));
      feedback = scenario.feedback.good;
      if (stars === 3) feedback = scenario.feedback.perfect;
      
      // Special case for financial scenario with perfect response
      if (isFinancialScenario && actualRequiredFound >= 4 && bonusKeywordsFound.length >= 1) {
        stars = 3;
        feedback = "You're on the money! Ruth seems irritated but you managed to not give in.";
      }
      
      // Also give 3 stars for responses that have 3+ required keywords and mention insider
      if (isFinancialScenario && actualRequiredFound >= 3 && 
          (bonusKeywordsFound.includes('insider') || bonusKeywordsFound.includes('insider trading'))) {
        stars = 3;
        feedback = "You're on the money! Ruth seems irritated but you managed to not give in.";
      }
      
      // Give 3 stars for responses that mention insider trading with a proper refusal
      if (isFinancialScenario && hasFinancialRefusal && 
          bonusKeywordsFound.includes('insider trading')) {
        stars = 3;
        feedback = "You're on the money! Ruth seems irritated but you managed to not give in.";
      }
    } else if (actualRequiredFound === totalRequired - 1 || (actualRequiredFound >= 2 && totalRequired === 3) || 
               (isFinancialScenario && actualRequiredFound >= 2)) {
      // 2/3 key points covered = 2 stars, or 2+ keywords for financial scenario
      stars = 2;
      feedback = scenario.feedback.good;
      
      // Check first if this is a 3-star response with insider trading
      if (isFinancialScenario && hasFinancialRefusal && 
          bonusKeywordsFound.includes('insider trading')) {
        stars = 3;
        feedback = "You're on the money! Ruth seems irritated but you managed to not give in.";
      }
      // Special contextual feedback for 2-star financial responses
      else if (isFinancialScenario && actualRequiredFound === 2) {
        feedback = "Good start, but you could strengthen your response by mentioning specific regulations or the legal implications of insider trading.";
      }
      
      // Special case for "nope" + "its against our policies" pattern
      if (isSimpleNoFollowedByPolicy && stars !== 3) {
        stars = 2;
        feedback = "Good job! You refused appropriately and mentioned policy. To strengthen your response further, you could mention specific regulations like SEC rules or the legal implications of insider trading.";
        summaryFeedback = "Great job on compliance awareness and appropriate boundaries!";
      }
    } else if (actualRequiredFound >= 1 || hasCloseNumericalAnswer || hasFinancialRefusal || 
               (isFinancialScenario && hasNoResponse && bonusKeywordsFound.length > 0)) {
      // At least 1 key point covered = 1 star (or 2 for good financial refusal)
      if (hasFinancialRefusal && actualRequiredFound >= 1) {
        stars = 2;
        feedback = scenario.feedback.good;
        
        // Check if this should be upgraded to 3 stars for insider trading
        if (isFinancialScenario && bonusKeywordsFound.includes('insider trading')) {
          stars = 3;
          feedback = "You're on the money! Ruth seems irritated but you managed to not give in.";
        }
        
        // Debug logging
        console.log('Financial refusal with keywords:', { 
          hasFinancialRefusal, 
          actualRequiredFound, 
          requiredKeywordsFound,
          bonusKeywordsFound,
          normalizedResponse: normalizedResponse.substring(0, 100) 
        });
      } else if (isFinancialScenario && hasNoResponse && bonusKeywordsFound.includes('insider trading')) {
        // Refusal with insider trading shows good understanding even without required keywords
        stars = 2;
        feedback = scenario.feedback.good;
      } else if (isSimpleNoFollowedByPolicy) {
        // Already handled above
        stars = 2;
      } else if (hasCloseNumericalAnswer && actualRequiredFound >= 1) {
        // Has close year AND at least one other correct answer
        // 0.5 for close year + 1 for one correct answer = 1.5 stars
        if (scenario.id === 'volvo') {
          console.log('Volvo - 1.5 star branch hit!', {
            hasCloseNumericalAnswer,
            actualRequiredFound
          });
        }
        stars = 1.5;
        feedback = scenario.feedback.needsWork;
      } else {
        // Log why we're in this branch
        if (scenario.id === 'volvo') {
          console.log('Volvo - falling to else branch:', {
            hasCloseNumericalAnswer,
            actualRequiredFound,
            condition: `hasCloseNumericalAnswer && actualRequiredFound >= 1 = ${hasCloseNumericalAnswer && actualRequiredFound >= 1}`
          });
        }
        stars = hasCloseNumericalAnswer ? 0.5 : 1;
        feedback = scenario.feedback.needsWork;
      }
    } else if (isFinancialScenario && hasNoResponse) {
      // Award at least 1 star for "no" responses in financial scenario
      stars = 1;
      feedback = scenario.feedback.needsWork;
    } else {
      stars = 0;
      feedback = scenario.feedback.poor;
    }

    // Clear summary feedback if rating is poor (0 stars) or if we have specific 3-star feedback
    if (stars === 0) {
      summaryFeedback = '';
    }
    
    // For 3-star financial responses with "You're on the money" feedback, combine into single message
    if (stars === 3 && feedback === "You're on the money! Ruth seems irritated but you managed to not give in." && summaryFeedback) {
      feedback = `${feedback} ${summaryFeedback}`;
      summaryFeedback = '';
    }
    
    return {
      stars,
      feedback,
      summaryFeedback: summaryFeedback || undefined,
      detailedFeedback: {
        requiredKeywordsFound,
        bonusKeywordsFound,
        forbiddenKeywordsFound: effectiveForbiddenWords,
        missingRequiredKeywords,
        numericalHints: numericalHints.length > 0 ? numericalHints : undefined,
        specificHints: specificHints.length > 0 ? specificHints : undefined,
      },
    };
  }
}

export const evaluator = new ResponseEvaluator();