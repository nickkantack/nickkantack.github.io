
function newNotification(text, isError) {
    notifier.innerHTML = text;
    let flashCount = 3;
    for (let i = 0; i < flashCount; i++) {
        setTimeout(() => {
            notifier.classList.add(isError ? "errorNotification" : "infoNotification");
        }, 250 + i * 500);
        setTimeout(() => {
            notifier.classList.remove(isError ? "errorNotification" : "infoNotification");
        }, 750 + i * 500);
    }
}