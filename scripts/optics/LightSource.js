var LightSourceFactory = {
	create: function(pos, dir){
		return {
			pos: pos,
			dir: dir,
			paint: function(ctx){
				ctx.fillStyle = '#FFFF00';
				ctx.beginPath();
				ctx.arc(this.pos.x, this.pos.y, 10, 0, 2 * Math.PI);
				ctx.fill();
			},
			paintRay: function(ctx){
				currentPosition = this.pos.copy();
				ctx.strokeStyle = '#FFFF00';
				var distanceTravelled = 0;
				var tempDir = this.dir.copy();
				while (currentPosition.isOnScreen() && distanceTravelled < 1000){
					// As you go, don't quantize the currentPosition! We need it to be as accurate as possible.
					var newPosition = currentPosition.add(tempDir.lengthOf(4));
					
					// Update the direction if needed
					for (opticIndex in optics){
						var optic = optics[opticIndex];
						if (optic.isInOptic(newPosition) || optic.isInOptic(currentPosition)){
							var rho1 = currentPosition.distanceTo(optic.pos);
							var rho2 = newPosition.distanceTo(optic.pos);
							// Compute indices of refraction
							var n1 = optic.nOfRho(rho1);
							var n2 = optic.nOfRho(rho2);
							// Update the direction
							var norm = optic.normAt(currentPosition);
							var tan = optic.tanAt(currentPosition);
							var dirOnNorm = tempDir.projOn(norm);
							var dir1OnTan = tempDir.projOn(tan);
							var sinOfIncidentAngle = n1 / n2 * dir1OnTan.mag() / tempDir.mag();
							// Check if incident angle exceeds critical angle
							if (optic.nOfRho(rho1) > optic.nOfRho(rho2)){
								var criticalAngle = Math.asin(n2 / n1);
								var incidentAngle = Math.asin(sinOfIncidentAngle);
								if (incidentAngle > criticalAngle){
									tempDir = tempDir.sub(dirOnNorm.scale(2)); // Total internal reflection
									break;
								}
							}
							var tanOfIncidentAngle = sinOfIncidentAngle / Math.sqrt(1 - Math.pow(sinOfIncidentAngle, 2));
							if (isNaN(tanOfIncidentAngle)){ // Then the angle of incidence was 90 degrees
								tempDir = dir1OnTan;
								break;
							}
							var dir2OnTanMag = dirOnNorm.mag() * tanOfIncidentAngle;
							tempDir = dirOnNorm.add(dir1OnTan.lengthOf(dir2OnTanMag));
							break; // Currently, we assume no overlap of any optics with each other
						}
					}
					// Paint a line for the progress
					ctx.beginPath();
					ctx.moveTo(currentPosition.x, currentPosition.y);
					ctx.lineTo(newPosition.x, newPosition.y);
					ctx.stroke();
					// Update the current position
					currentPosition = newPosition.copy();
					
					distanceTravelled++;
				}
			}
		}
	}
}