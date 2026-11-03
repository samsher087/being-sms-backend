import { Request, Response, NextFunction } from 'express';
import { WebsiteContent } from '../models/WebsiteContent';
import { Tenant } from '../models/Tenant';
import { Notice } from '../models/Notice';
import { ExamSchedule } from '../models/Exam';

export const getPublicWebsiteData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code } = req.params;

    // Find tenant
    const tenant = await Tenant.findOne({ code: code.toLowerCase(), isActive: true });
    if (!tenant) {
      res.status(404).json({ success: false, message: 'School not found or website not active.' });
      return;
    }

    // Load or create default website CMS content
    let content = await WebsiteContent.findOne({ tenantId: tenant._id });
    if (!content) {
      content = await WebsiteContent.create({
        tenantId: tenant._id,
        hero: {
          badge: 'Admissions Open 2026-27',
          title: `Welcome to ${tenant.name}`,
          subtitle: tenant.tagline || 'Excellence in holistic education and character building.',
          ctaPrimaryText: 'Apply for Admission',
          ctaPrimaryLink: '/admissions',
          ctaSecondaryText: 'Explore Campus',
          ctaSecondaryLink: '/facilities',
          heroImage: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1600&q=80',
        },
      });
    }

    // Public announcements & notices
    const publicNotices = await Notice.find({ tenantId: tenant._id, targetRole: { $in: ['ALL', 'STUDENTS', 'PARENTS'] } })
      .sort({ isPinned: -1, publishDate: -1 })
      .limit(6);

    // Upcoming public events/exams
    const upcomingEvents = await ExamSchedule.find({ tenantId: tenant._id, status: 'UPCOMING' })
      .sort({ startDate: 1 })
      .limit(4);

    res.json({
      success: true,
      school: {
        id: tenant._id,
        name: tenant.name,
        code: tenant.code,
        logo: tenant.logo,
        tagline: tenant.tagline,
        contact: tenant.contact,
        themeConfig: tenant.themeConfig,
      },
      content,
      publicNotices,
      upcomingEvents,
    });
  } catch (error) {
    next(error);
  }
};

export const updateWebsiteContent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    if (!tenantId) {
      res.status(400).json({ success: false, message: 'Tenant context required.' });
      return;
    }

    const updated = await WebsiteContent.findOneAndUpdate(
      { tenantId },
      req.body,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, message: 'School website content updated successfully.', content: updated });
  } catch (error) {
    next(error);
  }
};
