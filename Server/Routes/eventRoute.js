const express = require('express');
const router = express.Router();
const Event = require('../Model/Event');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// -------------------- MULTER SETUP --------------------
const uploadDir = path.join(__dirname, '..', 'uploads', 'events');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// -------------------- HELPER: COMPUTE STATUS --------------------
const computeStatus = (event) => {
  const now = new Date();

  if (event.isDisabled) return 'Not Available';
  if (event.date < now) return 'Completed';
  if (event.date.toDateString() === now.toDateString()) return 'Ongoing';
  return 'Upcoming';
};

// -------------------- CREATE EVENT --------------------
router.post('/event', upload.single('image'), async (req, res, next) => {
  try {
    const { name, code, date, location, description, category, user, maxParticipants } = req.body;

    if (!name || !code || !date || !location || !category || !user || !maxParticipants) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    if (!req.file) return res.status(400).json({ success: false, message: 'Event image is required' });
    if (code.length !== 8) return res.status(400).json({ success: false, message: 'Event code must be 8 characters' });

    const existingEvent = await Event.findOne({ code });
    if (existingEvent) return res.status(400).json({ success: false, message: 'Event code already exists' });

    const newEvent = new Event({
      name,
      code,
      date: new Date(date),
      location,
      description: description || '',
      category,
      user,
      maxParticipants,
      currentParticipants: 0,
      isDisabled: false,
      status: 'Upcoming',
      image: `uploads/events/${req.file.filename}`,
    });

    newEvent.status = computeStatus(newEvent);

    const savedEvent = await newEvent.save();
    res.status(201).json({ success: true, message: 'Event created successfully', event: savedEvent });
  } catch (error) {
    next(error);
  }
});

// -------------------- GET ALL EVENTS --------------------
router.get('/events', async (req, res, next) => {
  try {
    const events = await Event.find({ isDisabled: false })
      .select('name code date location description category image user isDisabled status maxParticipants currentParticipants')
      .sort({ date: 1 });

    res.status(200).json({ success: true, message: 'All events retrieved', events });
  } catch (error) {
    next(error);
  }
});

// -------------------- GET EVENT BY ID --------------------
router.get('/events/:id', async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).select(
      'name code date location description category image user isDisabled status maxParticipants currentParticipants'
    );

    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    res.status(200).json({ success: true, message: 'Event retrieved', event });
  } catch (error) {
    next(error);
  }
});


// -------------------- GET EVENTS BY USER --------------------
router.get('/events/user/:userid', async (req, res, next) => {
  try {
    const events = await Event.find({ user: req.params.userid })
      .select('name code date location description category image isDisabled status maxParticipants currentParticipants')
      .sort({ date: 1 });

    res.status(200).json({ success: true, message: 'Events retrieved', events });
  } catch (error) {
    next(error);
  }
});

// -------------------- GET ALL EVENTS FOR ADMIN --------------------
router.get('/admin/events', async (req, res, next) => {
  try {
    const events = await Event.find()
      .populate('user', 'username email') // <-- populate username and email
      .select('name code date location description category image user isDisabled status maxParticipants currentParticipants')
      .sort({ date: 1 });

    res.status(200).json({ success: true, message: 'All events retrieved', events });
  } catch (error) {
    next(error);
  }
});

// -------------------- GET EVENT BY CODE --------------------
router.get('/event/code/:code', async (req, res, next) => {
  try {
    const event = await Event.findOne({ code: req.params.code });

    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.isDisabled) return res.status(403).json({ success: false, message: 'Event is not available' });

    res.status(200).json({ success: true, message: 'Event retrieved', event });
  } catch (error) {
    next(error);
  }
});

// -------------------- UPDATE EVENT --------------------
router.put('/event/:id', upload.single('image'), async (req, res, next) => {
  try {
    const { name, date, location, description, category, maxParticipants } = req.body;

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    // Validate maxParticipants
    if (maxParticipants < event.currentParticipants) {
      return res.status(400).json({
        success: false,
        message: `Max participants cannot be less than current participants (${event.currentParticipants})`
      });
    }

    // Update event fields
    event.name = name;
    event.date = date;
    event.location = location;
    event.description = description;
    event.category = category;
    event.maxParticipants = maxParticipants;
    if (req.file) event.image = `uploads/events/${req.file.filename}`;

    event.status = computeStatus(event);
    await event.save();

    res.status(200).json({ success: true, message: 'Event updated successfully', event });
  } catch (error) {
    next(error);
  }
});

// -------------------- DISABLE / ENABLE EVENT --------------------
router.patch('/event/:id/disable', async (req, res, next) => {
  try {
    const { disable } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    // Cannot enable if admin disabled
    if (!disable && event.disabledBy === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'This event was disabled by admin and cannot be enabled by user.',
      });
    }

    event.isDisabled = disable;
    event.disabledBy = disable ? 'user' : null;
    event.status = computeStatus(event);
    await event.save();

    res.status(200).json({ success: true, event });
  } catch (err) {
    next(err);
  }
});

router.patch('/admin/event/:id/disable', async (req, res, next) => {
  try {
    const { disable } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    // Cannot enable if user disabled
    if (!disable && event.disabledBy === 'user') {
      return res.status(403).json({
        success: false,
        message: 'This event was disabled by the user and cannot be enabled by admin.',
      });
    }

    event.isDisabled = disable;
    event.disabledBy = disable ? 'admin' : null;
    event.status = computeStatus(event);
    await event.save();

    res.status(200).json({ success: true, event });
  } catch (err) {
    next(err);
  }
});


module.exports = router;