export const cleanName = (name: string) => {
  return name
    .replace(/^[A-Z]{2}\s*-\s*/g, "")
    .replace(/^[^-\-]+[-–]\s*/g, "")
    .replace(/^[A-Z]{2}\s*-\s*/i, "")
    .replace(/\([^)]*\)/g, "")
    .trim();
};
