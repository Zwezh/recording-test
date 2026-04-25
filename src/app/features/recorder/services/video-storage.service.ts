import { Injectable } from '@angular/core';

import { SavedVideo, SavedVideoRecord } from '../models/recorder.models';

const DB_NAME = 'bandwidth-recorder';
const DB_VERSION = 1;
const STORE_NAME = 'videos';

@Injectable({ providedIn: 'root' })
export class VideoStorageService {
  private databasePromise: Promise<IDBDatabase> | null = null;

  async loadAll(): Promise<readonly SavedVideo[]> {
    const database = await this.openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const records = this.toVideoRecords(request.result);
        resolve(
          records.sort(
            (first, second) =>
              new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
          ),
        );
      };
    });
  }

  async save(video: SavedVideo): Promise<void> {
    const database = await this.openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(video);

      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async delete(id: string): Promise<void> {
    const database = await this.openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  private openDatabase(): Promise<IDBDatabase> {
    this.databasePromise ??= new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = () => {
        const database = request.result;

        if (!database.objectStoreNames.contains(STORE_NAME)) {
          const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt');
        }
      };
    });

    return this.databasePromise;
  }

  private toVideoRecords(value: unknown): SavedVideoRecord[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter((item): item is SavedVideoRecord => this.isVideoRecord(item));
  }

  private isVideoRecord(value: unknown): value is SavedVideoRecord {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const record = value as Partial<SavedVideoRecord>;

    return (
      typeof record.id === 'string' &&
      record.blob instanceof Blob &&
      typeof record.mimeType === 'string' &&
      typeof record.createdAt === 'string' &&
      typeof record.durationSeconds === 'number' &&
      (record.quality === 'low' || record.quality === 'medium' || record.quality === 'high')
    );
  }
}
