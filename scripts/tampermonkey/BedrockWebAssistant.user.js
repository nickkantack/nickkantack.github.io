// ==UserScript==
// @name         BedrockWebAssistant
// @namespace    http://tampermonkey.net/
// @version      2024-06-01
// @description  Provide a chat widget for a Bedrock powered AI assistant that can take actions in the user's browser.
// @author       nickkantack
// @match        https://www.kantacks.com/*
// @match        https://kantacks.com/*
// @match        https://www.google.com/*
// @match        https://www.wikipedia.org/*
// @match        https://en.wikipedia.org/*
// @grant        GM.xmlHttpRequest
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM.getValue
// @grant        GM.setValue
// @require      https://sdk.amazonaws.com/js/aws-sdk-2.7.20.min.js
// @require      https://nickkantack.github.io/KantackJsCommons/dist/KJSC.js
// ==/UserScript==

const MAIN_STYLE_COLOR = `#486`;
const MAIN_STYLE_COLOR_DARK = `#254`;
const MESSAGE_STYLE_USER = `display: block; position: relative; left: 10%; width: 80%; background: ${MAIN_STYLE_COLOR}; box-shadow: 5px 5px 5px #BBB; border-radius: 5px;
                      margin: 10px; padding: 10px; color: #fff; border: 2px solid ${MAIN_STYLE_COLOR_DARK}; box-sizing: border-box;`
const MESSAGE_STYLE_ASSISTANT = `display: block; position: relative; left: 0; width: 80%; background: #CCC; box-shadow: 5px 5px 5px #BBB; border-radius: 5px;
                              margin: 10px; padding: 10px; border: 2px solid #999; box-sizing: border-box;`;

let visibleConversationHistory = [];
let conversationHistory = [];

AWS.config.update({region: 'us-east-1'});
AWS.config.credentials = new AWS.CognitoIdentityCredentials({IdentityPoolId: 'us-east-1:f0bb38aa-79ab-4ede-9702-49da272cb847'});
const lambda = new AWS.Lambda({region: 'us-east-1', apiVersion: '2015-03-31'});

let sessionId = "";

async function sendConversation() {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({"conversationHistory": conversationHistory, "isOnWikipedia": /wikipedia\.org/.test(window.location)});
        console.log(`The payload is ${payload}`);
        lambda.invoke(
            {
                FunctionName : 'BedrockWebAssistant',
                Payload: payload,
                InvocationType : 'RequestResponse',
                LogType : 'None'
            }, function(err, data) {
                    console.log(data);
                    if (err) {
                        console.error(`Got this error: ${err}`);
                        reject(err);
                    } else {
                        const response = JSON.parse(data.Payload);
                        console.log(`Received this session id: ${response.knowledgeBaseSessionId}`);
                        sessionId = response.knowledgeBaseSessionId;
                        resolve(response);
                    }
                });
    });
}

let isSubmitCooledDown = true;
let spinnerTheta = 0;
let spinnerThetaIncrement = 0.1;

function getSpinnerPath() {
    const sin = Math.sin(spinnerTheta);
    const cos = Math.cos(spinnerTheta);
    return `M${50 + 40 * cos} ${50 + 40 * sin}L${50 + 40 * sin} ${50 + -40 * cos}L${50 + -40 * cos} ${50 + -40 * sin}L${50 + -40 * sin} ${50 + 40 * cos}Z`;
}

function createUi() {

    // Create chat window
    const chatDiv = document.createElement("div");
    chatDiv.style = `display: none; position: fixed; width: 30%; max-width: 400px; min-width: 200px; right: 1em; top: 4em; height: 500px; max-height: 70%; border: 4px solid ${MAIN_STYLE_COLOR};
                     z-index: 98; font-size: 24px; border-radius: 5px; background: #fff; font-family: "Amazon Ember";`;
    document.body.appendChild(chatDiv);

    const progressIndicator = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    progressIndicator.style = `display: none; position: absolute; top: 0; left: 5%; height: 5%;`;
    progressIndicator.setAttribute(`viewBox`, `0 0 100 100`);
    progressIndicator.innerHTML = `<path stroke="none" fill="#999" d="M0 40L40 0L90 40L40 90Z"/>`;
    const spinner = progressIndicator.querySelector(`path`);
    chatDiv.appendChild(progressIndicator);

    const chatHistoryDiv = document.createElement("div");
    chatHistoryDiv.id = `chatHistoryDiv`;
    chatHistoryDiv.style = `border: 2px solid #999; display: block; position: relative; top: 5%; left: 0; width: 100%; height: 80%; border-radius: 4px; overflow-y: scroll; font-size: 14px;`;
    chatDiv.appendChild(chatHistoryDiv);

    const chatControlsDiv = document.createElement("div");
    chatControlsDiv.style = `display: block; position: relative; top: 5%; left: 0; width: 100%; height: 15%; border-radius: 4px;`;
    chatDiv.appendChild(chatControlsDiv);

    const inputTextArea = document.createElement("textarea");
    inputTextArea.id = `inputTextArea`;
    inputTextArea.style = `display: block; position: relative; top: 0; left: 0; width: 80%; height: 100%; overflow-y: scroll; font-size: 14px; border-radius: 5px;
                           padding: 5px; resize: none; box-sizing: border-box;`;
    chatControlsDiv.appendChild(inputTextArea);

    const submitButton = document.createElement("button");
    submitButton.innerHTML = `Ask`;
    submitButton.style = `display: block; position: absolute; top: 0; right: 0; width: 20%; height: 100%; font-size: 14px; border-radius: 5px;`;
    chatControlsDiv.appendChild(submitButton);
    inputTextArea.addEventListener("keydown", (e) => {
        if (e.keyCode === 13) {
            submitButton.click();
            setTimeout(() => {
                inputTextArea.value = inputTextArea.value.replace("\n", "");
            }, 100);
        }
    });

    const sendMessageToModel = async (message, isHidden) => {
        // Immediately add a card in the conversation history
        let spinnerInterval;
        let timeout;
        if (!isHidden) {
            const card = document.createElement("div");
            card.style = MESSAGE_STYLE_USER;
            card.innerHTML = message;
            chatHistoryDiv.appendChild(card);
            chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;

            // Start the animation for waiting
            progressIndicator.style.display = "block";
            spinnerTheta = 0;
            spinner.setAttribute(`d`, getSpinnerPath());
            spinnerInterval = setInterval(() => {
                spinnerTheta += spinnerThetaIncrement;
                spinner.setAttribute(`d`, getSpinnerPath());
            }, 25);

            // Schedule the timeout for showing there was an error
            timeout = setTimeout(() => {
                clearInterval(spinnerInterval);
            }, 60000);
        }

        conversationHistory.push({role: "user", content: `${isHidden ? "[This message is from the Local App; the user did not see this message and is unaware that you received it.]" : ""}: ${message}`});

        // Ask the question and await the result
        const response = await sendConversation();

        console.log(response);

        conversationHistory = conversationHistory.concat(response.new_messages);

        KJSC.IO.setValue(DATAKEYS.FULL_CONVERSATION_HISTORY, conversationHistory);

        const mostRecentMessageContent = response.new_messages[response.new_messages.length - 1].content;

        // Catch an reject any message that includes multiple prefixes
        let uniquePrefixesFound = 0;
        if (/!User:/i.test(mostRecentMessageContent)) {
            uniquePrefixesFound++;
            if ((mostRecentMessageContent.match(/!User:/ig) || []).length > 1) {
                await sendMessageToModel(`Your message was not forwarded because it contains multiple "!User:" prefixes. Each message of yours may only contain one command to the Local App or one message to the user. Please try again and follow this rule.`);
                return;
            }
        }
        if (/!Local\sApp:/i.test(mostRecentMessageContent)) {
            uniquePrefixesFound++;
            if ((mostRecentMessageContent.match(/!Local\sApp:/ig) || []).length > 1) {
                await sendMessageToModel(`Your message was not forwarded because it contains multiple "!Local App:" prefixes. Each message of yours may only contain one command to the Local App or one message to the user. Please try again and follow this rule.`);
                return;
            }
        }

        if (uniquePrefixesFound > 1) {
            await sendMessageToModel(`Your message was not forwarded because it contained multiple prefixes from the allowed list ("!User:", "!Local App"). This is not allowed. Try again with a response that only includes one prefix.`, true);
            return;
        }

        // Catch and specially handle any requests to the Local App that should not appear as turns in the conversation as viewed from the user

        // If both !User: and !Local App appear in the response, we terminate and only show what was marked for the user.
        if (/^!Local\sApp:/.test(mostRecentMessageContent) && !/!User:/.test(mostRecentMessageContent)) {

            // TODO Handle a system request, but check first that the request began with "!Local App:", then call await sendMessageToModel() again
            const unsplitParts = response.new_messages[response.new_messages.length - 1].content.replace(/^!Local\sApp:\s*/i, "").trim();
            const parts = unsplitParts.split(",");
            console.log(`Local App received this command: ${parts[0]}`);

            // Switch based on command
            let newMessageToModel = "";
            switch (parts[0]) {
                case "getHtml":
                    if (parts.length >= 2) {
                        newMessageToModel = await KJSC.WebClient.loadUrlSync(parts[1]);
                    } else {
                        newMessageToModel = "Could not provide page html because your request, when separated by commas, resulted in fewer than two pieces. The Local App was expecting your request to be of the format \"!Local App:getHtml,URL\" where \"URL\" is a website URL that does not contain any commas.";
                    }
                    break;
                case "getWikipediaText":
                    newMessageToModel = await getWikipediaText();
                    break;
                default:
                    newMessageToModel = "Sorry, was not able to parse your request. It may have been formatted incorrectly, or there may be a bug in the Local App. You can try again, but you also might need to try something else or give up. Consider notifying the user that this happened, but still try to assist the user in their request if possible.";
            }

            // Send reply to model
            await sendMessageToModel(newMessageToModel, true);

        } else {

            const responseCard = document.createElement("div");
            responseCard.style = MESSAGE_STYLE_ASSISTANT;
            responseCard.innerHTML = mostRecentMessageContent.replace(/.*!User:\s*/, "");
            chatHistoryDiv.appendChild(responseCard);
            chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;

            // Cancel the timeout for showing there was an error
            clearInterval(spinnerInterval);
            clearTimeout(timeout);
            progressIndicator.style.display = "none";

            visibleConversationHistory.push({role: "assistant", content: mostRecentMessageContent});
            KJSC.IO.setValue(DATAKEYS.VISIBLE_CONVERSATION_HISTORY, visibleConversationHistory);

        }
    }

    submitButton.addEventListener("click", async () => {

        if (!isSubmitCooledDown) return;

        isSubmitCooledDown = false;

        setTimeout(() => {
            isSubmitCooledDown = true;
        }, 500);

        const question = inputTextArea.value.replace("\n", "");

        inputTextArea.value = "";

        if (/^clear$/i.test(question.trim())) {
            KJSC.IO.setValue(DATAKEYS.CONVERSATION_HISTORY, []);
            KJSC.IO.setValue(DATAKEYS.VISIBLE_CONVERSATION_HISTORY, []);
            conversationHistory = [];
            visibleConversationHistory = [];
            loadMessageHistory();
            return;
        }

        sendMessageToModel(question);

        visibleConversationHistory.push({role: "user", content: question});
        KJSC.IO.setValue(DATAKEYS.VISIBLE_CONVERSATION_HISTORY, visibleConversationHistory);

    });

    // Create the button to toggle in the UI
    const button = document.createElement("button");
    button.innerHTML = "?";
    button.style = `display: block; position: fixed; right: 1em; top: 3em; z-index: 99999999; border: 4px solid ${MAIN_STYLE_COLOR_DARK}; color: #fff; background: ${MAIN_STYLE_COLOR};
                    width: 2em; height: 2em; border-radius: 1em; cursor: pointer; font-size: 24px; padding: 0;`;
    button.addEventListener("click", async () => {
        if (chatDiv.style.display === "none") {
            chatDiv.style.display = "block";
        } else {
            chatDiv.style.display = "none";
        }
    });
    document.body.appendChild(button);
}

const DATAKEYS = {
    FULL_CONVERSATION_HISTORY: `FULL_CONVERSATION_HISTORY`,
    VISIBLE_CONVERSATION_HISTORY: `VISIBLE_CONVERSATION_HISTORY`
}

function openSeparateTab(url) {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

async function getWikipediaText() {
    const contentElement = document.getElementById(`mw-content-text`);
    if (contentElement) {
        let validElements = contentElement.querySelectorAll(`p,dl,h1,h2,h3,h4,h5`);
        let elementsBeforeSeeAlso = [];
        for (let element of validElements) {
            if (element.querySelector("#See_also")) break;
            elementsBeforeSeeAlso.push(element);
        }
        let result = [...elementsBeforeSeeAlso].map(x => x.innerHTML).join("");
        result = result.replaceAll(/\n/g, "");
        result = result.replaceAll(/<span.*?<\/span>/gm, "");
        result = result.replaceAll(/<img.*?>/gm, "");
        result = result.replaceAll(/<math.*?<\/math>/gm, "").replaceAll(/<semantics>.*?<\/semantics>/gm, "");
        console.log(result);
        return result;
    } else {
        return "Unable to retrieve the content of the wikipedia article.";
    }
}

async function loadMessageHistory() {
    const chatHistoryDiv = document.getElementById(`chatHistoryDiv`);
    chatHistoryDiv.innerHTML = ``;

    const pastMessages = await KJSC.IO.getValue(DATAKEYS.VISIBLE_CONVERSATION_HISTORY);
    if (!pastMessages) return;

    for (let turn of pastMessages) {
        const responseCard = document.createElement("div");
        responseCard.style = turn.role === "user" ? MESSAGE_STYLE_USER : MESSAGE_STYLE_ASSISTANT;
        responseCard.innerHTML = turn.content.replace(/^!User:\s*/, "");
        chatHistoryDiv.appendChild(responseCard);
    }
    chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;

}

function scheduleConversationHistorySweeper() {

    setInterval(async () => {
        const visibleConversationHistory = await KJSC.IO.getValue(DATAKEYS.VISIBLE_CONVERSATION_HISTORY);
        if (!visibleConversationHistory) return;
        const chatHistoryDiv = document.getElementById(`chatHistoryDiv`);
        if (visibleConversationHistory.length !== chatHistoryDiv.children.length) {
            console.log(`Reloading messages`);
            loadMessageHistory();
        }
    }, 2000);

}

(async function() {
    'use strict';

    createUi();
    loadMessageHistory();

    scheduleConversationHistorySweeper();

})();

