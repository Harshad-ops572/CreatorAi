import fs from 'fs';
import path from 'path';
import { env } from '../config/env';

export class StorageService {
  private baseDir: string;

  constructor() {
    this.baseDir = path.resolve(process.cwd(), env.UPLOAD_DIR);
    this.ensureDirectory(this.baseDir);
  }

  public ensureDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  public getProjectDir(projectId: string): string {
    const projectDir = path.join(this.baseDir, projectId);
    this.ensureDirectory(projectDir);
    return projectDir;
  }

  public getPublicUrl(relativePath: string): string {
    // Normalizes Windows backslashes to forward slashes for clean web URLs
    const normalized = relativePath.replace(/\\/g, '/').replace(/^\/+/, '');
    return `/uploads/${normalized}`;
  }

  public getAbsolutePathFromUrl(fileUrl: string): string {
    const cleanUrl = fileUrl.replace(/^\/uploads\//, '');
    return path.join(this.baseDir, cleanUrl);
  }

  public async deleteFile(filePath: string): Promise<boolean> {
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
      return false;
    } catch (err) {
      console.error(`Failed to delete file at ${filePath}:`, err);
      return false;
    }
  }

  public async deleteProjectDirectory(projectId: string): Promise<boolean> {
    try {
      const projectDir = path.join(this.baseDir, projectId);
      if (fs.existsSync(projectDir)) {
        await fs.promises.rm(projectDir, { recursive: true, force: true });
        return true;
      }
      return false;
    } catch (err) {
      console.error(`Failed to delete project directory ${projectId}:`, err);
      return false;
    }
  }
}

export const storageService = new StorageService();
