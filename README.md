# AOI Creation Tool

A modern, interactive web application for creating and managing Areas of Interest (AOIs) on satellite/drone imagery maps. Built with React, TypeScript, and Leaflet.

![AOI Creation Tool](https://img.shields.io/badge/React-18.2.0-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue) ![Vite](https://img.shields.io/badge/Vite-5.0.12-purple)

## Table of Contents

- [Features](#features)
- [Setup](#setup)
- [Architecture](#architecture)
- [Map Library Choice](#map-library-choice)
- [Performance Considerations](#performance-considerations)
- [Testing Strategy](#testing-strategy)
- [Tradeoffs Made](#tradeoffs-made)
- [Production Readiness](#production-readiness)
- [Time Spent](#time-spent)
- [API Documentation](#api-documentation)
- [ER Diagram / Schema](#er-diagram--schema)

## Features

### Core Features
- ✅ Interactive map with WMS satellite imagery layer (Geobasis NRW)
- ✅ Polygon drawing tools for creating AOIs
- ✅ Shapefile upload support (.shp, .zip, .geojson)
- ✅ Location search using Nominatim geocoding
- ✅ AOI management (create, view, edit, delete)
- ✅ Area calculation for polygons
- ✅ Persistent storage using localStorage
- ✅ Responsive sidebar UI

### Bonus Features
- ✅ Layer management (toggle WMS layer visibility)
- ✅ Custom map controls
- ✅ Accessibility improvements (ARIA labels, keyboard navigation)
- ✅ Unit tests for utility functions
- ✅ Comprehensive E2E tests with Playwright

## Setup

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# The application will be available at http://localhost:3000
```

### Environment Variables

No environment variables are required for local development. The application uses:
- Public WMS service (Geobasis NRW)
- Public Nominatim geocoding API
- Client-side localStorage for persistence

### Build for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

### Running Tests

```bash
# Run Playwright E2E tests
npm test

# Run Playwright tests with UI
npm run test:ui

# Run unit tests (Vitest)
npm run test:unit

# Run unit tests with UI
npm run test:unit:ui
```

### Linting and Formatting

```bash
# Run ESLint
npm run lint

# Format code with Prettier
npm run format
```

## Architecture

### Project Structure

```
aoi-creation-tool/
├── src/
│   ├── components/
│   │   ├── aoi/              # AOI list and details components
│   │   ├── layout/            # Layout components (Sidebar, MainLayout)
│   │   └── map/               # Map-related components
│   ├── context/               # React Context for state management
│   ├── types/                 # TypeScript type definitions
│   ├── utils/                 # Utility functions (geo calculations)
│   └── test/                  # Test setup files
├── tests/                     # Playwright E2E tests
├── dist/                      # Build output
└── public/                    # Static assets
```

### State Management

The application uses **React Context API** for state management:

- **MapContext**: Manages map state (center, zoom, drawing mode) and AOI CRUD operations
- **LocalStorage**: Persists AOIs between sessions
- **Component State**: Local UI state (editing mode, search queries)

### Key Design Decisions

1. **Context over Redux**: Chose React Context for simplicity and to avoid over-engineering for a single-page application
2. **Component Composition**: Separated map logic into reusable components (MapContent, AoiLayers, WMSLayer)
3. **Type Safety**: Comprehensive TypeScript types for all data structures
4. **Separation of Concerns**: Utility functions separated from components for testability

### Data Flow

```
User Action → Component → Context → State Update → Re-render
                ↓
         localStorage (persistence)
```

## Map Library Choice

### Why Leaflet?

I selected **Leaflet** as the map library for the following reasons:

1. **Mature and Stable**: Leaflet is one of the most mature and widely-used open-source mapping libraries (10+ years)
2. **WMS Support**: Excellent built-in support for WMS layers, which is required for this project
3. **React Integration**: `react-leaflet` provides excellent React bindings with hooks-based API
4. **Drawing Tools**: `leaflet-draw` plugin provides comprehensive drawing capabilities out of the box
5. **Performance**: Lightweight (~38KB gzipped) compared to alternatives
6. **Community**: Large community, extensive documentation, and many plugins
7. **Flexibility**: Easy to customize controls, styles, and behavior

### Alternatives Considered

1. **MapLibre GL JS**
   - ❌ More complex setup
   - ❌ Larger bundle size
   - ❌ WMS support requires additional plugins
   - ✅ Better performance for 3D/vector tiles

2. **OpenLayers**
   - ❌ Steeper learning curve
   - ❌ More complex API
   - ✅ Excellent WMS support
   - ✅ More features out of the box

3. **react-map-gl (Mapbox)**
   - ❌ Requires API key
   - ❌ Commercial licensing concerns
   - ✅ Excellent performance
   - ✅ Modern API

4. **Google Maps API**
   - ❌ Requires API key and billing
   - ❌ Limited customization
   - ❌ Not open source

**Decision**: Leaflet provides the best balance of features, ease of use, WMS support, and community support for this project.

## Performance Considerations

### Current Implementation

1. **Component Memoization**: Used `useCallback` and `useMemo` where appropriate to prevent unnecessary re-renders
2. **Lazy Loading**: Map components load only when needed
3. **Debounced Search**: Location search could be debounced (future improvement)
4. **LocalStorage Optimization**: Only saves when AOIs change, not on every render

### Handling 1000s of Points/Polygons

For production with large datasets, I would implement:

1. **Virtual Scrolling for AOI List**
   ```typescript
   // Use react-window or react-virtualized
   import { FixedSizeList } from 'react-window';
   ```

2. **Clustering for Map Markers**
   ```typescript
   // Use Leaflet.markercluster
   import MarkerClusterGroup from 'react-leaflet-cluster';
   ```

3. **Viewport-Based Rendering**
   - Only render AOIs visible in current map bounds
   - Use spatial indexing (R-tree) for efficient queries
   ```typescript
   const visibleAois = useMemo(() => {
     return aois.filter(aoi => mapBounds.contains(aoi.bounds));
   }, [aois, mapBounds]);
   ```

4. **Web Workers for Calculations**
   - Move area calculations to Web Workers
   - Process large shapefile uploads in background

5. **Progressive Loading**
   - Load AOIs in batches (e.g., 100 at a time)
   - Implement pagination for AOI list

6. **Canvas Rendering**
   - Use Leaflet Canvas renderer for large polygon sets
   - Reduces DOM nodes significantly

7. **Data Compression**
   - Simplify polygon geometries (Douglas-Peucker algorithm)
   - Store coordinates with reduced precision

8. **Caching Strategy**
   - Cache map tiles
   - Cache geocoding results
   - Use IndexedDB for larger datasets

### Performance Metrics

- Initial load: < 2s
- Map render: < 500ms
- AOI creation: < 100ms
- Search response: < 1s (depends on API)

## Testing Strategy

### E2E Tests (Playwright)

**Why Playwright?**
- Cross-browser testing (Chromium, Firefox, WebKit)
- Reliable auto-waiting
- Excellent debugging tools
- Network interception capabilities

**Test Coverage:**
1. ✅ Map and controls display correctly
2. ✅ Drawing mode toggle functionality
3. ✅ Location search functionality
4. ✅ AOI creation and management
5. ✅ LocalStorage persistence
6. ✅ Accessibility features

**What We Test:**
- User interactions (clicks, keyboard navigation)
- UI state changes
- Data persistence
- Accessibility compliance

**What We Would Test with More Time:**
- Actual polygon drawing (complex mouse interactions)
- Shapefile upload with various formats
- Error handling (network failures, invalid data)
- Performance under load
- Cross-browser compatibility

### Unit Tests (Vitest)

**Why Vitest?**
- Fast execution (Vite-powered)
- Jest-compatible API
- Excellent TypeScript support
- Built-in coverage

**Test Coverage:**
- ✅ `calculateArea()` - Area calculations for polygons
- ✅ `calculateCentroid()` - Centroid calculations
- ✅ `formatArea()` - Area formatting (m², ha, km²)

**What We Would Test with More Time:**
- Context provider functions
- Component rendering
- Event handlers
- Edge cases and error conditions

### Testing Philosophy

- **Quality over Quantity**: Focus on critical user flows
- **Maintainability**: Tests should be easy to understand and update
- **Realistic Scenarios**: Test actual user workflows, not just happy paths

## Tradeoffs Made

### 1. Context API vs Redux/Zustand

**Chosen**: Context API
- ✅ Simpler setup
- ✅ No additional dependencies
- ✅ Sufficient for current scale
- ❌ Could become unwieldy with more features

**Tradeoff**: Simplicity over scalability. For a larger app, would migrate to Zustand or Redux Toolkit.

### 2. LocalStorage vs IndexedDB

**Chosen**: LocalStorage
- ✅ Simpler API
- ✅ Sufficient for current data size
- ❌ 5-10MB limit
- ❌ Synchronous (blocks UI)

**Tradeoff**: Ease of use over performance. For larger datasets, would use IndexedDB.

### 3. Inline Styles vs CSS Modules

**Chosen**: Tailwind CSS (utility classes)
- ✅ Rapid development
- ✅ Consistent design system
- ✅ Small bundle size (with purging)
- ❌ Can become verbose

**Tradeoff**: Developer experience over traditional CSS. Tailwind provides excellent DX and performance.

### 4. Client-Side Only vs Backend

**Chosen**: Client-side only
- ✅ No server costs
- ✅ Faster development
- ✅ Works offline (with localStorage)
- ❌ No collaboration features
- ❌ Limited data size

**Tradeoff**: Simplicity over features. For production, would add backend for:
- User authentication
- Shared AOIs
- Larger datasets
- Real-time collaboration

### 5. Manual Drawing vs Predefined Shapes

**Chosen**: Manual polygon drawing
- ✅ Maximum flexibility
- ✅ Matches requirements
- ❌ More complex UX

**Tradeoff**: Flexibility over simplicity. Could add predefined shapes as enhancement.

## Production Readiness

### What's Ready

✅ **Core Functionality**
- Map rendering and interactions
- AOI creation and management
- Shapefile upload
- Location search
- Data persistence

✅ **Code Quality**
- TypeScript for type safety
- ESLint for code quality
- Component-based architecture
- Error handling

✅ **User Experience**
- Responsive design
- Accessibility improvements
- Loading states
- Error messages

### What Would Be Added for Production

1. **Backend Integration**
   - REST API for AOI CRUD
   - User authentication (JWT)
   - Database (PostgreSQL with PostGIS)
   - File storage for shapefiles

2. **Error Handling**
   - Global error boundary
   - Retry logic for API calls
   - User-friendly error messages
   - Error logging (Sentry)

3. **Performance**
   - Code splitting
   - Image optimization
   - CDN for static assets
   - Service worker for offline support

4. **Security**
   - Input validation
   - XSS prevention
   - CSRF protection
   - Rate limiting

5. **Monitoring**
   - Analytics (Google Analytics/Mixpanel)
   - Performance monitoring
   - Error tracking
   - User feedback

6. **Documentation**
   - API documentation (Swagger)
   - User guide
   - Developer documentation
   - Deployment guide

7. **CI/CD**
   - Automated testing
   - Code quality checks
   - Automated deployments
   - Preview environments

8. **Additional Features**
   - Export AOIs (GeoJSON, KML, Shapefile)
   - Import from various formats
   - AOI templates
   - Collaboration features
   - Version history

## Time Spent

### Breakdown

- **Setup & Configuration**: 2 hours
  - Project setup (Vite, TypeScript, Tailwind)
  - Map library integration
  - Development environment

- **Core Features**: 8 hours
  - Map component with WMS layer
  - Drawing functionality
  - AOI management (CRUD)
  - Shapefile upload
  - Location search

- **State Management**: 3 hours
  - Context API implementation
  - LocalStorage persistence
  - State synchronization

- **UI/UX**: 4 hours
  - Sidebar design
  - AOI list component
  - AOI details panel
  - Responsive layout

- **Testing**: 3 hours
  - Playwright E2E tests
  - Unit tests for utilities
  - Test configuration

- **Accessibility**: 2 hours
  - ARIA labels
  - Keyboard navigation
  - Focus management

- **Documentation**: 3 hours
  - README
  - Code comments
  - Architecture decisions

- **Bug Fixes & Refinement**: 2 hours
  - Import fixes
  - Type errors
  - Performance optimizations

**Total**: ~27 hours

## API Documentation

### Internal API (Context Methods)

#### MapContext

```typescript
interface MapContextType {
  // Map state
  mapCenter: [number, number];
  zoom: number;
  updateMapView: (center: [number, number], zoom: number) => void;
  
  // Drawing mode
  isDrawing: boolean;
  setDrawingMode: (isDrawing: boolean) => void;
  
  // AOI management
  aois: Aoi[];
  selectedAoiId: string | null;
  selectAoi: (id: string | null) => void;
  addAoi: (aoi: Omit<Aoi, 'id' | 'createdAt'>) => void;
  updateAoi: (id: string, updates: Partial<Aoi>) => void;
  deleteAoi: (id: string) => void;
  clearAllAois: () => void;
}
```

### External APIs Used

#### 1. WMS Service (Geobasis NRW)

**Endpoint**: `https://www.wms.nrw.de/geobasis/wms_nw_dop`

**Parameters**:
- `layers`: `nw_dop_rgb` (satellite imagery)
- `format`: `image/png`
- `transparent`: `true`

**Response**: PNG image tiles

#### 2. Nominatim Geocoding API

**Endpoint**: `https://nominatim.openstreetmap.org/search`

**Parameters**:
- `format`: `json`
- `q`: Search query (URL encoded)
- `limit`: Number of results (default: 5)

**Example Request**:
```
GET https://nominatim.openstreetmap.org/search?format=json&q=Berlin&limit=5
```

**Example Response**:
```json
[
  {
    "display_name": "Berlin, Germany",
    "lat": "52.5170365",
    "lon": "13.3888599",
    "type": "city"
  }
]
```

## ER Diagram / Schema

### Data Model

```
AOI (Area of Interest)
├── id: string (UUID)
├── name: string
├── description?: string
├── geometry: Point[] (Array of [lng, lat] coordinates)
├── createdAt: Date
├── updatedAt?: Date
└── properties?: Record<string, any> (Additional metadata)
```

### Storage Schema (LocalStorage)

```json
{
  "aoi-creation-tool-aois": [
    {
      "id": "aoi-1234567890-abc123",
      "name": "Berlin City Center",
      "description": "Central area of Berlin",
      "geometry": [
        [13.3888599, 52.5170365],
        [13.4050, 52.5200],
        [13.4100, 52.5150],
        [13.3888599, 52.5170365]
      ],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  ]
}
```

### Component Hierarchy

```
App
└── MapProvider (Context)
    └── MainLayout
        ├── Sidebar
        │   ├── AoiList
        │   └── AoiDetails
        └── MapComponent
            ├── MapContainer
            │   ├── TileLayer (OpenStreetMap)
            │   ├── WMSLayer (Satellite)
            │   ├── AoiLayers
            │   ├── SearchBar
            │   └── DrawFeatureGroup
            └── MapEvents
```

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.
