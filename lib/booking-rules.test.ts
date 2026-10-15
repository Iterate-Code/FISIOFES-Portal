import test from "node:test";
import assert from "node:assert/strict";
import {
  canUseCredit,
  getDailySlots,
  normalizePhone,
  validateCancellation,
} from "./booking-rules.ts";

test("normalizes Colombian phone numbers", () => {
  assert.equal(normalizePhone("302 548 6279"), "+573025486279");
  assert.equal(normalizePhone("+57 302-548-6279"), "+573025486279");
});

test("publishes weekday and Saturday operating hours", () => {
  const monday = getDailySlots("2026-10-19", "pilates");
  const saturday = getDailySlots("2026-10-24", "training");
  const sunday = getDailySlots("2026-10-25", "pilates");

  assert.deepEqual(monday.map((slot) => slot.time), ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "16:00", "17:00", "18:00", "19:00"]);
  assert.deepEqual(saturday.map((slot) => slot.time), ["08:00", "09:00", "10:00", "11:00", "12:00"]);
  assert.deepEqual(sunday, []);
  assert.equal(monday[0].capacity, 5);
  assert.equal(saturday[0].capacity, 4);
});

test("allows credits only for active compatible plans", () => {
  const now = new Date("2026-10-15T12:00:00-05:00");
  assert.deepEqual(canUseCredit({ service: "dual", creditsRemaining: 2, expiresAt: "2026-11-01" }, "pilates", now), { ok: true });
  assert.equal(canUseCredit({ service: "training", creditsRemaining: 2, expiresAt: "2026-11-01" }, "pilates", now).ok, false);
  assert.equal(canUseCredit({ service: "pilates", creditsRemaining: 0, expiresAt: "2026-11-01" }, "pilates", now).reason, "NO_CREDITS");
  assert.equal(canUseCredit({ service: "pilates", creditsRemaining: 2, expiresAt: "2026-10-01" }, "pilates", now).reason, "PLAN_EXPIRED");
});

test("requires cancellation at least two hours before class", () => {
  assert.equal(validateCancellation("2026-10-15T18:00:00-05:00", new Date("2026-10-15T15:59:00-05:00")).refundCredit, true);
  assert.equal(validateCancellation("2026-10-15T18:00:00-05:00", new Date("2026-10-15T16:01:00-05:00")).refundCredit, false);
});
