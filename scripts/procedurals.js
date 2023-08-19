//-------------------------------------------------------------------------------------------------------
function E(a){
	return document.getElementById(a);
}
//-------------------------------------------------------------------------------------------------------
// Nav bar
// The nav bar automation contract is that for each member of the list below, there exists a page
// in pages that is the space-removed, camel-cased transformation of the name (unless it has 
// special handling in the switch below).
const navBarPages = ["Home", "Projects", "Literature", "About Me", "Resume"];
function renderNavBar() {
	const navBar = E("navBar");
	for (let navBarPage of navBarPages) {
		// Catch any special cases and handle them differently
		const buttonId = `nav${navBarPage.replace(/\s/g, "")}`;
		const button = document.createElement("button");
		button.id = buttonId;
		button.classList.add("navButton");
		button.innerHTML = navBarPage;
		navBar.appendChild(button);
		switch (navBarPage) {
			case "Resume":
				button.addEventListener("click", () => {
					let a = document.createElement("a");
					a.href="../pdf/resume.pdf";
					a.download = "resume.pdf";
					document.body.appendChild(a);
					a.click();
				});
			break;
			default:
				button.addEventListener("click", () => { window.location.href = `./${navBarPage.substring(0, 1).toLowerCase() + navBarPage.substring(1).replace(/\s/g, "")}.html`; });
		}
	}
}