-- 0003_seed.down.sql
-- 初期シードを取り消す
DELETE FROM posts WHERE id IN (1,2,3,4,5,6);
DELETE FROM users WHERE id IN (1,2);
DELETE FROM flavors WHERE id IN (1,2,3,4,5,6);
