
# Full-Screen 3D Model Viewer

An ultra-lightweight, cross-platform viewer for `.glb` models and Gaussian splats in `.ply` or `.spz` format. The current page uses a selector to switch between a GLB preview and a splat viewer, powered by Google's [`<model-viewer>`](https://modelviewer.dev/) and GaussianSplats3D.

live preview at <https://maicen.github.io/m8-u3-3d-viewer/>

## Features

- True full-screen layout with custom resets to prevent scrolling margins or clipping.
- Model selector that switches between GLB and splat assets.
- Custom overlay controls using a glassmorphic floating panel.
- Interactive camera controls for the GLB viewer.
- Super lightweight, with no bulky framework dependencies.
- Deployment-ready for simple static servers such as Rust-based servers, Node utilities, or Python.

## Project Structure

```text
├── .vscode/
├── final_models/
│   ├── apartment_model.glb
│   └── splat-trained-compressed.ply
├── index.html
├── room_colmap/
│   ├── images/
│   └── sparse/
│       └── 0/
└── workflow/
    ├── 3d_splat_app/
    └── metashape/
```

## Software Used

### First Model

Model: `final_models\apartment_model.glb`

#### Polycam

Polycam for iOS 6.0.14 (cdce00217) was used for live scanning and mesh generation of a residential apartment, exported as USDZ.

#### Blender

Used to convert the USDZ file to GLB for wider compatibility.

### Second Model

Model: `final_models\splat-trained-compressed.ply`

A [room dataset](https://arxiv.org/abs/2111.12077) of 311 was used to generate COLMAP then Splats.

#### Agisoft Metashape

Used to generate COLMAP data for splat training.

#### 3D Splat App

Used for splat training and export of the compressed PLY file.

## Quick Start

### 1. Set Up Your Files

The viewer loads its assets from `final_models/` through the selector in `index.html`. The bundled files are `apartment_model.glb` and `splat-trained-compressed.ply`, and the code is ready to include more entries if you add them.

If you replace or rename a model, update the `filesInFolder` array and `folderPath` in `index.html` so the dropdown points at the new files.

### 2. Run a Local Server

Browsers block local file system access (`file://`) due to CORS security policies, so you must serve this project through a local web server.

#### Option A: Static Web Server

```bash
winget install static-web-server.static-web-server
static-web-server -p 8080
```

#### Option B: Node.js with npx

```bash
npx serve
# or
npx http-server -p 8080
```

#### Option C: Python Standard Library

```bash
python -m http.server 8080
```

#### Option D: VS Code Live Server Extension

If you use VS Code, install the Live Server extension and open `index.html` with it to launch a local preview with live reload.

Open <http://localhost:8080> in your browser to view your model.

## Extensibility and Custom APIs

The control layout uses the `<model-viewer>` JavaScript API. You can extend the functionality inside a `<script>` tag.

## MIME Type Support

If your server fails to load an asset, make sure it serves the files as static binary content and does not rewrite or text-encode them.

- `.glb`: `model/gltf-binary`
- `.ply` and `.spz`: regular binary/static file responses are usually sufficient

All default servers suggested above support this out of the box.
