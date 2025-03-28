// example of rustify
import { type Result, Ok, Err } from "./src";

const divide = (a: number, b: number): Result<number, string> =>
  b === 0 ? Err("Divisor is zero") : Ok(a / b);

const result = divide(10, 5).unwrapOrElse((err) => {
  console.error("Division error: ", err);
  return 0;
});

console.log({ result }); // 2 or 0 if error
