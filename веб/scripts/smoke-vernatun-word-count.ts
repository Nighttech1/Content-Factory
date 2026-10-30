import {
  assertCoverHeadline,
  countWords,
} from "../lib/studio/vernatun-carousel/word-count";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

assert(countWords("ВСЁ РЕШАЕТ ЗНАКОМЫЙ?") === 3, "3 words");
assert(countWords("<b>Один</b> два три четыре пять") === 5, "strip html");
assert(assertCoverHeadline("Три слова тут").ok, "valid cover");
assert(!assertCoverHeadline("Один два три четыре пять").ok, "too long");

console.log("vernatun word-count OK");
