// 云端同步配置（配置一次后 Push 到 GitHub，手机/电脑打开同一网址即可共享）
// 获取方式：Supabase 控制台 → Project Settings → API
window.SHARE_BOARD_CLOUD = {
  url: "https://chuwaqgjjuvogiqugwfn.supabase.co", 
  key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNodXdhcWdqanV2b2dpcXVnd2ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMzM4ODcsImV4cCI6MjA5NTYwOTg4N30.Nkyf3vFYGMkjbLjlZIAZXBapEjAG3fU1zFvD6FLtZCg", 
  board: "main",  // 房间号，所有人须一致；也可在网址加 ?board=xxx
};
