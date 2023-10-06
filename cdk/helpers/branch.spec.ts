import { getBranch } from "#helpers/branch.ts";
import { branch } from "#helpers/configuration.ts";

describe("branch helper", () => {
    it("branch and configuration should match", () => {
        expect(getBranch()).toEqual(branch);
    });
});