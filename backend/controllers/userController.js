const User = require('../models/User');

exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent updating sensitive fields
    const updates = { ...req.body };
    delete updates.role;
    delete updates.registrationType;
    delete updates.status;
    delete updates.passwordHash;

    const isEmployee = user.role === 'employee' || user.registrationType === 'Employee' || user.role === 'District Mining Officer' || user.role === 'Revenue Surveyor (ULPIN)' || user.role === 'Field Inspection Squad';

    if (isEmployee) {
      user.pendingProfileUpdates = updates;
      await user.save();
      return res.status(200).json({ msg: 'Update request submitted to Admin.', status: 'pending' });
    } else {
      Object.assign(user, updates);
      await user.save();
      return res.status(200).json({ msg: 'Profile updated successfully.', user });
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Server error updating profile' });
  }
};
