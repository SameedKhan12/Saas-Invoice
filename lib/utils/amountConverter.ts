// Use this in your FORM handleSubmit
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

// Use this in your TABLE for display
export function formatCurrency(cents: number): string {
  return (cents / 10000).toFixed(2);
}