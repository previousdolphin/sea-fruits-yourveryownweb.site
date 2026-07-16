// ============================================================
// SEA FRUITS — SCRIPTS.JS
// Three.js 3D Creature Renderers + UI Interactions
// ============================================================

// ============================================================
// UTILITY: Wait for DOM
// ============================================================
document.addEventListener('DOMContentLoaded', function () {

  // ----------------------------------------------------------
  // NAV: Toggle mobile menu
  // ----------------------------------------------------------
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close on link click
    navMenu.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ----------------------------------------------------------
  // HEADER: Add scrolled class for shadow
  // ----------------------------------------------------------
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  // ----------------------------------------------------------
  // REVEAL ON SCROLL: IntersectionObserver
  // ----------------------------------------------------------
  const revealEls = document.querySelectorAll(
    '.creature-card, .menu-item, .visit-card, .philosophy-text, .philosophy-visual, .menu-preview-item, .ambiance-text, .ambiance-placeholder, .form-wrapper'
  );

  revealEls.forEach(function (el) {
    el.classList.add('reveal');
  });

  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry, i) {
      if (entry.isIntersecting) {
        setTimeout(function () {
          entry.target.classList.add('revealed');
        }, 80 * (entry.target.dataset.revealDelay || 0));
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(function (el, i) {
    el.dataset.revealDelay = i % 4;
    revealObserver.observe(el);
  });

  // ----------------------------------------------------------
  // THREE.JS: Check availability
  // ----------------------------------------------------------
  if (typeof THREE === 'undefined') {
    console.warn('Sea Fruits: THREE.js not loaded — skipping 3D renderers.');
    return;
  }

  // ----------------------------------------------------------
  // THREE.JS HELPER: Make a renderer that fills its canvas
  // ----------------------------------------------------------
  function makeRenderer(canvas) {
    var renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    return renderer;
  }

  function sizeRenderer(renderer, canvas) {
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    if (canvas.width !== w || canvas.height !== h) {
      renderer.setSize(w, h, false);
      return true;
    }
    return false;
  }

  // ----------------------------------------------------------
  // THREE.JS HELPER: Standard camera + lights combo
  // ----------------------------------------------------------
  function makeScene(bgColor) {
    var scene = new THREE.Scene();
    if (bgColor !== undefined) {
      scene.background = new THREE.Color(bgColor);
    }

    var ambient = new THREE.AmbientLight(0xfff5e0, 0.6);
    scene.add(ambient);

    var key = new THREE.DirectionalLight(0xfff0cc, 1.4);
    key.position.set(4, 6, 5);
    key.castShadow = true;
    scene.add(key);

    var fill = new THREE.DirectionalLight(0xc0e8d0, 0.5);
    fill.position.set(-5, 2, -3);
    scene.add(fill);

    var rim = new THREE.PointLight(0xb45309, 0.8, 20);
    rim.position.set(0, -3, -5);
    scene.add(rim);

    return scene;
  }

  function makeCamera(aspect) {
    var cam = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    cam.position.set(0, 0, 5);
    return cam;
  }

  // ----------------------------------------------------------
  // DRAG-TO-ROTATE CONTROLLER
  // ----------------------------------------------------------
  function addDragRotate(canvas, targetObj) {
    var isDragging = false;
    var prevX = 0, prevY = 0;
    var velX = 0, velY = 0;
    var autoRotateSpeed = 0.004;

    canvas.style.cursor = 'grab';

    function onDown(e) {
      isDragging = true;
      canvas.style.cursor = 'grabbing';
      prevX = e.clientX || (e.touches && e.touches[0].clientX);
      prevY = e.clientY || (e.touches && e.touches[0].clientY);
      velX = 0; velY = 0;
    }

    function onMove(e) {
      if (!isDragging) return;
      var x = e.clientX || (e.touches && e.touches[0].clientX);
      var y = e.clientY || (e.touches && e.touches[0].clientY);
      velX = (x - prevX) * 0.012;
      velY = (y - prevY) * 0.012;
      targetObj.rotation.y += velX;
      targetObj.rotation.x += velY;
      prevX = x; prevY = y;
    }

    function onUp() {
      isDragging = false;
      canvas.style.cursor = 'grab';
    }

    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    canvas.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);

    return {
      update: function () {
        if (!isDragging) {
          targetObj.rotation.y += autoRotateSpeed;
          velX *= 0.92;
          velY *= 0.92;
          targetObj.rotation.y += velX;
          targetObj.rotation.x += velY;
        }
      }
    };
  }

  // ==============================================================
  // CREATURE 1: LOBSTRAWBERRY
  // A crimson lobster body fused with strawberry-seeded surface
  // ==============================================================
  var lobCanvas = document.getElementById('canvas-lobstrawberry');
  if (lobCanvas) {
    (function () {
      var scene = makeScene(0x1a3c34);
      var cam = makeCamera(1);
      var renderer = makeRenderer(lobCanvas);
      sizeRenderer(renderer, lobCanvas);

      var group = new THREE.Group();
      scene.add(group);

      // Body: flattened sphere (main carapace)
      var bodyGeo = new THREE.SphereGeometry(1.1, 32, 24);
      var bodyMat = new THREE.MeshStandardMaterial({
        color: 0xc0392b,
        roughness: 0.35,
        metalness: 0.15,
        wireframe: false
      });
      // Squash like a lobster body
      bodyGeo.scale(1, 0.6, 1.5);
      var body = new THREE.Mesh(bodyGeo, bodyMat);
      group.add(body);

      // Strawberry seeds: small yellow ellipsoids on surface
      var seedMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.8 });
      var seedGeo = new THREE.SphereGeometry(0.06, 8, 6);
      for (var s = 0; s < 40; s++) {
        var theta = Math.random() * Math.PI * 2;
        var phi = Math.random() * Math.PI;
        var seed = new THREE.Mesh(seedGeo, seedMat);
        seed.position.set(
          1.12 * Math.sin(phi) * Math.cos(theta),
          0.62 * Math.cos(phi),
          1.54 * Math.sin(phi) * Math.sin(theta)
        );
        group.add(seed);
      }

      // Claws: two spheres on the sides
      var clawMat = new THREE.MeshStandardMaterial({ color: 0xe74c3c, roughness: 0.4, metalness: 0.1 });

      function makeClaw(side) {
        var clawGroup = new THREE.Group();
        // Upper arm
        var armGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.7, 12);
        var arm = new THREE.Mesh(armGeo, clawMat);
        arm.rotation.z = side * 1.1;
        arm.position.set(side * 0.8, -0.1, 0.2);
        clawGroup.add(arm);
        // Pincer
        var pinGeo = new THREE.SphereGeometry(0.35, 16, 12);
        pinGeo.scale(1.2, 0.7, 0.9);
        var pin = new THREE.Mesh(pinGeo, clawMat);
        pin.position.set(side * 1.4, -0.3, 0.3);
        clawGroup.add(pin);
        return clawGroup;
      }

      group.add(makeClaw(1));
      group.add(makeClaw(-1));

      // Tail: tapered segments
      var tailMat = new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.5 });
      for (var t = 0; t < 5; t++) {
        var segGeo = new THREE.CylinderGeometry(0.32 - t * 0.05, 0.38 - t * 0.05, 0.28, 10);
        segGeo.scale(1, 0.4, 1);
        var seg = new THREE.Mesh(segGeo, tailMat);
        seg.position.set(0, -0.05, -1.6 - t * 0.28);
        group.add(seg);
      }

      // Antennae
      var antMat = new THREE.LineBasicMaterial({ color: 0xf59e0b });
      function makeAntenna(side) {
        var points = [];
        for (var i = 0; i < 10; i++) {
          points.push(new THREE.Vector3(
            side * (0.3 + i * 0.25),
            0.5 + i * 0.25,
            1.0 - i * 0.15
          ));
        }
        var antGeo = new THREE.BufferGeometry().setFromPoints(points);
        return new THREE.Line(antGeo, antMat);
      }
      group.add(makeAntenna(1));
      group.add(makeAntenna(-1));

      var ctrl = addDragRotate(lobCanvas, group);

      function animate() {
        requestAnimationFrame(animate);
        ctrl.update();
        if (sizeRenderer(renderer, lobCanvas)) {
          cam.aspect = lobCanvas.clientWidth / lobCanvas.clientHeight;
          cam.updateProjectionMatrix();
        }
        renderer.render(scene, cam);
      }
      animate();
    })();
  }

  // ==============================================================
  // CREATURE 2: TUNANA
  // A sleek golden fish with banana-curve body
  // ==============================================================
  var tunCanvas = document.getElementById('canvas-tunana');
  if (tunCanvas) {
    (function () {
      var scene = makeScene(0x1a3c34);
      var cam = makeCamera(1);
      var renderer = makeRenderer(tunCanvas);
      sizeRenderer(renderer, tunCanvas);

      var group = new THREE.Group();
      scene.add(group);

      // Fish body: elongated, banana-curved
      var bodyMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.3,
        metalness: 0.25,
      });

      // Build a curved banana-fish shape via a lathe + bend effect using a custom tube path
      var curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, -1.8),
        new THREE.Vector3(0.1, 0.15, -0.9),
        new THREE.Vector3(0.3, 0.3, 0),
        new THREE.Vector3(0.25, 0.15, 0.9),
        new THREE.Vector3(0, -0.05, 1.8)
      ]);

      var tubeGeo = new THREE.TubeGeometry(curve, 40, 0.45, 16, false);
      // Flatten into fish cross-section
      var posAttr = tubeGeo.attributes.position;
      for (var v = 0; v < posAttr.count; v++) {
        var py = posAttr.getY(v);
        posAttr.setY(v, py * 0.5);
      }
      posAttr.needsUpdate = true;
      tubeGeo.computeVertexNormals();

      var fishBody = new THREE.Mesh(tubeGeo, bodyMat);
      group.add(fishBody);

      // Tail fin
      var tailMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5, side: THREE.DoubleSide });
      var tailGeo = new THREE.PlaneGeometry(1.0, 0.7);
      var tail = new THREE.Mesh(tailGeo, tailMat);
      tail.position.set(0, 0, 1.9);
      tail.rotation.y = Math.PI / 2;
      group.add(tail);

      // Dorsal fin
      var dorsalPoints = [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0.6, 0.5),
        new THREE.Vector2(1.0, 0.3),
        new THREE.Vector2(1.2, 0),
      ];
      var dorsalShape = new THREE.Shape(dorsalPoints);
      var dorsalGeo = new THREE.ShapeGeometry(dorsalShape);
      var dorsal = new THREE.Mesh(dorsalGeo, tailMat);
      dorsal.position.set(0.28, 0.22, -0.2);
      dorsal.rotation.y = Math.PI / 2;
      group.add(dorsal);

      // Scales: small metallic spots
      var scaleMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.2, metalness: 0.6 });
      var scaleGeo = new THREE.CircleGeometry(0.05, 6);
      for (var sc = 0; sc < 50; sc++) {
        var scale = new THREE.Mesh(scaleGeo, scaleMat);
        scale.position.set(
          (Math.random() - 0.5) * 0.8,
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 3.0
        );
        scale.rotation.y = Math.PI / 2;
        group.add(scale);
      }

      // Eye
      var eyeGeo = new THREE.SphereGeometry(0.08, 10, 10);
      var eyeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.9 });
      var eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(0.44, 0.08, -1.4);
      group.add(eye);

      var ctrl = addDragRotate(tunCanvas, group);

      var clock = new THREE.Clock();
      function animate() {
        requestAnimationFrame(animate);
        ctrl.update();
        // Gentle undulation
        group.rotation.z = Math.sin(clock.getElapsedTime() * 0.8) * 0.06;

        if (sizeRenderer(renderer, tunCanvas)) {
          cam.aspect = tunCanvas.clientWidth / tunCanvas.clientHeight;
          cam.updateProjectionMatrix();
        }
        renderer.render(scene, cam);
      }
      animate();
    })();
  }

  // ==============================================================
  // CREATURE 3: SALMBERRY (Salmon + Raspberry)
  // A round rosy fish with raspberry-like surface texture
  // ==============================================================
  var salCanvas = document.getElementById('canvas-salmonberry');
  if (salCanvas) {
    (function () {
      var scene = makeScene(0x1a3c34);
      var cam = makeCamera(1);
      var renderer = makeRenderer(salCanvas);
      sizeRenderer(renderer, salCanvas);

      var group = new THREE.Group();
      scene.add(group);

      // Body: plump rounded fish
      var bodyMat = new THREE.MeshStandardMaterial({
        color: 0xe07070,
        roughness: 0.5,
        metalness: 0.1
      });
      var bodyGeo = new THREE.SphereGeometry(1.0, 32, 24);
      bodyGeo.scale(1.4, 0.85, 1.0);
      var salmBody = new THREE.Mesh(bodyGeo, bodyMat);
      group.add(salmBody);

      // Raspberry drupelets: bumps on surface
      var drupMat = new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.7 });
      var drupGeo = new THREE.SphereGeometry(0.1, 8, 6);
      for (var d = 0; d < 55; d++) {
        var phi2 = Math.random() * Math.PI;
        var theta2 = Math.random() * Math.PI * 2;
        var drup = new THREE.Mesh(drupGeo, drupMat);
        var r = 1.0;
        drup.position.set(
          1.42 * r * Math.sin(phi2) * Math.cos(theta2),
          0.87 * r * Math.cos(phi2),
          r * Math.sin(phi2) * Math.sin(theta2)
        );
        group.add(drup);
      }

      // Tail
      var salTailMat = new THREE.MeshStandardMaterial({ color: 0xd45f5f, roughness: 0.5, side: THREE.DoubleSide });
      var salTailGeo = new THREE.PlaneGeometry(1.1, 0.75);
      var salTail = new THREE.Mesh(salTailGeo, salTailMat);
      salTail.position.set(0, 0, -1.15);
      salTail.rotation.y = Math.PI / 2;
      group.add(salTail);

      // Pectoral fins
      var finMat = new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.6, side: THREE.DoubleSide });
      var finGeo = new THREE.PlaneGeometry(0.6, 0.4);

      var finL = new THREE.Mesh(finGeo, finMat);
      finL.position.set(1.4, -0.3, 0.2);
      finL.rotation.z = 0.4;
      group.add(finL);

      var finR = new THREE.Mesh(finGeo, finMat);
      finR.position.set(-1.4, -0.3, 0.2);
      finR.rotation.z = -0.4;
      group.add(finR);

      // Dorsal
      var salDorsalGeo = new THREE.ConeGeometry(0.25, 0.55, 6);
      var salDorsal = new THREE.Mesh(salDorsalGeo, salTailMat);
      salDorsal.position.set(0, 0.9, 0.3);
      group.add(salDorsal);

      // Eye
      var salEyeGeo = new THREE.SphereGeometry(0.09, 10, 10);
      var salEyeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.05, metalness: 1.0 });
      var salEyeL = new THREE.Mesh(salEyeGeo, salEyeMat);
      salEyeL.position.set(1.28, 0.25, 0.6);
      group.add(salEyeL);

      var ctrl = addDragRotate(salCanvas, group);

      var clock2 = new THREE.Clock();
      function animate() {
        requestAnimationFrame(animate);
        ctrl.update();
        group.rotation.z = Math.sin(clock2.getElapsedTime() * 0.6) * 0.04;

        if (sizeRenderer(renderer, salCanvas)) {
          cam.aspect = salCanvas.clientWidth / salCanvas.clientHeight;
          cam.updateProjectionMatrix();
        }
        renderer.render(scene, cam);
      }
      animate();
    })();
  }

  // ==============================================================
  // HERO CANVAS: Particle field — floating sea-fruit particles
  // ==============================================================
  var heroCanvas = document.getElementById('hero-canvas');
  if (heroCanvas) {
    (function () {
      var scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf7f3ec);

      var cam = new THREE.PerspectiveCamera(60, 1, 0.1, 200);
      cam.position.z = 30;

      var renderer = new THREE.WebGLRenderer({ canvas: heroCanvas, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Particle system: mix of two colours (green & amber) 
      var particleCount = 600;
      var positions = new Float32Array(particleCount * 3);
      var colors = new Float32Array(particleCount * 3);
      var colGreen = new THREE.Color(0x1a3c34);
      var colAmber = new THREE.Color(0xb45309);
      var colCream = new THREE.Color(0xede7d9);

      for (var p = 0; p < particleCount; p++) {
        positions[p * 3] = (Math.random() - 0.5) * 80;
        positions[p * 3 + 1] = (Math.random() - 0.5) * 60;
        positions[p * 3 + 2] = (Math.random() - 0.5) * 40;

        var pick = Math.random();
        var c = pick < 0.33 ? colGreen : (pick < 0.66 ? colAmber : colCream);
        colors[p * 3] = c.r;
        colors[p * 3 + 1] = c.g;
        colors[p * 3 + 2] = c.b;
      }

      var pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      var pMat = new THREE.PointsMaterial({
        size: 0.22,
        vertexColors: true,
        transparent: true,
        opacity: 0.55,
        sizeAttenuation: true
      });

      var particles = new THREE.Points(pGeo, pMat);
      scene.add(particles);

      // Large ambient spheres for atmosphere
      var spheres = [];
      var sphereData = [
        { color: 0xc0392b, size: 3.5, x: -15, y: 8, z: -10 },
        { color: 0xf59e0b, size: 2.8, x: 12, y: -5, z: -8 },
        { color: 0x1a3c34, size: 4.2, x: 5, y: 12, z: -15 },
        { color: 0xe07070, size: 2.0, x: -8, y: -10, z: -5 }
      ];

      sphereData.forEach(function (d) {
        var geo = new THREE.SphereGeometry(d.size, 32, 24);
        var mat = new THREE.MeshStandardMaterial({
          color: d.color,
          roughness: 0.5,
          metalness: 0.15,
          transparent: true,
          opacity: 0.12
        });
        var amb = new THREE.AmbientLight(0xfff5e0, 1.0);
        scene.add(amb);
        var mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(d.x, d.y, d.z);
        spheres.push({ mesh: mesh, speed: 0.0003 + Math.random() * 0.0005, offset: Math.random() * Math.PI * 2 });
        scene.add(mesh);
      });

      var heroMouse = { x: 0, y: 0 };
      document.addEventListener('mousemove', function (e) {
        heroMouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
        heroMouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });

      var heroClock = new THREE.Clock();

      function animateHero() {
        requestAnimationFrame(animateHero);
        var t = heroClock.getElapsedTime();

        // Gentle float
        particles.rotation.y = t * 0.02;
        particles.rotation.x = t * 0.01;

        // Mouse parallax
        cam.position.x += (heroMouse.x * 3 - cam.position.x) * 0.02;
        cam.position.y += (heroMouse.y * 2 - cam.position.y) * 0.02;
        cam.lookAt(scene.position);

        // Animate spheres
        spheres.forEach(function (s) {
          s.mesh.position.y += Math.sin(t * s.speed * 1000 + s.offset) * 0.004;
          s.mesh.rotation.y += 0.002;
        });

        // Resize
        var w = heroCanvas.clientWidth;
        var h = heroCanvas.clientHeight;
        if (heroCanvas.width !== w || heroCanvas.height !== h) {
          renderer.setSize(w, h, false);
          cam.aspect = w / h;
          cam.updateProjectionMatrix();
        }

        renderer.render(scene, cam);
      }
      animateHero();
    })();
  }

  // ==============================================================
  // PHILOSOPHY CANVAS: Floating DNA-helix of fruit/sea symbols
  // ==============================================================
  var philCanvas = document.getElementById('philosophy-canvas');
  if (philCanvas) {
    (function () {
      var scene = makeScene(0xede7d9);
      var cam = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
      cam.position.set(0, 0, 8);
      var renderer = makeRenderer(philCanvas);
      sizeRenderer(renderer, philCanvas);

      var group = new THREE.Group();
      scene.add(group);

      // Helix of alternating green/amber spheres
      var greenMat = new THREE.MeshStandardMaterial({ color: 0x1a3c34, roughness: 0.4, metalness: 0.2 });
      var amberMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.4, metalness: 0.2 });
      var geo = new THREE.SphereGeometry(0.18, 12, 10);

      for (var h = 0; h < 28; h++) {
        var angle = (h / 28) * Math.PI * 4;
        var y = (h / 28) * 7 - 3.5;
        var r = 1.5;

        var sA = new THREE.Mesh(geo, h % 2 === 0 ? greenMat : amberMat);
        sA.position.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
        group.add(sA);

        var sB = new THREE.Mesh(geo, h % 2 === 0 ? amberMat : greenMat);
        sB.position.set(Math.cos(angle + Math.PI) * r, y, Math.sin(angle + Math.PI) * r);
        group.add(sB);

        // Connecting bar
        var barGeo = new THREE.CylinderGeometry(0.03, 0.03, r * 2, 6);
        var barMat = new THREE.MeshStandardMaterial({ color: 0xc0c0a0, roughness: 0.8, transparent: true, opacity: 0.4 });
        var bar = new THREE.Mesh(barGeo, barMat);
        bar.position.set(0, y, 0);
        bar.rotation.z = Math.PI / 2;
        bar.rotation.y = angle;
        group.add(bar);
      }

      var philClock = new THREE.Clock();

      function animatePhil() {
        requestAnimationFrame(animatePhil);
        var t = philClock.getElapsedTime();
        group.rotation.y = t * 0.4;
        group.rotation.x = Math.sin(t * 0.25) * 0.2;

        if (sizeRenderer(renderer, philCanvas)) {
          cam.aspect = philCanvas.clientWidth / philCanvas.clientHeight;
          cam.updateProjectionMatrix();
        }
        renderer.render(scene, cam);
      }
      animatePhil();
    })();
  }

  // ==============================================================
  // MENU PAGE HERO CANVAS: Swirling ribbon of particles
  // ==============================================================
  var menuHeroCanvas = document.getElementById('menu-hero-canvas');
  if (menuHeroCanvas) {
    (function () {
      var scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf0ebe1);
      var cam = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
      cam.position.set(0, 0, 20);
      var renderer = new THREE.WebGLRenderer({ canvas: menuHeroCanvas, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      var ambient = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambient);

      // Ribbon: torus-knot evoking twisted seafood + vine
      var tkGeo = new THREE.TorusKnotGeometry(5, 0.7, 160, 20, 2, 3);
      var tkMat = new THREE.MeshStandardMaterial({
        color: 0x1a3c34,
        roughness: 0.4,
        metalness: 0.3,
        wireframe: false
      });
      var tk = new THREE.Mesh(tkGeo, tkMat);
      scene.add(tk);

      var tkGeo2 = new THREE.TorusKnotGeometry(5.4, 0.3, 160, 12, 3, 5);
      var tkMat2 = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.5, metalness: 0.1, transparent: true, opacity: 0.6 });
      var tk2 = new THREE.Mesh(tkGeo2, tkMat2);
      scene.add(tk2);

      var dirLight = new THREE.DirectionalLight(0xfff0cc, 1.2);
      dirLight.position.set(5, 8, 5);
      scene.add(dirLight);

      var mkClock = new THREE.Clock();
      function animateMK() {
        requestAnimationFrame(animateMK);
        var t = mkClock.getElapsedTime();
        tk.rotation.x = t * 0.15;
        tk.rotation.y = t * 0.22;
        tk2.rotation.x = -t * 0.12;
        tk2.rotation.y = t * 0.18;

        var w = menuHeroCanvas.clientWidth;
        var h = menuHeroCanvas.clientHeight;
        if (menuHeroCanvas.width !== w || menuHeroCanvas.height !== h) {
          renderer.setSize(w, h, false);
          cam.aspect = w / h;
          cam.updateProjectionMatrix();
        }
        renderer.render(scene, cam);
      }
      animateMK();
    })();
  }

  // ==============================================================
  // VISIT PAGE HERO CANVAS: Calm ocean surface simulation
  // ==============================================================
  var visitHeroCanvas = document.getElementById('visit-hero-canvas');
  if (visitHeroCanvas) {
    (function () {
      var scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf0ebe1);
      var cam = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
      cam.position.set(0, 8, 18);
      cam.lookAt(0, 0, 0);
      var renderer = new THREE.WebGLRenderer({ canvas: visitHeroCanvas, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      var ambient = new THREE.AmbientLight(0xfff0cc, 0.7);
      scene.add(ambient);
      var dirLight = new THREE.DirectionalLight(0xfff5e0, 1.0);
      dirLight.position.set(5, 10, 5);
      scene.add(dirLight);

      // Water plane
      var waterGeo = new THREE.PlaneGeometry(30, 30, 60, 60);
      var waterMat = new THREE.MeshStandardMaterial({
        color: 0x1a3c34,
        roughness: 0.1,
        metalness: 0.4,
        transparent: true,
        opacity: 0.85,
        wireframe: false
      });
      var water = new THREE.Mesh(waterGeo, waterMat);
      water.rotation.x = -Math.PI / 2;
      scene.add(water);

      // Floating amber orbs = fruits on the sea
      var orbMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.3, metalness: 0.3 });
      var orbs = [];
      for (var ob = 0; ob < 12; ob++) {
        var orbGeo = new THREE.SphereGeometry(0.25 + Math.random() * 0.4, 16, 12);
        var orb = new THREE.Mesh(orbGeo, orbMat);
        orb.position.set(
          (Math.random() - 0.5) * 24,
          0.3,
          (Math.random() - 0.5) * 24
        );
        orbs.push({ mesh: orb, phase: Math.random() * Math.PI * 2, speed: 0.5 + Math.random() * 0.5 });
        scene.add(orb);
      }

      var visitClock = new THREE.Clock();

      function animateVisit() {
        requestAnimationFrame(animateVisit);
        var t = visitClock.getElapsedTime();

        // Wave the water geometry vertices
        var posAttr = waterGeo.attributes.position;
        for (var i = 0; i < posAttr.count; i++) {
          var wx = posAttr.getX(i);
          var wy = posAttr.getY(i);
          posAttr.setZ(i, Math.sin(wx * 0.5 + t) * 0.4 + Math.cos(wy * 0.4 + t * 0.8) * 0.3);
        }
        posAttr.needsUpdate = true;
        waterGeo.computeVertexNormals();

        // Bob the orbs
        orbs.forEach(function (o) {
          o.mesh.position.y = 0.4 + Math.sin(t * o.speed + o.phase) * 0.3;
        });

        var w = visitHeroCanvas.clientWidth;
        var h = visitHeroCanvas.clientHeight;
        if (visitHeroCanvas.width !== w || visitHeroCanvas.height !== h) {
          renderer.setSize(w, h, false);
          cam.aspect = w / h;
          cam.updateProjectionMatrix();
        }
        renderer.render(scene, cam);
      }
      animateVisit();
    })();
  }

  // ==============================================================
  // RESERVATION FORM: Basic validation & submit feedback
  // ==============================================================
  var resForm = document.querySelector('.reservation-form');
  if (resForm) {
    resForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = resForm.querySelector('#res-name').value.trim();
      var email = resForm.querySelector('#res-email').value.trim();
      var date = resForm.querySelector('#res-date').value;
      var time = resForm.querySelector('#res-time').value;
      var guests = resForm.querySelector('#res-guests').value;

      if (!name || !email || !date || !time || !guests) {
        showFormMessage('Please fill in all required fields.', 'error');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFormMessage('Please enter a valid email address.', 'error');
        return;
      }

      showFormMessage('Thank you, ' + name + '! We will confirm your reservation at ' + email + ' within 24 hours.', 'success');
      resForm.reset();
    });

    function showFormMessage(msg, type) {
      var existing = document.querySelector('.form-message');
      if (existing) existing.remove();

      var el = document.createElement('p');
      el.className = 'form-message form-message--' + type;
      el.textContent = msg;
      el.style.cssText = 'margin-top:1rem;padding:1em 1.5em;border-radius:4px;font-size:0.9rem;font-weight:500;' +
        (type === 'success'
          ? 'background:rgba(180,83,9,0.15);color:#b45309;border:1px solid rgba(180,83,9,0.3);'
          : 'background:rgba(220,38,38,0.1);color:#ef4444;border:1px solid rgba(220,38,38,0.2);');
      resForm.appendChild(el);

      setTimeout(function () { el.remove(); }, 6000);
    }
  }

}); // end DOMContentLoaded