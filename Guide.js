var Guide = {
	create: function(name, type, origin, referenceSize, color){
		var guide = {
			name: name,
			type: type,
			origin: origin,
			referenceSize: referenceSize,
			color: color
		}
		return guide;
	},
	//---------------------------------------------------------------------------------------------------
	paint: function(guide, c, ctx, yob, XFOVangle, YFOVangle){
		switch(guide.type){
			case "circle":
				var observer = [0, yob, 0];
				var toLeft = [1, 0, 0];
				var origin = getXYProjection(guide.origin, yob, XFOVangle, YFOVangle);
				var leftSide = getXYProjection(add(guide.origin, scale(toLeft, guide.referenceSize)), yob, XFOVangle, YFOVangle);
				var realRadius = Math.abs(origin[0] - leftSide[0]) * c.width;
				ctx.strokeStyle = guide.color;
				Guide.circle(ctx, realRadius, origin[0] * c.width, origin[1] * c.height);
			break;
		}
	},
	//---------------------------------------------------------------------------------------------------
	rotate: function(guide, axisPoint, axisDirection, angle){
		switch(guide.type){
			case "circle":
				var newOrigin = rotate3D(guide.origin, axisPoint, axisDirection, angle);
				return Guide.create(guide.name, guide.type, newOrigin, guide.referenceSize, guide.color, guide.rank);
			break;
			case 'cube':
				//Rotate each member of the vertices
				var newOrigin = [];
				for (var i = 0; i < guide.origin.length; i++){
					newOrigin[i] = rotate3D(guide.origin[i], axisPoint, axisDirection, angle);
				}
				//Return as new guide
				return Guide.create(guide.name, guide.type, newOrigin, guide.referenceSize, guide.color, guide.rank);
			break;
		}
		return 'COULDN\'T ROTATE';
	},
	//---------------------------------------------------------------------------------------------------
	translate: function(guide, direction, distance){
		switch(guide.type){
			case "circle":
				var newOrigin = add(guide.origin, scale(unit(direction), distance));
				return Guide.create(guide.name, guide.type, newOrigin, guide.referenceSize, guide.color, guide.rank);
			break;
			case 'cube':
				var newOrigin = [];
				for (var i = 0; i < guide.origin.length; i++){
					newOrigin[i] = add(guide.origin[i], scale(unit(direction), distance));
				}
				return Guide.create(guide.name, guide.type, newOrigin, guide.referenceSize, guide.color, guide.rank);
			break;
		}
	},
	//---------------------------------------------------------------------------------------------------
	circle: function circle(ctx, radius, x, y){
		ctx.beginPath();
		ctx.arc(x,y,radius,0,2 * Math.PI);
		ctx.stroke();
	}
}