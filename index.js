    const FPS = 60;
    const space = 0.7; // (0 => 1)
    const shipSize = 30;
    const shipMove = 5;
    const rotationSpeed = 360;
    const asteroidsNum = 3;
    const asteroidSize = 100;
    const asteroidSpeed = 50;
    const asteroidVert = 10;
    const asteroidAngle = 0.3; // (0 => 1)
    let asteroids = [];

    let canv = document.getElementById("canvas");
    let ctx = canv.getContext("2d");

    let ship = {
      x: canv.width / 2,
      y: canv.height / 2,
      radius: shipSize / 2,
      position: 90 / 180 * Math.PI,
      rotation: 0,
      moving: false,
      move: {
        x: 0,
        y: 0
      }
    };

    asteroidBelt();

    function asteroidBelt() {
      asteroids = [];
      let x,y;
      for (let i = 0; i < asteroidsNum; i++) {
        do{
        x = Math.floor(Math.random() * canv.width);
        y = Math.floor(Math.random() * canv.height);
        } while (distBetweenPoints(ship.x, ship.y, x, y) < asteroidSize * 2 + ship.radius);
        asteroids.push(newAsteroid(x, y));
      }
    };

    function distBetweenPoints(x1, y1, x2, y2) {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    function newAsteroid(x, y) {
      let asteroid = {
        x: x,
        y: y,
        xv: Math.random() * asteroidSpeed / FPS * (Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * asteroidSpeed / FPS * (Math.random() < 0.5 ? 1 : -1),
        radius: asteroidSize / 2,
        position: Math.random() * Math.PI * 2,
        vert: Math.floor(Math.random() * (asteroidVert + 1) + asteroidVert / 2),
        mod: [],
      }
      for (let i = 0; i < asteroid.vert; i++) {
        asteroid.mod.push(Math.random() * asteroidAngle * 2 + 1 - asteroidAngle);
      }
      
      return asteroid
    }

    function drawAsteroid() {
      //asteroid
      ctx.strokeStyle = "slategrey";
      ctx.lineWidth = shipSize / 20;
      let x, y, radius, position, vert, mod;
      for(let i = 0; i < asteroids.length; i++) {

        x = asteroids[i].x;
        y = asteroids[i].y;
        radius = asteroids[i].radius;
        position = asteroids[i].position;
        vert = asteroids[i].vert;
        mod = asteroids[i].mod;

        ctx.beginPath();
        ctx.moveTo(
          x + radius * mod[0] * Math.cos(position),
          y + radius * mod[0] * Math.sin(position),
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

     //WASD
    function keyDown(ev) {
      switch(ev.keyCode) {
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

    function drawShip() {
      //ship
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

    function drawShipTale() {
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
      ctx.stroke();
    }

    function shipWASD() {
      //move
      if (ship.moving) {
        ship.move.x += shipMove * Math.cos(ship.position) / FPS;
        ship.move.y -= shipMove * Math.sin(ship.position) / FPS;
        drawShipTale();
      } else {
        ship.move.x -= space * ship.move.x / FPS;
        ship.move.y -= space * ship.move.y / FPS;
      };
      //WASD rotate
      ship.position += ship.rotation;
      //ship moving
      ship.x += ship.move.x;
      ship.y += ship.move.y;
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

    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);

    setInterval(update, 1000 / FPS);

    function update() {
      //background
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canv.width, canv.height);
      //ship
      drawShip();
      //asteroid
      drawAsteroid()
      //move
      shipWASD();
      //teleport
      teleport();
      //center
      ctx.fillStyle = "red";
      ctx.fillRect(ship.x - 1, ship.y - 1 , 2, 2);
    }