import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    password: { type: String, required: true },
    type: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);
export { User };
