export function replaceElementsById<T extends { id?: string }>(currentArray: T[], updatedArray: T[]) {

  const copy = [ ...currentArray ];

  for (const val of updatedArray) {
    const index = copy.findIndex((item: any) => item.id === val.id);
    copy[index] = val;
  }

  return copy;
}
