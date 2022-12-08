    //frames
    const FPS = 60;
    //space honey
    const SPACE = 0.7; // (0 => 1)
    //ship
    const SHIP_LIVES = 3;
    const SHIP_SIZE = 30;
    const SHIP_MOVE = 5;
    const ROT_SPEED = 360;
    //asteroid
    const ASTR_NUM = 3;
    const ASTR_SIZE = 100;
    const ASTR_SPEED = 50;
    const ASTR_VERT = 10;
    const ASTR_ANGLES = 0.3; // (0 => 1)
    //ship dead
    const SHIP_DEAD = 0.3;
    const SHIP_TIME = 3;
    const SHIP_BLINK = 0.3;
    //laser
    const LASER_MAX = 10;
    const LASER_SPEED = 500;
    const LASER_DIST = 0.6;
    const LASER_BOOM = 0.1;
    //text
    const TEXT_TIME = 2.5;
    const TEXT_SIZE = 40;
    //score
    const SCORE_ABIG = 20;
    const SCORE_AMED = 50;
    const SCORE_ASML = 100;
    const SAVE_SCORE = "highscore";
    //debug
    const SHOW_COLISION = false;
    
    let canv = document.getElementById("canvas");
    let ctx = canv.getContext("2d");

    let level, lives, asteroids, ship, score, scoreHigh, text, textAlpha;
    newGame();

    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);

    setInterval(update, 1000 / FPS);


    //game

    function asteroidBelt() { //random Aspawn
      asteroids = [];
      let x,y;
      for (let i = 0; i < ASTR_NUM + level; i++) {
        do{
        x = Math.floor(Math.random() * canv.width);
        y = Math.floor(Math.random() * canv.height);
        } while (distBetweenPoints(ship.x, ship.y, x, y) < ASTR_SIZE * 2 + ship.radius);
        asteroids.push(newAsteroid(x, y, Math.ceil(ASTR_SIZE / 2)));
      }
    }

    function destroyA(index) {
      let x = asteroids[index].x;
      let y = asteroids[index].y;
      let radius = asteroids[index].radius;

      if (radius == Math.ceil(ASTR_SIZE / 2)) { 
          asteroids.push(newAsteroid(x, y, Math.ceil(ASTR_SIZE / 4)));
          asteroids.push(newAsteroid(x, y, Math.ceil(ASTR_SIZE / 4)));
          score += SCORE_ABIG;
      } else if (radius == Math.ceil(ASTR_SIZE / 4)) { 
          asteroids.push(newAsteroid(x, y, Math.ceil(ASTR_SIZE / 8)));
          asteroids.push(newAsteroid(x, y, Math.ceil(ASTR_SIZE / 8)));
          score += SCORE_AMED;
      } else {
        score += SCORE_ASML;
      }

      //HIGH SCORE
      if (score > scoreHigh) {
        scoreHigh = score;
        localStorage.setItem(SAVE_SCORE, scoreHigh);
      }

      asteroids.splice(index, 1);

      //make new level
      if (asteroids.length == 0) {
        level++;
        newLevel();
      }
    }

    function distBetweenPoints(x1, y1, x2, y2) {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    function drawTrian(x, y, position, colour = "white") {
      ctx.strokeStyle = colour; 
      ctx.lineWidth = SHIP_SIZE / 20;
      //draw ship
      ctx.beginPath();
      ctx.moveTo(
      x + 4 / 3 * ship.radius * Math.cos(position),
      y - 4 / 3 * ship.radius * Math.sin(position)
      );
      ctx.lineTo(
        x - ship.radius * (2 / 3 * Math.cos(position) + Math.sin(position)),
        y + ship.radius * (2 / 3 * Math.sin(position) - Math.cos(position))
      );
      ctx.lineTo(
        x - ship.radius * (2 / 3 * Math.cos(position) - Math.sin(position)),
        y + ship.radius * (2 / 3 * Math.sin(position) + Math.cos(position))
      );
      ctx.closePath();
      ctx.stroke();
    }

    function deadShip() {
      ship.dead = Math.ceil(SHIP_DEAD * FPS);
    }

    function gameOver() {
      ship.gameOver = true;
      text = "Game Over";
      textAlpha = 1.0;
      //localStorage.clear();
    }

    //WASD
    function keyDown(ev) {
      if (ship.gameOver) {
        return;
      }

      switch(ev.keyCode) {
        //laser(spacebar)
        case 32:
          shootBoom();
        break;
        //left
        case 37:
          ship.rotation = ROT_SPEED / 180 * Math.PI / FPS;
        break;
        //up
        case 38:
          ship.moving = true;
        break;
        //right
        case 39:
          ship.rotation = -ROT_SPEED / 180 * Math.PI / FPS;
        break;
      }
    };

    function keyUp(ev) {
      if (ship.gameOver) {
        return;
      }
      
      switch(ev.keyCode) {
        //laser(spacebar)
        case 32:
          ship.canShoot = true;
        break;
        //stop left
        case 37:
          ship.rotation = 0;
        break;
        //stop up
        case 38:
          ship.moving = false;
        break;
        //stop right
        case 39:
          ship.rotation = 0;
        break;
      }
    };

    function newAsteroid(x, y, radius) {
      let levelSpeed = 1 + 0.1 * level;
      let asteroid = {
        x: x,
        y: y,
        xv: Math.random() * ASTR_SPEED * levelSpeed / FPS * (Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * ASTR_SPEED * levelSpeed / FPS * (Math.random() < 0.5 ? 1 : -1),
        radius: radius,
        position: Math.random() * Math.PI * 2,
        vert: Math.floor(Math.random() * (ASTR_VERT + 1) + ASTR_VERT / 2),
        mod: [],
      }
      for (let i = 0; i < asteroid.vert; i++) {
        asteroid.mod.push(Math.random() * ASTR_ANGLES * 2 + 1 - ASTR_ANGLES);
      }
      
      return asteroid
    }

    function newGame() {
      level = 0;
      lives = SHIP_LIVES;
      score = 0;
      ship = newShip();
      let scoreStr = localStorage.getItem(SAVE_SCORE);
      if (scoreStr == null) {
        scoreHigh = 0;
      } else {
        scoreHigh = scoreStr;
      }
      newLevel();
    }

    function newLevel() {
      text = "Level " + (level + 1);
      textAlpha = 1.0;
      asteroidBelt();
    }

    function newShip() {
      return {
        x: canv.width / 2,
        y: canv.height / 2,
        radius: SHIP_SIZE / 2,
        position: 90 / 180 * Math.PI,
        blinkNum: Math.ceil(SHIP_TIME / SHIP_BLINK),
        blinkT: Math.ceil(SHIP_BLINK * FPS),
        canShoot: true,
        gameOver: false,
        dead: 0,
        lasers: [],
        rotation: 0,
        moving: false,
        move: {
          x: 0,
          y: 0
        }
      }
    }

    function shootBoom() {  //draw laser
      if (ship.canShoot && ship.lasers.length < LASER_MAX) {
        ship.lasers.push({
          x: ship.x + 4 / 3 * ship.radius * Math.cos(ship.position),
          y: ship.y - 4 / 3 * ship.radius * Math.sin(ship.position),
          xv: LASER_SPEED * Math.cos(ship.position) / FPS,
          yv: -LASER_SPEED * Math.sin(ship.position) / FPS,
          dist: 0,
          boomTime: 0,
        });
      }
      ship.canShoot = false;
    }

    function drawAsteroid() {
      //asteroid
      let x, y, radius, position, vert, mod;
      for (let i = 0; i < asteroids.length; i++) {
        ctx.strokeStyle = "slategrey";
        ctx.lineWidth = SHIP_SIZE / 20;

        x = asteroids[i].x;
        y = asteroids[i].y;
        radius = asteroids[i].radius;
        position = asteroids[i].position;
        vert = asteroids[i].vert;
        mod = asteroids[i].mod;

        ctx.beginPath();
        ctx.moveTo(
          x + radius * mod[0] * Math.cos(position),
          y + radius * mod[0] * Math.sin(position)
        );
        //draw
        for (let j = 1; j < vert; j++) {
          ctx.lineTo(
            x + radius * mod[j] * Math.cos(position + j * Math.PI * 2 / vert),
            y + radius * mod[j] * Math.sin(position + j * Math.PI * 2 / vert),
          );
        }
        ctx.closePath();
        ctx.stroke();
        //debug
        if(SHOW_COLISION) {
          ctx.strokeStyle = " lime";
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2, false);
          ctx.stroke();
        }
      }
    }

    function drawShip() {
      let boom = ship.dead > 0;
      let blink = ship.blinkNum % 2 == 0;
      //ship tale
      if (ship.moving && !ship.gameOver) {
        ship.move.x += SHIP_MOVE * Math.cos(ship.position) / FPS;
        ship.move.y -= SHIP_MOVE * Math.sin(ship.position) / FPS;

        if(!boom && blink) {
          //tale of ship
          ctx.fillStyle = "red";
          ctx.strokeStyle = "yellow"; 
          ctx.lineWidth = SHIP_SIZE / 20;
          ctx.beginPath();
          ctx.moveTo(
            ship.x - ship.radius * (2 / 3 * Math.cos(ship.position) + 0.5 * Math.sin(ship.position)),
            ship.y + ship.radius * (2 / 3 * Math.sin(ship.position) - 0.5 * Math.cos(ship.position))
          );
          ctx.lineTo(
            ship.x - ship.radius * 6 / 3 * Math.cos(ship.position),
            ship.y + ship.radius * 6 / 3 * Math.sin(ship.position)
          );
          ctx.lineTo(
            ship.x - ship.radius * (2 / 3 * Math.cos(ship.position) - 0.5 * Math.sin(ship.position)),
            ship.y + ship.radius * (2 / 3 * Math.sin(ship.position) + 0.5 * Math.cos(ship.position))
          );
          ctx.closePath();
          ctx.fill();
          ctx.stroke()
        }
      } else {
        ship.move.x -= SPACE * ship.move.x / FPS;
        ship.move.y -= SPACE * ship.move.y / FPS;
      }

      //ship
      if(!boom){
        if (blink && !ship.gameOver) {
          drawTrian(ship.x, ship.y, ship.position);
        }

        //blink
        if(ship.blinkNum > 0) {
          ship.blinkT--;

          if (ship.blinkT == 0) {
            ship.blinkT = Math.ceil(SHIP_BLINK * FPS);
            ship.blinkNum--;
          }
        }
      } else {
        //boom
        ctx.fillStyle = " darkred";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.radius * 1.7, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = " red";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.radius * 1.4, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = " orange";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.radius * 1.1, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = " yellow";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.radius * 0.8, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = " white";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.radius * 0.5, 0, Math.PI * 2, false);
        ctx.fill();
      }

      if(SHOW_COLISION) {
        ctx.strokeStyle = " lime";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.radius, 0, Math.PI * 2, false);
        ctx.stroke();
      }
    }

    function drawLaser() {
      for (let i = 0; i < ship.lasers.length; i++) {
        if (ship.lasers[i].boomTime == 0) {
            ctx.fillStyle = "salmon";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, SHIP_SIZE / 15, 0, Math.PI * 2, false);
            ctx.fill();
        } else {
            // draw boom
            ctx.fillStyle = "orangered";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.radius * 0.75, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = "salmon";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.radius * 0.5, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = "pink";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.radius * 0.25, 0, Math.PI * 2, false);
            ctx.fill();
        }
      }
    }

    function lMove(){
      // move the lasers
      for (let i = ship.lasers.length - 1; i >= 0; i--) {
                
        if (ship.lasers[i].dist > LASER_DIST * canv.width) {
          ship.lasers.splice(i, 1);
          continue;
        }

        if (ship.lasers[i].boomTime > 0) {
          ship.lasers[i].boomTime--;

          if (ship.lasers[i].boomTime == 0) {
              ship.lasers.splice(i, 1);
              continue;
          }
        } else {
            ship.lasers[i].x += ship.lasers[i].xv;
            ship.lasers[i].y += ship.lasers[i].yv;

            ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv, 2));
        }

        // teleport
        if (ship.lasers[i].x < 0) {
          ship.lasers[i].x = canv.width;
        } else if (ship.lasers[i].x > canv.width) {
          ship.lasers[i].x = 0;
        }
        if (ship.lasers[i].y < 0) {
          ship.lasers[i].y = canv.height;
        } else if (ship.lasers[i].y > canv.height) {
          ship.lasers[i].y = 0;
        }
      }
    }
    
    function aMove() {
      for(let i = 0; i < asteroids.length; i++) {
        //move
        asteroids[i].x += asteroids[i].xv;
        asteroids[i].y += asteroids[i].yv;
        //teleport
        if (asteroids[i].x < 0 - asteroids[i].radius) {
          asteroids[i].x = canv.width + asteroids[i].radius;
        } else if (asteroids[i].x > canv.width + asteroids[i].radius) {
          asteroids[i].x = 0 - asteroids[i].radius
        }
        if (asteroids[i].y < 0 - asteroids[i].radius) {
          asteroids[i].y = canv.height + asteroids[i].radius;
        } else if (asteroids[i].y > canv.height + asteroids[i].radius) {
          asteroids[i].y = 0 - asteroids[i].radius
        }
      }
    }

    function teleport() {
      //teleport to other side
      if (ship.x < 0 - ship.radius) {
        ship.x = canv.width + ship.radius;
      } else if (ship.x > canv.width + ship.radius) {
        ship.x = 0 - ship.radius;
      }

      if (ship.y < 0 - ship.radius) {
        ship.y = canv.height + ship.radius;
      } else if (ship.y > canv.height + ship.radius) {
        ship.y = 0 - ship.radius;
      }
    }

    function boom() {
      let boom = ship.dead > 0;

      if(!boom) {
        if(ship.blinkNum == 0 && !ship.gameOver) {
        //colision
          for (let a = 0; a < asteroids.length; a++) {
            if (distBetweenPoints(ship.x, ship.y, asteroids[a].x, asteroids[a].y) < ship.radius + asteroids[a].radius) {
              deadShip();
              destroyA(a);
              break;
            }
          }
        }
      //WASD rotate
      ship.position += ship.rotation;
      //ship moving
      ship.x += ship.move.x;
      ship.y += ship.move.y;
      } else {
        ship.dead--;
        if (ship.dead == 0) {
          lives--;
          if (lives == 0) {
            gameOver();
          } else {
          ship = newShip();
          }
        }
      }
    }

    function lVSa() {
      let ax, ay, aradius, lx, ly;
      
      for (let i = asteroids.length - 1; i >= 0; i--) {

        ax = asteroids[i].x;
        ay = asteroids[i].y;
        aradius = asteroids[i].radius;

        for (let j = ship.lasers.length - 1; j >= 0; j--) {

            lx = ship.lasers[j].x;
            ly = ship.lasers[j].y;

            if (ship.lasers[j].boomTime == 0 && distBetweenPoints(ax, ay, lx, ly) < aradius) {

              // destroy the asteroid and activate the laser explosion
              destroyA(i);
              ship.lasers[j].boomTime = Math.ceil(LASER_BOOM * FPS);
              break;
            }
          }
        }
      }

    function drawLives() {
      let lifeColour;
      for (let i = 0; i < lives; i++) {
        let boom = ship.dead > 0;
        lifeColour = boom && i == lives - 1 ? "red" : "white";
        drawTrian(SHIP_SIZE + i * SHIP_SIZE * 1.2, SHIP_SIZE, 0.5 * Math.PI, lifeColour);
      }
    }

    function drawText() {
      //text
      if (textAlpha >= 0) {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(255, 255, 255, " + textAlpha + ")";
        ctx.font = "small-caps " + TEXT_SIZE + "px dejavu sens mono";
        ctx.fillText(text, canv.width / 2, canv.height * 0.75);
        textAlpha -= (1.0 / TEXT_TIME / FPS);
      } else if (ship.gameOver) {
        newGame();
      }
      //score
      if (!ship.gameOver) {
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "white";
        ctx.font = TEXT_SIZE + "px dejavu sens mono";
        ctx.fillText(score, canv.width - SHIP_SIZE / 2, SHIP_SIZE);
        //draw high score
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "white";
        ctx.font = (TEXT_SIZE * 0.5) + "px dejavu sens mono";
        ctx.fillText("Best: " + scoreHigh, canv.width / 2, SHIP_SIZE);
      }
    }

    function update() {
      //background
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canv.width, canv.height);
      //asteroid
      drawAsteroid()
      //ship
      drawShip();
      //lasers
      drawLaser();
      //draw lives
      drawLives();
      //draw score
      drawText();
      //laser VS asteroid
      lVSa();
      //boom
      boom();
      //teleport
      teleport();
      //laser move
      lMove();   
      //asteroid move
      aMove();  
    }