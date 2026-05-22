## 1. Card component variant

- [x] 1.1 Add `variant?: "default" | "featured"` (and optional `badge?: string`) to `Card` props in `app/components/ui/Card.tsx`
- [x] 1.2 Implement featured styles: navy-to-blue gradient surface, white label/sublabel, white/15 icon disc, white icon and chevron, unchanged `min-h-[72px]` and focus ring
- [x] 1.3 Render optional uppercase badge pill beside label when `badge` is set on featured variant only

## 2. Home page integration

- [x] 2.1 Update AI Speech `Card` in `app/app/page.tsx` to use `variant="featured"` and `badge="AI"` (keep `href`, label, sublabel, and microphone icon)
- [x] 2.2 Confirm other four home cards remain default variant with no prop changes

## 3. Verification

- [x] 3.1 Manually verify home screen: featured card stands out, no `animate-*` on the card, tap opens `/speech?autostart=mic`
- [x] 3.2 Manually verify keyboard focus ring and readable contrast on gradient background
