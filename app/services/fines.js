export function computeLateFine(dueAt, endEpochMs) {
  const msPerDay = 86400000;
  const days = Math.max(0, Math.ceil((endEpochMs - dueAt) / msPerDay));
  return days * 2;
}

export function computeMissingFine(bookPrice, pendingLate) {
  return Number(bookPrice) + 200 + Number(pendingLate || 0);
}


