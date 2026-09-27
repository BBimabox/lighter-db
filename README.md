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
