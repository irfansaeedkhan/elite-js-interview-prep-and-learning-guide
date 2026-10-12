/** Normalize user output predictions for loose matching. */
export function normalizePrediction(input: string): string {
  return input
    .toLowerCase()
    .split(/[\s,]+/)
    .filter(Boolean)
    .join('');
}

export function predictionsMatch(userInput: string, expected: string): boolean {
  return normalizePrediction(userInput) === normalizePrediction(expected);
}
