var CloakSphereFactory = {
	create: function (pos, radius, nOfRho, label){
		return {
			pos: pos,
			nOfRho: nOfRho,
			radius: radius,
			label: label,
			normAt: function(b){
				return b.sub(this.pos).unit();
			},
			tanAt: function(b){
				norm = this.normAt(b);
				return VectorFactory.create(norm.y, -norm.x);
			},
			isInOptic: function(vector){
				if (this.pos.distanceTo(vector) > this.radius){
					return false;
				}
				return true;
			},
			paint: function(ctx){
				// Working from the outside, once the index of refraction is large enough, paint rings
				for (var rho = radius; rho > 0; rho -= 5){
					var localN = this.nOfRho(rho);
					var color = "#000000";
					if (localN < 1){
						color = "rgb(0, " + parseInt((1 - localN) * 255) + ", 0";
					}
					if (localN > 1){
						var blueLevel = parseInt((localN-1) * 100);
						if (blueLevel > 255){
							blueLevel =255;
						}
						color = "rgb(0, 0, " + blueLevel + ")";
					}
					// Now paint the portion of the sphere
					ctx.fillStyle = color;
					ctx.beginPath();
					ctx.arc(this.pos.x, this.pos.y, rho, 0, 2 * Math.PI);
					ctx.fill();
				}
				// Draw an outline
				ctx.strokeStyle = '#FF0000';
				ctx.beginPath();
				ctx.arc(this.pos.x, this.pos.y, radius, 0, 2 * Math.PI);
				ctx.stroke();
				// Draw the label
				ctx.fillStyle = '#FFFFFF';
				ctx.font = '30px Arial';
				ctx.fillText(this.label, this.pos.x - this.radius, this.pos.y + this.radius + 30);
			},
			paintOver: function(ctx){
				// Fill black circle over the whole thing
				ctx.fillStyle = '#000000';
				ctx.beginPath();
				ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI);
				ctx.fill();
				// Write black text over the white text
				ctx.fillStyle = '#000000';
				ctx.font = "15px Arial";
				ctx.fillText(this.label, this.pos - this.radius, this.pos + this.radius);
			}
		}
	}
}