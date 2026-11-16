# Owner's guide

Everyday tasks for running the portfolio. Site: https://coralbareket.vercel.app · Admin: https://coralbareket.vercel.app/admin

## Sign in to the admin panel

1. Open `/admin` and click **Sign in with Google** with coral.bareket@gmail.com.
2. Only accounts with the admin claim get in. Anyone else sees "Not authorized".
3. Once signed in on a browser, your visits from that browser are not counted in analytics.

The admin claim was granted once per Firebase project. If you ever need it again (new account or project):

```bash
pnpm tsx --env-file=.env.production.local scripts/grant-admin.ts coral.bareket@gmail.com   # production
pnpm admin:grant coral.bareket@gmail.com                                                      # dev
```

Then sign out and back in.

## Add a project

1. Admin → **Projects** → **New project**.
2. Fill in the title, a **slug** (lowercase-with-dashes, becomes `/projects/<slug>`), subtitle, a short description
   for the card, problem, approach, key decisions (one per line), and the architecture flow (one step per line,
   `Step | detail`, drawn as a diagram on the project page). Add the repo and demo links.
3. **Upload** a cover image (PNG, JPG, WebP or AVIF).
4. Tick **Published** and **Save**.

The project shows on the site within about 5 minutes (API cache). Its page gets full SEO and link-preview tags
on the next deploy. Until then it still works, and shows "Loading project…" for a moment.

To hide the Projects section entirely, use Admin → **Content** → Settings.

## Update your CV

Admin → **CV** → **Replace CV (PDF)**. The old file is deleted from Cloudinary. Use "test download" to check it.
The Download CV button only appears once a CV exists, and every download is counted in Analytics.

## Edit the site's text

Admin → **Content**: hero (name, title, value statement, location, skill chips), tech stack (one
`Group: item, item` per line), engineering focus cards, experience, and About. Click **Save all changes**.
Changes show within about 5 minutes. Search results and link previews pick them up on the next deploy.

If you change the hero text, also refresh the link-preview image: `pnpm og` on your machine, then commit.

## Read contact messages

Every message is emailed to your Gmail (reply straight from Gmail; Reply-To is the sender) and also saved in
Admin → **Inbox**. The tab shows an unread count. Use **Mark read**, **Archive** or **Reply**.

## Analytics

Admin → **Analytics**: page views, CV downloads, messages, page views per day, traffic sources, how far down
the page visitors scroll (section reach), link clicks and short insights, for 7 / 30 / 90 days or all time.
**Export CSV** downloads the daily numbers.

## Run it on your machine

```bash
pnpm start     # http://localhost:3000 (uses the disposable dev Firebase project from .env.local)
pnpm check     # lint, format, typecheck, tests, build
```

## Release dev → production

1. Work on `dev`, commit and push.
2. On GitHub, open a pull request **dev → main** and merge it. Merging alone deploys nothing.
3. GitHub → **Actions → Deploy to production → Run workflow** (branch `main`).
4. The workflow runs every check, the emulator tests, the production build and the Playwright smoke tests.
   Only if all of them pass does it deploy, then it checks the live site. If anything fails, production stays
   as it was. The failed step's log says why.

## Check usage against the free tiers

Nothing can ever be billed (no card is on file). Hitting a limit only pauses that service until it resets.

| Where                                                       | What to look at           | Free limit                      |
| ----------------------------------------------------------- | ------------------------- | ------------------------------- |
| Firebase console → coral-portfolio-prod → Firestore → Usage | reads / writes / deletes  | 50K / 20K / 20K per day         |
| Vercel → coralbareket → Usage                               | function invocations, CPU | 1M invocations, 4 h CPU / month |
| Resend → Emails                                             | emails sent               | 100 / day, 3,000 / month        |
| Cloudinary → Dashboard                                      | credits used              | 25 / month                      |

Normal portfolio traffic uses a few percent of these.

## Keys and secrets

- Production secrets live in Vercel (Settings → Environment Variables), in GitHub (Settings → Secrets and
  variables → Actions) and in your local `.env.production.local`. Never commit that file.
- To rotate a key (Resend, Turnstile, Cloudinary, Vercel token): create the new one, put it in
  `.env.production.local`, run `pnpm setup:production`, update the matching GitHub secret if there is one, and run
  the deploy workflow. Then delete the old key at the provider.
