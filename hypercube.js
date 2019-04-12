
//----------------------------------------------------------------------------------------------------
// Vector Object
//----------------------------------------------------------------------------------------------------
var V = {
	create: function(x, y, z){
		return {
			x: x,
			y: y,
			z: z,
			mag: function(){ return Math.sqrt(x*x + y*y + z*z); },
			add: function(b){ return V.create(this.x + b.x, this.y + b.y, this.z + b.z); },
			sub: function(b){ return V.create(this.x - b.x, this.y - b.y, this.z - b.z); },
			scale: function(c){ return V.create(this.x * c, this.y * c, this.z * c); },
			unit: function(){ return this.scale(1 / this.mag()); },
			lengthOf: function(c){ return this.unit().scale(c); },
			print: function(){ return ('<' + this.x + ',' + this.y + ',' + this.z + '>'); },
			DP: function(b){ return this.x * b.x + this.y * b.y + this.z * b.z; },
			CP: function(b){ return V.create(this.y * b.z - this.z * b.y, this.z * b.x - this.x * b.z, this.x * b.y - this.y * b.x); },
			dist: function(b){ return b.sub(this).mag(); },
			angle: function(b){ return Math.acos(this.DP(b) / this.mag() / b.mag()); },
			projOn: function(b){ return b.scale(this.DP(b) / b.mag() / b.mag()); },
			r3D: function(rotationAxisPoint, rotationAxisDirection, rotationAngle){
				var v = this.sub(rotationAxisPoint);
				var P = v.sub(v.projOn(rotationAxisDirection));
				if (P.mag() < 0.0001){ return this; }
				else{
					var v2 = P.scale(Math.cos(rotationAngle)).add(rotationAxisDirection.unit().CP(P).scale(Math.sin(rotationAngle)));
					var answer = v.projOn(rotationAxisDirection).add(v2).add(rotationAxisPoint);
					return V.create(answer.x, answer.y, answer.z);
				}
			},
			t3D: function(direction, distance){if (direction.mag() == 0){ return this; } return this.add(direction.lengthOf(distance)); },
			pixels: function(){
				var localX = this.x / (yob - this.y) * yob;
				var localY = this.z / (yob - this.y) * yob;
				var XMax = yob * Math.sin(XFOVangle / 2);
				var YMax = yob * Math.sin(YFOVangle / 2);
				return {x: c.width * (localX / XMax / 2 + 0.5), y: c.height * (-localY / YMax / 2 + 0.5) };
			},
			midWith: function(b){ return this.add(b.sub(this).scale(0.5)); },
			toLine: function(lineStart, lineDir){ return this.sub(lineStart).sub(this.sub(lineStart).projOn(lineDir)); },
			proj4Dto3D: function(a, q){
				
			}
		}
	}
}
//----------------------------------------------------------------------------------------------------
// Surface Object
//----------------------------------------------------------------------------------------------------
var Surface = {
	create: function(){
		return {
			vertices: []
		}
	}
}


function generate4DHypercube(s){
	
	var surfaces = []; // Array of all 2D faces. A surface contains 4 Vectors

	for (var i = 0; i < 3; i++){
		for (var j = i + 1; j < 4; j++){
			// i and j are the slow varing components.
			for (var k = 0; k < 3; k++){
				for (var l = k + 1; l < 4; l++){
					if (i != j && j != k && k != l && i != k && i != l && j != l){
						for (var w = 0; w < 2; w++){
							for (var x = 0; x < 2; x++){
								var surface = Surface.create();
								for (var y = 0; y < 2; y++){
									for (var z = 0; z < 2; z++){
										var v = {w * s, x * s, y * s, z * s};
										var vertexToAdd = V.create(v[i], v[j], v[k], v[l]);
									}
								}
								surfaces.push(surface);
							}
						}
					}
				}
			}
		}
	}
	
	return surfaces;
	
}