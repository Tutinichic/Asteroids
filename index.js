    //frames
    const FPS = 60;
    //space honey
    const space = 0.7; // (0 => 1)
    //ship
    const shipSize = 30;
    const shipMove = 5;
    const rotationSpeed = 360;
    //asteroid
    const asteroidsNum = 3;
    const asteroidSize = 100;
    const asteroidSpeed = 50;
    const asteroidVert = 10;
    const asteroidAngle = 0.3; // (0 => 1)
    //ship dead
    const shipDead = 0.3;
    const shipTime = 3;
    const shipBlink = 0.3;
    //laser
    const LASER_MAX = 10;
    const LASER_SPEED = 500;
    const LASER_DIST = 0.6;
    const LASER_BOOM = 0.1;
    //debug
    const showColision = false;
    
    let canv = document.getElementById("canvas");
    let ctx = canv.getContext("2d");

    let ship = newShip();

    let asteroids = [];
    asteroidBelt();

    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);

    setInterval(update, 1000 / FPS);


    //game

    function asteroidBelt() { //random Aspawn
      asteroids = [];
      let x,y;
      for (let i = 0; i < asteroidsNum; i++) {
        do{
        x = Math.floor(Math.random() * canv.width);
        y = Math.floor(Math.random() * canv.height);
        } while (distBetweenPoints(ship.x, ship.y, x, y) < asteroidSize * 2 + ship.radius);
        asteroids.push(newAsteroid(x, y, Math.ceil(asteroidSize / 2)));
      }
    }

    function destroyA(index) {
      let x = asteroids[index].x;
      let y = asteroids[index].y;
      let radius = asteroids[index].radius;

      if (radius == Math.ceil(asteroidSize / 2)) { 
          asteroids.push(newAsteroid(x, y, Math.ceil(asteroidSize / 4)));
          asteroids.push(newAsteroid(x, y, Math.ceil(asteroidSize / 4)));
      } else if (radius == Math.ceil(asteroidSize / 4)) { 
          asteroids.push(newAsteroid(x, y, Math.ceil(asteroidSize / 8)));
          asteroids.push(newAsteroid(x, y, Math.ceil(asteroidSize / 8)));
      }
      asteroids.splice(index, 1);
    }

    function distBetweenPoints(x1, y1, x2, y2) {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    function deadShip() {
      ship.dead = Math.ceil(shipDead * FPS);
    }

    //WASD
    function keyDown(ev) {
      switch(ev.keyCode) {
        //laser(spacebar)
        case 32:
          shootBoom();
        break;
        //left
        case 37:
          ship.rotation = rotationSpeed / 180 * Math.PI / FPS;
        break;
        //up
        case 38:
          ship.moving = true;
        break;
        //right
        case 39:
          ship.rotation = -rotationSpeed / 180 * Math.PI / FPS;
        break;
      }
    };

    function keyUp(ev) {
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
      let asteroid = {
        x: x,
        y: y,
        xv: Math.random() * asteroidSpeed / FPS * (Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * asteroidSpeed / FPS * (Math.random() < 0.5 ? 1 : -1),
        radius: radius,
        position: Math.random() * Math.PI * 2,
        vert: Math.floor(Math.random() * (asteroidVert + 1) + asteroidVert / 2),
        mod: [],
      }
      for (let i = 0; i < asteroid.vert; i++) {
        asteroid.mod.push(Math.random() * asteroidAngle * 2 + 1 - asteroidAngle);
      }
      
      return asteroid
    }

    function newShip() {
      return {
        x: canv.width / 2,
        y: canv.height / 2,
        radius: shipSize / 2,
        position: 90 / 180 * Math.PI,
        blinkNum: Math.ceil(shipTime / shipBlink),
        blinkT: Math.ceil(shipBlink * FPS),
        canShoot: true,
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
        ctx.lineWidth = shipSize / 20;

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
        if(showColision) {
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
      if (ship.moving) {
        ship.move.x += shipMove * Math.cos(ship.position) / FPS;
        ship.move.y -= shipMove * Math.sin(ship.position) / FPS;

        if(!boom && blink) {
          //tale of ship
          ctx.fillStyle = "red";
          ctx.strokeStyle = "yellow"; 
          ctx.lineWidth = shipSize / 20;
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
        ship.move.x -= space * ship.move.x / FPS;
        ship.move.y -= space * ship.move.y / FPS;
      }

      //ship
      if(!boom){
        if (blink) {
        
        ctx.strokeStyle = "white"; 
        ctx.lineWidth = shipSize / 20;
        //draw ship
        ctx.beginPath();
        ctx.moveTo(
        ship.x + 4 / 3 * ship.radius * Math.cos(ship.position),
        ship.y - 4 / 3 * ship.radius * Math.sin(ship.position)
        );
        ctx.lineTo(
          ship.x - ship.radius * (2 / 3 * Math.cos(ship.position) + Math.sin(ship.position)),
          ship.y + ship.radius * (2 / 3 * Math.sin(ship.position) - Math.cos(ship.position))
        );
        ctx.lineTo(
          ship.x - ship.radius * (2 / 3 * Math.cos(ship.position) - Math.sin(ship.position)),
          ship.y + ship.radius * (2 / 3 * Math.sin(ship.position) + Math.cos(ship.position))
        );
        ctx.closePath();
        ctx.stroke();
        }

        //blink
        if(ship.blinkNum > 0) {
          ship.blinkT--;

          if (ship.blinkT == 0) {
            ship.blinkT = Math.ceil(shipBlink * FPS);
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

      if(showColision) {
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
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, shipSize / 15, 0, Math.PI * 2, false);
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
        if(ship.blinkNum == 0) {
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
          ship = newShip();
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