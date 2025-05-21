import express from 'express';
import { Setting } from '../models/settingModel.js';
import { Log } from '../models/logModel.js';
const router = express.Router();
import { User } from "../models/userModel.js"; 
import { Book } from "../models/bookModel.js"; 

const defaultSetting = {
  settings: {
    notifications: {
      email: true,
      sms: false,
      push: {
        android: false,
        ios: true,
      },
    },    
    privacy: {
      location: false,
      camera: true,
      microphone: false,
    },
    security: {
      twoFactorAuth: false,
      backupCodes: true,
    },
  },
  preferences: {
    theme: {
      darkMode: false,
      highContrast: false,
    },
    language: {
      english: true,
      spanish: false,
      nested: {
        regionalDialects: {
          catalan: true,
          quechua: false,
        },
      },
    },
  },
  integrations: {
    slack: false,
    github: {
      issues: true,
      pullRequests: false,
    },
    jira: {
      basic: false,
      advanced: {
        workflows: true,
        automations: false,
      },
    },
  },
};

router.put('/setting', async (req, res) => {
  try {
    const { user_id, setting } = req.body;

    if (!user_id || !setting) {
      return res.status(400).json({ message: "user_id and setting are required." });
    }

    const savedSetting = await Setting.findOneAndUpdate(
      { user_id },                
      { setting },                 
      {
        new: true,                
        upsert: true,             
        setDefaultsOnInsert: true 
      }
    );

    res.status(200).json(savedSetting);
  } catch (error) {
    console.error("Error saving setting:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post('/log', async (req, res) => {
  try {
    const { user_id, date, content } = req.body;

    if (!user_id || !date || !content) {
      return res.status(400).json({ message: "user_id, date, and content are required." });
    }

    const logEntry = new Log({ user_id, date, content });
    const savedLog = await logEntry.save();

    res.status(201).json(savedLog);
  } catch (error) {
    console.error("Error saving log:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


function transformToNodeTree(obj) {
  const walk = (val, key) => {
    if (typeof val === "boolean") return { name: key, val };
    return {
      name: key,
      children: Object.entries(val).map(([k, v]) => walk(v, k)),
    };
  };

  return Object.entries(obj).map(([k, v]) => walk(v, k));
}
 
router.get('/setting', async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ message: "user_id is required." });
    }

    const user = await User.findOne({ user_id });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.type === "Expert") {
      const allSettings = await Setting.find({}, { _id: 0, user_id: 1, setting: 1 });
      return res.status(200).json(allSettings);
    }

    let settingDoc = await Setting.findOne({ user_id });

    if (!settingDoc) {
      settingDoc = await Setting.create({
        user_id,
        setting: transformToNodeTree(defaultSetting), 
      });
    }

    res.json(settingDoc);
  } catch (error) {
    console.error("Error retrieving setting:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


const normalizeDate = (inputDate) => {
  const date = new Date(inputDate);
  const mm = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-based
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
};

router.post('/book', async (req, res) => {
  try {
    const { user_id, date, slot, name, email, service } = req.body;

    if (!user_id || !date || !slot || !name || !email || !service) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const user = await User.findOne({ user_id });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const normalizedDate = normalizeDate(date);
    const existingBooking = await Book.findOne({
      date: normalizedDate,
      slot,
    });

    if (existingBooking) {
      return res.status(409).json({ message: "Slot already booked." });
    }
    
    const newBooking = await Book.create({
      user_id,
      date: normalizedDate,
      slot,
      name,
      email,
      service,
    });

    return res.status(201).json({ message: "Booking successful", booking: newBooking });
  } catch (error) {
    console.error("Error during booking:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});



export default router;