// Minimal shim in case we replace native date input later
export function getDateEpochMsFromInput(inputEl) {
  return new Date(`${inputEl.value}T23:59:59`).getTime();
}


