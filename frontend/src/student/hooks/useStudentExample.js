import { useState } from "react";

export function useStudentExample() {
  const [value, setValue] = useState(0);
  return { value, inc: () => setValue((v) => v + 1) };
}
