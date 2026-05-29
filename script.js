    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const overDiv = document.getElementById('gameOver');
    const finalScore = document.getElementById('finalScore');
    const warningDiv = document.getElementById('warning');
    const instruccionesDiv = document.getElementById('instrucciones');

    const nave = { x: 230, y: 600, w: 40, h: 40, speed: 10 };
    let enemigos = [];
    let puntos = 0;
    let vidas = 10;  
    let gameOver = false;

    let activarLaterales = false;
    let activarAbajo = false;
    let modoExtremo = false;
    let enPausa = false;
    let juegoActivo = false;

    const keys = {};

    document.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
    document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

    function iniciarJuego() {
      instruccionesDiv.style.display = 'none';
      canvas.style.display = 'block';
      juegoActivo = true;
      loop();
    }

    function crearEnemigoArriba() {
      enemigos.push({
        x: Math.random() * (canvas.width - 40),
        y: -40,
        w: 40,
        h: 40,
        speedY: 5 + Math.random() * (modoExtremo ? 10 : 5),
        speedX: 0
      });
    }

    function crearEnemigoLateral(lado) {
      enemigos.push({
        x: lado === 'left' ? -40 : canvas.width,
        y: Math.random() * (canvas.height - 100),
        w: 40,
        h: 40,
        speedY: 0,
        speedX: (lado === 'left' ? 5 : -5) + Math.random() * (modoExtremo ? 10 : 5)
      });
    }

    function crearEnemigoAbajo() {
      enemigos.push({
        x: Math.random() * (canvas.width - 40),
        y: canvas.height + 40,
        w: 40,
        h: 40,
        speedY: -(5 + Math.random() * (modoExtremo ? 10 : 5)),
        speedX: 0
      });
    }

    function moverNave() {
      if ((keys['arrowleft'] || keys['a']) && nave.x > 0) nave.x -= nave.speed;
      if ((keys['arrowright'] || keys['d']) && nave.x < canvas.width - nave.w) nave.x += nave.speed;
      if ((keys['arrowup'] || keys['w']) && nave.y > 0) nave.y -= nave.speed;
      if ((keys['arrowdown'] || keys['s']) && nave.y < canvas.height - nave.h) nave.y += nave.speed;
    }

    function dibujarNave() {
      ctx.fillStyle = 'cyan';
      ctx.fillRect(nave.x, nave.y, nave.w, nave.h);
    }

    function dibujarEnemigos() {
      ctx.fillStyle = 'red';
      enemigos.forEach(en => {
        ctx.fillRect(en.x, en.y, en.w, en.h);
        en.y += en.speedY;
        en.x += en.speedX;
      });
      enemigos = enemigos.filter(en =>
        en.y < canvas.height + en.h &&
        en.y > -en.h &&
        en.x < canvas.width + en.w &&
        en.x > -en.w
      );
    }

    function detectarColisiones() {
      enemigos.forEach((en, ei) => {
        if (
          nave.x < en.x + en.w &&
          nave.x + nave.w > en.x &&
          nave.y < en.y + en.h &&
          nave.y + nave.h > en.y
        ) {
          enemigos.splice(ei, 1);
          vidas--;
          if (vidas <= 0) {
            gameOver = true;
            finalScore.textContent = puntos;
            overDiv.style.display = 'block';
          }
        }
      });
    }

    function dibujarHUD() {
      ctx.fillStyle = 'white';
      ctx.font = '18px sans-serif';
      ctx.fillText(`Puntos: ${puntos}`, 10, 25);
      ctx.fillText(`Vidas: ${vidas}`, 400, 25);
    }

    function mostrarWarning(texto, callback) {
      enPausa = true;
      warningDiv.textContent = texto;
      warningDiv.style.display = 'block';
      setTimeout(() => {
        warningDiv.style.display = 'none';
        enPausa = false;
        if (callback) callback();
      }, 1500);
    }

    function loop() {
      if (gameOver || !juegoActivo) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      moverNave();
      dibujarNave();
      dibujarEnemigos();
      detectarColisiones();
      dibujarHUD();

      if (!enPausa) {
        puntos++;

        if (puntos >= 2000 && !activarLaterales) {
          mostrarWarning("⚠️ ¡Cuidado a los lados!", () => activarLaterales = true);
        }
        if (puntos >= 3000 && !activarAbajo) {
          mostrarWarning("⚠️ ¡Cuidado abajo!", () => activarAbajo = true);
        }
        if (puntos >= 5000 && !modoExtremo) {
          mostrarWarning("🔥 ¡Modo Extremo!", () => modoExtremo = true);
        }

        const freqBase = modoExtremo ? 0.08 : (puntos >= 2000 ? 0.02 : 0.03);
        if (Math.random() < freqBase) crearEnemigoArriba();

        if (activarLaterales) {
          const freqLateral = modoExtremo ? 0.05 : 0.015;
          if (Math.random() < freqLateral) crearEnemigoLateral('left');
          if (Math.random() < freqLateral) crearEnemigoLateral('right');
        }

        if (activarAbajo) {
          const freqAbajo = modoExtremo ? 0.04 : 0.008;
          if (Math.random() < freqAbajo) crearEnemigoAbajo();
        }
      }

      requestAnimationFrame(loop);
    }