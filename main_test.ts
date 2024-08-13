import { assertEquals } from "jsr:@std/assert@1.0.2";
import {divide } from "./main.ts";

Deno.test("unwrapOrElse", () => {
  const resultError = divide(10, 0).unwrapOrElse(error => {
    console.error(error);
    return 0;
  });
  assertEquals(resultError, 0);

  const resultOk = divide(10, 2).unwrapOrElse(error => {
    console.error(error);
    return 0;
  });

  assertEquals(resultOk, 5);
});
