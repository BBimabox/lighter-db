Lighter DataBase v12.1

- Logo 不再放大 Google favicon；優先使用高解析 / SVG。
- Commons 圖片改抓 640px，並用新版 cache，避免舊糊圖繼續被沿用。
- 找不到可靠 logo 時，用清晰向量 maker mark，不再硬放大低解析圖。
- 品牌頁改成三個收合區：已收錄型號、新增型號、品牌資料 / 辨識。
- 預設只展開型號列表，畫面更乾淨。

Lighter DataBase v11.8

- 放大品牌 Logo 顯示區與實際 Logo 圖。
- 品牌卡新增「已收藏數量」純數字顯示。
- 保留 Rank 與最愛按鈕。

Lighter DataBase PWA v11.7

- 所有品牌卡片都有 Logo / maker mark 圖像位置。
- 有已知官方網站的品牌優先讀取官方網站 favicon / logo mark。
- 其他品牌會在可見時自動向 Wikimedia Commons 搜尋可辨識 Logo；查不到才回退為標示 MAKER MARK 的文字牌，不假裝是真 Logo。
- Logo 搜尋結果會存在本機快取，避免每次開啟都重查。

Lighter DB PWA v11.6

- App 頂端不再顯示使用者封面圖；該圖片只保留為手機 PWA App icon。
- 知識區移除自製 SVG 示意圖，改用 Wikimedia Commons 上具有 Public Domain / Creative Commons 授權的實物照片。
- 圖片加入作者 / 授權標示及原始 Commons 連結。
- 修正知識區圖片超出卡片邊界：所有圖片強制 max-width 100%、object-fit contain，手機改成單欄。
- Cloudflare Worker / OpenAI API 設定不需更動。

Lighter DB PWA v11.4

- 品牌頁的年份 / 真偽 / 網路研究 / 資料來源 / 品牌筆記整塊預設收起，點擊才展開。
- 品牌顯示名稱移除 Early / 早期 / 現代款等年代標籤並自動合併舊本機資料。
- 知識區新增 9 張原創示意圖，尤其補強機構 / 類型辨識。

Lighter DB PWA v11.3

- 修正新增 / 編輯型號時「我的最愛」切換沒有即時反應的問題。
- 將愛心改為火焰，並加入點擊火焰動畫。
- 新增可折疊的「型號辨識 / 研究資訊」區塊，避免表單過雜。
- 更新 App 封面與 PWA icon，使用使用者提供的圖片。
- 在知識區加強「機構 / 類型辨識」內容。

# Lighter DB PWA v11.2

- 修正 AI 後端已儲存/測試成功後，狀態徽章仍顯示「尚未設定」的 UI 問題。
- 儲存網址後顯示「已設定」；測試成功後顯示「已連線」。

# Lighter DB PWA v11

本版取消 Supabase 雲端同步，回歸 local-first：資料保存在目前瀏覽器 / 裝置，並使用 JSON 完整備份做跨裝置保存。

## v11 介面整理
- 新增可收合側邊列：我的最愛、打火機知識、備份。
- 底部導覽只保留三個主要功能：資料庫、收藏統計、AI 辨識。
- 原「說明」改為「備份」，集中匯出 / 匯入完整資料。
- 移除 Supabase 雲端頁、cloud.js、Supabase SQL 與設定文件。
- OpenAI AI 辨識仍沿用既有 Cloudflare Worker，不需要重新建立 API key。

## 資料保存
收藏、照片、最愛、維修紀錄、品牌 Alias 與 AI 歷史主要存在瀏覽器 localStorage / IndexedDB。請定期使用「備份」匯出完整 JSON，並另存到 Google Drive、iCloud、OneDrive 或電腦。

## 更新 GitHub Pages
把此資料夾內所有檔案覆蓋 repository 根目錄同名檔案，GitHub Pages 會自動重新部署。部署後可用 Ctrl + F5 強制更新。


## v11.2
- Android / PWA 返回鍵現在使用瀏覽器 History API：品牌、編輯、統計、AI、側邊功能可逐層返回，不再每次直接離開 App。
- 收藏編號改為可編輯；留空仍自動產生 L0001 格式，並檢查重複編號。
