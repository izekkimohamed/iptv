export const cleanName = (name: string) => {
  return name
    .replace(/^.*[|-]\s/i, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/[()]/g, "")
    .trim();
};

