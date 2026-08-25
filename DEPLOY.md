# Deploy & Review Workflow (check changes BEFORE production)

The repo uses **two branches** so you can review every change on a live
Preview build before it ever touches the production site.

| Branch   | Purpose                     | Vercel result            |
|----------|-----------------------------|--------------------------|
| `develop`| Staging / review            | **Preview** deployment   |
| `main`   | Production (live)           | **Production** deployment|

Vercel is connected to the repo, so:
- Pushing `develop` builds a **Preview** URL you can click and test.
- Pushing `main` rebuilds and replaces the **live** site.

## Daily flow

1. Make your code changes (any file).
2. Push to `develop` to get a review link:
   ```powershell
   .\scripts\deploy.ps1 preview
   ```
   (Add `-Message "what changed"` to commit with a custom message.)
3. Open the Preview URL (Vercel dashboard → the `develop` deployment, or `vercel ls`).
   Click through the app and confirm the change works.
4. When satisfied, promote to production:
   ```powershell
   .\scripts\deploy.ps1 prod
   ```

That's it — `prod` merges `develop` into `main` and pushes, which is the
only thing that updates the live site.

## Notes
- Never push directly to `main` by hand; always go through `develop` so a
  Preview exists to review first.
- The `connectors` Add dialog now uses a dropdown of the real backend source
  names (`himalayas`, `remoteok`, `remotive`, `arbeitnow`, `findwork`,
  `weworkremotely`, `hn_hiring`, `adzuna`, `jooble`, `greenhouse`, `lever`,
  `ashby`), so a connector can't be created misconfigured.
- Sources tagged "needs API key" (`adzuna`, `jooble`, `greenhouse`, `lever`,
  `ashby`) still require server-side credentials; they'll show an `error`
  status on sync until those env vars / config are set.
