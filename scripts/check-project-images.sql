SELECT
  p.id,
  p.title,
  COUNT(pi.id) as image_count,
  array_agg(pi.storage_path) as image_urls
FROM projects p
LEFT JOIN project_images pi ON p.id = pi.project_id
WHERE p.approval_status = 'pending'
GROUP BY p.id, p.title
ORDER BY p.created_at DESC
LIMIT 5;
