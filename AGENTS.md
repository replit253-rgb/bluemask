<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

- Keep shared BlueMask navigation and footer in `SiteChrome`, service cards in `ServiceCards`, and shared styling in the global stylesheet so storefront pages stay consistent.
- Treat account inventory, top-up prices, reviews, and external ordering links as source-provided static content; do not invent production values or imply checkout is available.
