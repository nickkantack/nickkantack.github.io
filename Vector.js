var VectorFactory = {
	create: function(x, y){
		return{
			x: x,
			y: y,
			copy: function(){
				return VectorFactory.create(x, y);
			},
			isOnScreen: function(){
				if (this.x > canvas.width){
					return false;
				}
				if (this.x < 0){
					return false;
				}
				if (this.y > canvas.height){
					return false;
				}
				if (this.y < 0){
					return false;
				}
				return true;
			},
			add: function(b){
				return VectorFactory.create(this.x + b.x, this.y + b.y);
			},
			sub: function(b){
				return VectorFactory.create(this.x - b.x, this.y - b.y);
			},
			scale: function(c){
				return VectorFactory.create(this.x * c, this.y * c);
			},
			mag: function(){ // Includes addition of 0.01 to suppress zero mags
				return Math.sqrt(this.x * this.x + this.y * this.y + 0.00001);
			},
			magSq: function(){ // Includes addition of 0.01 to suppress zero mags
				return this.x * this.x + this.y * this.y + 0.00001;
			},
			distanceTo: function(b){
				return this.sub(b).mag();
			},
			unit: function(){
				return this.scale(1/this.mag());
			},
			lengthOf: function(c){
				return this.scale(c / this.mag());
			},
			DP: function(b){
				return this.x * b.x + this.y * b.y;
			},
			projOn: function(b){
				return b.scale(this.DP(b)/b.magSq());
			},
			angleWith: function(b){
				return Math.acos(this.DP(b) / this.mag() / b.mag());
			},
			asString: function(){
				return '<' + this.x + ', ' + this.y + '>\n';
			}
		}
	}
}