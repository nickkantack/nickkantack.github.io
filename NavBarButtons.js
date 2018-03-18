//Mouse detector for button animations - cycles through alterations
$(document).mousemove(function (event) {

	var mousePos = [event.pageX, event.pageY - $(window).scrollTop(), 0];
	
	var observer = [0, yob, 0];
	
	//For each alteration in the alteration list
	for (var i = 0; i < alterations.length; i++){

		//Grab the front face of the appropriate thing. This structure presumes that the thing is a rectangular prism and that we have not rotated it.
		var frontface = [];
		frontface[0] = getXYProjection(things[thingIndex(alterations[i].thing)].surfaces[0].vertices[1], yob, XFOVangle, YFOVangle);
		frontface[1] = getXYProjection(things[thingIndex(alterations[i].thing)].surfaces[0].vertices[2], yob, XFOVangle, YFOVangle);
		frontface[2] = getXYProjection(things[thingIndex(alterations[i].thing)].surfaces[1].vertices[2], yob, XFOVangle, YFOVangle);
		frontface[3] = getXYProjection(things[thingIndex(alterations[i].thing)].surfaces[1].vertices[3], yob, XFOVangle, YFOVangle);
		for (var j = 0; j < frontface.length; j++){
			frontface[j].push(0);	//Set a z component of 0 for every frontface "vertex"
		}
		
		//Turn frontface percentages into pixel values
		for (var j = 0; j < frontface.length; j++){
			frontface[j][0] *= $('#graph').width();
			frontface[j][1] *= $('#graph').height();
		}
		if (!alterations[i].hover && pointPenetratesSurfaceVertices(mousePos, frontface)){//Then we just entered the button area

			clearInterval(alterations[i].animator);
			alterations[i].hover = true;
			
			var iCopy = i; 	//IMPORTANT STEP ARISING FROM ASYNCHRONOUS CODE
							//We need to create a local copy of i for the anonymous setInterval function to use. If we use i, then by the time the anonymous function executes,
							//i will have been changed by i's for loop. If we make a local copy of i whose memory address is dumped by this scope before i is incremented, there
							//is a safe copy of i in memory for the anonymous function to reference. This is actually an interesting artifact of memory management.

			alterations[i].animator = setInterval(function() {
			var translationAxis = alterations[iCopy].translationVector;	//The direction for the thing to translate
			var rotationAxisPoint = [0, 0, 1];	//This won't be used. This is a placeholder. We intentionally disallow rotations in this application of alterations due to a presumed orientation of frontface. Rotating the thing would ruin our use of frontface
												//and spoil our detection of a mouseover.
			var rotationAxisDirection = [0, 0, 1];	//This won't be used. This is a placeholder. See comment in line above.
				things[thingIndex(alterations[iCopy].thing)] = translateAndRotateThing(things[thingIndex(alterations[iCopy].thing)], translationAxis, alterations[iCopy].translationDistance / alterations[iCopy].steps, rotationAxisPoint, rotationAxisDirection, 0);
				var ratio = 1.01;
				textBlocks[iCopy].origin = add(textBlocks[iCopy].origin, scale(translationAxis, 1.35 * alterations[iCopy].translationDistance / alterations[iCopy].steps));
				textBlocks[iCopy].fontSize *= ratio;
				alterations[iCopy].currentStep++;
				if (alterations[iCopy].currentStep >= alterations[iCopy].steps){	//Then the alteration is completed, and we want to stop the animator.
				clearInterval(alterations[iCopy].animator);
				}
				//repaint();
				requestRepaint("#FFFDF9");
			}, alterations[iCopy].time / alterations[iCopy].steps);
		}
		if (alterations[i].hover && !pointPenetratesSurfaceVertices(mousePos, frontface)){	//Then we just left the button area.
		
			clearInterval(alterations[i].animator);
			alterations[i].hover = false;
			
			var iCopy2 = i;	//See comment above about iCopy. Using iCopy here creates issues where animators reach over and adjust the wrong thing. Again, think asynchronicity.
			alterations[i].animator = setInterval(function() {
				var translationAxis = [0, 1, 0];
				var rotationAxisPoint = [0, 0, 1];
				var rotationAxisDirection = [0, 0, 1];
				things[thingIndex(alterations[iCopy2].thing)] = translateAndRotateThing(things[thingIndex(alterations[iCopy2].thing)], translationAxis, - alterations[iCopy2].translationDistance / alterations[iCopy2].steps, rotationAxisPoint, rotationAxisDirection, 0);
				var ratio = 1 / 1.01;
				textBlocks[iCopy2].origin = add(textBlocks[iCopy2].origin, scale(translationAxis, - 1.35 * alterations[iCopy2].translationDistance / alterations[iCopy2].steps));
				textBlocks[iCopy2].fontSize *= ratio;
				alterations[iCopy2].currentStep--;
				if (alterations[iCopy2].currentStep <= 0){	//Then the alteration is completed, and we want to stop the animator.
					clearInterval(alterations[iCopy2].animator);
				}
				//repaint();
				requestRepaint("#FFFDF9");
			}, alterations[iCopy2].time / alterations[iCopy2].steps);
		}
		
	}
});