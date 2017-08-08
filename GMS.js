for (var i = 0, e = document.querySelectorAll('.draggable'); i < e.length; i++) e[i].drag = [];
var room = document.querySelector('canvas').getContext('2d'); room.move = []; var RAD = Math.PI/180, _ = undefined;
room.m = document.querySelector('#\\:menu'); room.sr = document.querySelector('#\\:s\\>r'); room.so = document.querySelector('#\\:s\\>o');
room.canvas.width = +room.sr.querySelector('input').value; room.canvas.height = +room.sr.querySelector('input:nth-of-type(2)').value;
room.gridX = +room.sr.querySelector('input:nth-of-type(3)').value;
room.gridY = +room.sr.querySelector('input:nth-of-type(4)').value;
room.gridRot = +room.sr.querySelector('input:nth-of-type(5)').value;
room.canvas.style.left = window.innerWidth/2 - room.canvas.width/2 + 'px';
room.canvas.style.top = window.innerHeight/2 - room.canvas.height/2 + 'px';
room.sprites = {e:[], pos: 0}; room.objects = {e:[], pos:0};
room.font = 'bold 16px Comic Sans MS'; room.textBaseline = 'middle'; room.textAlign = 'center'; room.lineWidth = 2;
room.draw = function() {
  room.fillStyle = '#999'; room.beginPath();
  room.fillRect(0, 0, room.canvas.width, room.canvas.height);
  room.strokeStyle = '#555'; room.lineWidth = 2;
  for (var i = room.gridX; i < room.canvas.width; i += room.gridX) {
    room.moveTo(i, 0); room.lineTo(i, room.canvas.height); room.stroke()
  }
  for (i = room.gridY; i < room.canvas.height; i += room.gridY) {
    room.moveTo(0, i); room.lineTo(room.canvas.width, i); room.stroke()
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
    for (i = 0; i < o.length; i++) o[i].active = 0; room.draw(); return
  }
  if (e.shiftKey) {
    for (var o = room.objects.e, i = o.length-1; i >= 0; i--) if (o[i].active && o[i].hover(mx, my)) {
      if (o[i].hover(mx, my, _, .6*o[i].height, .6*o[i].width, _) && !o[i].action.length) {
        o[i].action = [0, my - o[i].height]; return
      }
      if (o[i].hover(mx, my, .6*o[i].width, _, _, .6*o[i].height) && !o[i].action.length) {
        o[i].action = [1, mx - o[i].width]; return
      }
      if (o[i].hover(mx, my, .6*o[i].width, .6*o[i].height, _, _) && !o[i].action.length) {
        o[i].action = [2, Math.atan2(my-o[i].y-o[i].origin_y,mx-o[i].x-o[i].origin_x)-o[i].ang()]; return
      }
      if (o[i].hover(mx, my, _, _, .6*o[i].width, .6*o[i].height) && !o[i].action.length) {
        for (var j = 0; j < o.length; j++) o[j].action = [3, mx - o[j].x, my - o[j].y]; return
      }
    }
    room.move = [mx, my]; return
  }
  for (var i = 0, o = room.objects.e; i < o.length; i++) o[i].active = 0;
  var obj = {
    name: 'obj' + room.objects.pos, active: 0, action: [],
    sprite: room.sprites.e[-1], origin_x: 0, origin_y: 0, image_angle: 0, width: 32, height: 32,
    x: Math.floor(mx/room.gridX) * room.gridX, y: Math.floor(my/room.gridY) * room.gridY,
    ang: function() {return -this.image_angle*RAD},
    hover: function(mx,my,x,y,w,h) {
      x = x||0; y = y||0; w = w||this.width; h = h||this.height;
      var a = Math.sqrt(Math.pow(mx-this.x-this.origin_x,2) + Math.pow(my-this.y-this.origin_y,2)),
        t = Math.atan2(my-this.y-this.origin_y, mx-this.x-this.origin_x) - this.ang();
      return a*Math.cos(t) > x && a*Math.cos(t) < w && a*Math.sin(t) > y && a*Math.sin(t) < h
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
      room.draw(); room.strokeStyle = '#f0f';
      if (o[i].hover(mx, my, _, .6*o[i].height, .6*o[i].width, _)) {
        room.canvas.classList.add('cur-n-resize');
        room.drawBound(o[i], _, o[i].y+.6*o[i].height, .6*o[i].width, .4*o[i].height);
        break
      } else {
        room.canvas.classList.remove('cur-n-resize');
        if (o[i].hover(mx, my, .6*o[i].width, _, _, .6*o[i].height)) {
          room.canvas.classList.add('cur-e-resize');
          room.drawBound(o[i], o[i].x+.6*o[i].width, _, .4*o[i].width, .6*o[i].height);
          break
        } else {
          room.canvas.classList.remove('cur-e-resize');
          if (o[i].hover(mx, my, .6*o[i].width, .6*o[i].height, _, _)) {
            room.canvas.classList.add('cur-pointer');
            room.drawBound(o[i], o[i].x+.6*o[i].width, o[i].y+.6*o[i].height, .4*o[i].width, .4*o[i].height);
            room.beginPath();
            room.arc(room.bound(o[i])[6], room.bound(o[i])[7], .4*Math.min(o[i].width,o[i].height), o[i].ang()-1, o[i].ang()+2);
            room.stroke(); break
          } else {
            room.canvas.classList.remove('cur-pointer');
            if (o[i].hover(mx, my, _, _, .6*o[i].width, .6*o[i].height)) {
              room.drawBound(o[i], _, _, .6*o[i].width, .6*o[i].height); break
            }
          }
        }
      }
    } else {room.canvas.classList.remove('cur-pointer', 'cur-n-resize', 'cur-e-resize'); room.draw()}
    for (i = 0, o = room.objects.e; i < o.length; i++) {
      if (o[i].action[0] == 0) {
        for (j = 0; j < o.length; j++) if (o[j].active && Math.floor((my-o[i].action[1])/room.gridY) > 0)
          o[j].height = Math.floor((my-o[i].action[1])/room.gridY) * room.gridY;
        room.draw(); break
      }
      if (o[i].action[0] == 1) {
        for (j = 0; j < o.length; j++) if (o[j].active && Math.floor((mx-o[i].action[1])/room.gridX) > 0)
          o[j].width = Math.floor((mx-o[i].action[1])/room.gridX) * room.gridX;
        room.draw(); break
      }
      if (o[i].action[0] == 2) {
        for (j = 0; j < o.length; j++) if (o[j].active) o[j].image_angle = Math.floor(
          (o[i].action[1] - Math.atan2(my-o[i].y-o[i].origin_y,mx-o[i].x-o[i].origin_x)) / RAD/room.gridRot
        ) * room.gridRot;
        room.draw(); room.beginPath(); room.strokeStyle = 'red';
        room.moveTo(o[i].x + o[i].origin_x + 96, o[i].y + o[i].origin_y);
        room.lineTo(o[i].x + o[i].origin_x, o[i].y + o[i].origin_y);
        room.lineTo(o[i].x + o[i].origin_x + 96*Math.cos(o[i].ang()), o[i].y + o[i].origin_y + 96*Math.sin(o[i].ang()));
        room.arc(o[i].x + o[i].origin_x, o[i].y + o[i].origin_y, 32, o[i].ang(), 0);
        room.stroke(); room.beginPath(); room.fillStyle = 'red';
        room.fillText(o[i].image_angle + String.fromCharCode(186), o[i].x + o[i].origin_x + 64*Math.cos(o[i].ang()/2), o[i].y + o[i].origin_y + 64*Math.sin(o[i].ang()/2));
        room.fill(); break
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
    for (var i = 0, o = room.objects.e; i < o.length; i++) o[i].active = 1; room.draw(); return false
  }
  if (e.keyCode == 46) {
    room.objects.e = room.objects.e.filter(function(k) {return !k.active}); room.draw(); return false
  }
}
document.onkeyup = function(e) {
  if (e.keyCode == 16) {room.canvas.classList.remove('cur-grab', 'cur-e-resize', 'cur-n-resize'); room.draw()}
}

document.onmousemove = function(e) {
  for (var i = 0, d = document.querySelectorAll('.draggable'); i < d.length; i++) if (d[i].drag.length) {
    d[i].style.left = e.clientX - d[i].drag[0] + 'px'; d[i].style.top = e.clientY - d[i].drag[1] + 'px'
  }
}
for (var i = 0, d = document.querySelectorAll('.draggable'); i < d.length; i++) {
  d[i].querySelector('span:first-child').onmousedown = function(e,f,g,h,i) {
    var p = this.parentElement; if (!p.drag.length) p.drag = [e.clientX - p.offsetLeft, e.clientY - p.offsetTop]
  }
  d[i].querySelector('span:first-child').onmouseup = function(e) {this.parentElement.drag = []}
  d[i].querySelector('span:first-child').ondblclick = function(e) {this.parentElement.style.display = 'none'}
}
room.sr.querySelector('input').onchange = function() {
  room.canvas.width = +this.value; room.draw()
}
room.sr.querySelector('input:nth-of-type(2)').onchange = function() {
  room.canvas.height = +this.value; room.draw()
}
room.sr.querySelector('input:nth-of-type(3)').onchange = function() {
  room.gridX = +this.value; room.draw()
}
room.sr.querySelector('input:nth-of-type(4)').onchange = function() {
  room.gridY = +this.value; room.draw()
}
room.sr.querySelector('input:nth-of-type(5)').onchange = function() {
  room.gridRot = +this.value; room.draw()
}
room.m.querySelector('div').onclick = function() {
  var menuItself = window.innerHeight - room.m.offsetTop - room.m.offsetHeight,
    menuBtn = window.innerHeight - room.m.querySelector('div').offsetTop - room.m.querySelector('div').offsetHeight;
  function move() {
    menuBtn--; room.m.querySelector('div').style.bottom = menuBtn + 'px';
    if (menuBtn <= -52) {clearInterval(event); event = setInterval(move2, 1)}
  }
  function move2() {
    menuItself++; room.m.style.bottom = menuItself + 'px';
    if (menuItself >= 0) clearInterval(event)
  }
  var event = setInterval(move, 1)
}
room.m.querySelector('li:last-child').onclick = function() {
  var menuItself = window.innerHeight - room.m.offsetTop - room.m.offsetHeight,
    menuBtn = window.innerHeight - room.m.querySelector('div').offsetTop - room.m.querySelector('div').offsetHeight;
  function move() {
    menuItself --; room.m.style.bottom = menuItself + 'px';
    if (menuItself <= -52) {clearInterval(event); setTimeout(function() {event = setInterval(move2, 1)}, 1000)}
  }
  function move2() {
    menuBtn++; room.m.querySelector('div').style.bottom = menuBtn + 'px';
    if (menuBtn >= 0) clearInterval(event)
  }
  if (popup.style.display == 'block') {} else var event = setInterval(move, 1)
}
for (var i = 0, e = room.m.querySelectorAll('li'); i < e.length-1; i++) e[i].onclick = function() {
  popup.style.bottom = this.offsetHeight + 16 + 'px';
  popup.querySelector('div').style.left = this.offsetLeft - this.offsetWidth/2 + 'px';
  if (popup.style.display == 'block') {
    var opa = +popup.style.opacity, heit = popup.offsetHeight;
    function move() {
      if (heit > 0) {heit -= 10; popup.style.height = heit + 'px'}
      if (opa > 0) {opa -= .05; popup.style.opacity = opa}
      else {popup.style.display = 'none'; popup.style.height = '0'; clearInterval(event)}
    }
    var event = setInterval(move, 1)
  } else {
    popup.style.display = 'block'; var opa = +popup.style.opacity, heit = popup.offsetHeight;
    function move() {
      if (opa < 1) {opa += .02; popup.style.opacity = opa}
      if (heit < window.innerHeight*.8) {heit+=10; popup.style.height = heit + 'px'}
      if (opa >= 1 && heit >= window.innerHeight*.8) clearInterval(event)
    }
    var event = setInterval(move, 1)
  }
}