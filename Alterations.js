function createAlteration(thing, translationVector, translationDistance, rotationAxisPoint, rotationAxisDirection, angle, time, steps, currentStep){
	
	var animator;
	
	var alteration = {
		thing: thing,
		translationVector: translationVector,
		translationDistance: translationDistance,
		rotationAxisPoint: rotationAxisDirection,
		angle: angle,
		time: time,
		steps: steps,
		currentStep: currentStep,
		hover: false,
		animator: animator
		
	}
	
	return alteration;
	
}
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------