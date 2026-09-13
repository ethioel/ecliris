# Save this file as generate_enhanced_playground.py
# Run it with: python generate_enhanced_playground.py

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ecliris - Enhanced Verification</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      background: radial-gradient(ellipse at center, #1a0a2e 0%, #000 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #fff;
      padding: 20px;
    }
    h1 {
      font-weight: 200;
      letter-spacing: 6px;
      margin-bottom: 8px;
      font-size: 2.5rem;
    }
    .tagline {
      opacity: 0.6;
      margin-bottom: 40px;
      font-size: 14px;
      letter-spacing: 2px;
    }
    .ecliris-card {
      background: rgba(10, 10, 15, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 24px;
      backdrop-filter: blur(20px);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      width: 100%;
      max-width: 600px;
      transition: all 0.3s;
    }
    .ecliris-card.error {
      animation: shake 0.5s;
      border-color: rgba(255, 68, 102, 0.5);
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-10px); }
      75% { transform: translateX(10px); }
    }
    .ecliris-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .ecliris-title {
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 1px;
      opacity: 0.85;
      text-transform: uppercase;
    }
    .ecliris-viewport {
      width: 100%;
      height: 400px;
      background: radial-gradient(ellipse at center, #0a0a1e 0%, #000 100%);
      border-radius: 8px;
      overflow: hidden;
      position: relative;
      margin-bottom: 16px;
      cursor: none;
    }
    .ecliris-viewport canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
    .ecliris-instruction {
      font-size: 14px;
      opacity: 0.9;
      text-align: center;
      margin-bottom: 12px;
      min-height: 20px;
      font-weight: 500;
    }
    .ecliris-status {
      font-size: 13px;
      opacity: 0.7;
      text-align: center;
      min-height: 20px;
      transition: all 0.3s;
    }
    .ecliris-status.success { color: #00ffcc; opacity: 1; }
    .ecliris-status.error { color: #ff4466; opacity: 1; }
    .ecliris-status.warning { color: #ffaa00; opacity: 1; }
    .retry-btn {
      display: none;
      margin: 16px auto 0;
      padding: 10px 24px;
      background: linear-gradient(135deg, #6e45e2, #88d3ce);
      color: #fff;
      border: none;
      border-radius: 100px;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
      box-shadow: 0 4px 15px rgba(110, 69, 226, 0.4);
    }
    .retry-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(110, 69, 226, 0.6);
    }
    .retry-btn:active {
      transform: translateY(0);
    }
    .retry-btn.visible {
      display: block;
    }
    #result {
      margin-top: 24px;
      font-size: 13px;
      font-family: 'SF Mono', Monaco, monospace;
      opacity: 0.8;
      min-height: 20px;
      text-align: center;
    }
    .loading {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255,255,255,.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 1s ease-in-out infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <h1>ECLIRIS</h1>
  <p class="tagline">Observe the unseen.</p>
  
  <div class="ecliris-card" id="card">
    <div class="ecliris-header">
      <span class="ecliris-title">Ecliris · Security Verification</span>
    </div>
    <div class="ecliris-viewport" id="viewport">
      <canvas id="canvas"></canvas>
    </div>
    <div class="ecliris-instruction" id="instruction">Initializing...</div>
    <div class="ecliris-status" id="status">Move cursor to reveal the universe...</div>
    <button class="retry-btn" id="retryBtn">Try Again</button>
  </div>
  
  <div id="result"></div>

  <script>
    // ============================================
    // ECLIRIS ENHANCED ENGINE
    // ============================================
    
    const GRAVITY_RADIUS = 200;
    const EVENT_HORIZON = 15;
    
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const viewport = document.getElementById('viewport');
    const status = document.getElementById('status');
    const instruction = document.getElementById('instruction');
    const result = document.getElementById('result');
    const card = document.getElementById('card');
    const retryBtn = document.getElementById('retryBtn');

    let particles = [];
    let targets = [];
    let mouse = { x: 0, y: 0, active: false };
    let pathData = [];
    let consumedCount = 0;
    let targetInstruction = '';
    let requiredTargets = [];
    let gameState = 'initializing'; // initializing, playing, verifying, success, error

    // Target types with different properties
    const TARGET_TYPES = [
      { name: 'blue', color: 'rgba(100, 200, 255, 1)', glow: 'rgba(100, 200, 255, 0.6)' },
      { name: 'purple', color: 'rgba(180, 100, 255, 1)', glow: 'rgba(180, 100, 255, 0.6)' },
      { name: 'green', color: 'rgba(100, 255, 180, 1)', glow: 'rgba(100, 255, 180, 0.6)' },
      { name: 'orange', color: 'rgba(255, 180, 100, 1)', glow: 'rgba(255, 180, 100, 0.6)' },
      { name: 'pink', color: 'rgba(255, 100, 180, 1)', glow: 'rgba(255, 100, 180, 0.6)' }
    ];

    const TARGET_SIZES = [
      { name: 'small', radius: 15 },
      { name: 'medium', radius: 25 },
      { name: 'large', radius: 35 }
    ];

    // Initialize canvas size
    function resize() {
      const rect = viewport.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
    resize();
    window.addEventListener('resize', resize);

    // Generate random challenge
    function generateChallenge() {
      const numTargets = Math.floor(Math.random() * 3) + 3; // 3-5 targets
      const targetType = TARGET_TYPES[Math.floor(Math.random() * TARGET_TYPES.length)];
      
      // Create targets with random properties
      targets = [];
      for (let i = 0; i < numTargets; i++) {
        const type = Math.random() > 0.4 ? targetType : TARGET_TYPES[Math.floor(Math.random() * TARGET_TYPES.length)];
        const size = TARGET_SIZES[Math.floor(Math.random() * TARGET_SIZES.length)];
        
        targets.push({
          x: Math.random() * (canvas.width - 100) + 50,
          y: Math.random() * (canvas.height - 100) + 50,
          consumed: false,
          radius: size.radius,
          type: type,
          size: size.name
        });
      }

      // Generate instruction
      const instructionType = Math.random();
      if (instructionType < 0.5) {
        // Consume all of a specific color
        requiredTargets = targets.filter(t => t.type.name === targetType.name);
        targetInstruction = `Consume all ${targetType.name} stars`;
      } else {
        // Consume all of a specific size
        const targetSize = TARGET_SIZES[Math.floor(Math.random() * TARGET_SIZES.length)];
        requiredTargets = targets.filter(t => t.size === targetSize.name);
        targetInstruction = `Consume all ${targetSize.name} stars`;
      }

      instruction.textContent = targetInstruction;
      consumedCount = 0;
      status.textContent = `${consumedCount} / ${requiredTargets.length}`;
      status.className = 'ecliris-status';
    }

    // Initialize universe
    function initUniverse() {
      particles = [];
      for (let i = 0; i < 600; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: 0, vy: 0,
          size: Math.random() * 1.5 + 0.5,
          alpha: Math.random() * 0.6 + 0.2
        });
      }
      
      generateChallenge();
      gameState = 'playing';
    }

    // Mouse events
    viewport.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
      
      pathData.push({ x: mouse.x, y: mouse.y, t: performance.now() });
      if (pathData.length > 500) pathData.shift();
    });

    viewport.addEventListener('mouseleave', () => {
      mouse.active = false;
    });

    // Animation loop
    function animate() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update particles
      particles.forEach((p) => {
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.hypot(dx, dy);

          if (dist < GRAVITY_RADIUS && dist > EVENT_HORIZON) {
            const force = (GRAVITY_RADIUS - dist) / GRAVITY_RADIUS;
            p.vx += (dx / dist) * force * 0.5;
            p.vy += (dy / dist) * force * 0.5;
          }

          if (dist < EVENT_HORIZON * 2.5) {
            p.size = Math.min(p.size * 1.03, 4);
          }

          if (dist < EVENT_HORIZON) {
            p.x = Math.random() * canvas.width;
            p.y = Math.random() * canvas.height;
            p.vx = 0; p.vy = 0;
            p.size = Math.random() * 1.5 + 0.5;
          }
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;

        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update targets
      targets.forEach((t) => {
        if (t.consumed) return;
        
        if (mouse.active) {
          const dist = Math.hypot(mouse.x - t.x, mouse.y - t.y);
          if (dist < EVENT_HORIZON + t.radius) {
            // Check if this is a required target
            if (requiredTargets.includes(t)) {
              t.consumed = true;
              consumedCount++;
              status.textContent = `${consumedCount} / ${requiredTargets.length}`;
              
              if (consumedCount === requiredTargets.length) {
                gameState = 'verifying';
                verifyHumanity();
              }
            } else {
              // Wrong target - show warning
              status.textContent = `Wrong target! ${consumedCount} / ${requiredTargets.length}`;
              status.className = 'ecliris-status warning';
              setTimeout(() => {
                if (gameState === 'playing') {
                  status.textContent = `${consumedCount} / ${requiredTargets.length}`;
                  status.className = 'ecliris-status';
                }
              }, 1000);
            }
          }
        }

        // Draw target with its specific color
        const gradient = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, t.radius);
        gradient.addColorStop(0, t.type.color);
        gradient.addColorStop(0.5, t.type.glow);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw singularity (black hole cursor)
      if (mouse.active) {
        ctx.strokeStyle = 'rgba(255, 150, 50, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, EVENT_HORIZON + 8, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, EVENT_HORIZON + 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, EVENT_HORIZON, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(animate);
    }
    animate();

    // ============================================
    // ENHANCED BEHAVIORAL ANALYSIS
    // ============================================

    function calculateAngularMomentum(path) {
      if (path.length < 3) return 0;
      let momentum = 0;
      for (let i = 2; i < path.length; i++) {
        const v1x = path[i-1].x - path[i-2].x;
        const v1y = path[i-1].y - path[i-2].y;
        const v2x = path[i].x - path[i-1].x;
        const v2y = path[i].y - path[i-1].y;
        momentum += Math.abs(v1x * v2y - v1y * v2x);
      }
      return momentum / path.length;
    }

    function calculateVelocityVariance(path) {
      if (path.length < 2) return 0;
      const velocities = [];
      for (let i = 1; i < path.length; i++) {
        const dt = path[i].t - path[i-1].t;
        if (dt > 0) {
          velocities.push(Math.hypot(path[i].x - path[i-1].x, path[i].y - path[i-1].y) / dt);
        }
      }
      if (velocities.length === 0) return 0;
      const avg = velocities.reduce((a, b) => a + b, 0) / velocities.length;
      return velocities.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / velocities.length;
    }

    function calculateMicroMovements(path) {
      // Humans have tiny tremors, bots are too smooth
      if (path.length < 10) return 0;
      let microMovements = 0;
      for (let i = 1; i < path.length; i++) {
        const dist = Math.hypot(path[i].x - path[i-1].x, path[i].y - path[i-1].y);
        if (dist > 0 && dist < 2) microMovements++;
      }
      return microMovements / path.length;
    }

    function calculatePathComplexity(path) {
      // Measure how "curvy" the path is
      if (path.length < 3) return 0;
      let complexity = 0;
      for (let i = 2; i < path.length; i++) {
        const angle1 = Math.atan2(path[i-1].y - path[i-2].y, path[i-1].x - path[i-2].x);
        const angle2 = Math.atan2(path[i].y - path[i-1].y, path[i].x - path[i-1].x);
        const angleDiff = Math.abs(angle2 - angle1);
        complexity += angleDiff > Math.PI ? 2 * Math.PI - angleDiff : angleDiff;
      }
      return complexity / path.length;
    }

    function calculateAccelerationPatterns(path) {
      // Humans have natural acceleration curves
      if (path.length < 3) return 0;
      const accelerations = [];
      for (let i = 2; i < path.length; i++) {
        const v1 = Math.hypot(path[i-1].x - path[i-2].x, path[i-1].y - path[i-2].y) / (path[i-1].t - path[i-2].t);
        const v2 = Math.hypot(path[i].x - path[i-1].x, path[i].y - path[i-1].y) / (path[i].t - path[i-1].t);
        accelerations.push(Math.abs(v2 - v1));
      }
      if (accelerations.length === 0) return 0;
      return accelerations.reduce((a, b) => a + b, 0) / accelerations.length;
    }

    function calculateHumanityScore(telemetry) {
      const momentum = calculateAngularMomentum(telemetry.path);
      const variance = calculateVelocityVariance(telemetry.path);
      const microMovements = calculateMicroMovements(telemetry.path);
      const complexity = calculatePathComplexity(telemetry.path);
      const acceleration = calculateAccelerationPatterns(telemetry.path);

      // Weighted scoring system
      let score = 0;
      
      // Angular momentum (humans curve naturally)
      if (momentum > 5) score += 25;
      else if (momentum > 2) score += 15;
      
      // Velocity variance (humans accelerate/decelerate)
      if (variance > 0.05) score += 25;
      else if (variance > 0.01) score += 15;
      
      // Micro-movements (humans have tremors)
      if (microMovements > 0.3) score += 20;
      else if (microMovements > 0.1) score += 10;
      
      // Path complexity (humans take curved paths)
      if (complexity > 0.5) score += 20;
      else if (complexity > 0.2) score += 10;
      
      // Acceleration patterns (natural movement)
      if (acceleration > 0.1) score += 10;
      else if (acceleration > 0.05) score += 5;

      return {
        score,
        metrics: { momentum, variance, microMovements, complexity, acceleration }
      };
    }

    // Verify humanity by calling the server
    async function verifyHumanity() {
      status.innerHTML = '<span class="loading"></span> Analyzing movement patterns...';
      status.className = 'ecliris-status';
      
      const telemetry = {
        path: pathData,
        targetsConsumed: consumedCount,
        totalTargets: requiredTargets.length
      };

      const humanityResult = calculateHumanityScore(telemetry);

      try {
        const res = await fetch('http://localhost:3000/v1/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            siteKey: 'test_key_playground',
            telemetry: {
              ...telemetry,
              angularMomentum: humanityResult.metrics.momentum
            }
          })
        });
        
        const data = await res.json();
        
        if (data.success) {
          gameState = 'success';
          status.textContent = '✓ Verification Complete';
          status.className = 'ecliris-status success';
          instruction.textContent = 'You are human!';
          result.textContent = 'Token: ' + data.token.substring(0, 32) + '...';
          result.style.color = '#00ffcc';
          console.log('✅ Success! Score:', humanityResult.score, 'Metrics:', humanityResult.metrics);
        } else {
          throw new Error(data.error || 'Verification failed');
        }
      } catch (err) {
        gameState = 'error';
        card.classList.add('error');
        status.textContent = 'We couldn\'t verify you. Please try again.';
        status.className = 'ecliris-status error';
        instruction.textContent = 'Verification failed';
        retryBtn.classList.add('visible');
        result.textContent = 'Error: ' + err.message;
        result.style.color = '#ff4466';
        console.error('❌ Error:', err, 'Score:', humanityResult.score, 'Metrics:', humanityResult.metrics);
        
        setTimeout(() => {
          card.classList.remove('error');
        }, 500);
      }
    }

    // Retry button
    retryBtn.addEventListener('click', () => {
      retryBtn.classList.remove('visible');
      pathData = [];
      initUniverse();
      result.textContent = '';
    });

    // Initialize
    initUniverse();
  </script>
</body>
</html>
"""

with open('enhanced_playground.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print("✅ enhanced_playground.html created!")
print("\n🎯 New Features:")
print("  • Random number of targets (3-5)")
print("  • Different target types (colors and sizes)")
print("  • Dynamic instructions (e.g., 'Consume all blue stars')")
print("  • Wrong target detection with warnings")
print("  • Enhanced behavioral analysis:")
print("    - Angular momentum")
print("    - Velocity variance")
print("    - Micro-movements (human tremors)")
print("    - Path complexity")
print("    - Acceleration patterns")
print("  • Robust error handling with retry button")
print("  • Visual feedback (shake animation on error)")
print("  • Loading states and progress indicators")
print("\n📂 Open enhanced_playground.html in your browser")
print("🌐 Make sure your server is still running on port 3000")