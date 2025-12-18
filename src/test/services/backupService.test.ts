/**
 * Backup Service Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { exportBackup, importBackup } from '../../services/backupService';
import { storageService } from '../../services/storageService';
import type { AftercareProfile, AftercarePlan } from '../../types';

// Mock storage service
vi.mock('../../services/storageService', () => ({
  storageService: {
    loadProfile: vi.fn(),
    loadPlan: vi.fn(),
    loadDocuments: vi.fn(),
    loadContacts: vi.fn(),
    loadChecklist: vi.fn(),
    saveProfile: vi.fn(),
    savePlan: vi.fn(),
    saveDocuments: vi.fn(),
    saveContacts: vi.fn(),
    saveChecklist: vi.fn(),
  },
}));

describe('Backup Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('exportBackup', () => {
    it('should export all data to JSON', async () => {
      const mockProfile: AftercareProfile = {
        id: 'test-profile',
        hasConfirmedDisclaimer: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      const mockPlan: AftercarePlan = {
        id: 'test-plan',
        profile: mockProfile,
        tasks: [],
        createdAt: '2024-01-01',
        lastUpdatedAt: '2024-01-01',
      };

      vi.mocked(storageService.loadProfile).mockResolvedValue(mockProfile);
      vi.mocked(storageService.loadPlan).mockResolvedValue(mockPlan);
      vi.mocked(storageService.loadDocuments).mockResolvedValue([]);
      vi.mocked(storageService.loadContacts).mockResolvedValue([]);
      vi.mocked(storageService.loadChecklist).mockResolvedValue([]);

      const backupJson = await exportBackup();
      const backup = JSON.parse(backupJson);

      expect(backup.version).toBe('1.0.0');
      expect(backup.profile).toEqual(mockProfile);
      expect(backup.plan).toEqual(mockPlan);
      expect(backup.metadata.profileExists).toBe(true);
      expect(backup.metadata.planExists).toBe(true);
    });
  });

  describe('importBackup', () => {
    it('should import valid backup', async () => {
      const backupJson = JSON.stringify({
        version: '1.0.0',
        exportDate: '2024-01-01',
        profile: { id: 'test', hasConfirmedDisclaimer: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        plan: null,
        documents: [],
        contacts: [],
        checklist: [],
        metadata: {},
      });

      const result = await importBackup(backupJson);

      expect(result.success).toBe(true);
      expect(vi.mocked(storageService.saveProfile)).toHaveBeenCalled();
    });

    it('should reject invalid backup format', async () => {
      const result = await importBackup('{}');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid backup file format');
    });
  });
});

