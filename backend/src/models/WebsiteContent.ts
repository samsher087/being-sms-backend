import mongoose, { Document, Schema } from 'mongoose';

export interface IWebsiteContent extends Document {
  tenantId: mongoose.Types.ObjectId;
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    ctaPrimaryText: string;
    ctaPrimaryLink: string;
    ctaSecondaryText: string;
    ctaSecondaryLink: string;
    heroImage: string;
  };
  about: {
    heading: string;
    description: string;
    foundedYear: string;
    affiliation: string; // e.g. "CBSE Affiliated - No. 2730123"
    vision: string;
    mission: string;
    stats: { label: string; value: string }[];
  };
  principalMessage: {
    principalName: string;
    principalTitle: string;
    principalImage: string;
    quote: string;
    fullMessage: string;
  };
  academics: {
    intro: string;
    levels: { title: string; ageGroup: string; description: string; highlights: string[] }[];
  };
  facilities: {
    title: string;
    icon: string;
    description: string;
    image?: string;
  }[];
  gallery: {
    title: string;
    category: string;
    imageUrl: string;
  }[];
  testimonials: {
    name: string;
    role: string; // "Parent of Class 10 Student"
    content: string;
    avatar?: string;
    rating: number;
  }[];
  contactInfo: {
    address: string;
    phone: string;
    email: string;
    officeHours: string;
    googleMapsEmbedUrl?: string;
  };
}

const WebsiteContentSchema = new Schema<IWebsiteContent>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, unique: true, index: true },
    hero: {
      badge: { type: String, default: 'Admissions Open 2026-27' },
      title: { type: String, default: 'Nurturing Young Minds for Global Excellence' },
      subtitle: { type: String, default: 'A tradition of academic distinction, holistic character building, and world-class sports facilities in India.' },
      ctaPrimaryText: { type: String, default: 'Apply for Admission' },
      ctaPrimaryLink: { type: String, default: '/admissions' },
      ctaSecondaryText: { type: String, default: 'Explore Campus' },
      ctaSecondaryLink: { type: String, default: '/facilities' },
      heroImage: { type: String, default: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1600&q=80' },
    },
    about: {
      heading: { type: String, default: 'Excellence in Education Since 1998' },
      description: { type: String, default: 'Providing inclusive, values-driven and rigorous education for future leaders, innovators, and thinkers.' },
      foundedYear: { type: String, default: '1998' },
      affiliation: { type: String, default: 'Affiliated to CBSE, New Delhi' },
      vision: { type: String, default: 'To empower students with critical thinking, ethical integrity, and technological fluency.' },
      mission: { type: String, default: 'To foster an inspiring learning environment blending Indian cultural values with 21st-century modern pedagogy.' },
      stats: [
        {
          label: { type: String, default: 'Happy Students' },
          value: { type: String, default: '2,800+' },
        },
        {
          label: { type: String, default: 'Expert Faculty' },
          value: { type: String, default: '140+' },
        },
        {
          label: { type: String, default: 'Board Exam Pass Rate' },
          value: { type: String, default: '100%' },
        },
        {
          label: { type: String, default: 'National Awards' },
          value: { type: String, default: '35+' },
        },
      ],
    },
    principalMessage: {
      principalName: { type: String, default: 'Dr. Sunita Sharma, Ph.D.' },
      principalTitle: { type: String, default: 'Principal & Academic Director' },
      principalImage: { type: String, default: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80' },
      quote: { type: String, default: 'Education is not the learning of facts, but the training of the mind to think and innovate.' },
      fullMessage: { type: String, default: 'Welcome to our institution. We take pride in our commitment to cultivating not just exceptional scholars, but compassionate, disciplined, and forward-thinking human beings ready to lead in an interconnected world.' },
    },
    academics: {
      intro: { type: String, default: 'Our curriculum follows the National Education Policy (NEP 2020) and CBSE guidelines, encouraging experiential inquiry.' },
      levels: [
        {
          title: { type: String, default: 'Foundational & Primary (Nursery - Grade 5)' },
          ageGroup: { type: String, default: 'Ages 3 - 10' },
          description: { type: String, default: 'Play-way, foundational literacy, numeracy, storytelling, and sensory discovery.' },
          highlights: [{ type: String, default: 'Activity-based STEM & phonics' }],
        },
        {
          title: { type: String, default: 'Middle School (Grade 6 - Grade 8)' },
          ageGroup: { type: String, default: 'Ages 11 - 13' },
          description: { type: String, default: 'Integrated sciences, coding, social studies, and linguistic proficiency.' },
          highlights: [{ type: String, default: 'Robotics labs & debate forums' }],
        },
        {
          title: { type: String, default: 'Senior Secondary (Grade 9 - Grade 12)' },
          ageGroup: { type: String, default: 'Ages 14 - 18' },
          description: { type: String, default: 'Specialized Science (PCM/PCB), Commerce, and Humanities streams with career counseling.' },
          highlights: [{ type: String, default: 'IIT-JEE / NEET / CUET integrated coaching' }],
        },
      ],
    },
    facilities: [
      {
        title: { type: String, default: 'Smart Digital Classrooms' },
        icon: { type: String, default: 'MonitorPlay' },
        description: { type: String, default: 'Interactive panels, audio-visual smart learning modules, and high-speed campus Wi-Fi.' },
        image: { type: String, default: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80' },
      },
      {
        title: { type: String, default: 'Modern Science & AI Labs' },
        icon: { type: String, default: 'FlaskConical' },
        description: { type: String, default: 'State-of-the-art Physics, Chemistry, Biology, and AI/Robotics maker spaces.' },
        image: { type: String, default: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80' },
      },
      {
        title: { type: String, default: 'Olympic-Standard Sports Arena' },
        icon: { type: String, default: 'Trophy' },
        description: { type: String, default: 'Swimming pool, synthetic basketball and tennis courts, cricket nets, and football turf.' },
        image: { type: String, default: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80' },
      },
    ],
    gallery: [
      {
        title: { type: String, default: 'Annual Sports Day 2026' },
        category: { type: String, default: 'Sports' },
        imageUrl: { type: String, default: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80' },
      },
      {
        title: { type: String, default: 'Robotics & Science Fair' },
        category: { type: String, default: 'Academics' },
        imageUrl: { type: String, default: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80' },
      },
      {
        title: { type: String, default: 'Inter-School Cultural Fest' },
        category: { type: String, default: 'Arts' },
        imageUrl: { type: String, default: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80' },
      },
    ],
    testimonials: [
      {
        name: { type: String, default: 'Rajesh & Meena Malhotra' },
        role: { type: String, default: 'Parents of Class 10 Student' },
        content: { type: String, default: 'The individual attention from teachers and the seamless SMS portal keeping us updated on fees and attendance has made our experience wonderful.' },
        avatar: { type: String, default: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
        rating: { type: Number, default: 5 },
      },
      {
        name: { type: String, default: 'Ananya Verma' },
        role: { type: String, default: 'Head Girl, Batch of 2026' },
        content: { type: String, default: 'SoftDeals SMS made tracking assignments and examination schedules effortless. Our school provides every platform to excel.' },
        avatar: { type: String, default: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80' },
        rating: { type: Number, default: 5 },
      },
    ],
    contactInfo: {
      address: { type: String, default: 'Sector 14, Institutional Area, New Delhi - 110001' },
      phone: { type: String, default: '+91 11 2619 4400' },
      email: { type: String, default: 'admissions@delhischool.edu.in' },
      officeHours: { type: String, default: 'Monday - Saturday: 8:00 AM - 3:30 PM' },
      googleMapsEmbedUrl: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

export const WebsiteContent = mongoose.model<IWebsiteContent>('WebsiteContent', WebsiteContentSchema);
