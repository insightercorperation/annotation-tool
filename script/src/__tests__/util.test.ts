import { sliceArray } from "../util";

describe("slice array by size", () => {
  it("has no remainder", () => {
    const arr = [1, 2, 3, 4, 5, 6];

    const sliced = sliceArray<number>(arr, 3);

    expect(sliced).toEqual([
      [1, 2, 3],
      [4, 5, 6]
    ]);
  });

  it("has remainder", () => {
    const arr = [1, 2, 3, 4, 5];

    const sliced = sliceArray<number>(arr, 3);

    expect(sliced).toEqual([
      [1, 2, 3],
      [4, 5]
    ]);
  });
});
