# Kill Sheet Calculator

A professional web-based calculator for well control engineering calculations. This application helps drilling engineers and well control specialists calculate critical parameters during kick situations and well control operations.

![Kill Sheet Calculator](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Overview

The Kill Sheet Calculator is a comprehensive tool designed to perform real-time well control calculations including:

- **Kill Mud Weight** calculations
- **Initial and Final Circulating Pressures** (ICP/FCP)
- **Drillpipe Pressure Schedules**
- **Volume and Stroke Calculations**
- **Time Estimations** for well control operations
- **Visual Pressure Charts** for monitoring

## Features

✅ **Real-time Calculations** - Instant updates as you input data  
✅ **Comprehensive Input Sections** - Well information, kick data, casing, drill collar, and drill pipe data  
✅ **HWDP Support** - Optional Heavy Weight Drill Pipe calculations  
✅ **Pressure Schedule Table** - Detailed drillpipe pressure circulating schedule  
✅ **Interactive Charts** - Visual representation of pressure vs strokes using Chart.js  
✅ **PDF Export** - Download complete kill sheet as PDF for record-keeping  
✅ **Professional UI** - Clean, modern interface with blue/gray color scheme  
✅ **Input Validation** - Ensures data accuracy and prevents calculation errors  
✅ **Responsive Design** - Works on desktop, tablet, and mobile devices

## Technologies Used

- **HTML5** - Semantic markup and structure
- **CSS3** - Modern styling with custom properties and animations
- **JavaScript (ES6+)** - Core calculation logic and interactivity
- **Chart.js** - Data visualization for pressure charts
- **html2pdf.js** - PDF generation functionality

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- No server or installation required - runs entirely in the browser

### Installation

1. Clone or download this repository:
   ```bash
   git clone <repository-url>
   cd petro
   ```

2. Open `index.html` in your web browser:
   ```bash
   open index.html
   ```
   
   Or simply double-click the `index.html` file.

### File Structure

```
petro/
├── index.html      # Main HTML structure
├── styles.css      # Styling and layout
├── script.js       # Calculation logic and interactivity
├── package.json    # Project metadata
├── vercel.json     # Vercel deployment configuration
└── README.md       # This file
```

## Deployment

### Deploy to Vercel

This project is ready for one-click deployment to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/kill-sheet-calculator)

#### Manual Deployment Steps

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy using Vercel CLI**:
   ```bash
   cd petro
   vercel
   ```

3. **Or deploy via Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your Git repository
   - Vercel will auto-detect the static site
   - Click "Deploy"

#### Vercel Configuration

The project includes a `vercel.json` file with optimal settings for static site deployment:
- Automatic HTTPS
- Global CDN distribution
- Instant cache invalidation
- Zero configuration required

### Alternative Deployment Options

This is a static website and can be deployed to:
- **GitHub Pages** - Free hosting for public repositories
- **Netlify** - Drag and drop deployment
- **AWS S3** - Static website hosting
- **Any web server** - Just upload the files

## Usage

### Input Sections

1. **Well Information**
   - Hole Diameter (in)
   - Hole Depth - TVD (ft)
   - Current Mud Weight (ppg)
   - Normal Circulating Pressure (psi)
   - Slow Pump Pressure (psi)
   - Slow Pump Speed (spm)
   - Pump Capacity (bbl/stroke)

2. **Kick Data**
   - Drill Pipe Shut-In Pressure - SIDPP (psi)
   - Casing Shut-In Pressure - SICP (psi)
   - Pit Gain (bbl)

3. **Casing Data**
   - Last Casing ID (in)
   - Last Casing OD (in)
   - Casing Grade
   - Casing Linear Weight (lb/ft)
   - Casing Setting Depth (ft)

4. **Drill Collar Data**
   - Drill Collar OD (in)
   - Drill Collar ID (in)
   - Drill Collar Length (ft)

5. **Drill Pipe Data**
   - Drill Pipe OD (in)
   - Drill Pipe ID (in)
   - Drill Pipe Nominal Weight (lb/ft)

6. **HWDP (Optional)**
   - Enable checkbox if HWDP is present
   - HWDP OD, ID, and Length

### Calculated Results

The calculator automatically computes:

- **Kill Parameters**: Kill Mud Weight, ICP, FCP, Pressure Drop per 100 Strokes
- **Volume & Stroke Calculations**: Drill string volume, surface-to-bit strokes, annular capacity, etc.
- **Time Calculations**: Surface-to-bit time, bit-to-surface time, total pumping time
- **Pressure Schedule**: Detailed table showing pressure at various stroke intervals
- **Pressure Chart**: Visual graph of pressure vs strokes

### Actions

- **Reset Form**: Clear all inputs and start fresh
- **Download PDF**: Export the complete kill sheet with all calculations and charts

## Formulas and Calculations

### Key Formulas

**Kill Mud Weight (KMW)**:
```
KMW = Current Mud Weight + (SIDPP / (0.052 × Hole Depth))
```

**Initial Circulating Pressure (ICP)**:
```
ICP = SIDPP + Slow Pump Pressure
```

**Final Circulating Pressure (FCP)**:
```
FCP = Slow Pump Pressure × (Kill Mud Weight / Current Mud Weight)
```

**Annular Capacity**:
```
Capacity = (Hole Diameter² - Pipe OD²) / 1029.4 (bbl/ft)
```

## Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ Internet Explorer (not supported)

## Safety Notice

> [!CAUTION]
> This calculator is a tool to assist in well control calculations. Always verify results with standard industry practices and consult with qualified well control specialists. The accuracy of calculations depends on the accuracy of input data.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built for drilling engineers and well control professionals
- Follows industry-standard well control calculation methods
- Designed with input from field operations experience

## Support

For questions, issues, or feature requests, please open an issue in the repository.

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Author**: Well Control Engineering Team
