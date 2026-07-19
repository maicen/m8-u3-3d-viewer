
## Full-Screen 3D Model Viewer

An ultra-lightweight, cross-platform, full-screen 3D model viewer designed to showcase `.glb` or `.gltf` assets seamlessly in any browser. Built using Google's [`<model-viewer>`](https://modelviewer.dev/) component, it includes responsive overlay controls, interactive camera options, and fluid performance optimizations out of the box.

## Features

- True full-screen layout with custom resets to prevent scrolling margins or clipping.
- Custom overlay controls using a glassmorphic floating panel.
- Interactive cameras for front view, top view, and automatic spin.
- Super lightweight, with no bulky framework dependencies.
- Deployment-ready for simple static servers such as Rust-based servers, Node utilities, or Python.

## Project Structure

```text
├── index.html          # Main HTML document with custom CSS and JS controls
└── 1447_03_26.glb      # Your 3D model asset (glTF Binary format)
```

## Quick Start

### 1. Set Up Your Files

Put your 3D model in the project folder, either as `1447_03_26.glb` or with whatever filename you reference in `index.html`.

```html
<model-viewer id="my-viewer" src="1447_03_26.glb" alt="A 3D model" ar camera-controls>
</model-viewer>
```

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

Open <http://localhost:8080> in your browser to view your model.

## Extensibility and Custom APIs

The control layout uses the `<model-viewer>` JavaScript API. You can extend the functionality inside a `<script>` tag.

### Dynamic Camera Control

```js
viewer.cameraOrbit = "45deg 55deg 2m";
```

### Animation Triggers

```js
viewer.animationName = "Walk";
viewer.play();
viewer.pause();
```

### Dynamic Material Swap

```js
viewer.variantName = "MidnightBlue";
```

## MIME Type Support

If your server fails to load the 3D asset, ensure it serves `.glb` files with the correct MIME type:

- MIME type: `model/gltf-binary`

All default servers suggested above support this out of the box.
