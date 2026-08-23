import { toast } from "react-toastify";

export const handleCopyToClipboard = (text, index, t) => {
  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      if (typeof t === "function") {
        toast.success(t("linkCopied"));
      } else {
        toast.success("Link copied");
      }
    } catch {
      fallbackCopy(text, t);
    }
  };

  const fallbackCopy = (text, t) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);

    if (typeof t === "function") {
      toast.success(t("linkCopied"));
    } else {
      toast.success("Link copied");
    }
  };

  copyText();
};

export const extractNameFromConfigURL = (url) => {
  const namePattern = /#([^#]*)/;
  const match = url.match(namePattern);

  if (match) {
    try {
      return decodeURIComponent(match[1]);
    } catch (error) {
      console.error("Malformed URI component:", match[1], error);
      return match[1];
    }
  }

  if (url.startsWith("vmess://")) {
    const encodedString = url.replace("vmess://", "");

    try {
      const decodedString = atob(encodedString);
      return JSON.parse(decodedString).ps;
    } catch (error) {
      console.error("Invalid vmess URL format:", error);
      return null;
    }
  }
  return null;
};


export const calculateRemainingTime = (expire, t) => {
  if (!expire) return t("infinity");

  let expireTimestamp;
  if (typeof expire === "number") {
    expireTimestamp = expire;
  } else if (typeof expire === "string") {
    expireTimestamp = Math.floor(new Date(expire).getTime() / 1000);
  } else {
    throw new Error("Invalid expire format");
  }

  const remainingSeconds = expireTimestamp - Math.floor(Date.now() / 1000);
  if (remainingSeconds <= 0) return t("ended");

  const days = Math.floor(remainingSeconds / (60 * 60 * 24));
  const hours = Math.floor((remainingSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((remainingSeconds % (60 * 60)) / 60);

  if (days > 0) return `${days} ${t("days")} `;
  if (hours > 0) return `${hours} ${t("hours")}`;
  return `${minutes} ${t("minutes")}`;
};

export const calculateUsedTimePercentage = (expireTimestamp) => {
  let expireTimeInSeconds;

  if (typeof expireTimestamp === "string") {
    expireTimeInSeconds = Math.floor(
      new Date(expireTimestamp).getTime() / 1000
    );
  } else if (typeof expireTimestamp === "number") {
    expireTimeInSeconds = expireTimestamp;
  } else {
    return Infinity;
  }

  const remainingSeconds = expireTimeInSeconds - Math.floor(Date.now() / 1000);

  if (remainingSeconds <= 0) return 100;

  const daysRemaining = Math.floor(remainingSeconds / (60 * 60 * 24));

  if (daysRemaining < 1) {
    return 99;
  }

  if (daysRemaining <= 30) {
    return ((30 - daysRemaining) / 30) * 100;
  }

  if (daysRemaining <= 90) {
    return ((90 - daysRemaining) / 90) * 100;
  }

  if (daysRemaining <= 180) {
    return ((180 - daysRemaining) / 180) * 100;
  }

  return Infinity;
};

export const formatTraffic = (bytes, t) => {
  if (bytes === null) {
    return t("infinity");
  }

  if (bytes < 0) {
    return t("gigabytes");
  }

  const units = [t("B"), t("KB"), t("MB"), t("GB"), t("TB")];
  const thresholds = [1, 1024, 1024 ** 2, 1024 ** 3];

  for (let i = 0; i < thresholds.length; i++) {
    if (bytes < thresholds[i] * 1024) {
      return `${(bytes / thresholds[i]).toFixed()} ${units[i]}`;
    }
  }
  return `${(bytes / 1024 ** 4).toFixed(2)} ${t("TB")}`;
};

export const formatBytes = (bytes, t) => {
  if (bytes === null || bytes === undefined || isNaN(bytes) || bytes < 0) {
    return { value: "0", unit: typeof t === "function" ? t("B") : "B" };
  }

  const units = [
    typeof t === "function" ? t("B") : "B",
    typeof t === "function" ? t("KB") : "KB",
    typeof t === "function" ? t("MB") : "MB",
    typeof t === "function" ? t("GB") : "GB",
    typeof t === "function" ? t("TB") : "TB",
  ];
  const thresholds = [1, 1024, 1024 ** 2, 1024 ** 3];

  for (let i = 0; i < thresholds.length; i++) {
    if (bytes < thresholds[i] * 1024) {
      const val = bytes / thresholds[i];
      return {
        value: val >= 10 ? val.toFixed(0) : val.toFixed(1),
        unit: units[i],
      };
    }
  }
  return {
    value: (bytes / 1024 ** 4).toFixed(2),
    unit: units[4],
  };
};

