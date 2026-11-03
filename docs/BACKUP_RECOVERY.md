# SoftDeals SMS — Database Backup & Disaster Recovery Guide

This document outlines the backup policies, automated scripts, and point-in-time recovery procedures for SoftDeals SMS in production.

---

## 1. Backup Strategy

| Backup Type | Frequency | Retention Period | Storage Location |
|---|---|---|---|
| **Full Database Dump** | Daily at 02:00 AM IST | 30 Days | Encrypted AWS S3 / Cloudflare R2 |
| **Hourly Oplog Backup** | Hourly | 7 Days | Secondary Backup Vault |
| **Weekly Offline Archive** | Every Sunday | 1 Year | Cold Glacier Storage |

---

## 2. Automated Backup Shell Script

Create `/usr/local/bin/backup-sms.sh`:
```bash
#!/bin/bash
set -e

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/softdeals_sms"
ARCHIVE_NAME="softdeals_sms_backup_${TIMESTAMP}.tar.gz"
MONGODB_URI="mongodb://127.0.0.1:27017/softdeals_sms"

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting MongoDB dump..."
mongodump --uri="${MONGODB_URI}" --out="${BACKUP_DIR}/dump_${TIMESTAMP}"

echo "[$(date)] Compressing backup..."
tar -czf "${BACKUP_DIR}/${ARCHIVE_NAME}" -C "${BACKUP_DIR}" "dump_${TIMESTAMP}"
rm -rf "${BACKUP_DIR}/dump_${TIMESTAMP}"

# Optional: Upload to AWS S3 bucket with server-side encryption
# aws s3 cp "${BACKUP_DIR}/${ARCHIVE_NAME}" "s3://softdeals-sms-backups/${ARCHIVE_NAME}" --sse AES256

# Delete local backups older than 14 days
find "${BACKUP_DIR}" -type f -name "*.tar.gz" -mtime +14 -exec rm {} \;

echo "[$(date)] Backup completed successfully: ${ARCHIVE_NAME}"
```

Make executable and register with cron:
```bash
chmod +x /usr/local/bin/backup-sms.sh
# Run daily at 02:00 AM
crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-sms.sh >> /var/log/sms-backup.log 2>&1
```

---

## 3. Database Restoration Procedure

In the event of hardware failure or catastrophic data corruption:

### Step 1: Decompress Backup
```bash
cd /var/backups/softdeals_sms
tar -xzf softdeals_sms_backup_20261024_020000.tar.gz
```

### Step 2: Restore Database Collections
```bash
mongorestore --uri="mongodb://127.0.0.1:27017/softdeals_sms" --drop dump_20261024_020000/softdeals_sms
```
*The `--drop` flag replaces existing corrupted collections cleanly before restoring.*

### Step 3: Run Validation & Integrity Checks
```bash
cd /var/www/softdeals-sms/backend
npm test
```
Verifies that all tenant collections, role schemas, unique indexes, and audit logs are restored and intact.
