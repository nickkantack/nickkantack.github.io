/*

DEPENDENCIES----------------------
Physics.js has VectorSpace.js dependencies.

*/
function biotSavartIntegrand(differentialWireLocation, differentialWireDirection, currentMagnitude, testPoint, permeability){
	
	/*
	This function takes input 3 dimensional vectors for differentialWireLocation, differentialWireDirection, and testPoint.
	currentMagnitude and permeability are scalars and are not differential in size.
	
	differntialWireDirection should have a scale corresponding to the desired length of the approximate differential.
	*/
	if (areSame(testPoint, differentialWireLocation)){return [0, 0, 0];}
	/*
	alert(
	'differentialWireLocation: ' + differentialWireLocation +
	'\ndifferentialWireDirection: ' + differentialWireDirection +
	'\ncurrentMagnitude: ' + currentMagnitude +
	'\ntestPoint: ' + testPoint + 
	'\npermeability: ' + permeability +
	'\n and result: ' + scale(CP(differentialWireDirection, sub(testPoint, differentialWireLocation)), permeability / 4 / Math.PI * currentMagnitude / Math.pow(mag(distance(differentialWireLocation, testPoint)), 3)) +
	'\nCross Product: ' + CP(differentialWireDirection, sub(testPoint, differentialWireLocation)) +
	'\nScale factor: ' + permeability / 4 / Math.PI * currentMagnitude / Math.pow(mag(distance(differentialWireLocation, testPoint)), 3) +
	'\ndistance: ' + distance(differentialWireLocation, testPoint)
	
	
	);
	*/
	
	return scale(CP(differentialWireDirection, sub(testPoint, differentialWireLocation)), permeability / 4 / Math.PI * currentMagnitude / Math.pow(distance(differentialWireLocation, testPoint), 3));
}
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------