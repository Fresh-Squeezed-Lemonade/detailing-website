# Jordan Clark's Pressure Washing — Website

---

## File Structure

```
├── index.html        # Page structure and content
├── styles.css        # All styles (custom properties, responsive layout)
├── script.js         # Nav, smooth scroll, mobile menu
├── README.md         # This file
└── images/           # Your before/after photos go here
    ├── before-1.jpg
    ├── after-1.jpg
    ├── before-2.jpg
    ├── after-2.jpg
    ├── before-3.jpg
    └── after-3.jpg
```

---

## Setup Checklist

### 1. Connect Cal.com

Open `index.html` and find the booking `<iframe>`. Replace `YOUR_CAL_USERNAME` in two places with your actual Cal.com username:

```html
<iframe src="https://cal.com/YOUR_CAL_USERNAME" ...>
```
```html
<a href="https://cal.com/YOUR_CAL_USERNAME" ...>Open it in a new tab →</a>
```

Your Cal.com username is in the URL when you log into cal.com — e.g. `cal.com/jordanclark`.

> **Tip:** In Cal.com's settings you can also grab an **embed snippet** for a more tightly integrated look. If you do that, replace the entire `<iframe>` block with Cal.com's provided embed code.

### 2. Add Your Before/After Photos

Create an `images/` folder in the same directory as `index.html` and add your photos with these exact filenames:

| File | Used for |
|---|---|
| `before-1.jpg` | First pair — before |
| `after-1.jpg`  | First pair — after |
| `before-2.jpg` | Second pair — before |
| `after-2.jpg`  | Second pair — after |
| `before-3.jpg` | Third pair — before |
| `after-3.jpg`  | Third pair — after |

If you have different filenames, you can update the `src` attributes inside the `.gallery__grid` section of `index.html` instead.

**Image tips:**
- JPG works great; WebP is smaller/faster if you have the option
- Aim for consistent aspect ratios across pairs — the CSS uses `4/3`
- Landscape orientation looks best in the grid

### 3. Update Contact Details

Search `index.html` for any placeholder phone/email text and replace with yours. The current version doesn't have a contact form — the Cal.com calendar is the primary CTA.

### 4. Update Captions

In the gallery section, the three captions currently read "Basic Exterior Wash," "Premium Interior + Exterior," and "Wheels & Tires Detail." Edit the `<p class="before-after__caption">` tags to match what's actually shown in your photos.

---

## Deployment

This site is fully static — drop all files (including the `images/` folder) anywhere:

| Platform | How |
|---|---|
| **Netlify** | Drag the folder to [app.netlify.com/drop](https://app.netlify.com/drop) |
| **GitHub Pages** | Push to a repo, enable Pages in Settings → Pages |
| **Vercel** | Import the repo at vercel.com |
| **Traditional host** | FTP/SFTP everything to your `public_html` directory |

Make sure the `images/` folder goes up alongside `index.html` — not inside a subfolder.
