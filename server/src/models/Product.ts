import mongoose, { Document, Schema } from 'mongoose';

export interface IProductProfile {
  name: string;
  category: string;
  features: string[];
  benefits: string[];
  usp: string; // Unique Selling Proposition
  price?: string;
  targetAudience: string[];
  brandTone: string[];
  keyClaims: string[];
  visualStyle: string;
}

export interface IProduct extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  rawDescription: string;
  uploadedFiles: {
    filename: string;
    originalName: string;
    mimeType: string;
    path: string;
    url: string;
  }[];
  profile: IProductProfile;
  createdAt: Date;
  updatedAt: Date;
}

const ProductProfileSchema = new Schema<IProductProfile>(
  {
    name: { type: String, default: '' },
    category: { type: String, default: '' },
    features: [{ type: String }],
    benefits: [{ type: String }],
    usp: { type: String, default: '' },
    price: { type: String, default: '' },
    targetAudience: [{ type: String }],
    brandTone: [{ type: String }],
    keyClaims: [{ type: String }],
    visualStyle: { type: String, default: '' },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    rawDescription: { type: String, default: '' },
    uploadedFiles: [
      {
        filename: String,
        originalName: String,
        mimeType: String,
        path: String,
        url: String,
      },
    ],
    profile: {
      type: ProductProfileSchema,
      default: () => ({
        name: '',
        category: '',
        features: [],
        benefits: [],
        usp: '',
        price: '',
        targetAudience: [],
        brandTone: [],
        keyClaims: [],
        visualStyle: '',
      }),
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
