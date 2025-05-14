import mongoose, { Schema, type Document, type Model } from "mongoose"
import bcrypt from "bcryptjs"

// Location interface
interface ILocation {
  type: 'Point';
  coordinates: [number, number]; // ✅ Correct for TypeScript
}

// Volunteer details interface
interface IVolunteerDetails {
  nidNumber: string
  nidImageUrl?: string
  verifiedByAdmin: boolean
  status: "online" | "busy" | "offline"
  skills?: string[]
  rating?: number
  completedTasks?: number
}

// User interface
export interface IUser extends Document {
  name?: string
  email?: string
  phone?: string
  phone2?: string
  password?: string
  otp?: string
  otpExpiresAt?: Date
  isVerified: boolean
  role?: "victim" | "volunteer" | "admin"
  gender?: string
  profilePhotoUrl?: string
  location?: ILocation
  volunteerDetails?: IVolunteerDetails
  createdAt: Date
  updatedAt: Date
  comparePassword: (candidatePassword: string) => Promise<boolean>
}

// Location schema
const LocationSchema = new Schema<ILocation>({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
  },
  coordinates: {
    type: [Number], // ✅ Capital N
    required: true,
  },
})

// Volunteer details schema
const VolunteerDetailsSchema = new Schema<IVolunteerDetails>({
  nidNumber: { type: String, required: true },
  nidImageUrl: { type: String },
  verifiedByAdmin: { type: Boolean, default: false },
  status: { type: String, enum: ["online", "busy", "offline"], default: "offline" },
  skills: [{ type: String }],
  rating: { type: Number, default: 0 },
  completedTasks: { type: Number, default: 0 },
})

// User schema
const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, sparse: true, lowercase: true, trim: true },
    phone: { type: String, sparse: true, trim: true },
    phone2: { type: String, trim: true },
    password: { type: String },
    otp: { type: String },
    otpExpiresAt: { type: Date },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["victim", "volunteer", "admin"] },
    gender: { type: String },
    profilePhotoUrl: { type: String },
    location: { type: LocationSchema },
    volunteerDetails: { type: VolunteerDetailsSchema },
  },
  { timestamps: true },
)

// Pre-save hook to hash password
UserSchema.pre<IUser>("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password") || !this.password) return next()

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10)

    // Hash the password along with the new salt
    const hash = await bcrypt.hash(this.password, salt)

    // Override the cleartext password with the hashed one
    this.password = hash
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false
  return bcrypt.compare(candidatePassword, this.password)
}

// Create indexes
UserSchema.index({ email: 1 }, { sparse: true })
UserSchema.index({ phone: 1 }, { sparse: true })
UserSchema.index({ location: "2dsphere" })

// Create or retrieve the User model
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default User
