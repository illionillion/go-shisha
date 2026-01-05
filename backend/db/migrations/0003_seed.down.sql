-- 0003_seed.down.sql
-- 初期シードを取り消す
-- 初期シードを取り消す
-- 外部キー制約の関係で、子テーブル(posts) → 親テーブル(users) → マスタ(flavors) の順で削除します。
-- `users` に対して `ON DELETE CASCADE` が設定されている場合は users を削除するだけでも posts は削除されますが、
-- 意図を明確にするために明示的に posts を先に削除しています。
DELETE FROM posts WHERE id IN (1,2,3,4,5,6);
DELETE FROM users WHERE id IN (1,2);
DELETE FROM flavors WHERE id IN (1,2,3,4,5,6);
