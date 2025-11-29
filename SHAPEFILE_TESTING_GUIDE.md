# Shapefile Upload Testing Guide

## Supported Formats

The application supports three formats:
1. **Shapefile (.shp)** - Must be in a ZIP file with all required files (.shp, .shx, .dbf, .prj)
2. **ZIP file** - Contains a complete shapefile (all required files)
3. **GeoJSON (.geojson)** - Standard GeoJSON format

## How to Test the Upload Feature

### Step 1: Access the Upload Button
1. Start the application: `npm run dev`
2. Look for the **"Upload Shapefile"** button in the left sidebar
3. Click the button to trigger the file picker

### Step 2: Upload a File
1. Click "Upload Shapefile" button
2. Select a valid shapefile (ZIP), GeoJSON, or .shp file
3. The file will be processed automatically

### Step 3: Verify It Works
After uploading, you should see:
- ✅ New AOIs appear in the sidebar list
- ✅ Polygons appear on the map
- ✅ Map automatically zooms to fit the imported features
- ✅ AOIs are named based on file properties or default names

## Where to Get Sample Shapefiles

### Option 1: Download Sample Shapefiles (Recommended)

**Natural Earth Data** (Free, high-quality):
- Website: https://www.naturalearthdata.com/downloads/
- Download: https://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/cultural/ne_10m_admin_0_countries.zip
- Contains: Country boundaries (good for testing)

**USGS Earth Explorer**:
- Website: https://earthexplorer.usgs.gov/
- Free account required
- Various geographic datasets

**OpenStreetMap Data**:
- Website: https://www.openstreetmap.org/
- Export areas as shapefiles using tools like:
  - https://www.openstreetmap.org/export
  - https://extract.bbbike.org/

### Option 2: Create Your Own GeoJSON (Easiest for Testing)

Create a simple GeoJSON file for testing:

**File: `test-aoi.geojson`**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Test Area 1",
        "description": "Test polygon for AOI creation"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [13.4050, 52.5200],
          [13.4100, 52.5200],
          [13.4100, 52.5150],
          [13.4050, 52.5150],
          [13.4050, 52.5200]
        ]]
      }
    }
  ]
}
```

**Coordinates format**: `[longitude, latitude]` (note: longitude first!)

### Option 3: Use Online Shapefile Converters

Convert other formats to shapefile:
- **Mapshaper**: https://mapshaper.org/
  - Upload any format
  - Export as shapefile (ZIP)
- **MyGeodata Converter**: https://mygeodata.cloud/converter/
- **Ogre**: https://ogre.adc4gis.com/

## Testing Checklist

### ✅ Basic Functionality
- [ ] Click "Upload Shapefile" button opens file picker
- [ ] Can select .zip, .shp, or .geojson files
- [ ] File uploads without errors
- [ ] AOIs appear in sidebar after upload
- [ ] Polygons appear on map
- [ ] Map zooms to fit imported features

### ✅ Error Handling
- [ ] Invalid file shows error message
- [ ] Non-geographic file shows error
- [ ] Empty file handled gracefully
- [ ] Large files don't crash the app

### ✅ Data Integrity
- [ ] Polygon coordinates are correct
- [ ] AOI names are preserved or defaulted
- [ ] Multiple polygons from one file all import
- [ ] Imported AOIs can be edited/deleted

## Common Issues & Solutions

### Issue: "Error processing shapefile"
**Causes:**
- Missing required shapefile files (.shx, .dbf)
- Corrupted file
- Wrong coordinate system

**Solution:**
- Ensure shapefile is in a ZIP with all files
- Try GeoJSON format instead
- Check file is not corrupted

### Issue: "No polygons appear"
**Causes:**
- File contains only points/lines (not polygons)
- Coordinates are outside map bounds
- File format not supported

**Solution:**
- Use a file with Polygon geometry
- Check coordinates are valid lat/lng
- Try a different file format

### Issue: "Map doesn't zoom"
**Causes:**
- File has no valid bounds
- Coordinates are invalid

**Solution:**
- Check GeoJSON structure is correct
- Verify coordinates are [lng, lat] format

## Quick Test with GeoJSON

1. Create a file `test.geojson` with this content:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "name": "Berlin Square" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [13.38, 52.51],
          [13.42, 52.51],
          [13.42, 52.53],
          [13.38, 52.53],
          [13.38, 52.51]
        ]]
      }
    }
  ]
}
```

2. Save it
3. Click "Upload Shapefile" in the app
4. Select `test.geojson`
5. You should see a square polygon in Berlin!

## Expected Behavior

When working correctly:
1. **File Selection**: Clicking button opens system file picker
2. **Processing**: Brief moment while file is processed (no visible loading indicator currently)
3. **Success**: 
   - New AOIs appear in sidebar
   - Polygons render on map
   - Map zooms to show all imported features
   - AOIs are named from file properties or auto-named
4. **Persistence**: Imported AOIs are saved to localStorage

## Debugging Tips

1. **Check Browser Console**: Open DevTools (F12) to see any errors
2. **Check Network Tab**: Verify file is being read
3. **Check Application Tab**: Verify AOIs are added to context
4. **Test with Simple GeoJSON**: Start with a simple GeoJSON to verify basic functionality

## File Size Recommendations

- **Small files (< 1MB)**: Should work instantly
- **Medium files (1-10MB)**: May take a few seconds
- **Large files (> 10MB)**: May cause performance issues

For testing, use small files with 1-5 polygons.

