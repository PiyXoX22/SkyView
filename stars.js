function generateStars(scene, count = 5000) {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
  
    for (let i = 0; i < count; i++) {
      const r = 1000;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
  
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
  
      positions.push(x, y, z);
  
      const brightness = Math.random();
      colors.push(brightness, brightness, brightness);
    }
  
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  
    const material = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true
    });
  
    const stars = new THREE.Points(geometry, material);
    scene.add(stars);
  
    return stars;
  }
  