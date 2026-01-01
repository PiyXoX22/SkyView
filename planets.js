function createPlanet(scene, size, distance, color) {
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color });
    const planet = new THREE.Mesh(geometry, material);
    planet.position.x = distance;
    scene.add(planet);
    return planet;
  }
  
  function loadPlanets(scene) {
    return {
      earth: createPlanet(scene, 10, 80, 0x2266ff),
      moon: createPlanet(scene, 3, 95, 0xaaaaaa),
      mars: createPlanet(scene, 6, 140, 0xff5533)
    };
  }
  