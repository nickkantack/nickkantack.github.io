//-------------------------------------------------------------------------------------------------------
function E(a){
	return document.getElementById(a);
}
//-------------------------------------------------------------------------------------------------------
// Nav bar
E('navHome').addEventListener('click', function(){ window.location.replace('./index.html'); });
E('navResume').addEventListener('click', function(){
	let a = document.createElement("a");
	a.href="./resume.pdf";
	a.download = "resume.pdf";
	document.body.appendChild(a);
	a.click();
});
E('navProjects').addEventListener('click', function(){ window.location.replace('./projects.html'); });
E('navLiterature').addEventListener('click', function(){ window.location.replace('./literature.html'); });
//-------------------------------------------------------------------------------------------------------
// Nav bar stickiness
/*
var offset = E('navBar').offsetTop;
window.onscroll = function() {
  if (window.pageYOffset >= offset) {
    E('navBar').classList.add('stickyNavBar')
  } else {
    E('navBar').classList.remove('stickyNavBar');
  }
};
*/
//-------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------
