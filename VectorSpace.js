function alertVector(vector){//Prints all of the components of the input vector in series in an alert box. Dimension must be greater than 1.
	if (vector.length < 2){alert(vector + " does not appear to be a vector. This function expects a vector of at least 2 components."); return null;}
	var result = "<";	
	for (var i = 0; i < vector.length; i++){result += vector[i] + ", ";}
	result = result.substring(0, result.length - 2);
	result += ">";
	alert(result);
}
//--------------------------------------------------------------------------
function mag(vector){//Returns the length of the input vector. Dimension must be greater than 1.
	if (vector.length < 2){alert(vector + " does not appear to be a vector. This function expects a vector of at least 2 components.");return null;}
	var result = 0;
	for (var i =0; i < vector.length; i++){result += Math.pow(vector[i], 2);}
	result = Math.sqrt(result);
	return result;
}
//--------------------------------------------------------------------------
function scale(vector, factor){//Returns the input vector scaled by the input factor. Dimension must be greater than 1.
	if (vector.length < 2){alert(vector + " does not appear to be a vector. This function expects a vector of at least 2 components.");return null;}
	var result = [0, 0, 0];
	for (var i = 0; i < vector.length; i++){result[i] = factor * vector[i];}
	return result;
}
//--------------------------------------------------------------------------
function unit(vector){//Returns the unit vector in the direction of the input vector. Dimension must be greater than 1.
	if (vector.length < 2){alert(vector + " does not appear to be a vector. This function expects a vector of at least 2 components.");return null;}
	var magnitude = mag(vector);
	var result = [];
	for (var i = 0; i < vector.length; i++){result[i] = vector[i] / magnitude;}
	return result;
}
//--------------------------------------------------------------------------
function add(vector1, vector2){//Returns the vector sum of the two input vectors. Dimension must be equal between vectors and greater than 1.
	if (vector1.length < 2){alert(vector1 + " does not appear to be a vector. This function expects a vector of at least 2 components.");return null;}
	if (vector2.length < 2){alert(vector2 + " does not appear to be a vector. This function expects a vector of at least 2 components.");return null;}
	if (vector1.length != vector2.length){alert("Input vectors are not the same dimension. This function requires vectors of equal dimension.");return null;}
	var result = [];
	for (var i = 0; i < vector1.length; i++){result[i] = vector1[i] + vector2[i];}
	return result;
}
//--------------------------------------------------------------------------
function distance(vector1, vector2){//Returns the magnitude of the difference between the two input vectors. Dimensions must be equal between vectors and greater than 1.
	if (vector1.length < 2){alert(vector1 + " does not appear to be a vector. This function expects a vector of at least 2 components.");return null;}
	if (vector2.length < 2){alert(vector2 + " does not appear to be a vector. This function expects a vector of at least 2 components.");return null;}
	if (vector1.length != vector2.length){alert("Input vectors are not the same dimension. This function requires vectors of equal dimension.");return null;}
	return mag(sub(vector1, vector2));
}
//--------------------------------------------------------------------------
function sub(vector1, vector2){//Returns the vector difference (vector1 - vector2) of the two input vectors. Dimensions must be equal between vectors and greater than 1.
	if (vector1.length < 2){alert(vector1 + " does not appear to be a vector. This function expects a vector of at least 2 components.");return null;}
	if (vector2.length < 2){alert(vector2 + " does not appear to be a vector. This function expects a vector of at least 2 components.");return null;}
	if (vector1.length != vector2.length){alert("Input vectors are not the same dimension. This function requires vectors of equal dimension.");return null;}
	var result = [];
	for(var i = 0; i < vector1.length; i++){result[i] = vector1[i] - vector2[i];}
	return result;
}
//--------------------------------------------------------------------------
function DP(vector1, vector2){//Returns the dot product of the input vectors. Dimensions must be equal between vectors and greater than 1.
	if (vector1.length < 2){alert(vector1 + " does not appear to be a vector. This function expects a vector of at least 2 components.");return null;}
	if (vector2.length < 2){alert(vector2 + " does not appear to be a vector. This function expects a vector of at least 2 components.");return null;}
	if (vector1.length != vector2.length){alert("Input vectors are not the same dimension. This function requires vectors of equal dimension.");return null;}
	var result = 0;
	for (var i = 0; i < vector1.length; i++){result += vector1[i] * vector2[i];}
	return result;
}
//--------------------------------------------------------------------------
function CP(vector1, vector2){//Returns the cross product (vector1 cross vector2) magnitude of two dimensional input vectors or the cross product vector of three dimensional input vectors.
	//Dimensions must be equal between vectors and either 2 or 3.
	if (!(vector1.length == 2 || vector1.length == 3)){alert(vector1 + " does not appear to be a vector. This function expects a vector of 2 or 3 components.");return null;}
	if (!(vector2.length == 2 || vector2.length == 3)){alert(vector2 + " does not appear to be a vector. This function expects a vector of 2 or 3 components.");return null;}
	if (vector1.length != vector2.length){alert("Input vectors are not the same dimension. This function requires vectors of equal dimension.");return null;}
	switch (vector1.length){
		case 2:
			return vector1[0] * vector2[1] - vector1[1] * vector2[0];
		break;
		case 3:
			var result = [0, 0, 0];
			result[0] = vector1[1] * vector2[2] - vector2[1] * vector1[2];
			result[1] = vector1[2] * vector2[0] - vector2[2] * vector1[0];
			result[2] = vector1[0] * vector2[1] - vector2[0] * vector1[1];
			return result;
		break;
	}
}
//--------------------------------------------------------------------------
function angleBetween(vector1, vector2){//Returns the smallest angle (in radians) between vector1 and vector2. Dimensions must be equal between vectors and greater than 1.
	if (vector1.length < 2){alert(vector1 + " does not appear to be a vector. This function expects a vector of at least 2 components.");return null;}
	if (vector2.length < 2){alert(vector2 + " does not appear to be a vector. This function expects a vector of at least 2 components.");return null;}
	if (vector1.length != vector2.length){alert("Input vectors are not the same dimension. This function requires vectors of equal dimension.");return null;}
	return Math.acos(DP(vector1, vector2) / (mag(vector1) * mag(vector2)));
}
//--------------------------------------------------------------------------
function projAonB(vector1, vector2){//Returns the vector of vector1 projected onto vector2. Dimensions must be equal between vectors and greater than 1.
	if (mag(vector2) == 0){return [0, 0, 0]}//This can happen if rotate3D is used on a vector that is on the rotational axis (in which case no rotation is needed.
	return scale(vector2, DP(vector1, vector2) / Math.pow(mag(vector2), 2));
}
//--------------------------------------------------------------------------
function rotate3D(vector2Rotate, rotationAxisPoint, rotationAxisDirection, rotationAngle){
	//Returns vector2Rotate rotated by rotationAngle (radians) about the axis defined by rotationAxisPoint and rotationAxisDirection. All vectors must be 3 dimensional.
	if (!(vector2Rotate.length == 3 && rotationAxisPoint.length == 3 && rotationAxisDirection.length == 3)
	){alert("Input vectors are not all 3 dimensional. All input vectors must be 3 dimensional.");return null;}
	var v = sub(vector2Rotate, rotationAxisPoint);
	var P = sub(v, projAonB(v, rotationAxisDirection));
	if (mag(P) < 0.0001){
		return vector2Rotate;
	}
	else{
		var v2 = add(scale(P, Math.cos(rotationAngle)), scale(CP(rotationAxisDirection, P), Math.sin(rotationAngle) * mag(P) / mag(CP(rotationAxisDirection, P))));
		//alert('vector2Rotate: ' + vector2Rotate + '\nrotationAxisPoint: ' + rotationAxisPoint + '\nrotationAxisDirection: ' + rotationAxisDirection + '\nv is '+v +
		//'\nP: '+P+'\nv2: '+v2+'\nfinal result:'+add(projAonB(v, rotationAxisDirection), add(v2, rotationAxisPoint)));
		return add(projAonB(v, rotationAxisDirection), add(v2, rotationAxisPoint));
	}
}
//--------------------------------------------------------------------------
function translateVector(vector, componentIndex, increment){//Returns the vector with the component at componentIndex incremented by increment. Dimension must be greater than 1.
	if (vector.length < 2){alert(vector + " does not appear to be a vector. This function expects a vector of at least 2 components.");return null;}
	if (vector.length <= componentIndex){alert("Vector is too small to have a component at " + componentIndex);return null;}
	var result = [];
	for (var i = 0; i < vector.length; i++){
		if (i == componentIndex){result[i] = vector[i] + increment;}
		else{result[i] = vector[i]}
	}
	return result;
}
//--------------------------------------------------------------------------
function nearestPointOnLine(refPoint, lineDirectionVector, pointOnLine){//Returns 3D vector of point on line nearest to refPoint. Input vectors must all be 3 dimensional.
	if (!(refPoint.length == 3 && lineDirectionVector.length == 3 && pointOnLine.length == 3)
	){alert("Input vectors are not all 3 dimensional. All input vectors must be 3 dimensional.");return null;}
	return add(pointOnLine, projAonB(sub(refPoint, lineDirectionVector), lineDirectionVector));
}
//--------------------------------------------------------------------------
function getXYProjection(coordinates, yob, XFOVangle, YFOVangle){
	
	/*
	coordinates is a 3 dimensional coordinate. The observer is at <0, yob, 0> (using <x, y, z> convention).
	The observer is looking in the <0, -1, 0> direction. xFOVangle and yFOVangle are the angular field of view
	limits for the observer (XFOV is horizontal and YFOV is vertical). yob is the distance between the observer
	and the y=0 plane (it is relevant for object size scaling (making a 3m wide cube actually look like a 3m
	wide cube for a given FOV configuration).
	
	This function returns a vector of two parameters:
	result[0] -> the percent of the viewport's width that should appear to the left of the point (in css, the left percentage)
	result[1] -> the percent of the viewport's height that should appear above the point (in css, the top percentage)
	
	*/
	
	var localX = coordinates[0] / (yob - coordinates[1]) * yob;
	var localY = coordinates[2] / (yob - coordinates[1]) * yob;
	
	var XMax = yob * Math.sin(XFOVangle / 2);
	var YMax = yob * Math.sin(YFOVangle / 2);
	
	var result = [];
	result[0] = (localX / XMax) / 2 + 0.5;
	result[1] = -(localY / YMax) / 2 + 0.5;
	
	return result;
	
}
//--------------------------------------------------------------------------
function asPercentString(fraction){//Returns a string which is the number of percents followed by % that correspond to fraction (fraction is a value between 0 and 1).
	var value = fraction * 100;
	return value + "%";
}
//--------------------------------------------------------------------------
function nearestPointOnPlane(referencePoint, normal, planePoint){
	return sub(referencePoint, projAonB(sub(referencePoint, planePoint), normal));
}
//--------------------------------------------------------------------------
function distanceToPlane(referencePoint, normal, planePoint){
	return mag(sub(referencePoint, nearestPointOnPlane(referencePoint, normal, planePoint)));
}
//--------------------------------------------------------------------------
function linePlaneIntersection(linePoint, lineDirection, normal, planePoint){
	return add(linePoint, scale(unit(lineDirection), distanceToPlane(linePoint, normal, planePoint) / mag(projAonB(unit(sub(nearestPointOnPlane(linePoint, normal, planePoint), linePoint)), lineDirection))));
}
//--------------------------------------------------------------------------
function pointPenetratesSurfaceVertices(point, vertices){
	if (distance(vertices[0], point) == 0){return true;}
	for (var i = 0; i < 3; i++){
		if (distance(vertices[i], point) == 0){return true;}
		if (DP(CP(sub(vertices[0], vertices[3]), sub(point, vertices[3])), CP(sub(vertices[i + 1], vertices[i]), sub(point, vertices[i]))) <= 0){return false;}
	}
	return true;
}
//--------------------------------------------------------------------------
function copyOf(input){
	result = [];
	for (var i = 0; i < input.length; i++){
		var point = [];
		for (var j = 0; j < input[i].length; j++){
			point[j] = input[i][j];
		}
		result[i] = point;
	}
	return result;
}
//--------------------------------------------------------------------------
function areSame(vector1, vector2){
	if (distance(vector1, vector2) == 0){return true;}
	return false;
}
//--------------------------------------------------------------------------
function midPoint(vector1, vector2){
	var result = [];
	for (var i = 0; i < vector1.length; i++){
		result[i] = (vector1[i] + vector2[i]) / 2;
	}
	return result;
}
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
