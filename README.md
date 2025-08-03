# Tetris - Classic HTML5 Game

A beautiful and modern implementation of the classic Tetris game built with HTML5, CSS3, and JavaScript.

## Features

- 🎮 **Classic Tetris Gameplay**: All 7 standard tetromino pieces (I, O, T, S, Z, J, L)
- 🎨 **Modern Design**: Beautiful gradient backgrounds, smooth animations, and responsive layout
- 📱 **Responsive**: Works perfectly on desktop, tablet, and mobile devices
- 🎯 **Score System**: Track your score, level, and lines cleared
- ⏸️ **Game Controls**: Start, pause, and reset functionality
- ⌨️ **Keyboard Controls**: Full keyboard support for smooth gameplay
- 🔄 **Next Piece Preview**: See the upcoming piece
- 🎵 **Visual Effects**: Smooth animations and visual feedback

## How to Play

1. **Start the Game**: Click the "Start Game" button
2. **Move Pieces**: Use arrow keys to move pieces left and right
3. **Rotate**: Press the up arrow key to rotate pieces
4. **Soft Drop**: Press the down arrow key to make pieces fall faster
5. **Hard Drop**: Press the spacebar to instantly drop pieces to the bottom
6. **Clear Lines**: Complete horizontal lines to clear them and earn points
7. **Level Up**: Clear more lines to increase your level and game speed

## Controls

| Key | Action |
|-----|--------|
| ← → | Move Left/Right |
| ↑ | Rotate Piece |
| ↓ | Soft Drop |
| Space | Hard Drop |

## Game Features

### Scoring System
- **Line Clear**: 100 points × current level per line
- **Soft Drop**: 1 point per cell dropped
- **Hard Drop**: 2 points per cell dropped

### Level System
- Level increases every 10 lines cleared
- Game speed increases with each level
- Maximum speed reached at level 10

### Visual Design
- Gradient backgrounds with smooth animations
- Modern button designs with hover effects
- Responsive layout for all screen sizes
- Beautiful color scheme for each tetromino piece

## Technical Details

- **HTML5 Canvas**: For smooth graphics rendering
- **CSS3**: Modern styling with gradients and animations
- **Vanilla JavaScript**: No external dependencies
- **Responsive Design**: Mobile-friendly interface
- **SEO Optimized**: Proper meta tags and semantic HTML

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Installation

1. Download all files to a directory
2. Open `index.html` in your web browser
3. Start playing!

## File Structure

```
tetris/
├── index.html      # Main HTML file
├── style.css       # CSS styles
├── tetris.js       # Game logic
└── README.md       # This file
```

## Customization

You can easily customize the game by modifying:

- **Colors**: Edit the `COLORS` object in `tetris.js`
- **Speed**: Adjust the `dropInterval` values
- **Scoring**: Modify the scoring system in the `clearLines()` function
- **Styling**: Update the CSS in `style.css`

## License

This project is open source and available under the MIT License.

---

Enjoy playing Tetris! 🎮 
