function createThing(surfaces, name_in){
	
	/*
	A thing is a group of surfaces with a name. This makes it easy to transform groups of surfaces uniformly
	which is useful when those groups are part of a rigid body.
	*/
	
	var name = name_in || "none";
	var thing = {
		surfaces: surfaces,
		name: name
	}
	return thing;
}
//--------------------------------------------------------------------------
function rotateThing(thing, rotationAxisPoint, rotationAxisVector, angle){
	//Returns a thing which is the input thing rotated according to the input parameters.
	var newSurfaces = [];
	for (var i = 0; i < thing.surfaces.length; i++){
		newSurfaces[i] = rotateSurface(thing.surfaces[i], rotationAxisPoint, rotationAxisVector, angle);
	}
	return createThing(newSurfaces, thing.name);
}
//--------------------------------------------------------------------------
function translateThing(thing, translationVector, distance){
	//Returns a thing which is the input thing translated according to the input parameters
	var newSurfaces = [];
	for (var i = 0; i < thing.surfaces.length; i++){
		newSurfaces[i] = translateSurface(thing.surfaces[i], translationVector, distance);
	}
	return createThing(newSurfaces, thing.name);
}
//--------------------------------------------------------------------------
function thingCentroid(thing){
	//Returns the point that is the average of all of the surface vertices that make up the thing.
	var result = [0, 0, 0];
	var counter = 0;
	for (var i = 0; i < thing.surfaces.length; i++){
		for (var j = 0; j < thing.surfaces[i].vertices.length; j++){
			counter++;
			result = add(result, thing.surfaces[i].vertices[j]);
		}
	}
	result = scale(result, 1 / counter);
	return result;
}
//--------------------------------------------------------------------------
function translateAndRotateThing(thing, translationAxis, translationDistance, rotationAxisPoint, rotationAxisDirection, angle){
	//Returns a thing which is the input thing after the specified transformation.
	thing = rotateThing(thing, rotationAxisPoint, rotationAxisDirection, angle);
	thing = translateThing(thing, translationAxis, translationDistance);
	return thing;
}
//--------------------------------------------------------------------------
function translateAndSpinThingSelfAxis(thing, translationAxis, translationDistance, rotationAxisDirection, angle){
	//This is a variant on translateAndRotateThing that presumes the centroid of the thing is the rotationAxisPoint
	thing = rotateThing(thing, thingCentroid(thing), rotationAxisDirection, angle);
	thing = translateThing(thing, translationAxis, translationDistance);
	return thing;
}
//--------------------------------------------------------------------------
function thingIndex(name){	//Returns the index of the thing in the array things with the input name. A return value of -1 indicates the name wasn't found.
	for (var i = 0; i < things.length; i++){
		if (things[i].name == name){
			return i;
		}
	}
	return -1;
}
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------