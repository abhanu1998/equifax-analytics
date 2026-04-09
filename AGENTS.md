<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Persistent Context Protocol (Always Apply)

- Use `docs/PERSISTENT_CONTEXT.md` as the canonical running context file.
- Before any GitHub push or Vercel production deploy:
  - Update `docs/PERSISTENT_CONTEXT.md` with latest decisions, state, and links.
  - Ensure the context file is included in the same commit.
- After successful push/deploy:
  - Update commit/deploy references in `docs/PERSISTENT_CONTEXT.md`.
  - Commit and push the context update if needed so repository state stays in sync.
