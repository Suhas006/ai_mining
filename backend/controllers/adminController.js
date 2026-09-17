const User = require('../models/User');
const nodemailer = require('nodemailer');

// Ensure you configure this transport correctly based on your email provider.
// Ethereal is used as a fallback if no environment variables are provided.
const createTransporter = async () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail', // Or another provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });
  } else {
    // Mock / Ethereal account for testing if real credentials are not provided
    console.warn("⚠️ Using Mock/Ethereal email for nodemailer because EMAIL_USER is not set.");
    let testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
};

async function getPendingEmployees(req, res) {
  try {
    const pendingUsers = await User.find({ status: 'Pending' }).select('-passwordHash');
    res.json(pendingUsers);
  } catch (err) {
    console.error('Error fetching pending employees:', err);
    res.status(500).json({ error: 'Failed to fetch pending employees.' });
  }
}

async function getActiveUsers(req, res) {
  try {
    const activeUsers = await User.find({ status: 'Active' }).select('-passwordHash');
    res.json(activeUsers);
  } catch (err) {
    console.error('Error fetching active users:', err);
    res.status(500).json({ error: 'Failed to fetch active users.' });
  }
}

async function approveEmployee(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    user.status = 'Active';
    await user.save();

    // Send email notification
    try {
      let transporter = await createTransporter();
      let info = await transporter.sendMail({
        from: '"DepthFence Grid Administrator" <admin@depthfence.in>',
        to: user.officialEmail,
        subject: "Security Clearance Approved - DepthFence Enterprise Grid",
        text: `Hello ${user.fullName},\n\nYour DepthFence Employee account has been approved by the Administrator. You may now log in to the enterprise grid using your registered credentials.\n\nThank you,\nSystem Administrator`,
        html: `<p>Hello <strong>${user.fullName}</strong>,</p><p>Your DepthFence Employee account has been approved by the Administrator. You may now log in to the enterprise grid using your registered credentials.</p><p>Thank you,<br/>System Administrator</p>`,
      });

      console.log("Email sent: %s", info.messageId);
      if (nodemailer.getTestMessageUrl(info)) {
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      }
    } catch (emailErr) {
      console.error('Failed to send approval email:', emailErr);
      // We don't fail the request if email fails, but we could warn the admin
    }

    res.json({ msg: 'Employee approved successfully and email sent.', user });
  } catch (err) {
    console.error('Error approving employee:', err);
    res.status(500).json({ error: 'Failed to approve employee.' });
  }
}

async function rejectEmployee(req, res) {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ msg: 'Employee rejected and removed.' });
  } catch (err) {
    console.error('Error rejecting employee:', err);
    res.status(500).json({ error: 'Failed to reject employee.' });
  }
}

async function revokeAccess(req, res) {
    try {
      const { id } = req.params;
      await User.findByIdAndDelete(id);
      res.json({ msg: 'User access revoked.' });
    } catch (err) {
      console.error('Error revoking access:', err);
      res.status(500).json({ error: 'Failed to revoke access.' });
    }
}

module.exports = {
  getPendingEmployees,
  getActiveUsers,
  approveEmployee,
  rejectEmployee,
  revokeAccess
};
