var Point2D = {
	create: function(x, y) {
		return = {
			x: x,
			y: y,
			add: function(otherPoint) {
				return Point2D.create(this.x + otherPoint.x, this.y + otherPoint.y);
			},
			sub: function(otherPoint) {
				return Point2D.create(this.x - otherPoint.x, this.y - otherPoint.y);
			}
		}
	}
}