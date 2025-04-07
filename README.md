# Enormous - Personal Tools & Resources

A modern, responsive landing page for a personal toolkit website hosted on GitHub Pages. This website features a clean, minimalist design inspired by modern UI aesthetics.

## Features

- **Modern Design**: Clean, minimalist aesthetic with subtle animations and transitions
- **Responsive Layout**: Works seamlessly across desktop, tablet, and mobile devices
- **Interactive Elements**: Subtle hover effects, smooth scrolling, and UI feedback
- **Optimized Performance**: Fast load times with minimal external dependencies
- **Accessibility**: Semantic HTML and proper ARIA attributes
- **Easily Extensible**: Modular structure for adding new tools and sections

## Structure

```
.
├── index.html             # Main HTML structure
├── css/
│   └── styles.css         # All styling
├── js/
│   └── main.js            # JavaScript functionality
└── README.md              # This documentation
```

## Design Elements

The design incorporates elements inspired by:

- **MagicUI**: For card transitions and hover effects
- **CultUI**: For clean, minimalist aesthetic
- **Aceternity**: For modern interaction patterns

## Customization

### Adding New Tools

To add a new tool to the tools grid:

1. Add a new card to the `.tools-grid` section in `index.html`:

```html
<div class="tool-card" style="--animation-order: 4;">
    <div class="tool-icon">
        <i class="fas fa-[icon-name]"></i>
    </div>
    <h3>Tool Name</h3>
    <p>Brief description of the tool's functionality</p>
</div>
```

2. Add a corresponding toolbar item:

```html
<div class="toolbar-item">
    <i class="fas fa-[icon-name]"></i>
    <span>Tool Name</span>
</div>
```

### Color Scheme

The color scheme is defined using CSS variables in `styles.css`. To modify the color scheme, update the variables in the `:root` section:

```css
:root {
    --primary-color: #9CA368;
    --secondary-color: #F4A261;
    --text-color: #2C3639;
    --light-text: #5C6B73;
    --background-color: #F5F5F5;
    --section-bg: #ECEEE7;
    --card-bg: #FFFFFF;
    /* ... other variables */
}
```

## Browser Compatibility

The website should work in all modern browsers, including:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Deployment

1. Push all files to your GitHub repository
2. Enable GitHub Pages in your repository settings

## Credits

- Font Awesome for icons
- Inter font from Google Fonts
- Design inspiration from the provided aesthetic images

## License

This project is licensed under the MIT License - see the LICENSE file for details. 