import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import settingRoute from './routes/settingRoute.js';
import userRoute from './routes/userRoute.js';
import cors from 'cors';
import { User } from './models/userModel.js';   

dotenv.config();

const app = express();

const PORT = process.env.PORT || 4040;
const mongoDBURL = process.env.MONGO_URI;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

app.get('/', (request, response) => {
  return response.status(200).send('Backend is running');
});

app.use('/api', settingRoute);
app.use('/api', userRoute);

const seedAdminUser = async () => {
  try {
    const patienExists = await User.findOne({ user_id: 'Patient1' });
    if (!patienExists) {
      const patientUser = new User({
        user_id: 'Patient1',
        password: '123',
        type: "Patient"
      });
      await patientUser.save();
      console.log('Default Patient1 user created: patient / 123');
    } else {
      console.log('Patient1 user already exists.');
    }

    const expertExists = await User.findOne({ user_id: 'Expert1' });
    if (!expertExists) {
      const expertUser = new User({
        user_id: 'Expert1',
        password: '123',
        type: "Expert"
      });
      await expertUser.save();
      console.log('Default Expert1 user created: expert / 123');
    } else {
      console.log('Expert1 user already exists.');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};

mongoose
  .connect(mongoDBURL)
  .then(async () => {
    console.log('App connected to database');
    await seedAdminUser();
    app.listen(PORT, () => {
      console.log(`App is listening to port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
