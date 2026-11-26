const visual = document.querySelector(".visual-art");
const canvas = document.querySelector(".signal-canvas");

if (visual instanceof HTMLElement && canvas instanceof HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (context) {
    let width = 0;
    let height = 0;
    let frame = 0;
    let elapsed = 0;
    let pointerX = 0.58;
    let pointerY = 0.5;
    let pointerActive = false;
    let visible = false;

    const resizeCanvas = () => {
      const bounds = visual.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      drawSignal();
    };

    const drawSignal = () => {
      context.clearRect(0, 0, width, height);

      const centerY = height * 0.7;
      const amplitude = height * (pointerActive ? 0.07 : 0.045);
      const speed = motionPreference.matches ? 0 : elapsed;

      context.lineWidth = 1;
      context.strokeStyle = "rgba(217, 255, 101, 0.2)";
      context.beginPath();
      for (let x = 0; x <= width; x += 3) {
        const progress = x / width;
        const envelope = Math.sin(progress * Math.PI);
        const wave =
          Math.sin(progress * 21 - speed * 1.1) * 0.6 +
          Math.sin(progress * 43 - speed * 0.7) * 0.2 +
          Math.sin(progress * 8 + speed * 0.35) * 0.2;
        const y = centerY + wave * amplitude * envelope;
        if (x === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();

      const sweepX = ((speed * 22) % (width + 1));
      const gradient = context.createLinearGradient(sweepX - 40, 0, sweepX + 40, 0);
      gradient.addColorStop(0, "rgba(217, 255, 101, 0)");
      gradient.addColorStop(0.5, "rgba(217, 255, 101, 0.8)");
      gradient.addColorStop(1, "rgba(217, 255, 101, 0)");
      context.fillStyle = gradient;
      context.fillRect(sweepX - 40, height * 0.18, 80, height * 0.64);

      if (pointerActive) {
        const x = pointerX * width;
        const y = pointerY * height;
        const glow = context.createRadialGradient(x, y, 0, x, y, 86);
        glow.addColorStop(0, "rgba(217, 255, 101, 0.16)");
        glow.addColorStop(1, "rgba(217, 255, 101, 0)");
        context.fillStyle = glow;
        context.fillRect(x - 86, y - 86, 172, 172);
        context.beginPath();
        context.arc(x, y, 3, 0, Math.PI * 2);
        context.fillStyle = "#d9ff65";
        context.fill();
      }
    };

    const animate = (timestamp) => {
      if (!visible || document.hidden || motionPreference.matches) {
        frame = 0;
        drawSignal();
        return;
      }

      elapsed = timestamp / 1000;
      drawSignal();
      frame = window.requestAnimationFrame(animate);
    };

    const startAnimation = () => {
      if (visible && !document.hidden && !motionPreference.matches && frame === 0) {
        frame = window.requestAnimationFrame(animate);
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) startAnimation();
      else if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    });

    visual.addEventListener("pointermove", (event) => {
      const bounds = visual.getBoundingClientRect();
      pointerX = (event.clientX - bounds.left) / bounds.width;
      pointerY = (event.clientY - bounds.top) / bounds.height;
      pointerActive = true;
      if (!frame) drawSignal();
    });

    visual.addEventListener("pointerleave", () => {
      pointerActive = false;
      if (!frame) drawSignal();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden && frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      } else {
        startAnimation();
      }
    });

    motionPreference.addEventListener("change", () => {
      if (motionPreference.matches && frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      } else {
        startAnimation();
      }
      drawSignal();
    });
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    observer.observe(visual);
  }
}
