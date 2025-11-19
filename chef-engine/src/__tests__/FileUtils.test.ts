import { describe, it, expect } from 'vitest';
import { FileUtils } from '../filesystem/FileUtils.js';
import type { ProjectFile } from '../types/index.js';

describe('FileUtils', () => {
  describe('normalizePaths', () => {
    it('should normalize Windows paths to POSIX', () => {
      const files: ProjectFile[] = [
        { path: 'src\\components\\App.tsx', content: 'test' },
        { path: 'public\\assets\\logo.png', content: 'test' },
      ];

      const normalized = FileUtils.normalizePaths(files);

      expect(normalized[0].path).toBe('src/components/App.tsx');
      expect(normalized[1].path).toBe('public/assets/logo.png');
    });

    it('should handle already normalized paths', () => {
      const files: ProjectFile[] = [
        { path: 'src/components/App.tsx', content: 'test' },
      ];

      const normalized = FileUtils.normalizePaths(files);

      expect(normalized[0].path).toBe('src/components/App.tsx');
    });
  });

  describe('calculateTotalSize', () => {
    it('should calculate total size from content', () => {
      const files: ProjectFile[] = [
        { path: 'file1.txt', content: 'hello' }, // 5 bytes
        { path: 'file2.txt', content: 'world' }, // 5 bytes
      ];

      const size = FileUtils.calculateTotalSize(files);

      expect(size).toBe(10);
    });

    it('should use explicit size if provided', () => {
      const files: ProjectFile[] = [
        { path: 'file1.txt', content: 'hello', size: 100 },
      ];

      const size = FileUtils.calculateTotalSize(files);

      expect(size).toBe(100);
    });
  });

  describe('getExtension', () => {
    it('should return file extension', () => {
      expect(FileUtils.getExtension('test.js')).toBe('.js');
      expect(FileUtils.getExtension('test.tsx')).toBe('.tsx');
      expect(FileUtils.getExtension('package.json')).toBe('.json');
    });

    it('should return empty string for files without extension', () => {
      expect(FileUtils.getExtension('README')).toBe('');
    });
  });

  describe('isConfigFile', () => {
    it('should identify common config files', () => {
      expect(FileUtils.isConfigFile('package.json')).toBe(true);
      expect(FileUtils.isConfigFile('tsconfig.json')).toBe(true);
      expect(FileUtils.isConfigFile('vite.config.ts')).toBe(true);
    });

    it('should return false for non-config files', () => {
      expect(FileUtils.isConfigFile('src/App.tsx')).toBe(false);
      expect(FileUtils.isConfigFile('index.html')).toBe(false);
    });
  });

  describe('isSourceFile', () => {
    it('should identify source code files', () => {
      expect(FileUtils.isSourceFile('App.js')).toBe(true);
      expect(FileUtils.isSourceFile('Component.tsx')).toBe(true);
      expect(FileUtils.isSourceFile('store.ts')).toBe(true);
    });

    it('should return false for non-source files', () => {
      expect(FileUtils.isSourceFile('README.md')).toBe(false);
      expect(FileUtils.isSourceFile('image.png')).toBe(false);
    });
  });

  describe('validatePaths', () => {
    it('should pass validation for valid paths', () => {
      const files: ProjectFile[] = [
        { path: 'src/App.tsx', content: 'test' },
        { path: 'package.json', content: '{}' },
      ];

      const result = FileUtils.validatePaths(files);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject absolute paths', () => {
      const files: ProjectFile[] = [
        { path: '/absolute/path/file.js', content: 'test' },
      ];

      const result = FileUtils.validatePaths(files);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject parent directory references', () => {
      const files: ProjectFile[] = [
        { path: '../outside/file.js', content: 'test' },
      ];

      const result = FileUtils.validatePaths(files);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should warn about empty files', () => {
      const files: ProjectFile[] = [
        { path: 'empty.txt', content: '' },
      ];

      const result = FileUtils.validatePaths(files);

      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('filesToMap', () => {
    it('should convert file array to map', () => {
      const files: ProjectFile[] = [
        { path: 'file1.txt', content: 'content1' },
        { path: 'file2.txt', content: 'content2' },
      ];

      const map = FileUtils.filesToMap(files);

      expect(map).toEqual({
        'file1.txt': 'content1',
        'file2.txt': 'content2',
      });
    });
  });
});
