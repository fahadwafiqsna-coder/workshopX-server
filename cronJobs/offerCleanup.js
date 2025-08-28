const cron = require("node-cron");
const Offer = require("../models/Offer.model");

cron.schedule("0 0 * * *", async () => {
  try {
    const now = new Date();
    const result = await Offer.deleteMany({ expireAt: { $lt: now } });
    console.log(`[CRON] Deleted ${result.deletedCount} expired offers.`);
  } catch (err) {
    console.error("[CRON] Error deleting expired offers:", err.message);
  }
});
