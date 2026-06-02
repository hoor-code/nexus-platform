const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Meeting = require('../models/Meeting');
const { v4: uuidv4 } = require('uuid'); // Install this tool to generate unique calling rooms

// @route   POST api/meetings/schedule
// @desc    Schedule a meeting with conflict checking
router.post('/schedule', auth, async (req, res) => {
  const { title, description, attendee, startTime, endTime } = req.body;

  try {
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Double Booking / Conflict Detection Logic
    const conflict = await Meeting.findOne({
      status: 'accepted',
      $or: [
        { host: req.user.id },
        { host: attendee },
        { attendee: req.user.id },
        { attendee: attendee }
      ],
      startTime: { $lt: end },
      endTime: { $gt: start }
    });

    if (conflict) {
      return res.status(400).json({ message: 'Time slot conflict detected! One of the users is already booked.' });
    }

    const newMeeting = new Meeting({
      title,
      description,
      host: req.user.id,
      attendee,
      startTime: start,
      endTime: end,
      roomId: uuidv4() // Auto-creates a unique room string identifier for WebRTC
    });

    const meeting = await newMeeting.save();
    res.status(201).json(meeting);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/meetings
// @desc    Get all dashboard meetings for current logged in user
router.get('/', auth, async (req, res) => {
  try {
    const meetings = await Meeting.find({
      $or: [{ host: req.user.id }, { attendee: req.user.id }]
    })
    .populate('host', 'name email role')
    .populate('attendee', 'name email role')
    .sort({ startTime: 1 });

    res.json(meetings);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/meetings/:id
// @desc    Update meeting status (Accept/Reject)
router.put('/:id', auth, async (req, res) => {
  const { status } = req.body; // 'accepted' or 'rejected'

  try {
    let meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: 'Meeting invitation not found' });

    // Validate that only the intended attendee can accept or decline
    if (meeting.attendee.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized action' });
    }

    meeting.status = status;
    await meeting.save();
    res.json(meeting);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;