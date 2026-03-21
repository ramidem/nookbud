-- Simplify RBAC: migrate 5 roles (owner, parent, guardian, lawyer, viewer) to 3 (owner, editor, viewer)
UPDATE space_members SET role = 'editor' WHERE role IN ('parent', 'guardian');
UPDATE space_members SET role = 'viewer' WHERE role = 'lawyer';
-- owner stays owner, viewer stays viewer
