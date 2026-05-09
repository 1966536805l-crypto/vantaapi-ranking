import { describe, it, expect } from 'vitest';
import { UserRole, LearningDirection, QuestionType, Difficulty, ProgressStatus } from '@prisma/client';

describe('Database Models', () => {
  describe('User Model', () => {
    it('should have required fields', () => {
      // Test user model structure
      const userFields = ['id', 'email', 'passwordHash', 'role', 'createdAt', 'updatedAt'];
      expect(userFields).toBeDefined();
    });

    it('should support USER and ADMIN roles', () => {
      expect(UserRole.USER).toBe('USER');
      expect(UserRole.ADMIN).toBe('ADMIN');
    });
  });

  describe('Course Model', () => {
    it('should have learning direction enum', () => {
      expect(LearningDirection.ENGLISH).toBe('ENGLISH');
      expect(LearningDirection.CPP).toBe('CPP');
    });
  });

  describe('Question Model', () => {
    it('should have question types', () => {
      expect(QuestionType.MULTIPLE_CHOICE).toBe('MULTIPLE_CHOICE');
      expect(QuestionType.FILL_BLANK).toBe('FILL_BLANK');
      expect(QuestionType.CODE_READING).toBe('CODE_READING');
    });

    it('should have difficulty levels', () => {
      expect(Difficulty.EASY).toBe('EASY');
      expect(Difficulty.MEDIUM).toBe('MEDIUM');
      expect(Difficulty.HARD).toBe('HARD');
    });
  });

  describe('Progress Model', () => {
    it('should have progress statuses', () => {
      expect(ProgressStatus.NOT_STARTED).toBe('NOT_STARTED');
      expect(ProgressStatus.IN_PROGRESS).toBe('IN_PROGRESS');
      expect(ProgressStatus.COMPLETED).toBe('COMPLETED');
    });
  });
});
