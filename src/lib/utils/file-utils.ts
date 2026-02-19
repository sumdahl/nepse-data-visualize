import { mkdir, writeFile, readFile, access, appendFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

export async function ensureDir(path: string): Promise<void> {
  await mkdir(path, { recursive: true });
}

export async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function writeJsonAtomic(path: string, data: unknown): Promise<void> {
  await ensureDir(dirname(path));
  const content = JSON.stringify(data, null, 2);
  await writeFile(path, content, 'utf8');
}

export async function readJson<T>(path: string): Promise<T> {
  const content = await readFile(path, 'utf8');
  return JSON.parse(content);
}

export async function appendJsonl(path: string, records: unknown[]): Promise<void> {
  await ensureDir(dirname(path));
  const lines = records.map(r => JSON.stringify(r)).join('\n') + '\n';
  await appendFile(path, lines, 'utf8');
}

export async function readJsonl<T>(path: string): Promise<T[]> {
  const content = await readFile(path, 'utf8');
  const lines = content.trim().split('\n');
  return lines.filter(Boolean).map(line => JSON.parse(line));
}

export async function findFiles(basePath: string, pattern: RegExp): Promise<string[]> {
  const results: string[] = [];
  
  async function scan(dir: string): Promise<void> {
    try {
      const entries = await readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          await scan(fullPath);
        } else if (entry.isFile() && pattern.test(entry.name)) {
          results.push(fullPath);
        }
      }
    } catch {}
  }
  
  await scan(basePath);
  return results;
}

export async function findFilesByDate(basePath: string, date: string): Promise<string[]> {
  const [year, month, day] = date.split('-');
  const dirPath = join(basePath, 'data', 'raw', 'nepse', year, month, day);
  const results: string[] = [];
  
  try {
    const entries = await readdir(dirPath);
    for (const entry of entries) {
      if (entry.endsWith('.json') && entry.startsWith('signals_')) {
        results.push(join(dirPath, entry));
      }
    }
  } catch {}
  
  return results;
}

export function buildRawPath(basePath: string, date: string, time: string): string {
  const [year, month, day] = date.split('-');
  return join(basePath, 'data', 'raw', 'nepse', year, month, day, `signals_${time}.json`);
}

export function buildCleanedPath(basePath: string, date: string): string {
  const [year, month] = date.split('-');
  return join(basePath, 'data', 'cleaned', 'nepse', year, month, `cleaned_${date}.jsonl`);
}

export function buildFeaturesPath(basePath: string, date: string): string {
  const [year, month] = date.split('-');
  return join(basePath, 'data', 'features', 'nepse', year, month, `features_${date}.jsonl`);
}

export function buildHistoricalPath(basePath: string): string {
  return join(basePath, 'data', 'historical', 'nepse_timeseries.jsonl');
}