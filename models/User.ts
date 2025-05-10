import mongoose, { Schema, type Document, type Model } from "mongoose"

// Location interface
interface ILocation {
 type?: "Point"
 coordinates: [number, number] // [longitude, latitude]
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
}

// Location schema
const LocationSchema = new Schema<ILocation>({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
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

// Create indexes
UserSchema.index({ email: 1 }, { sparse: true })
UserSchema.index({ location: "2dsphere" })

// Create or retrieve the User model
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default User
