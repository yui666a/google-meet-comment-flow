import { decodeHTMLSpecialWord } from "./utils/decodeHTMLSpecialWord";

let prevThread: Node;

let prevPopupThread: Node;

const CHAT_SELECTOR_BASE = "div.WUFI9b[data-panel-id='2']";

const CHAT_SELECTOR_OBJ = {
  container: CHAT_SELECTOR_BASE,
  thread: `${CHAT_SELECTOR_BASE} > div.hWX4r div.z38b6`,
  message: `${CHAT_SELECTOR_BASE} > div.hWX4r div.z38b6 div[jsname="dTKtvb"] > div`,
} as const;

const CHAT_CLASS_OBJ = {
  isHidden: "qdulke",
} as const;

const POPUP_SELECTOR_BASE = "div.fJsklc.nulMpf.Didmac.sOkDId";

const POPUP_SELECTOR_OBJ = {
  container: POPUP_SELECTOR_BASE,
  thread: `${POPUP_SELECTOR_BASE} > div.mIw6Bf.nTlZFe.P9KVBf`,
  message: `${POPUP_SELECTOR_BASE} > div.mIw6Bf.nTlZFe.P9KVBf div[jsname="dTKtvb"] > div`,
} as const;

const extractMessageFromPopupThread = (
  popupThread: Element | null
): string | undefined => {
  if (!popupThread || popupThread.isEqualNode(prevPopupThread)) return;

  prevPopupThread = popupThread.cloneNode(true);

  const messageNodes = popupThread.querySelectorAll(POPUP_SELECTOR_OBJ.message);

  if (messageNodes.length === 0) return;

  const messageNode = messageNodes[messageNodes.length - 1];

  return messageNode.innerHTML;
};

const extractMessageFromThread = (
  thread: Element | null
): string | undefined => {
  if (!thread || thread.isEqualNode(prevThread)) return;

  prevThread = thread.cloneNode(true);

  const messageNodes = thread.querySelectorAll(CHAT_SELECTOR_OBJ.message);

  if (messageNodes.length === 0) return;

  const messageNode = messageNodes[messageNodes.length - 1];

  return messageNode.innerHTML;
};

const observer = new MutationObserver(async (mutations: MutationRecord[]) => {
  try {
    const addedNode = mutations[0].addedNodes?.[0];

    if (addedNode?.nodeType !== Node.ELEMENT_NODE) return;

    const isEnabledStreaming = await chrome.runtime.sendMessage({
      method: "getIsEnabledStreaming",
    });

    if (!isEnabledStreaming) return;

    const popupThread = document.querySelector(POPUP_SELECTOR_OBJ.thread);

    const chatPanel = document.querySelector(CHAT_SELECTOR_OBJ.container);
    const chatPanelAside = chatPanel?.closest("aside.R3Gmyc");
    const isChatVisible =
      chatPanelAside &&
      !chatPanelAside.classList.contains(CHAT_CLASS_OBJ.isHidden);
    const thread = document.querySelector(CHAT_SELECTOR_OBJ.thread);

    const message = isChatVisible
      ? extractMessageFromThread(thread)
      : extractMessageFromPopupThread(popupThread);

    if (!message) return;

    chrome.runtime.sendMessage({
      method: "setComment",
      value: decodeHTMLSpecialWord(message),
    });
  } catch (e) {
    console.error(e);
  }
});

document.addEventListener("DOMContentLoaded", () =>
  observer.observe(document.body, {
    subtree: true,
    childList: true,
  })
);
