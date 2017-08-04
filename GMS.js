var room = document.querySelector('canvas').getContext('2d');
room.canvas.width = 640; room.canvas.height = 480; room.move = []; grid.drag = [];
room.gridX = +grid.querySelector('input').value; room.gridY = +grid.querySelectorAll('input')[1].value;
room.gridRot = +grid.querySelectorAll('input')[2].value;
room.canvas.style.left = window.innerWidth/2 - room.canvas.width/2 + 'px';
room.canvas.style.top = window.innerHeight/2 - room.canvas.height/2 + 'px';
room.sprites = {e:[], pos: 0}; room.objects = {e:[], pos:0}; var RAD = Math.PI/180, _ = undefined;
room.draw = function() {
  room.fillStyle = '#999'; room.beginPath();
  room.fillRect(0, 0, room.canvas.width, room.canvas.height);
  room.strokeStyle = '#555';
  for (var i = room.gridX; i < room.canvas.width; i += room.gridX) {
    room.moveTo(i-.5, 0); room.lineTo(i-.5, room.canvas.height); room.stroke()
  }
  for (i = room.gridY; i < room.canvas.height; i += room.gridY) {
    room.moveTo(0, i-.5); room.lineTo(room.canvas.width, i-.5); room.stroke()
  }
  for (i = 0; i < room.objects.e.length; i++) room.objects.e[i].draw()  
}
room.bound = function(base,x,y,w,h) {
  x = x||base.x; y = y||base.y; w = w||base.width; h = h||base.height;
  var ang = base.ang(), oX = base.x + base.origin_x - x, oY = base.y + base.origin_y - y,
    bW = oX - oX*Math.cos(ang) + oY*Math.sin(ang), bH = oY - oY*Math.cos(ang) - oX*Math.sin(ang);
  return [
    bW, bH,
    x+bW, y+bH,
    x+bW + w*Math.cos(ang), y+bH + w*Math.sin(ang),
    x+bW + w*Math.cos(ang) - h*Math.sin(ang), y+bH + w*Math.sin(ang) + h*Math.cos(ang),
    x+bW - h*Math.sin(ang), y+bH + h*Math.cos(ang)
  ]
}
room.drawBound = function(base,x,y,w,h) {
  x = x||base.x; y = y||base.y; w = w||base.width; h = h||base.height; room.beginPath();
  var b = room.bound(base,x,y,w,h);
  room.moveTo(b[2], b[3]); room.lineTo(b[4], b[5]); room.lineTo(b[6], b[7]); room.lineTo(b[8], b[9]);
  room.closePath(); room.stroke()
}

var img = new Image();
img.src = 'spr_default.png';
room.sprites.e[-1] = img;
room.draw();

room.canvas.onmousedown = function(e) {
  var mx = e.clientX - room.canvas.offsetLeft, my = e.clientY - room.canvas.offsetTop;
  if (e.ctrlKey) {
    for (var o = room.objects.e, i = o.length-1; i >= 0; i--) if (o[i].hover(mx,my)) {
      o[i].active = 1 - o[i].active; room.draw(); return
    }
    return
  }
  if (e.shiftKey) {
    for (var o = room.objects.e, i = o.length-1; i >= 0; i--) if (o[i].active && o[i].hover(mx, my)) {
      if (o[i].hover(mx, my, _, .75*o[i].height, .75*o[i].width, _) && !o[i].action.length) {
        o[i].action = [0, my - o[i].height]; return
      }
      if (o[i].hover(mx, my, .75*o[i].width, _, _, .75*o[i].height) && !o[i].action.length) {
        o[i].action = [1, mx - o[i].width]; return
      }
      if (o[i].hover(mx, my, .75*o[i].width, .75*o[i].height, _, _) && !o[i].action.length) {
        o[i].action = [2, Math.atan2(mx-o[i].x-o[i].origin_x,my-o[i].y-o[i].origin_y)]; return
      }
      if (o[i].hover(mx, my, _, _, .75*o[i].width, .75*o[i].height) && !o[i].action.length) {
        for (var j = 0; j < o.length; j++) o[j].action = [3, mx - o[j].x, my - o[j].y]; return
      }
    }
    room.move = [mx, my]; return
  }
  for (var i = 0, o = room.objects.e; i < o.length; i++) o[i].active = 0; room.draw();
  var obj = {
    name: 'obj' + room.objects.pos, active: 0, action: [],
    sprite: room.sprites.e[-1], origin_x: 0, origin_y: 0, image_angle: 0, width: 32, height: 32,
    x: Math.floor(mx/room.gridX) * room.gridX, y: Math.floor(my/room.gridY) * room.gridY,
    ang: function() {return -this.image_angle*RAD},
    hover: function(mx,my,x,y,w,h) {
      x = x||0; y = y||0; w = w||this.width; h = h||this.height;
      var a = Math.sqrt(Math.pow(mx-this.x-this.origin_x,2) + Math.pow(my-this.y-this.origin_y,2)),
        t = Math.atan2(mx-this.x-this.origin_x, my-this.y-this.origin_y) + this.ang();
      return a*Math.sin(t) > x && a*Math.sin(t) < w && a*Math.cos(t) > y && a*Math.cos(t) < h
    },
    draw: function() {
      room.translate(this.x + this.origin_x, this.y + this.origin_y); room.rotate(this.ang());
      room.drawImage(this.sprite, -this.origin_x, -this.origin_y, this.width, this.height);
      room.rotate(-this.ang()); room.translate(-this.x - this.origin_x, -this.y - this.origin_y)
      if (this.active) {room.strokeStyle = '#0f0'; room.drawBound(this)}
    }
  }
  room.objects.e.push(obj); room.objects.pos++; room.draw()
}

room.canvas.onmouseup = function() {
  room.move = [];
  for (var i = 0, o = room.objects.e; i < o.length; i++) o[i].action = []
}

room.canvas.onmousemove = function(e) {
  var mx = e.clientX - room.canvas.offsetLeft, my = e.clientY - room.canvas.offsetTop;
  if (room.move.length) {
    room.canvas.style.left = e.clientX - room.move[0] + 'px'; room.canvas.style.top = e.clientY - room.move[1] + 'px';
    return
  }
  if (e.shiftKey) {
    for (var o = room.objects.e, i = o.length-1; i >= 0; i--) if (o[i].active && o[i].hover(mx, my)) {
      if (o[i].hover(mx, my, _, .75*o[i].height, .75*o[i].width, _)) {
        room.draw();
        for (var j = 0; j < o.length; j++) if (o[j].active) {
          room.strokeStyle = '#f0f'; room.drawBound(o[j], _, o[j].y+.75*o[j].height, .75*o[j].width, .25*o[j].height);
          room.canvas.classList.add('cur-n-resize')
        }
        break
      } else {
        room.canvas.classList.remove('cur-n-resize');
        if (o[i].hover(mx, my, .75*o[i].width, _, _, .75*o[i].height)) {
          room.draw();
          for (var j = 0; j < o.length; j++) if (o[j].active) {
            room.strokeStyle = '#f0f'; room.drawBound(o[j], o[j].x+.75*o[j].width, _, .25*o[j].width, .75*o[j].height);
            room.canvas.classList.add('cur-e-resize')
          }
          break
        } else {
          room.canvas.classList.remove('cur-e-resize');
          if (o[i].hover(mx, my, .75*o[i].width, .75*o[i].height, _, _)) {
            room.draw();
            for (var j = 0; j < o.length; j++) if (o[j].active) {
              room.strokeStyle = '#f0f'; room.beginPath();
              room.arc(room.bound(o[j])[6], room.bound(o[j])[7], .25*Math.min(o[j].width,o[j].height), 0, 2*Math.PI)
              room.stroke(); room.canvas.classList.add('cur-pointer')
            }
            break
          } else {
            room.canvas.classList.remove('cur-pointer');
            if (o[i].hover(mx, my, _, _, .75*o[i].width, .75*o[i].height)) {
              room.draw();
              for (var j = 0; j < o.length; j++) if (o[j].active) {
                room.strokeStyle = '#f0f'; room.drawBound(o[j], _, _, .75*o[j].width, .75*o[j].height)
              }
              break
            }
          }
        }
      }
    } else {room.canvas.classList.remove('cur-pointer', 'cur-n-resize', 'cur-e-resize'); room.draw()}
    for (i = 0, o = room.objects.e; i < o.length; i++) {
      if (o[i].action[0] == 0) {
        for (j = 0; j < o.length; j++) if (o[j].active) {o[j].height = Math.floor((my-o[i].action[1])/room.gridY) * room.gridY}
        room.draw(); break
      }
      if (o[i].action[0] == 1) {
        for (j = 0; j < o.length; j++) if (o[j].active) {o[j].width = Math.floor((mx-o[i].action[1])/room.gridX) * room.gridX}
        room.draw(); break
      }
      if (o[i].action[0] == 2) {
        for (j = 0; j < o.length; j++) if (o[j].active) {
          o[j].image_angle = Math.floor((Math.atan2(mx-o[i].x-o[i].origin_x,my-o[i].y-o[i].origin_y)-o[i].action[1])/RAD/room.gridRot) * room.gridRot;
        }
        room.draw(); break
      }
      if (o[i].action[0] == 3) {
        for (j = 0; j < o.length; j++) if (o[j].active) {
          o[j].x = Math.floor((mx-o[j].action[1])/room.gridX) * room.gridX;
          o[j].y = Math.floor((my-o[j].action[2])/room.gridY) * room.gridY
        }
        room.draw()
      }
    }
  }
}

document.onkeydown = function(e) {
  if (e.keyCode == 16 && room.canvas.className.indexOf('cur-grab') == -1) room.canvas.classList.add('cur-grab');
  if (e.keyCode == 65 && e.ctrlKey) {
    for (var i = 0, o = room.objects.e; i < o.length; i++) o[i].active = true; room.draw(); return false
  }
}
document.onkeyup = function(e) {
  if (e.keyCode == 16) {room.canvas.classList.remove('cur-grab', 'cur-e-resize', 'cur-n-resize'); room.draw()}
}

document.onmousemove = function(e) {
  if (grid.drag.length) {
    grid.style.left = e.clientX - grid.drag[0] + 'px'; grid.style.top = e.clientY - grid.drag[1] + 'px'
  }
}
grid.querySelector('span:first-child').onmousedown = function(e) {
  if (!grid.drag.length) grid.drag = [e.clientX - grid.offsetLeft, e.clientY - grid.offsetTop]
}
grid.querySelector('span:first-child').onmouseup = function(e) {
  grid.drag = []
}
grid.querySelector('span:first-child').ondblclick = function(e) {
  grid.style.display = 'none'
}
grid.querySelector('input').onchange = function() {
  room.gridX = +this.value; room.draw()
}
grid.querySelectorAll('input')[1].onchange = function() {
  room.gridY = +this.value; room.draw()
}
grid.querySelectorAll('input')[2].onchange = function() {
  room.gridRot = +this.value; room.draw()
}
menu.querySelector('div').onclick = function() {
  var menuItself = window.innerHeight - menu.offsetTop - menu.offsetHeight,
    menuBtn = window.innerHeight - menu.querySelector('div').offsetTop - menu.querySelector('div').offsetHeight;
  function move() {
    menuBtn--; menu.querySelector('div').style.bottom = menuBtn + 'px';
    if (menuBtn <= -52) {clearInterval(event); event = setInterval(move2, 1)}
  }
  function move2() {
    menuItself++; menu.style.bottom = menuItself + 'px';
    if (menuItself >= 0) clearInterval(event)
  }
  var event = setInterval(move, 1)
}
menu.querySelector('li:last-child').onclick = function() {
  var menuItself = window.innerHeight - menu.offsetTop - menu.offsetHeight,
    menuBtn = window.innerHeight - menu.querySelector('div').offsetTop - menu.querySelector('div').offsetHeight;
  function move() {
    menuItself --; menu.style.bottom = menuItself + 'px';
    if (menuItself <= -52) {clearInterval(event); setTimeout(function() {event = setInterval(move2, 1)}, 1000)}
  }
  function move2() {
    menuBtn++; menu.querySelector('div').style.bottom = menuBtn + 'px';
    if (menuBtn >= 0) clearInterval(event)
  }
  var event = setInterval(move, 1)
}
