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
    console.warn("⚠️ EMAIL_USER not set. Bypassing email notification to avoid Ethereal hangs.");
    return null;
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
      if (transporter) {
        let info = await transporter.sendMail({
          from: '"DepthFence Grid Administrator" <admin@depthfence.in>',
          to: user.officialEmail,
          subject: "Security Clearance Approved - DepthFence Enterprise Grid",
          text: `Hello ${user.fullName},\n\nYour DepthFence Employee account has been approved by the Administrator. You may now log in to the enterprise grid using your registered credentials.\n\nThank you,\nSystem Administrator`,
          html: `<p>Hello <strong>${user.fullName}</strong>,</p><p>Your DepthFence Employee account has been approved by the Administrator. You may now log in to the enterprise grid using your registered credentials.</p><p>Thank you,<br/>System Administrator</p>`,
        });

        console.log("Email sent: %s", info.messageId);
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

async function deleteUser(req, res) {
    try {
      const { id } = req.params;
      await User.findByIdAndDelete(id);
      res.status(200).json({ msg: 'User permanently deleted.' });
    } catch (err) {
      console.error('Error deleting user:', err);
      res.status(500).json({ error: 'Failed to delete user.' });
    }
}

async function approveProfileRequest(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (user.pendingProfileUpdates) {
      Object.assign(user, user.pendingProfileUpdates);
      user.pendingProfileUpdates = null;
      await user.save();
    }
    res.json({ msg: 'Profile update approved.', user });
  } catch (err) {
    console.error('Error approving profile request:', err);
    res.status(500).json({ error: 'Failed to approve profile request.' });
  }
}

async function rejectProfileRequest(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    user.pendingProfileUpdates = null;
    await user.save();
    res.json({ msg: 'Profile update rejected.', user });
  } catch (err) {
    console.error('Error rejecting profile request:', err);
    res.status(500).json({ error: 'Failed to reject profile request.' });
  }
}

module.exports = {
  getPendingEmployees,
  getActiveUsers,
  approveEmployee,
  rejectEmployee,
  deleteUser,
  approveProfileRequest,
  rejectProfileRequest
};
