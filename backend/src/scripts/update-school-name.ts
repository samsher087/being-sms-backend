import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import { Tenant } from '../models/Tenant';
import { WebsiteContent } from '../models/WebsiteContent';
import { Notice } from '../models/Notice';

async function updateSchoolName() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/softdeals-sms';
  console.log('Connecting to MongoDB:', mongoUri);
  await mongoose.connect(mongoUri);

  const tenant = await Tenant.findOne({ code: 'dps-rkp' });
  if (!tenant) {
    console.error('Tenant dps-rkp not found!');
    process.exit(1);
  }

  console.log(`Current tenant name: "${tenant.name}"`);
  tenant.name = 'D.A.V Public School, Pindersot';
  await tenant.save();
  console.log(`Updated tenant name to: "${tenant.name}"`);

  // Update WebsiteContent
  const webUpdate = await WebsiteContent.updateMany(
    { tenantId: tenant._id },
    {
      $set: {
        'hero.title': 'D.A.V Public School, Pindersot',
        'about.description': 'D.A.V Public School, Pindersot is one of India’s most acclaimed educational institutions. Ranked consistently among the top schools nationwide, we blend academic rigor with sports, performing arts, and character leadership.',
        'principalMessage.fullMessage': 'At D.A.V Public School, Pindersot, we believe that each student is endowed with boundless potential. Our endeavor is to guide them to discover their passions, hone their analytical rigor, and emerge as responsible citizens equipped to navigate an interconnected world with courage and empathy.',
      },
    }
  );
  console.log(`Updated WebsiteContent documents: ${webUpdate.modifiedCount}`);

  // Update notices containing Delhi Public School
  const notices = await Notice.find({ tenantId: tenant._id });
  for (const notice of notices) {
    let changed = false;
    if (notice.content && notice.content.includes('Delhi Public School, R.K. Puram')) {
      notice.content = notice.content.replace(/Delhi Public School, R\.K\. Puram/g, 'D.A.V Public School, Pindersot');
      changed = true;
    }
    if (notice.title && notice.title.includes('Delhi Public School, R.K. Puram')) {
      notice.title = notice.title.replace(/Delhi Public School, R\.K\. Puram/g, 'D.A.V Public School, Pindersot');
      changed = true;
    }
    if (changed) {
      await notice.save();
      console.log(`Updated notice: ${notice.title}`);
    }
  }

  await mongoose.disconnect();
  console.log('Successfully updated school name to D.A.V Public School, Pindersot in MongoDB!');
}

updateSchoolName().catch((err) => {
  console.error('Error updating school name:', err);
  process.exit(1);
});
