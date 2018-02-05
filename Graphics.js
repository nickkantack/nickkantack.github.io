function animate(index, translationDirection, translationDistance, rotationAxisPoint, rotationAxisDirection, angle, time, steps, currentStep){
	
	/*
	Calling this function initiates the translation and/or rotation animation (specified by the input parameters) on the thing at things[index] (where index is a supplied parameter).
	
	Note: If you specify a translation, it will translate the thing AND the rotationAxisPoint during the course of the animation. This
	is, in my opinion, intuitive and far more likely to be what a programmer wanted. However, if this is not desired, it is easy to create
	a copy of this method that does not translate the rotationAxisPoint (marked below)
	
	*/
	
	currentStep++;
	if (currentStep >= steps){	//Then we are one step away from being done with the animation.
		things[index] = translateAndRotateThing(things[index], translationDirection, translationDistance * (1 - currentStep / steps + 1 / steps), rotationAxisPoint, rotationAxisDirection, angle * (1 - currentStep / steps + 1 / steps));
		rotationAxisPoint = add(rotationAxisPoint, scale(translationDirection, translationDistance * (1 - currentStep / steps + 1 / steps)));	//Remove this if you don't want the rotationAxisPoint to translate
		repaint();
	}
	else{	//Then we are beginning or in the midst of the animation.
		things[index] = translateAndRotateThing(things[index], translationDirection, translationDistance / steps, rotationAxisPoint, rotationAxisDirection, angle / steps);
		rotationAxisPoint = add(rotationAxisPoint, scale(translationDirection, translationDistance / steps));	//Remove this if you don't want the rotationAxisPoint to translate
		repaint();
		setTimeout(function(){	//Schedule the next frame of the animation.
		
			animate(index, translationDirection, translationDistance, rotationAxisPoint, rotationAxisDirection, angle, time, steps, currentStep);
		
		}, time / steps);
	}
}
//--------------------------------------------------------------------------
function repaint(){
	
	/*
	This method paints the view of the 3D enviornment defined by the array things.
	*/
	
	//Get ready to paint
	var c = document.getElementById("graph");
	var ctx = c.getContext("2d");

	//Clear canvas
	ctx.fillStyle = "#FFFDF9";
	ctx.fillRect(0, 0, c.width, c.height);
	allSurfaces = [];
	
	/*
	You can't just paint things and surfaces in any order you like. Some surfaces are blocking your view of others, so you need to paint
	the surfaces in order from least blocking to most blocking. We don't need to group surfaces as things anymore, so we need to do the following
	3 steps.
	
	We need to:
		1)	dump all surfaces into an array, 
		2)	depth-sort them, 
		3)	paint them starting with the background and ending with the foreground.
	
	*/

	//DUMP
	for (var i = 0; i < things.length; i++){
		for (var j = 0; j < things[i].surfaces.length; j++){
			allSurfaces.push(things[i].surfaces[j]);
		}
	}
	
	//DEPTH - SORT
	/*
	
	This is kinda abstract, but this method is very effective at ordering surfaces to paint in a 3D enviornment. We need to put the surfaces in an
	order where any nth member of the order is definitely not blocked by any part of the mth member of the order (where m > n). In other words,
	each surface in the list is definitely not covered up at all by any of the surfaces after it in the list.
	
	This list is simple to make once we can clearly determine for any two surfaces whether one is definitely overlapping the other. The criteria
	for determining this are handled by the aIsInFrontOfB(...) in Surface.js. These criteria are the following:
	
	Surface A is definitely overlapping surface B to some extent if any of the following are true:
	1) The ray from the observer to any vertex of surface B intersects surface A before reaching the surface B vertex.
	2) The ray from the observer to any vertex of surface A intersects surface B after reaching the surface A vertex.
	3) Surface A and B share a boundary and the ray from the observer to a point on surface B near the boundary intersects surface A before reaching the surface B point near the boundary.
	
	Note that if two surfaces intersect, according to these criteria potentially each surface is in front of the other. In a sorting method
	(like this one) this can cause an infinite loop. Therefore, this method includes infinite loop protection (with grabs array).
	
	*/
	var references = [];	//This array will record our ordered list of surfaces. This is basically our painting schedule
	for (var i = 0; i < allSurfaces.length; i++){references[i] = i;}	//Initially, our painting schedule will be the same order as the allSurfaces array (this will probably change).
	for (var i = 0; i < allSurfaces.length; i++){	//This is the beginning of the part of the list we're not sure about. All positions < i are locked in.
		var grabs = [];	//This array keeps track of how many times we've pulled each surface to the front of the non-locked in part of the list (since the last time we locked in a surface).
		for (var t = 0; t < allSurfaces.length; t++){grabs[t] = 0;}	//Every surface starts with a clean slate.
		for (var j = i + 1; j < allSurfaces.length; j++){	//For every surface in the non-locked in part of the list
			if (aIsInFrontOfB(allSurfaces[references[i]], allSurfaces[references[j]])){/*Good. No change is necessary*/}
			else{
				if (grabs[references[j]] == 0){//If this is false, this surface has been moved to this spot in the list before (i.e. we are in a loop and need to break out).
					grabs[references[j]] = 1;	//Mark that we have now grabbed surface references[j] and put it to the front. If we every do this again for references[j] we will know we are in a loop.
					var buffer = references[j];	//Swap surface references[i] and references[j]. Note we are swapping them in our schedule (references array) NOT in the allSurfaces array itself. The former is more lightweight.
					references[j] = references[i];
					references[i] = buffer;
					j = i + 1; //We want to start over now that we have a new order to proceed through the surfaces
				}
				else{j = allSurfaces.length;}//Break the loop. Due to surface-through-surface intersections there are some equivocal depths and we cannot sort any further
			}
		}
	}
	
	//PAINT
	for (var i = 0; i < allSurfaces.length; i++){
		paintSurface(ctx, allSurfaces[references[allSurfaces.length - 1 - i]], yob, XFOVangle, YFOVangle);
	}

	//Paint textBlocks (for now, a textBlock is presumed to belong in front of any potential object
	for (var i = 0; i < textBlocks.length; i++){	
		ctx.font = textBlocks[i].fontStyle + " " + parseInt(textBlocks[i].fontSize) + "px " + textBlocks[i].fontFamily;
		ctx.fillStyle = textBlocks[i].color;
		var coordinates = getXYProjection(textBlocks[i].origin, yob, XFOVangle, YFOVangle);
		ctx.fillText(textBlocks[i].text, coordinates[0] * c.width, coordinates[1] * c.height);
	}
	
}
//--------------------------------------------------------------------------
function requestRepaint(){
	
	/*
	When lots of animations are taking place, repaint can get called an excessive number of times.
	This function sets a minimum time which must elapse between repaints to keep the animation 
	burden on the client computer as light as possible.
	*/
	
	var d = new Date();
	var currentTime = d.getTime();
	
	if (currentTime - lastRepaintTime > minRepaintInterval){
	
		lastRepaintTime = currentTime;
		
		repaint();
		
	}
	
}
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------