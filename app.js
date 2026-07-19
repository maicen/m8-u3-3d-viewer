import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';

// Update the array to match your exact directory tree
const filesInFolder = [
    "splat-trained-compressed.ply",
    "apartment_model.glb"

];

const folderPath = "final_models/";

// Grab UI elements
const selectEl = document.getElementById('model-select');
const glbContainer = document.getElementById('glb-container');
const splatContainer = document.getElementById('splat-container');

const gltfLoader = new GLTFLoader();
let glbRenderer = null;
let glbScene = null;
let glbCamera = null;
let glbControls = null;
let glbModel = null;
let glbAnimationFrameId = null;

let splatViewer = null;
const splatDisposalState = new WeakSet();
let loadRequestId = 0;

function resizeGlbViewer() {
    if (!glbRenderer || !glbCamera) return;
    const width = glbContainer.clientWidth;
    const height = glbContainer.clientHeight;
    if (!width || !height) return;
    glbCamera.aspect = width / height;
    glbCamera.updateProjectionMatrix();
    glbRenderer.setSize(width, height);
}

function createGlbViewerIfNeeded() {
    if (glbRenderer) return;

    glbScene = new THREE.Scene();
    glbScene.background = new THREE.Color(0xf5f5f5);

    glbCamera = new THREE.PerspectiveCamera(
        60,
        glbContainer.clientWidth / glbContainer.clientHeight,
        0.01,
        1000
    );
    glbCamera.position.set(2, 1.5, 3);

    glbRenderer = new THREE.WebGLRenderer({ antialias: true });
    glbRenderer.setPixelRatio(window.devicePixelRatio || 1);
    glbRenderer.setSize(glbContainer.clientWidth, glbContainer.clientHeight);
    glbContainer.appendChild(glbRenderer.domElement);

    glbControls = new OrbitControls(glbCamera, glbRenderer.domElement);
    glbControls.enableDamping = true;
    glbControls.target.set(0, 1, 0);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
    glbScene.add(hemiLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 7.5);
    glbScene.add(dirLight);

    window.addEventListener('resize', resizeGlbViewer);

    const animate = () => {
        glbAnimationFrameId = requestAnimationFrame(animate);
        if (!glbRenderer || !glbScene || !glbCamera || !glbControls) return;
        glbControls.update();
        glbRenderer.render(glbScene, glbCamera);
    };
    animate();
}

function disposeMaterial(material) {
    if (!material) return;
    Object.keys(material).forEach((key) => {
        const value = material[key];
        if (value && typeof value.dispose === 'function') {
            value.dispose();
        }
    });
    material.dispose();
}

function clearGlbModel() {
    if (!glbModel || !glbScene) return;
    glbModel.traverse((obj) => {
        if (obj.isMesh) {
            if (obj.geometry) obj.geometry.dispose();
            if (Array.isArray(obj.material)) {
                obj.material.forEach(disposeMaterial);
            } else {
                disposeMaterial(obj.material);
            }
        }
    });
    glbScene.remove(glbModel);
    glbModel = null;
}

function frameGlbModel(object3D) {
    if (!glbCamera || !glbControls) return;
    const box = new THREE.Box3().setFromObject(object3D);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const distance = maxDim * 1.8;

    glbCamera.position.set(center.x + distance, center.y + distance * 0.6, center.z + distance);
    glbCamera.near = maxDim / 100;
    glbCamera.far = maxDim * 100;
    glbCamera.updateProjectionMatrix();

    glbControls.target.copy(center);
    glbControls.update();
}

function isBenignSplatDisposeError(err) {
    return err &&
        err.name === 'NotFoundError' &&
        typeof err.message === 'string' &&
        err.message.includes("removeChild") &&
        err.message.includes("not a child");
}

async function disposeSplatViewerInstance(viewer) {
    if (!viewer || splatDisposalState.has(viewer)) return;
    splatDisposalState.add(viewer);

    try {
        if (typeof viewer.dispose !== 'function') return;
        const maybePromise = viewer.dispose();
        if (maybePromise && typeof maybePromise.then === 'function') {
            await maybePromise;
        }
    } catch (err) {
        if (!isBenignSplatDisposeError(err)) {
            console.error('Error during splat cleanup:', err);
        }
    }
}

async function cleanupSplatViewer() {
    if (!splatViewer) return;

    const viewerToDispose = splatViewer;
    splatViewer = null;
    await disposeSplatViewerInstance(viewerToDispose);
}

// Populate dropdown
filesInFolder.forEach(file => {
    const option = document.createElement('option');
    option.value = file;
    option.textContent = file;
    selectEl.appendChild(option);
});

// Routing logic
async function loadSelectedModel() {
    const currentRequestId = ++loadRequestId;
    const selectedFile = selectEl.value;
    const fullPath = folderPath + selectedFile;
    const ext = selectedFile.split('.').pop().toLowerCase();

    // Hide both viewers initially
    glbContainer.classList.remove('active');
    splatContainer.classList.remove('active');

    if (ext === 'glb') {
        await cleanupSplatViewer();
        if (currentRequestId !== loadRequestId) return;

        glbContainer.classList.add('active');
        createGlbViewerIfNeeded();
        resizeGlbViewer();
        clearGlbModel();

        gltfLoader.load(
            fullPath,
            (gltf) => {
                if (currentRequestId !== loadRequestId) return;
                glbModel = gltf.scene;
                glbScene.add(glbModel);
                frameGlbModel(glbModel);
            },
            undefined,
            (error) => {
                console.error('Error loading GLB:', error);
            }
        );
    }
    else if (ext === 'spz' || ext === 'ply') {
        await cleanupSplatViewer();
        if (currentRequestId !== loadRequestId) return;

        clearGlbModel();
        splatContainer.classList.add('active');

        // Initialize a new Splat Viewer instance
        const viewer = new GaussianSplats3D.Viewer({
            'rootElement': splatContainer,
            'cameraUp': [0, 1, 0],
            'initialCameraPosition': [0, 1, 5],
            'initialCameraLookAt': [0, 0, 0],
            'sharedMemoryForWorkers': false
        });
        splatViewer = viewer;

        // Load the file natively (.spz or .ply)
        viewer.addSplatScene(fullPath, {
            'progressiveLoad': true
        }).then(async () => {
            if (currentRequestId !== loadRequestId || splatViewer !== viewer) {
                await disposeSplatViewerInstance(viewer);
                return;
            }
            viewer.start();
        }).catch(err => {
            console.error("Error loading splat:", err);
        });
    }
    else if (ext === 'sog') {
        // SOG requires the PlayCanvas engine
        alert("The .sog format requires the PlayCanvas engine. Please select the GLB, SPZ, or PLY files instead.");
    }
}

// Listen for user changes
selectEl.addEventListener('change', loadSelectedModel);

// Load the first model on startup
if (filesInFolder.length > 0) {
    loadSelectedModel();
}
