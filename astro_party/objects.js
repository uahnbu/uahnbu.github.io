class Ball {
  constructor(x,y,r,m,mode) {
    this.x = x; this.y = y;
    this.vX = 0; this.vY = 0;
    this.aX = 0; this.aY = 0;
    this.ang = 0;
    this.r = r;
    this.m = m;
    this.mode = mode;
    this.type = 'ball';
  }
  step() {
    this.vX /= 1.05; this.vY /= 1.05;
    this.x += this.vX;
    this.y += this.vY;
    if (this.x > room.width) {this.x -= room.width; }
    if (this.x < 0) {this.x = room.width + this.x; }
    if (this.y > room.height) {this.y -= room.height; }
    if (this.y < 0) {this.y = room.height - this.y; }
    this.checkCollide();
  }
  checkCollide() {
    Object.values(room.objects).forEach(clan => clan.forEach(obj => {
      if (obj !== this) {
        if (obj.type === 'ball') {
          if ((this.x - obj.x)**2 + (this.y - obj.y)**2 <= (this.r + obj.r)**2) {
            this.collideBall(obj, 0, 0);
          }
          if ((this.x + room.width - obj.x)**2 + (this.y - obj.y)**2 <= (this.r + obj.r)**2) {
            this.collideBall(obj, 1, 0);
          }
          if ((this.x - obj.x)**2 + (this.y + room.height - obj.y)**2 <= (this.r + obj.r)**2) {
            this.collideBall(obj, 0, 1);
          }
          if ((this.x + room.width - obj.x)**2 + (this.y + room.height - obj.y)**2 <= (this.r + obj.r)**2) {
            this.collideBall(obj, 1, 1);
          }
        }
        if (obj.type === 'wall') {
          let line1X = obj.x2 - obj.x1,
              line1Y = obj.y2 - obj.y1,
              edge = line1X ** 2 + line1Y ** 2,
              min = Infinity,
              minX = 0, minY = 0,
              moveX = 0, moveY = 0;
          [this.x - room.width, this.x, this.x + room.width].forEach((x,i) => {
            [this.y - room.height, this.y, this.y + room.height].forEach((y,j) => {
              let line2X = x - obj.x1,
                  line2Y = y - obj.y1,
                  t = Math.max(0, Math.min(edge, line1X * line2X + line1Y * line2Y)) / edge,
                  closestX = obj.x1 + t * line1X,
                  closestY = obj.y1 + t * line1Y;
              if ((x - closestX)**2 + (y - closestY)**2 <= (this.r + obj.r)**2) {
                min = (x - closestX)**2 + (y - closestY)**2;
                minX = closestX; minY = closestY;
                moveX = i - 1; moveY = j - 1;
              }
            });
          });
          if (min <= (this.r + obj.r)**2) {
            let fake = new Ball(minX, minY, obj.r, this.m, 'static');
            this.collideBall(fake, moveX, moveY);
          }
        }
      }
    }));
  }
  collideBall(target,moveX,moveY) {
    let nX = target.x - this.x - moveX * room.width,
        nY = target.y - this.y - moveY * room.height,
        dist = Math.sqrt(nX ** 2 + nY ** 2),
        overlap = dist - this.r - target.r;
    nX /= dist; nY /= dist;
    if (target.mode === 'static') {
      this.x += overlap * nX;
      this.y += overlap * nY;
    } else if (this.mode === 'static') {
      target.x -= overlap * nX;
      target.y -= overlap * nY;
    } else {
      this.x += overlap * nX * target.m / (this.m + target.m);
      this.y += overlap * nY * target.m / (this.m + target.m);
      target.x -= overlap * nX * this.m / (this.m + target.m);
      target.y -= overlap * nY * this.m / (this.m + target.m);
    }
    nX = target.x - this.x - moveX * room.width;
    nY = target.y - this.y - moveY * room.height;
    dist = Math.sqrt(nX ** 2 + nY ** 2);
    nX /= dist; nY /= dist;
    let p = 2 * (nX * (this.vX - target.vX) + nY * (this.vY - target.vY)) / (this.m + target.m);
    if (this.mode !== 'static') {
      this.vX -= p * target.m * nX;
      this.vY -= p * target.m * nY;
    }
    if (target.mode !== 'static') {
      target.vX += p * this.m * nX;
      target.vY += p * this.m * nY;
    }
  }
  draw() {
    const drawAt = (x,y) => {
      room.strokeStyle = '#27ae60';
      room.beginPath();
      room.arc(x, y, this.r, 0, Math.PI*2);
      room.stroke();
      if (this.mode === 'dynamic') {
        let pow = this.vX ** 2 + this.vY ** 2,
            ang = Math.atan2(this.vY, this.vX);
        room.strokeStyle = '#f1c40f';
        room.beginPath();
        room.moveTo(x, y);
        room.lineTo(
          x + (this.r + pow) * Math.cos(this.ang),
          y + (this.r + pow) * Math.sin(this.ang)
        );
        room.stroke();
      }
    };
    [room.width - this.x - this.r, this.x - this.r, -1].forEach((x,i) => {
      [room.height - this.y - this.r, this.y - this.r, -1].forEach((y,j) => {
        if (x < 0 && y < 0) {drawAt(
          [this.x - room.width, this.x + room.width, this.x][i],
          [this.y - room.height, this.y + room.height, this.y][j]
        ); }
      })
    });
  }
}

class Wall {
  constructor(x1,y1,x2,y2,r,breakable) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.r = r;
    let nX = this.x2 - this.x1,
        nY = this.y2 - this.y1,
        d = this.r / Math.sqrt(nX ** 2 + nY ** 2);
    nX *= d; nY *= d;
    this.x1 += nX; this.y1 += nY;
    this.x2 -= nX; this.y2 -= nY;
    this.type = 'wall';
    this.breakable = breakable;
  }
  draw() {
    let nX = this.x2 - this.x1,
        nY = this.y2 - this.y1,
        d = this.r / Math.sqrt(nX ** 2 + nY ** 2),
        tX = -nY * d,
        tY = nX * d;
    nX *= d; nY *= d;
    if (this.type === null) {
      let ang = Math.atan2(nY, nX);
      for (let i = 0; i <= 1/d; i += 1/d / Math.abs(this.x2 - this.x1) * 4) {room.objects['others'].push(
        new Sparkle(
          this.x1 + nX * i + tX, this.y1 + nY * i + tY,
          ang + 90 * RAD, Math.random(), 100, '#f1c40f'
        ),
        new Sparkle(
          this.x1 + nX * i - tX, this.y1 + nY * i - tY,
          ang - 90 * RAD, Math.random(), 100, '#f1c40f'
        )
      ); }
      for (let i = -90; i <= 90; i += 10) {room.objects['others'].push(
        new Sparkle(
          this.x1 - this.r * Math.cos(ang + i * RAD),
          this.y1 - this.r * Math.sin(ang + i * RAD),
          ang + (i + 180) * RAD, Math.random(), 100, '#f1c40f'
        ),
        new Sparkle(
          this.x2 + this.r * Math.cos(ang + i * RAD),
          this.y2 + this.r * Math.sin(ang + i * RAD),
          ang + i * RAD, Math.random(), 100, '#f1c40f'
        )
      ); }
      room.objects['wall'].splice(room.objects['wall'].indexOf(this), 1);
      return;
    }
    const drawAt = (x,y) => {
      room.strokeStyle = this.breakable ? '#f1c40f' : '#2ecc71';
      room.beginPath();
      room.moveTo(x - tX, y - tY);
      room.arcTo(x - tX - nX, y - tY - nY, x - nX, y - nY, this.r);
      room.arcTo(x + tX - nX, y + tY - nY, x + tX, y + tY, this.r);
      room.lineTo(x - this.x1 + this.x2 + tX, y - this.y1 + this.y2 + tY);
      room.arcTo(
        x - this.x1 + this.x2 + tX + nX, y - this.y1 + this.y2 + tY + nY,
        x - this.x1 + this.x2 + nX, y - this.y1 + this.y2 + nY, this.r
      );
      room.arcTo(
        x - this.x1 + this.x2 - tX + nX, y - this.y1 + this.y2 - tY + nY,
        x - this.x1 + this.x2 - tX, y - this.y1 + this.y2 - tY, this.r
      );
      room.closePath();
      room.stroke();
    };
    [room.width - this.x1 - this.r, this.x1 - this.r, -1].forEach((x,i) => {
      [room.height - this.y1 - this.r, this.y1 - this.r, -1].forEach((y,j) => {
        if (x < 0 && y < 0) {drawAt(
          [this.x1 - room.width, this.x1 + room.width, this.x1][i],
          [this.y1 - room.height, this.y1 + room.height, this.y1][j]
        ); }
      })
    });
  }
}

class Block {
  constructor(x,y) {
    let d = 48,
        r = 4;
    d -= r * 2;
    room.objects['wall'].push(
      new Wall(x, y, x + d, y, r, true),
      new Wall(x, y, x, y + d, r, true),
      new Wall(x, y + d, x + d, y + d, r, true),
      new Wall(x + d, y, x + d, y + d, r, true)
    );
  }
}

class Ship extends Ball {
  constructor(x,y,ang) {
    super(x, y, 16, 16, 'dynamic');
    this.ang = ang;
    this.keys = [38,40,37,39];
    this.scale = .4;
    this.sparkIdx = 0;
    this.fuelIdx = 0;
    this.fuelFPI = 2;
    this.flashIdx = 0;
    this.flashFPI = 1;
    this.ammoReload = 150;
    this.ammo = [this.ammoReload, this.ammoReload, this.ammoReload];
    this.ammoAng = 0;
    this.invincible = 100 - 100;
  }
  step() {
    if (keyPressed(this.keys[0]) && this.ammo.includes(this.ammoReload)) {
      room.objects['bullet'].push(new Bullet(
        this.x + 64 * this.scale * Math.cos(this.ang),
        this.y + 64 * this.scale * Math.sin(this.ang),
        this.ang, this
      ));
      room.objects['others'].push(
        new Cartridge(this.x, this.y, this.ang + 90 * RAD, 5)
      );
      this.ammo[this.ammo.indexOf(this.ammoReload)] = 0;
      this.sparkIdx = 1;
      this.vX -= Math.cos(this.ang);
      this.vY -= Math.sin(this.ang);
    }
    if (!keyDown(this.keys[1])) {
      this.vX += .5 * Math.cos(this.ang);
      this.vY += .5 * Math.sin(this.ang);
      if (Math.random() < .5) {
        room.objects['others'].push(new Sparkle(
          this.x, this.y, this.ang + (180 + ranInt(-30, 30)) * RAD,
          Math.random() * 2, 200, '#2980b9', '#94d8ef'
        ));
      }
    }
    if (keyPressed(this.keys[1])) {this.fuelIdx = -1; }
    if (keyReleased(this.keys[1])) {this.fuelIdx = 0; }
    if (keyDown(this.keys[2])) {this.ang -= 8 * RAD; }
    if (keyDown(this.keys[3])) {this.ang += 8 * RAD; }
    if (this.sparkIdx > 0) {
      if (this.sparkIdx < 12) {this.sparkIdx++; }
      else {this.sparkIdx = 0; }
    }
    if (this.fuelIdx >= 0) {
      if (this.fuelIdx < this.fuelFPI * room.sprites['fuel'].images.length - 1) {this.fuelIdx++; }
      else {this.fuelIdx = 0; }
    }
    if (this.flashIdx >= 0) {
      if (this.flashIdx < this.flashFPI * room.sprites['invincible'].images.length - 1) {this.flashIdx++; }
      else {this.flashIdx = 0; }
    }
    this.ammo.forEach((ammo,i) => {
      if (ammo < this.ammoReload) {this.ammo[i]++; }
    })
    this.ammoAng += 2 * RAD;
    if (this.invincible) {this.invincible--; }
    super.step();
  }
  collideBall(target,moveX,moveY) {
    if (room.objects['man'].includes(target) && !target.dead) {
      target.dead = true;
      let ang = Math.atan2(target.y - this.y, target.x - this.x);
      room.objects['others'].push(
        new ManBody(target.x, target.y, ang, 4),
        new ManBody(target.x, target.y, ang, 4),
        new ManBody(target.x, target.y, ang, 4),
        new ManBody(target.x, target.y, ang, 4),
        new ManBody(target.x, target.y, ang, 7),
        new ManBody(target.x, target.y, ang, 7),
      );
      for (let i = 0; i < 10; i++) {room.objects['others'].push(
        new Sparkle(target.x, target.y, ang + ranInt(-30, 30) * RAD, Math.random() * 2, 200, '#c0392b')
      ); }
    }
    super.collideBall(target, moveX, moveY);
  }
  draw() {
    const drawAt = (x,y) => {
      if (this.fuelIdx >= 0) {room.drawExt(
        'fuel', x, y, -72, -44, this.ang, this.scale, this.fuelIdx, this.fuelFPI, 72, 44
      ); }
      if (this.sparkIdx) {
        room.drawExt('spark', x, y, -40, -44, this.ang, this.scale, 0, 1, 40, 44);
      }
      room.drawExt('ship', x, y, -40, -44, this.ang, this.scale, 0, 1, 40, 44);
      if (this.invincible) {
        room.drawExt('invincible', x, y, -40, -44, this.ang, this.scale, this.flashIdx, this.flashFPI, 40, 44);
      }
      room.fillStyle = '#fff';
      this.ammo.forEach((ammo,i) => {if (ammo === this.ammoReload) {
        room.beginPath();
        room.fillRect(
          x + 80 * this.scale * Math.cos(this.ammoAng + 360 / this.ammo.length * RAD * i) - 3,
          y + 80 * this.scale * Math.sin(this.ammoAng + 360 / this.ammo.length * RAD * i) - 3,
          6, 6
        );
        room.fill();
      }});
    };
    [room.width - this.x - this.r, this.x - this.r, -1].forEach((x,i) => {
      [room.height - this.y - this.r, this.y - this.r, -1].forEach((y,j) => {
        if (x < 0 && y < 0) {drawAt(
          [this.x - room.width, this.x + room.width, this.x][i],
          [this.y - room.height, this.y + room.height, this.y][j]
        ); }
      })
    });
  }
}

class Man extends Ball {
  constructor(x,y,vX,vY,revive) {
    super(x, y, 8, 16, 'dynamic');
    if (revive) {
      this.vX = vX;
      this.vY = vY;
      this.revive = revive;
    } else {
      this.ang = vX;
      this.revive = vY;
    }
    this.keys = [38,40,37,39];
    this.scale = .4;
    this.suitIdx = -1;
    this.suitFPI = 8;
  }
  step() {
    if (this.dead) {
      super.step();
      return;
    }
    if (keyDown(this.keys[0])) {
      this.vX += .5 * Math.cos(this.ang);
      this.vY += .5 * Math.sin(this.ang);
      if (Math.random() < .1) {
        room.objects['others'].push(new Sparkle(
          this.x, this.y,
          this.ang + (180 + ranInt(-30, 30)) * RAD,
          Math.random(),
          100,
          '#3498db'
        ));
      }
    }
    if (keyPressed(this.keys[0])) {this.suitIdx = 0; }
    if (keyReleased(this.keys[0])) {this.suitIdx = -1; }
    if (keyDown(this.keys[2])) {this.ang -= 5 * RAD; }
    if (keyDown(this.keys[3])) {this.ang += 5 * RAD; }
    if (this.suitIdx >= 0) {
      if (this.suitIdx < this.suitFPI * room.sprites['man_suit'].images.length - 1) {this.suitIdx++; }
      else {this.suitIdx = 0; }
    }
    if (this.revive > 0) {
      this.revive--;
      if (this.revive === 50) {
        for (let i = 0; i < 100; i++) {
          let t = ranInt(1, 256),
              ang = ranInt(0, 360) * RAD;
          room.objects['others'].push(new Sparkle(
            this.x + t * Math.cos(ang), this.y + t * Math.sin(ang),
            ang + 180 * RAD, t / 50, 50, '#fff', this
          ));
        }
      }
    }
    else {
      room.objects['ship'].push(new Ship(this.x, this.y, this.ang));
      room.objects['man'].splice(room.objects['man'].indexOf(this), 1);
      return;
    }
    super.step();
  }
  collideBall(target,moveX,moveY) {
    if (!this.dead && room.objects['ship'].includes(target)) {
      this.dead = true;
      let ang = Math.atan2(this.y - target.y, this.x - target.x);
      room.objects['others'].push(
        new ManBody(this.x, this.y, ang, 4),
        new ManBody(this.x, this.y, ang, 4),
        new ManBody(this.x, this.y, ang, 4),
        new ManBody(this.x, this.y, ang, 4),
        new ManBody(this.x, this.y, ang, 7),
        new ManBody(this.x, this.y, ang, 7),
      );
      for (let i = 0; i < 10; i++) {room.objects['others'].push(
        new Sparkle(this.x, this.y, ang + ranInt(-30, 30) * RAD, Math.random() * 2, 200, '#c0392b')
      ); }
    }
    super.collideBall(target, moveX, moveY);
  }
  draw() {
    room.drawExt('man_head', this.x, this.y, -8, -24, this.ang, this.scale, 0, 1, 8, 24);
    if (this.dead) {return; }
    if (this.suitIdx === -1) {
      room.drawExt(
        'man_suit', this.x, this.y, -40, -24, this.ang, this.scale, 1, 1, 40, 24
      );
    } else {
      room.drawExt(
        'man_suit', this.x, this.y, -40, -24, this.ang, this.scale, this.suitIdx, this.suitFPI, 40, 24
      );
    }
  }
}

class Bullet {
  constructor(x,y,ang,prn) {
    this.x = x;
    this.y = y;
    this.vX = 12 * Math.cos(ang);
    this.vY = 12 * Math.sin(ang);
    this.r = 5;
    this.prn = prn;
  }
  step() {
    if (Math.abs(this.vX) < .1) {
      if (Math.abs(this.vY) < .1) {
        this.x += this.vX;
        this.y += this.vY;
        if (this.checkCollide()) {return; }
      } else {
        let increment = Math.sign(this.vY) / 10;
        for (let i = 0; i < Math.abs(this.vY) * 10; i++) {
          this.x += increment * this.vX / this.vY;
          this.y += increment;
          if (this.checkCollide()) {return; }
        }
      }
    } else {
      let increment = Math.sign(this.vX) / 10;
      for (let i = 0; i < Math.abs(this.vX) * 10; i++) {
        this.x += increment;
        this.y += increment * this.vY / this.vX;
        if (this.checkCollide()) {return; }
      }
    }
    if (this.x > room.width) {this.x -= room.width; }
    if (this.x < 0) {this.x = room.width + this.x; }
    if (this.y > room.height) {this.y -= room.height; }
    if (this.y < 0) {this.y = room.height - this.y; }
  }
  checkCollide() {
    let collided = false;
    if (this.prn) {
      if ((this.x - this.prn.x)**2 + (this.y - this.prn.y)**2 > (this.r + this.prn.r)**2) {
        this.prn = null;
      } else {return false; }
    } else {
      room.objects['ship'].forEach(ship => {
        if (!ship.invincible && (this.x - ship.x)**2 + (this.y - ship.y)**2 <= (this.r + ship.r)**2) {
          room.objects['man'].push(new Man(ship.x, ship.y, this.vX / 5, this.vY / 5, 500));
          room.objects['ship'].splice(room.objects['ship'].indexOf(ship), 1);
          collided = true;
        }
      });
    }
    if (!collided) {
      room.objects['man'].forEach(man => {
        if ((this.x - man.x)**2 + (this.y - man.y)**2 <= (this.r + man.r)**2) {
          man.dead = true;
          let ang = Math.atan2(man.y - this.y, man.x - this.x);
          room.objects['others'].push(
            new ManBody(man.x, man.y, ang, 4),
            new ManBody(man.x, man.y, ang, 4),
            new ManBody(man.x, man.y, ang, 4),
            new ManBody(man.x, man.y, ang, 4),
            new ManBody(man.x, man.y, ang, 7),
            new ManBody(man.x, man.y, ang, 7),
          );
          for (let i = 0; i < 10; i++) {room.objects['others'].push(
            new Sparkle(man.x, man.y, ang + ranInt(-30, 30) * RAD, Math.random() * 2, 200, '#c0392b')
          ); }
          collided = true;
        }
      });
    }
    if (!collided) {
      room.objects['wall'].forEach(wall => {
        let line1X = wall.x2 - wall.x1,
            line1Y = wall.y2 - wall.y1,
            line2X = this.x - wall.x1,
            line2Y = this.y - wall.y1,
            edge = line1X ** 2 + line1Y ** 2,
            t = Math.max(0, Math.min(edge, line1X * line2X + line1Y * line2Y)) / edge,
            closestX = wall.x1 + t * line1X,
            closestY = wall.y1 + t * line1Y;
        if ((this.x - closestX)**2 + (this.y - closestY)**2 <= (this.r + wall.r)**2) {
          if (wall.breakable) {wall.type = null; }
          collided = true;
        }
      });
    }
    if (collided) {
      room.objects['bullet'].splice(room.objects['bullet'].indexOf(this), 1);
      for (let i = 0; i < 5; i++) {
        room.objects['others'].push(
          new Sparkle(this.x, this.y, ranInt(0, 360) * RAD, Math.random() * 2, 100, '#f1c40f')
        );
      }
      return true;
    }
    return false;
  }
  draw() {
    room.drawExt('bullet', this.x, this.y, -8, -8, false, .7, 0, 1, 8, 8);
  }
}

class Sparkle {
  constructor(x,y,ang,spd,life,col,type) {
    this.x = x;
    this.y = y;
    this.spd = spd;
    this.ang = ang;
    this.life = ranInt(1, life);
    this.col = col;
    this.type = type;
    this.col = col;
  }
  step() {
    this.x += this.spd * Math.cos(this.ang);
    this.y += this.spd * Math.sin(this.ang);
    if (typeof this.type === 'object') {
      this.x += this.type.vX;
      this.y += this.type.vY;
    }
    if (this.life > 0) {this.life--; }
    else {
      room.objects['others'].splice(room.objects['others'].indexOf(this), 1);
    }
  }
  draw() {
    room.fillStyle = this.col;
    room.beginPath();
    room.fillRect(this.x - 2, this.y - 2, 4, 4);
    if (typeof this.type === 'string') {
      room.fillStyle = this.type;
      room.beginPath();
      room.fillRect(this.x - 1, this.y - 1, 2, 2);
    }
  }
}

class Cartridge {
  constructor(x,y,ang,spd) {
    this.x = x;
    this.y = y;
    this.r = 2;
    this.vX = spd * Math.cos(ang);
    this.vY = spd * Math.sin(ang);
    this.ang = ranInt(0, 360) * RAD;
  }
  step() {
    if (this.vX ** 2 + this.vY ** 2 > 1) {
      this.vX /= 1.01;
      this.vY /= 1.01;
    }
    this.x += this.vX;
    this.y += this.vY;
    if (this.x > room.width) {this.x -= room.width; }
    if (this.x < 0) {this.x = room.width + this.x; }
    if (this.y > room.height) {this.y -= room.height; }
    if (this.y < 0) {this.y = room.height - this.y; }
    this.checkCollide();
    this.ang += RAD;
  }
  checkCollide() {
    room.objects['wall'].some(wall => {
      let line1X = wall.x2 - wall.x1,
          line1Y = wall.y2 - wall.y1,
          line2X = this.x - wall.x1,
          line2Y = this.y - wall.y1,
          edge = line1X ** 2 + line1Y ** 2,
          t = Math.max(0, Math.min(edge, line1X * line2X + line1Y * line2Y)) / edge,
          closestX = wall.x1 + t * line1X,
          closestY = wall.y1 + t * line1Y;
      if ((this.x - closestX)**2 + (this.y - closestY)**2 <= (this.r + wall.r)**2) {
        let nX = closestX - this.x,
            nY = closestY - this.y,
            dist = Math.sqrt(nX ** 2 + nY ** 2);
        nX /= dist; nY /= dist;
        let p = 2 * (nX * this.vX + nY * this.vY);
        this.vX -= p * nX;
        this.vY -= p * nY;
      }
    });
  }
  draw() {
    room.fillStyle = '#e58e26';
    room.beginPath();
    room.translate(this.x, this.y);
    room.rotate(this.ang);
    room.fillRect(-4, -2, 8, 4);
    room.rotate(-this.ang);
    room.translate(-this.x, -this.y);
  }
}

class ManBody extends Cartridge {
  constructor(x,y,ang,size) {
    super(x, y, ang + ranInt(-30, 30) * RAD, Math.random() * 5);
    this.scale = .4;
    this.col = ['#3498db', '#2980b9'][Math.floor(size/5)];
    this.size = size;
  }
  draw() {
    room.fillStyle = this.col;
    room.beginPath();
    room.translate(this.x, this.y);
    room.rotate(this.ang);
    room.fillRect(-this.size/2, -this.size/2, this.size, this.size);
    room.rotate(-this.ang);
    room.translate(-this.x, -this.y);
  }
}
