(function registerPopupStories() {
	const popupStorySpans = document.querySelectorAll("span.popupStorySpan");
	for (let popupStorySpan of popupStorySpans) {
		const popupStoryDiv = document.getElementById(popupStorySpan.id.replace(/Span/, "Div"));
        function closePopupStoryDiv() {
            popupStoryDiv.style.height = "0";
            document.body.removeEventListener("click", closePopupStoryDivIfBody);
            setTimeout(() => {
                popupStoryDiv.style.display = "none";
            }, 500);
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
        closeButton.style = `cursor: pointer; width: 30px; height: 30px, border-radius: 5px; position: fixed; right: 0; top: 0`;
        popupStoryDiv.insertBefore(closeButton, popupStoryDiv.firstChild);
		popupStorySpan.addEventListener("click", () => {
			popupStoryDiv.style.display = "block";
            setTimeout(() => {
                popupStoryDiv.style.height = "400px";
                closeButton.addEventListener("click", closePopupStoryDiv);
                document.body.addEventListener("click", closePopupStoryDivIfBody);
            }, 10);
		});
        
	}
})();