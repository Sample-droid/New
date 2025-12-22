const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
      maxlength: [100, 'Event name cannot exceed 100 characters'],
    },

    code: {
      type: String,
      required: [true, 'Event code is required'],
      unique: true,
      trim: true,
      minlength: [8, 'Event code must be exactly 8 characters'],
      maxlength: [8, 'Event code must be exactly 8 characters'],
    },

    date: {
      type: Date,
      required: [true, 'Event date is required'],
      validate: {
        validator: function (value) {
          return value >= new Date();
        },
        message: 'Event date must be in the future',
      },
    },

    location: {
      type: String,
      required: [true, 'Event location is required'],
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },

    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },

    
   category: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Category',
  required: true,
},

  

    image: {
      type: String,
      default: '',
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    maxParticipants: {
      type: Number,
      required: [true, 'Maximum participants is required'],
      min: [1, 'Maximum participants must be at least 1'],
    },

    currentParticipants: {
      type: Number,
      default: 0,
      min: [0, 'Current participants cannot be negative'],
    },

    status: {
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Completed', 'Not Available'],
      default: 'Upcoming',
    },

    isDisabled: {
  type: Boolean,
  default: false,
},

disabledBy: {
  type: String,
  enum: ['admin', 'user', null],
  default: null,

},
  },
  
  {
    timestamps: true,
  }
);

// Indexes
eventSchema.index({ code: 1 });
eventSchema.index({ user: 1, isDisabled: 1 });

// -------------------- AUTOMATIC STATUS --------------------
eventSchema.pre('save', function (next) {
  const now = new Date();
  if (this.isDisabled) {
    this.status = 'Not Available';
  } else if (this.date < now) {
    this.status = 'Completed';
  } else if (this.date.toDateString() === now.toDateString()) {
    this.status = 'Ongoing';
  } else {
    this.status = 'Upcoming';
  }
  next();
});

eventSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  const now = new Date();

  if (update.isDisabled) {
    update.status = 'Not Available';
  } else if (update.date && new Date(update.date) < now) {
    update.status = 'Completed';
  } else if (update.date && new Date(update.date).toDateString() === now.toDateString()) {
    update.status = 'Ongoing';
  }
  next();
});
module.exports = mongoose.models.Event || mongoose.model("Event", eventSchema);