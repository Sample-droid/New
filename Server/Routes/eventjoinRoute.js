const express = require('express');
const router = express.Router();
const EventJoin = require('../Model/EventJoin');
const Event = require('../Model/Event');
const User = require('../Model/User'); // match your actual filename

// -------------------- JOIN EVENT --------------------
router.post('/join-event', async (req, res) => {
  try {
    const { userId, eventId } = req.body;
    if (!userId || !eventId) {
      return res.status(400).json({ success: false, message: 'User ID and Event ID are required' });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({ success: false, message: 'Event is full' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const existingJoin = await EventJoin.findOne({ user: userId, event: eventId });
    if (existingJoin) return res.status(400).json({ success: false, message: 'Already joined this event' });

    const join = new EventJoin({ user: userId, event: eventId });
    await join.save();

    // Increment currentParticipants
    event.currentParticipants += 1;
    if (event.status === 'Upcoming' && new Date() >= event.date) event.status = 'Ongoing';
    await event.save();

    res.status(201).json({ success: true, message: 'Joined event successfully', join });
  } catch (error) {
    console.error('Join Event Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// -------------------- FORFEIT (LEAVE) EVENT --------------------
router.delete('/forfeit-event', async (req, res) => {
  try {
    const { userId, eventId } = req.body;
    if (!userId || !eventId) {
      return res.status(400).json({ success: false, message: 'User ID and Event ID are required' });
    }

    const existingJoin = await EventJoin.findOne({ user: userId, event: eventId });
    if (!existingJoin) return res.status(404).json({ success: false, message: 'You have not joined this event' });

    await EventJoin.deleteOne({ _id: existingJoin._id });

    // Decrement currentParticipants
    const event = await Event.findById(eventId);
    if (event && event.currentParticipants > 0) event.currentParticipants -= 1;
    await event.save();

    res.status(200).json({ success: true, message: 'Forfeited event successfully' });
  } catch (error) {
    console.error('Forfeit Event Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// -------------------- FETCH JOINED EVENTS --------------------
router.get('/joined/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const joinedEvents = await EventJoin.find({ user: userId })
      .populate('event')
      .populate('user', 'username email role');
    res.status(200).json({ success: true, message: 'Joined events fetched successfully', joinedEvents });
  } catch (error) {
    console.error('Fetch Joined Events Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// -------------------- CHECK IF USER JOINED SPECIFIC EVENT --------------------
router.get('/joined/:userId/:eventId', async (req, res) => {
  try {
    const { userId, eventId } = req.params;
    const existingJoin = await EventJoin.findOne({ user: userId, event: eventId });
    res.status(200).json({ success: true, joined: !!existingJoin });
  } catch (error) {
    console.error('Check Join Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});
module.exports = router;