const POPUP_TRANSITION_TIME_MS = 300;
// Check for any misconfiguration between CSS and this javascript, since we can't link the two
if (document.getElementsByClassName("popupStoryDiv")) {
    const expectedTransitionValueFromCss = `${POPUP_TRANSITION_TIME_MS / 1000}s`;
    const foundTransitionValue = window.getComputedStyle(document.getElementsByClassName("popupStoryDiv")[0]).getPropertyValue("transition-duration");
    if (foundTransitionValue !== expectedTransitionValueFromCss) {
        console.warn("Check the 'transition' or 'transition-duration' property of the popupStoryDiv class. I expected that" +
        ` 'transition-duration' would be ${expectedTransitionValueFromCss} but it was ${foundTransitionValue}.`);
    }
}
console.log(document.getElementsByClassName("popupStoryDiv")[0].style);
(function registerPopupStories() {
	const popupStorySpans = document.querySelectorAll("span.popupStorySpan");
	for (let popupStorySpan of popupStorySpans) {
		const popupStoryDiv = document.getElementById(popupStorySpan.id.replace(/Span/, "Div"));
        function closePopupStoryDiv() {
            // Actions to take immediately upon closing the popup
            popupStoryDiv.style.height = "0";
            popupStoryDiv.style.overflowY = "hidden";
            for (let p of popupStoryDiv.querySelectorAll("p")) p.style.opacity = "0";
            if (popupStoryDiv.querySelector("button")) popupStoryDiv.querySelector("button").style.opacity = "0";
            document.body.removeEventListener("click", closePopupStoryDivIfBody);
            setTimeout(() => {
                // Actions to take once the popup has finished disappearing
                popupStoryDiv.style.display = "none";
            }, POPUP_TRANSITION_TIME_MS);
        };
        function closePopupStoryDivIfBody(e) {
            if (e.target.closest(".popupStoryDiv")) return;
            closePopupStoryDiv();
        }
		if (!popupStoryDiv) {
			console.error(`Failed to get the story div for popup span called ${popupStorySpan.id}`);
            return;
		}
        const closeButton = document.createElement("button");
        closeButton.innerHTML = "X";
        popupStoryDiv.insertBefore(closeButton, popupStoryDiv.firstChild);
        // Help push the start of the text down below the close button so it doesn't block any text
        if (popupStoryDiv.querySelector("p")) popupStoryDiv.querySelector("p").style.marginTop = "30px";
		popupStorySpan.addEventListener("click", () => {
			popupStoryDiv.style.display = "block";
            setTimeout(() => {
                // Actions to take just as the popup has started appearing
                popupStoryDiv.style.height = "400px";
                closeButton.addEventListener("click", closePopupStoryDiv);
                document.body.addEventListener("click", closePopupStoryDivIfBody);
            }, 10);
            setTimeout(() => {
                // Actions to take once the popup has finished appearing
                popupStoryDiv.style.overflowY = "auto";
                for (let p of popupStoryDiv.querySelectorAll("p")) p.style.opacity = "1";
                closeButton.style.opacity = "1";
            }, POPUP_TRANSITION_TIME_MS);
		});
        
	}
})();