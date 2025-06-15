import mongoose, { Schema, Document } from "mongoose";

export interface IGuest extends Document {
  nombre_invitado: string;
  codigo_reserva: string;
  max_acompanantes: number;
  confirmado: boolean;
  email_confirmacion?: string;
  acompanantes_confirmados?: number;
}

const GuestSchema: Schema = new Schema({
  nombre_invitado: {
    type: String,
    required: true,
    trim: true,
  },
  codigo_reserva: {
    type: String,
    required: true,
    unique: true,
  },
  max_acompanantes: {
    type: Number,
    required: true,
    default: 0,
  },
  confirmado: {
    type: Boolean,
    default: false,
  },
  email_confirmacion: {
    type: String,
    trim: true,
    lowercase: true,
  },
  acompanantes_confirmados: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model<IGuest>("Guest", GuestSchema);