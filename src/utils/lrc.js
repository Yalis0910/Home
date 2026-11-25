/**
 * HTML 实体解码
 */
export function decodeHtml(html) {
  if (!html) return "";
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

/**
 * 格式化秒数为 mm:ss
 */
export function formatTime(seconds) {
  if (!seconds || isNaN(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * 拆分双语歌词（如 "原文 (翻译)" 或 "原文\n翻译"）
 * 返回 { main: string, trans: string }
 */
export function splitBilingualLrc(text) {
  if (!text || typeof text !== "string") return { main: "", trans: "" };

  const trimmed = text.trim();
  if (trimmed.includes("\n")) {
    const [first, ...rest] = trimmed.split("\n");
    return {
      main: first.trim(),
      trans: rest.join(" ").trim(),
    };
  }

  // 匹配 Meting / 网易云常见的 "原文 (翻译)" 或 "原文 （翻译）" 格式
  const match = trimmed.match(/^(.+?)\s*[(\（]([^()\（）]*)[)\）]\s*$/);
  if (match) {
    const mainPart = match[1].trim();
    const transPart = match[2].trim();
    // 若括号内为空（如 "あ ()"），直接剔除空括号
    if (!transPart) {
      return { main: mainPart, trans: "" };
    }
    // 括号内包含中日韩文字，或原文含拉丁/假名时，视为双语翻译换行显示
    const hasCjk = /[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(transPart);
    const mainHasNonAsciiOrLatin = /[a-zA-Z\u3040-\u30ff\uac00-\ud7af]/.test(mainPart);
    if (hasCjk || mainHasNonAsciiOrLatin) {
      return { main: mainPart, trans: transPart };
    }
  }

  return { main: trimmed, trans: "" };
}

/**
 * 解析 LRC 歌词文本
 * 返回有序的歌词项数组: [{ time: number, text: string }]
 */
export function parseLrcText(lrcStr) {
  if (!lrcStr || typeof lrcStr !== "string") return [];

  const decoded = decodeHtml(lrcStr);
  const lines = decoded.replace(/([^\]^\n])\[/g, "$1\n[").split("\n");
  const result = [];

  const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    // 匹配该行所有时间标签
    const matches = [...rawLine.matchAll(timeRegex)];
    if (matches.length > 0) {
      // 提取歌词文本部分（移除所有时间标签）
      const text = rawLine.replace(/\[\d{2}:\d{2}(?:\.\d{2,3})?\]/g, "").trim();

      // 如果是纯空标签或特殊占位，依然保留让时间轴对齐
      for (const match of matches) {
        const mins = parseInt(match[1], 10);
        const secs = parseInt(match[2], 10);
        const ms = match[3] ? parseFloat("0." + match[3]) : 0;
        const time = mins * 60 + secs + ms;
        result.push({ time, text });
      }
    }
  }

  // 升序排列
  result.sort((a, b) => a.time - b.time);

  // 过滤掉纯元数据（如 [ti:...], [ar:...] 等没有匹配到正常时间标签的文本已被剔除）
  return result;
}
