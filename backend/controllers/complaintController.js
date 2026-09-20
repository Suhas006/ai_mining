const Complaint = require('../models/Complaint');

exports.createComplaint = async (req, res) => {
  try {
    const { fullName, contactNumber, governmentId, propertyDetails, encroacherDetails, complaintDetails } = req.body;
    
    const newComplaint = new Complaint({
      complainantId: req.user.id,
      fullName,
      contactNumber,
      governmentId,
      propertyDetails,
      encroacherDetails,
      complaintDetails,
      status: 'pending'
    });
    
    await newComplaint.save();
    return res.status(201).json({ message: 'Complaint submitted successfully', complaint: newComplaint });
  } catch (err) {
    console.error('Error creating complaint:', err);
    return res.status(500).json({ error: 'Server error while creating complaint' });
  }
};

exports.getMyGrievances = async (req, res) => {
  try {
    const complaints = await Complaint.find({ complainantId: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ complaints });
  } catch (err) {
    console.error('Error fetching grievances:', err);
    return res.status(500).json({ error: 'Server error while fetching grievances' });
  }
};

exports.getPendingComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ status: 'pending' }).sort({ createdAt: -1 }).populate('complainantId', 'fullName email');
    return res.status(200).json({ complaints });
  } catch (err) {
    console.error('Error fetching pending complaints:', err);
    return res.status(500).json({ error: 'Server error while fetching pending complaints' });
  }
};
