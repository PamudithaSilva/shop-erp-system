import User from '../models/User';

export const ensureAdminUser = async (): Promise<void> => {
  const email = (process.env.ADMIN_EMAIL || 'admin@shop.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';
  const exists = await User.findOne({ email });
  if (!exists) {
    await User.create({ name: process.env.ADMIN_NAME || 'Administrator', email, password, role: 'admin' });
    console.log(`Initial administrator created: ${email}`);
  }
};
