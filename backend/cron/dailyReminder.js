const cron = require('node-cron');
const { Op } = require('sequelize');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');

async function remindControllersWhoHaventChecked() {
  try {
    const controllers = await User.findAll({ where: { role: 'controller', isActive: true } });
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    for (const controller of controllers) {
      const didCheckToday = await AuditLog.findOne({
        where: {
          actorId: controller.id,
          action: 'kart_status_changed',
          createdAt: { [Op.gte]: startOfToday },
        },
      });

      if (!didCheckToday) {
        await Notification.create({
          userId: controller.id,
          message: "Reminder: you haven't completed your daily fleet check yet today.",
        });
      }
    }
  } catch (err) {
    console.error('Daily reminder job failed:', err.message);
  }
}

function startDailyReminderJob() {
  // Runs every day at 9:00 AM server time. Change the schedule string to test faster,
  // e.g. '*/1 * * * *' runs every minute — just remember to change it back.
  cron.schedule('0 9 * * *', remindControllersWhoHaventChecked);
  console.log('⏰ Daily controller reminder job scheduled (9:00 AM daily)');
}

module.exports = { startDailyReminderJob, remindControllersWhoHaventChecked };