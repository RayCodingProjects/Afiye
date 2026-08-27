(function(){
  var stage = document.getElementById('stage');
  var tag = document.getElementById('tag3d');
  var shadow = document.getElementById('stageShadow');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    tag.style.transform = 'rotateY(-22deg) rotateX(4deg)';
    return;
  }

  var baseAngle = -24;   // continuous slow turntable rotation
  var tiltX = 0, tiltY = 0;
  var targetTiltX = 0, targetTiltY = 0;
  var hovering = false;
  var speed = 0.05;      // degrees per frame, slow and deliberate

  function onMove(e){
    var rect = stage.getBoundingClientRect();
    var relX = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 .. 0.5
    var relY = (e.clientY - rect.top) / rect.height - 0.5;
    targetTiltY = relX * 50;   // left/right mouse movement -> extra yaw
    targetTiltX = relY * -18;  // up/down mouse movement -> pitch
  }

  stage.addEventListener('pointerenter', function(){ hovering = true; });
  stage.addEventListener('pointermove', onMove);
  stage.addEventListener('pointerleave', function(){
    hovering = false;
    targetTiltX = 0;
    targetTiltY = 0;
  });

  function frame(){
    if (!hovering) {
      baseAngle += speed;
    }
    tiltX += (targetTiltX - tiltX) * 0.08;
    tiltY += (targetTiltY - tiltY) * 0.08;

    var totalY = baseAngle + tiltY;
    var totalX = 4 + tiltX;

    tag.style.transform = 'rotateY(' + totalY + 'deg) rotateX(' + totalX + 'deg)';

    var rad = totalY * Math.PI / 180;
    var squeeze = 1 - Math.abs(Math.sin(rad)) * 0.22;
    shadow.style.transform = 'scaleX(' + squeeze + ')';

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
