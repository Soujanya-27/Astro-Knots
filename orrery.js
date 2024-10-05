// orrery.js

// NASA NEO API setup
const NASA_API_KEY = 'https://api.nasa.gov/planetary/earth/imagery?lon=100.75&lat=1.5&date=2014-02-01&api_key=DEMO_KEY'; // Get this from https://api.nasa.gov/
const NEO_API_URL = `https://api.nasa.gov/neo/rest/v1/feed?start_date=2024-10-01&end_date=2024-10-08&api_key=${NASA_API_KEY}`;

// THREE.js setup
let scene, camera, renderer, controls;

// Initialize the 3D scene
function initScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Controls for orbit navigation
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;

    // Camera positioning
    camera.position.set(0, 10, 20);
    controls.update();
    
    // Add sun at the center of the scene
    addSun();

    // Start rendering loop
    animate();
}

// Add a glowing Sun in the center
function addSun() {
    const sunGeometry = new THREE.SphereGeometry(3.17, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffdd00 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);
}

// Add planets with basic circular orbits
function addPlanets() {
    const planetData = [
        { name: 'Mercury', distance: 5.79, size: 0.4879, color: 0xaaaaaa },
        { name: 'Venus', distance: 10.8200000, size: 1.2104, color: 0xffd27f },
        { name: 'Earth', distance: 14.9600000, size: 1.2756, color: 0x2c79b0 },
        { name: 'Mars', distance: 	22.8000000, size: 0.6792, color: 0xff5733 },
        { name: 'Jupitor', distance: 77.8500000, size: 1.42984, color: 0xd9b38c },
        { name: 'Saturn', distance: 143.2000000, size: 1.20536, color: 0xf4e3c2 },
        { name: 'Uranus', distance: 286.7000000, size: 5.1118, color: 0x7fffd4 },
        { name: 'Neptube', distance: 451.5000000, size: 4.9528, color: 0x4b70dd },
        { name: 'Pluto', distance: 590.6400000, size: 2.376, color: 0xbfa77a },
    ];

    planetData.forEach((planet) => {
        const geometry = new THREE.SphereGeometry(planet.size, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: planet.color });
        const planetMesh = new THREE.Mesh(geometry, material);

        // Set position along an orbit (we simplify it with a circular orbit)
        planetMesh.position.x = planet.distance;
        scene.add(planetMesh);
    });
}

// Fetch and visualize NEOs
async function fetchNEOData() {
    try {
        const response = await fetch(NEO_API_URL);
        const data = await response.json();
        const neos = data.near_earth_objects;

        // Add each NEO to the scene
        Object.values(neos).forEach((dayNEOs) => {
            dayNEOs.forEach((neo) => {
                const { name, estimated_diameter, close_approach_data } = neo;
                const size = estimated_diameter.kilometers.estimated_diameter_max / 10; // Scale size down
                const distance = close_approach_data[0].miss_distance.kilometers / 1e6; // Scale distance

                addNEO(name, size, distance);
            });
        });
    } catch (error) {
        console.error("Failed to fetch NEO data:", error);
    }
}

// Add NEO (Near-Earth Object) to the scene
function addNEO(name, size, distance) {
    const geometry = new THREE.SphereGeometry(size || 0.1, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const neoMesh = new THREE.Mesh(geometry, material);

    // Set a random position along a "near-Earth" orbit
    const angle = Math.random() * 2 * Math.PI;
    neoMesh.position.x = distance * Math.cos(angle);
    neoMesh.position.z = distance * Math.sin(angle);

    scene.add(neoMesh);

    console.log(`Added NEO: ${name} (Size: ${size.toFixed(3)} km, Distance: ${distance.toFixed(3)} million km)`);
}

// Render loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize scene and load data
initScene();
addPlanets();
fetchNEOData();
