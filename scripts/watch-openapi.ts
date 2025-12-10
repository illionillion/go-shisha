import chokidar from 'chokidar';
import fs from 'fs-extra';
import path from 'path';

const SOURCE_PATH = path.resolve(__dirname, '../backend/docs/swagger.yaml');
const TARGET_PATH = path.resolve(__dirname, '../frontend/openapi/openapi.yml');

/**
 * OpenAPI仕様ファイルの監視・自動コピースクリプト
 * 
 * Backend側のopenapi.ymlの変更を検知し、自動的にFrontendにコピーする。
 * これによりOrvalの自動生成がトリガーされ、API型定義が最新に保たれる。
 */
const watcher = chokidar.watch(SOURCE_PATH, {
  persistent: true,
  ignoreInitial: false,
});

watcher
  .on('add', async () => {
    try {
      await fs.copy(SOURCE_PATH, TARGET_PATH);
      console.log('✅ OpenAPI spec copied to frontend (initial)');
    } catch (error) {
      console.error('❌ Failed to copy OpenAPI spec:', error);
    }
  })
  .on('change', async () => {
    try {
      await fs.copy(SOURCE_PATH, TARGET_PATH);
      console.log('✅ OpenAPI spec copied to frontend (updated)');
    } catch (error) {
      console.error('❌ Failed to copy OpenAPI spec:', error);
    }
  })
  .on('error', (error) => {
    console.error('❌ Watcher error:', error);
  });

console.log('👀 Watching OpenAPI spec:', SOURCE_PATH);
console.log('📝 Target:', TARGET_PATH);
