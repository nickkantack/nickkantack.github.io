function createSurface(vertices, color){
	
	/*
	A surface is presumed to be a set of coplanar points in cyclical order. Surfaces are the 
	basic building blocks of the 3D environment.
	*/
	
	var surface = {
		vertices: vertices,
		color: color,
	}
	return surface;
}
//--------------------------------------------------------------------------
function paintSurface(ctx, surface, yob, XFOVangle, YFOVangle){
	
	/*
	This method paints the surface based on its projection onto the screen from the 3D environment.
	*/
	var localVertices = copyOf(surface.vertices);
	
	var allHidden = true;	//This remains true if all the vertices of the surface are hidden from view.
	
	//Check if any vertices are in view
	for (var i = 0; i < surface.vertices.length; i++){
		var coordinates = getXYProjection(surface.vertices[i], yob, XFOVangle, YFOVangle);
		if (surface.vertices[i][1] < yob && coordinates[0] > 0 && coordinates[0] < 1 && coordinates[1] > 0 && coordinates[1] < 1){//Then this vertex is visible since a vertex is visible
			allHidden = false;
		}
		
		if (!allHidden && surface.vertices[i][1] > yob){
			localVertices[i][1] = 0.99 * yob;
		}
	}
	
	//Check if any surface boundaries intersect the vision cone
	var observer = [0, yob, 0];
	if(allHidden){
		for (var i = 0; i < 4; i++){
			var normal = [];
			var planePoint = [];
			switch(i){
				case 0:
					normal = [-yob, -yob * Math.sin(XFOVangle / 2), 0];
					planePoint = [yob * Math.sin(XFOVangle / 2), 0, 0];
				break;
				case 1:
					normal = [yob, -yob * Math.sin(XFOVangle / 2), 0];
					planePoint = [-yob * Math.sin(XFOVangle / 2), 0, 0];
				break;
				case 2:
					normal = [0, -yob * Math.sin(YFOVangle / 2), -yob];
					planePoint = [0, 0, yob * Math.sin(YFOVangle / 2)];
				break;
				case 3:
					normal = [0, -yob * Math.sin(YFOVangle / 2), yob];
					planePoint = [0, 0, -yob * Math.sin(YFOVangle / 2)];
				break;
			}
			var intersection = linePlaneIntersection(observer, sub(planePoint, observer), normal, planePoint);
			if (pointPenetratesSurfaceVertices(intersection, surface.vertices) && intersection < yob){allHidden = false;}
		}
	}
	
	var coordinates = getXYProjection(localVertices[0], yob, XFOVangle, YFOVangle);
	
	if (!allHidden){
		
			//Adjust out of view points
		for (var i = 0; i < coordinates.length; i++){
			if (localVertices[1] > yob){
				localVertices[1] = 0.99 * yob;
			}
		}
		//Now paint the coordinates
		var c = document.getElementById("graph");
		var maxLightToMinRatio = 10;
		var RGB = scale(hexTorgb(surface.color), (1 + (maxLightToMinRatio - 1) / 2 + (maxLightToMinRatio - 1) / 2 * getLightFactor(surface)) / maxLightToMinRatio);
		RGB[0] = parseInt(RGB[0]);
		RGB[1] = parseInt(RGB[1]);
		RGB[2] = parseInt(RGB[2]);
		ctx.fillStyle = rgbToHex(RGB);
		ctx.beginPath();
		ctx.moveTo(coordinates[0] * c.width, coordinates[1] * c.height);
		for (var i = 0; i < surface.vertices.length; i++){
			var coordinates2 = getXYProjection(localVertices[i], yob, XFOVangle, YFOVangle);
			ctx.lineTo(coordinates2[0] * c.width, coordinates2[1] * c.height);
		}
		ctx.lineTo(coordinates[0] * c.width, coordinates[1] * c.height);
		ctx.closePath();
		ctx.fill();
	}
	
}
//--------------------------------------------------------------------------
function getLightFactor(surface){
	var lightVector = [-1, -1, 0];
	return DP(unit(surfaceNormalVector(surface.vertices)), unit(lightVector));
}
//--------------------------------------------------------------------------
function getSurfaceDepth(surface){
	
	var depth = -999999;
	for (var i = 0; i < surface.vertices.length; i++){
		if (depth < surface.vertices[i][1]){depth = surface.vertices[i][1];}
	}
	
	var ob = [0, yob, 0];
	var tieBreak = Math.abs(DP(unit(surfaceNormalVector(surface.vertices)), ob));
		
	return (depth + 0.01 * tieBreak);
}
//--------------------------------------------------------------------------
function surfaceNormalVector(vertices){
	return CP(sub(vertices[2], vertices[0]), sub(vertices[1], vertices[0]));
}
//--------------------------------------------------------------------------
function pointIsInOrNearVisionCone(point, yob, XFOVangle, YFOVangle){
	if (point[1] > yob){return false;}
	if (Math.abs(point[0]) > 1.1 * yob * Math.sin(XFOVangle / 2)){return false;}
	if (Math.abs(point[2]) > 1.1 * yob * Math.sin(YFOVangle / 2)){return false;}
	return true;
}
//--------------------------------------------------------------------------
function rgbToHex(rgbArray){
	var redString = rgbArray[0].toString(16);
	var greenString = rgbArray[1].toString(16);
	var blueString = rgbArray[2].toString(16);
	if (redString.length == 1){redString = "0" + redString;}
	if (greenString.length == 1){greenString = "0" + greenString;}
	if (blueString.length == 1){blueString = "0" + blueString;}
	return "#" + redString + "" + greenString + "" + blueString;
}
//--------------------------------------------------------------------------
function hexTorgb(hex){
	return [parseInt(hex.substring(1, 3), 16), parseInt(hex.substring(3, 5), 16), parseInt(hex.substring(5, 7), 16)];
}
//--------------------------------------------------------------------------
function rotateSurface(surface, rotationAxisPoint, rotationAxisVector, angle){
	var newVertices = [];
	for (var i = 0; i < surface.vertices.length; i++){
		newVertices[i] = rotate3D(surface.vertices[i], rotationAxisPoint, rotationAxisVector, angle);
	}
	return createSurface(newVertices, surface.color);
}
//--------------------------------------------------------------------------
function translateSurface(surface, translationVector, distance){
	var newVertices =[];
	for (var i = 0; i < surface.vertices.length; i++){
		newVertices[i] = add(surface.vertices[i], scale(unit(translationVector), distance));
	}
	return createSurface(newVertices, surface.color);
}
//--------------------------------------------------------------------------
function aIsInFrontOfB(A, B){
	/*
	Surface A is definitely overlapping surface B to some extent if any of the following are true:
	1) The ray from the observer to any vertex of surface B intersects surface A before reaching the surface B vertex.
	2) The ray from the observer to any vertex of surface A intersects surface B after reaching the surface A vertex.
	3) Surface A and B share a boundary and the ray from the observer to a point on surface B near the boundary intersects surface A before reaching the surface B point near the boundary.
	*/
	var observer = [0, yob, 0];
	
	//Testing criterion 3. Check for shared boundaries.
	var AinteriorPoint = [];
	var BinteriorPoint = [];
	for (var i = 0; i < A.vertices.length; i++){
		var A1 = i;	//This index maps to a vertex on the boundary.
		var A2 = i + 1;	//This index maps to a vertex on the boundary.
		var A3 = i + 2;	//Grab a third point on the surface to help move inward from the boundary to obtain test points mentioned in criterion 3.
		if (A2 == A.vertices.length){A2 = 0;}
		if (A3 == A.vertices.length){A3 = 0;}
		if (A3 == A.vertices.length + 1){A3 = 1;}
		for (var j = 0; j < B.vertices.length; j++){
			var B1 = j;	//This index maps to a vertex on the boundary.
			var B2 = j + 1;	//This index maps to a vertex on the boundary.
			var B3 = j + 2;	//Grab a third point on the surface to help move inward from the boundary to obtain test points mentioned in criterion 3.
			if (B2 == B.vertices.length){B2 = 0;}
			if (B3 == B.vertices.length){B3 = 0;}
			if (B3 == B.vertices.length + 1){B3 = 1;}
			if ((areSame(A.vertices[A1], B.vertices[B1]) && areSame(A.vertices[A2], B.vertices[B2])) || (areSame(A.vertices[A1], B.vertices[B2]) && areSame(A.vertices[A2], B.vertices[B1]))){
				//Then the boundary is shared
				AinteriorPoint = add(midPoint(A.vertices[A1], A.vertices[A2]), scale(unit(sub(A.vertices[A3], A.vertices[A2])), 0.0001));
				BinteriorPoint = add(midPoint(B.vertices[B1], B.vertices[B2]), scale(unit(sub(B.vertices[B3], B.vertices[B2])), 0.0001));
				//Test for A
				var lineToAVertex = sub(AinteriorPoint, observer);
				var BplaneIntersection = linePlaneIntersection(observer, lineToAVertex, surfaceNormalVector(B.vertices), B.vertices[0]);
				if (pointPenetratesSurfaceVertices(BplaneIntersection, B.vertices)){	//Then the ray from the observer to the AinteriorPoint intersects surface B
					if ((distance(observer, AinteriorPoint) - distance(observer, BplaneIntersection)) > 0.000001 && //Then the AinteriorPoint is further than the intersection of surface B
					distance(AinteriorPoint, BplaneIntersection) > 0.000001 &&	//Then the AinteriorPoint and intersection of surface B are not too close together (this ensures they are different points)
					distance(observer, BplaneIntersection) > 1){	//Then the intersection point is not too close to the observer
						/* B is definitely in front of A.*/return false;}
				}
				//Test for B
				var lineToBVertex = sub(BinteriorPoint, observer);
				var AplaneIntersection = linePlaneIntersection(observer, lineToBVertex, surfaceNormalVector(A.vertices), A.vertices[0]);
				if (pointPenetratesSurfaceVertices(AplaneIntersection, A.vertices)){
					if ((distance(observer, BinteriorPoint) - distance(observer, AplaneIntersection)) < 0.000001 &&
					distance(BinteriorPoint, AplaneIntersection) > 0.000001 &&
					distance(observer, AplaneIntersection) > 1){
						/*B is definitely in front of A.*/return false;}
				}
			}
		}
	}
	
	//Testing criterion 2. Checking surface A vertices.
	for (var i = 0; i < A.vertices.length; i++){
		var lineToAVertex = sub(A.vertices[i], observer);
		var BplaneIntersection = linePlaneIntersection(observer, lineToAVertex, surfaceNormalVector(B.vertices), B.vertices[0]);
		if (pointPenetratesSurfaceVertices(BplaneIntersection, B.vertices)){
			if ((distance(observer, A.vertices[i]) - distance(observer, BplaneIntersection)) > 0.000001 && 
			distance(A.vertices[i], BplaneIntersection) > 0.000001 &&
			distance(observer, BplaneIntersection) > 1){
				/*B is definitely in front of A.*/return false;}
		}
	}
	
	//Testing criterion 1. Checking surface B vertices.
	for (var i = 0; i < B.vertices.length; i++){
		var lineToBVertex = sub(B.vertices[i], observer);
		var AplaneIntersection = linePlaneIntersection(observer, lineToBVertex, surfaceNormalVector(A.vertices), A.vertices[0]);
		if (pointPenetratesSurfaceVertices(AplaneIntersection, A.vertices)){
			if ((distance(observer, B.vertices[i]) - distance(observer, AplaneIntersection)) < 0.000001 &&
			distance(B.vertices[i], AplaneIntersection) > 0.000001 &&
			distance(observer, AplaneIntersection) > 1){
				/*B is definitely in front of A.*/return false;}
		}
	}
	
	//If we make it here, B is not definitely in front of A, so it is ok for B to follow A in our surface painting list.
	return true;
}
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------