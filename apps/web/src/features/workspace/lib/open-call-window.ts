type OpenCallWindowResult = {
  focus: () => void;
  navigateTo: (callId: string) => void;
  close: () => void;
  isPopupBlocked: boolean;
};

const CALL_WINDOW_NAME = "nexus-talk-call-window";
const CALL_WINDOW_FEATURES = [
  "popup=yes",
  "width=1280",
  "height=820",
  "left=120",
  "top=80",
  "resizable=yes",
  "scrollbars=no",
].join(",");

function buildCallWindowUrl(callId: string) {
  return `/call-window?call=${encodeURIComponent(callId)}`;
}

export function openCallWindow(callId?: string): OpenCallWindowResult {
  const targetUrl = callId ? buildCallWindowUrl(callId) : "/call-window";
  const handle = window.open(targetUrl, CALL_WINDOW_NAME, CALL_WINDOW_FEATURES);

  return {
    focus: () => {
      handle?.focus();
    },
    navigateTo: (nextCallId: string) => {
      const nextUrl = buildCallWindowUrl(nextCallId);

      if (handle && !handle.closed) {
        handle.location.href = nextUrl;
        handle.focus();
        return;
      }

      window.location.assign(nextUrl);
    },
    close: () => {
      handle?.close();
    },
    isPopupBlocked: !handle,
  };
}
