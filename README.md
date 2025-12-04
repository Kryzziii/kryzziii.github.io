<div align="center">

  <h1>✨ Personal Portfolio</h1>

  <p>
    A modern, responsive portfolio designed with the <strong>Glassmorphism</strong> aesthetic.<br>
    Built with a focus on clean UI/UX, performance, and cross-browser compatibility.
  </p>

  <p>
    <a href="https://portfolio.chris-jemming.lu"><strong>🌐 View Live Demo</strong></a>
    ·
    <a href="https://github.com/Kryzziii/kryzziii.github.io/issues">🪲 Report Bug</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
    <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  </p>
</div>

<br />

## 🎨 About The Project

This portfolio serves as a digital showcase for my projects, skills, and professional journey. The design leverages the **Glassmorphism** trend (frosted glass effect), implemented using modern, vanilla CSS without heavy frameworks.

### ✨ Key Features

* **💎 Glassmorphism UI:** Extensive use of `backdrop-filter: blur()`, semi-transparent borders, and `rgba` colors to create depth.
* **🌓 Dark / Light Mode:** Fully supported via CSS Variables with state persistence using LocalStorage.
* **📱 Fully Responsive:** Optimized for all viewports – from 4k desktops to mobile devices.
* **🍏 iOS Optimized:** Includes specific WebKit fixes to handle `border-radius` clipping and `overflow` rendering issues on Safari (iPhone).
* **⚡ High Performance:** Built with pure Vanilla JS and CSS to ensure maximum load speed.

---
## 🛠️ Built With

I intentionally avoided frameworks like Bootstrap or Tailwind to demonstrate strong fundamental understanding of CSS architecture and Layouts.

* **HTML5:** Semantic markup and structure.
* **CSS3:**
    * Flexbox & CSS Grid layouts.
    * CSS Custom Properties (Variables) for theming.
    * Mobile-first media queries.
    * Advanced selectors and backdrop filters.
* **JavaScript (ES6+):**
    * Theme toggling logic.
    * DOM manipulation.

---

## 🚀 Installation & Usage

You can clone this repository to check out the code or use it as a template.

1.  **Clone the repo**
    ```bash
    git clone https://github.com/Kryzziii/kryzziii.github.io.git
    ```

2.  **Navigate to directory**
    ```bash
    cd kryzziii.github.io
    ```

3.  **Run**
    Simply open `index.html` in your browser or use the VS Code "Live Server" extension.

---

## 📂 File Structure

```text
/
├── assets/               # Images, icons and screenshots
├── css/
│   ├── main.css          # The central import file (linked in HTML)
│   ├── 1-variables.css   # CSS Variables (Colors, Fonts, Glassmorphism settings)
│   ├── 2-base.css        # Resets, typography, and global defaults
│   ├── 3-layout.css      # Structure (Navbar, Grid, Footer)
│   ├── 4-components.css  # Reusable UI elements (Cards, Buttons, Pills)
│   └── 5-utilities.css   # Specific mobile overrides & fixes
├── js/
│   ├── main.js           # Core logic (Event listeners, Initialization)
│   └── components.js     # UI helpers (Dark mode toggle, Scroll logic)
├── 404.html              # Custom 404 error page
├── certifications.html   # Certifications and courses
├── experience.html       # Professional experience
├── index.html            # Main landing page
├── projects.html         # Detailed project overview
└── README.md             # Documentation